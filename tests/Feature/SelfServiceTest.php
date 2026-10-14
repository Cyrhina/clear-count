<?php

use App\Models\AttendanceRecord;
use App\Models\Branch;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Loan;
use App\Models\OvertimeRecord;
use App\Models\ShiftAssignment;
use App\Models\WorkSchedule;
use App\Support\LeaveDefaults;
use App\Support\LeaveLedger;

/** Two employees of one company, each with a sign-in of their own. */
function twoEmployees(): array
{
    $admin = companyUser('payroll_admin');
    [$a] = runStaff($admin->company);
    [$b] = runStaff($admin->company);

    return [$admin, $a, $b, companyUser('employee', $admin->company, ['employee_id' => $a->id]), companyUser('employee', $admin->company, ['employee_id' => $b->id])];
}

test('me returns the own record with pay and history, and only the contact fields can be changed', function () {
    [, $a, , $userA] = twoEmployees();

    $me = $this->actingAs($userA)->getJson('/api/me')->assertOk()->json('data');
    expect($me['id'])->toBe($a->id)->and($me['compensation']['basicPay'])->toEqual(30000)->and($me)->toHaveKeys(['bank', 'history', 'compensation_history', 'documents'])->and($me['branch_name'])->toBe(Branch::withoutGlobalScopes()->find($a->branch_id)->name);

    $this->actingAs($userA)->patchJson('/api/me', ['contact_number' => '0917 000 1111', 'personal_email' => 'me@example.com', 'address' => '12 New Street'])
        ->assertOk()->assertJsonPath('data.personal.contactNumber', '0917 000 1111')->assertJsonPath('data.personal.firstName', $a->personal['firstName']);
    expect($a->fresh()->personal)->toMatchArray(['personalEmail' => 'me@example.com', 'address' => '12 New Street', 'lastName' => $a->personal['lastName']]);

    // A bad email or a missing field is refused, and the rest of the record is not editable here.
    $this->actingAs($userA)->patchJson('/api/me', ['contact_number' => '1', 'address' => 'x', 'personal_email' => 'nope'])->assertUnprocessable();
    $this->actingAs($userA)->patchJson('/api/me', ['address' => 'x'])->assertUnprocessable();
    $this->actingAs($userA)->putJson("/api/employees/{$a->id}/personal", [])->assertForbidden();
});

test('an account with no employee gets nothing from me, and an employee cannot read someone else', function () {
    [$admin, , $b, $userA] = twoEmployees();

    $this->actingAs(companyUser('employee', $admin->company))->getJson('/api/me')->assertOk()->assertJsonPath('data', null);
    $this->actingAs(companyUser('employee', $admin->company))->patchJson('/api/me', ['contact_number' => '1', 'address' => 'x'])->assertNotFound();
    // The employee scope hides the record before the permission is even asked: a 404, not a leak.
    $this->actingAs($userA)->getJson("/api/employees/{$b->id}")->assertNotFound();
});

test('an employee reads only their own attendance, loans and roster', function () {
    [$admin, $a, $b, $userA] = twoEmployees();
    $day = WorkSchedule::where('company_id', $admin->company_id)->first();
    foreach ([$a, $b] as $e) {
        AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'date' => '2027-03-01', 'time_in' => '09:00', 'time_out' => '18:00', 'status' => 'present']);
        Loan::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'type' => 'company_loan', 'label' => 'Loan', 'principal' => 1000, 'balance' => 1000, 'monthly_deduction' => 100, 'start_date' => '2027-01-01', 'status' => 'active']);
        ShiftAssignment::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'date' => '2027-03-01', 'work_schedule_id' => $day->id]);
    }

    $this->actingAs($userA)->getJson('/api/attendance?from=2027-03-01&to=2027-03-31')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.employee_id', $a->id);
    $this->actingAs($userA)->getJson('/api/attendance?from=2027-03-01&to=2027-03-31&employee_id='.$b->id)->assertOk()->assertJsonCount(0, 'data');
    $this->actingAs($userA)->getJson('/api/loans')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.employee_id', $a->id);
    $this->actingAs($userA)->getJson('/api/schedules/roster?from=2027-03-01&to=2027-03-31')->assertOk()->assertJsonCount(1, 'data');
    $this->actingAs($userA)->getJson('/api/schedules/templates')->assertOk();
    // Writing the roster, or everyone's late dates, stays with the roles that manage them.
    $this->actingAs($userA)->postJson('/api/schedules/roster/clear', [])->assertForbidden();
    $this->actingAs($userA)->getJson('/api/attendance/late-dates')->assertForbidden();
});

test('an employee files and cancels their own leave and never anyone else\'s; a manager cannot file for the team', function () {
    [$admin, $a, $b, $userA] = twoEmployees();
    LeaveDefaults::ensure($admin->company_id);
    LeaveLedger::grantYear($a, now()->year);
    LeaveLedger::grantYear($b, now()->year);
    $type = LeaveType::where('company_id', $admin->company_id)->where('name', 'Vacation Leave')->firstOrFail();
    $body = fn ($e) => ['employee_id' => $e->id, 'leave_type_id' => $type->id, 'date_from' => '2027-03-01', 'date_to' => '2027-03-02'];

    $this->actingAs($userA)->postJson('/api/leave/requests/preview', $body($a))->assertOk();
    $id = $this->actingAs($userA)->postJson('/api/leave/requests', $body($a))->assertCreated()->json('data.id');
    $this->actingAs($userA)->postJson('/api/leave/requests', $body($b))->assertForbidden();
    $this->actingAs($userA)->postJson('/api/leave/requests/preview', $body($b))->assertForbidden();
    $this->actingAs($userA)->getJson('/api/leave/requests')->assertOk()->assertJsonCount(1, 'data');

    // A manager has self-service too, but that is not the right to file or cancel for the team.
    $manager = companyUser('manager', $admin->company, ['branch_id' => $a->branch_id, 'employee_id' => $b->id]);
    $this->actingAs($manager)->postJson('/api/leave/requests', $body($a))->assertForbidden();
    $this->actingAs($manager)->postJson("/api/leave/requests/{$id}/cancel")->assertForbidden();

    $this->actingAs($userA)->postJson("/api/leave/requests/{$id}/cancel")->assertOk();
    expect(LeaveRequest::first()->status)->toBe('cancelled');
    // HR still files for anyone.
    $this->actingAs(companyUser('hr_admin', $admin->company))->postJson('/api/leave/requests', $body($b))->assertCreated();
});

test('an employee files overtime for themselves, sees the rates and can withdraw a pending request', function () {
    [$admin, $a, $b, $userA] = twoEmployees();
    $keys = collect($this->actingAs($userA)->getJson('/api/overtime/rates')->assertOk()->json('data'))->pluck('key')->all();
    expect($keys)->toContain('regular', 'night_diff')->and($keys)->not->toContain('regular_holiday_worked');

    $body = fn ($e) => ['employee_id' => $e->id, 'work_date' => '2027-03-01', 'start_time' => '18:00', 'end_time' => '21:00', 'type' => 'regular', 'source' => 'ess'];
    $this->actingAs($userA)->postJson('/api/overtime', $body($b))->assertNotFound();
    $id = $this->actingAs($userA)->postJson('/api/overtime', $body($a))->assertCreated()->json('data.id');
    $this->actingAs($userA)->getJson('/api/overtime')->assertOk()->assertJsonCount(1, 'data');

    $other = OvertimeRecord::create(['company_id' => $admin->company_id, 'employee_id' => $b->id, 'work_date' => '2027-03-02', 'start_time' => '18:00', 'end_time' => '19:00', 'hours' => 1, 'type' => 'regular', 'multiplier' => 1.25, 'status' => 'pending']);
    $this->actingAs($userA)->deleteJson("/api/overtime/{$other->id}")->assertNotFound();
    $this->actingAs($userA)->deleteJson("/api/overtime/{$id}")->assertOk();
    expect(OvertimeRecord::withoutGlobalScopes()->count())->toBe(1);

    $other->update(['status' => 'approved']);
    $this->actingAs(companyUser('hr_admin', $admin->company))->deleteJson("/api/overtime/{$other->id}")->assertConflict();
    $this->actingAs($admin)->deleteJson("/api/overtime/{$other->id}")->assertForbidden();
});

test('the manager dashboard counts the team of the manager only', function () {
    $admin = companyUser('payroll_admin');
    $mine = Branch::factory()->create(['company_id' => $admin->company_id]);
    $theirs = Branch::factory()->create(['company_id' => $admin->company_id]);
    [$a] = runStaff($admin->company);
    [$b] = runStaff($admin->company);
    [$c] = runStaff($admin->company);
    foreach ([[$a, $mine], [$b, $mine], [$c, $theirs]] as [$e, $branch]) {
        $e->update(['branch_id' => $branch->id]);
    }
    $today = now()->toDateString();
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $a->id, 'date' => $today, 'time_in' => '09:30', 'time_out' => null, 'status' => 'late']);
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $b->id, 'date' => $today, 'status' => 'absent']);
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $c->id, 'date' => $today, 'time_in' => '09:00', 'time_out' => '18:00', 'status' => 'present']);
    OvertimeRecord::create(['company_id' => $admin->company_id, 'employee_id' => $a->id, 'work_date' => $today, 'start_time' => '22:00', 'end_time' => '23:00', 'hours' => 1, 'type' => 'night_diff', 'multiplier' => 1.1, 'status' => 'pending']);
    OvertimeRecord::create(['company_id' => $admin->company_id, 'employee_id' => $c->id, 'work_date' => $today, 'start_time' => '18:00', 'end_time' => '19:00', 'hours' => 1, 'type' => 'regular', 'multiplier' => 1.25, 'status' => 'pending']);

    $manager = companyUser('manager', $admin->company, ['branch_id' => $mine->id]);
    $d = $this->actingAs($manager)->getJson('/api/manager/dashboard')->assertOk()->json('data');
    expect($d['headcount'])->toBe(2)->and($d['attendance_date'])->toBe($today)->and($d['present'])->toBe(1)->and($d['late'])->toBe(1)->and($d['absent'])->toBe(1)
        ->and($d['missing_records'])->toBe(1)->and($d['pending']['night_diff'])->toBe(1)->and($d['pending']['overtime'])->toBe(0)
        ->and(collect($d['attention'])->pluck('status')->all())->toBe(['absent', 'late']);

    $this->actingAs(companyUser('employee', $admin->company))->getJson('/api/manager/dashboard')->assertForbidden();
});

test('finalizing a run tells the employee about the loan payment it took', function () {
    $admin = companyUser('payroll_admin');
    [$e, $group] = runStaff($admin->company);
    $self = companyUser('employee', $admin->company, ['employee_id' => $e->id]);
    $loan = Loan::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'type' => 'sss_salary_loan', 'label' => 'SSS Salary Loan', 'principal' => 10000, 'monthly_deduction' => 2000, 'start_date' => '2026-09-01']);

    $id = newRun($this, $admin, $group->id);
    $this->actingAs($admin)->postJson("/api/payroll/{$id}/run")->assertOk();
    $this->actingAs($admin)->postJson("/api/payroll/{$id}/approve")->assertOk();
    $this->actingAs($admin)->postJson("/api/payroll/{$id}/finalize")->assertOk();

    $notice = $self->notifications->firstWhere(fn ($n) => str_starts_with($n->data['message'], 'Loan payment'))->data;
    expect($notice['message'])->toBe('Loan payment of ₱1,000.00 processed for "SSS Salary Loan"')->and($notice['link'])->toBe('/ess/loans')->and($notice['highlight_id'])->toBe($loan->id);
});
