<?php

use App\Models\AttendanceRecord;
use App\Models\Branch;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\LeaveLedgerEntry;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\WorkSchedule;
use App\Support\LeaveDefaults;
use App\Support\LeaveLedger;

/** An employee on a Mon-Fri schedule, hired long ago, with this year's credits (Vacation 15, Sick 10 ...). */
function leaveStaff(int $companyId, ?int $branchId = null, array $employment = []): Employee
{
    LeaveDefaults::ensure($companyId);
    $branchId ??= Branch::factory()->create(['company_id' => $companyId])->id;
    $schedule = WorkSchedule::firstOrCreate(['company_id' => $companyId, 'name' => 'Day'], [
        'shift_type' => 'day', 'start_time' => '09:00', 'end_time' => '18:00', 'break_minutes' => 60, 'grace_period_minutes' => 10, 'days_of_week' => [1, 2, 3, 4, 5], 'rest_days' => [6, 7],
    ]);
    $employee = Employee::factory()->create(['company_id' => $companyId, 'branch_id' => $branchId, 'employment' => ['position' => 'Clerk', 'department' => 'Sales', 'employmentType' => 'regular', 'dateHired' => '2020-01-01', 'status' => 'active', 'category' => 'regular', ...$employment]]);
    Employee::withoutGlobalScopes()->whereKey($employee->id)->update(['work_schedule_id' => $schedule->id]);
    LeaveLedger::grantYear($employee, now()->year);

    return $employee;
}

function vacation(int $companyId): LeaveType
{
    return LeaveType::where('company_id', $companyId)->where('name', 'Vacation Leave')->firstOrFail();
}

/** A Monday well in the future, so no clash with anything else. */
const NEXT_MON = '2027-03-01';

function filing(Employee $e, LeaveType $t, array $overrides = []): array
{
    return ['employee_id' => $e->id, 'leave_type_id' => $t->id, 'date_from' => NEXT_MON, 'date_to' => '2027-03-05', ...$overrides];
}

test('leave types start with the defaults, and only those who manage types can change them', function () {
    $admin = companyUser();
    $types = $this->actingAs($admin)->getJson('/api/leave/types')->assertOk()->assertJsonCount(4, 'data')->json('data');
    expect(collect($types)->pluck('name')->all())->toContain('Vacation Leave');

    $id = $this->actingAs($admin)->postJson('/api/leave/types', ['name' => 'Study Leave', 'is_paid' => false, 'default_credits' => 3, 'max_carry_over' => 0, 'tier_credits' => ['executive' => 5]])->assertCreated()->json('data.id');
    $this->actingAs($admin)->postJson('/api/leave/types', ['name' => 'Study Leave', 'is_paid' => true, 'default_credits' => 1, 'max_carry_over' => 0])->assertUnprocessable();
    $this->actingAs($admin)->putJson("/api/leave/types/{$id}", ['name' => 'Study Leave', 'is_paid' => false, 'default_credits' => 4, 'max_carry_over' => 1])->assertOk();

    $manager = companyUser('manager', $admin->company, ['branch_id' => Branch::factory()->create(['company_id' => $admin->company_id])->id]);
    $this->actingAs($manager)->postJson('/api/leave/types', ['name' => 'X', 'is_paid' => true, 'default_credits' => 1, 'max_carry_over' => 0])->assertForbidden();
    $this->actingAs($manager)->getJson('/api/leave/types')->assertOk();
});

test('the preview counts working days and leaves out rest days and holidays; half days are 0.5', function () {
    $admin = companyUser();
    $e = leaveStaff($admin->company_id);
    $t = vacation($admin->company_id);
    Holiday::create(['company_id' => $admin->company_id, 'name' => 'Test', 'date' => '2027-03-03', 'type' => 'regular', 'scope' => 'national']);

    // Mon-Fri with a Wednesday holiday = 4
    $this->actingAs($admin)->postJson('/api/leave/requests/preview', filing($e, $t))->assertOk()->assertJsonPath('data.days', 4)->assertJsonPath('data.available', 15);
    // Sat-Sun only = nothing to file
    $this->actingAs($admin)->postJson('/api/leave/requests/preview', filing($e, $t, ['date_from' => '2027-03-06', 'date_to' => '2027-03-07']))->assertOk()->assertJsonPath('data.error', 'These dates are all rest days or days off, so there is nothing to file leave for.');
    // a half day is one date
    $this->actingAs($admin)->postJson('/api/leave/requests/preview', filing($e, $t, ['day_portion' => 'half_am', 'date_to' => '2027-03-05']))->assertJsonPath('data.days', 0.5);
});

test('filing, approving and cancelling move the balance, and a second decision is a conflict', function () {
    $admin = companyUser();
    $e = leaveStaff($admin->company_id);
    $t = vacation($admin->company_id);

    $id = $this->actingAs($admin)->postJson('/api/leave/requests', filing($e, $t, ['reason' => 'Trip']))->assertCreated()->assertJsonPath('data.days', 5)->json('data.id');
    // pending requests hold credits: available drops, the balance does not
    $row = $this->actingAs($admin)->getJson('/api/leave/balances?employee_id='.$e->id)->json('data');
    $vac = collect($row)->firstWhere('leave_type_id', $t->id);
    expect($vac['balance'])->toBe(15)->and($vac['pending'])->toBe(5)->and($vac['available'])->toBe(10);

    $this->actingAs($admin)->postJson('/api/leave/requests/decide', ['ids' => [$id], 'decision' => 'approved'])->assertOk()->assertJsonPath('data.decided', 1);
    expect(LeaveLedger::balance($e->id, $t->id))->toBe(10.0)->and(LeaveLedger::pending($e->id, $t->id))->toBe(0.0)
        ->and(LeaveLedgerEntry::where('entry_type', 'used')->first()->leave_request_id)->toBe($id);
    $this->actingAs($admin)->postJson('/api/leave/requests/decide', ['ids' => [$id], 'decision' => 'rejected'])->assertStatus(409);

    // cancelling an approved request gives the days back
    $this->actingAs($admin)->postJson("/api/leave/requests/{$id}/cancel")->assertOk();
    expect(LeaveLedger::balance($e->id, $t->id))->toBe(15.0)->and(LeaveRequest::first()->status)->toBe('cancelled');
    $this->actingAs($admin)->postJson("/api/leave/requests/{$id}/cancel")->assertStatus(409);
});

test('a rejected or cancelled pending request never touches the balance', function () {
    $admin = companyUser();
    $e = leaveStaff($admin->company_id);
    $t = vacation($admin->company_id);
    $a = $this->actingAs($admin)->postJson('/api/leave/requests', filing($e, $t))->json('data.id');
    $b = $this->actingAs($admin)->postJson('/api/leave/requests', filing($e, $t, ['date_from' => '2027-04-05', 'date_to' => '2027-04-06']))->json('data.id');

    $this->actingAs($admin)->postJson('/api/leave/requests/decide', ['ids' => [$a], 'decision' => 'rejected'])->assertOk();
    $this->actingAs($admin)->postJson("/api/leave/requests/{$b}/cancel")->assertOk();

    expect(LeaveLedger::balance($e->id, $t->id))->toBe(15.0)->and(LeaveLedgerEntry::where('entry_type', 'used')->count())->toBe(0);
});

test('overlapping leave and too little credit are refused, but AM and PM half days of one date fit', function () {
    $admin = companyUser();
    $e = leaveStaff($admin->company_id);
    $t = vacation($admin->company_id);
    $this->actingAs($admin)->postJson('/api/leave/requests', filing($e, $t))->assertCreated();

    $this->actingAs($admin)->postJson('/api/leave/requests', filing($e, $t, ['date_from' => '2027-03-04', 'date_to' => '2027-03-04']))->assertUnprocessable()->assertJsonPath('message', 'This employee already has pending leave on 2027-03-01 to 2027-03-05.');
    // 10 credits are still free: 11 days are too many
    $this->actingAs($admin)->postJson('/api/leave/requests', filing($e, $t, ['date_from' => '2027-04-05', 'date_to' => '2027-04-19']))->assertUnprocessable()->assertJsonPath('message', 'Not enough Vacation Leave credits: 10 days available, 11 requested.');

    $this->actingAs($admin)->postJson('/api/leave/requests', filing($e, $t, ['day_portion' => 'half_am', 'date_from' => '2027-05-03', 'date_to' => '2027-05-03']))->assertCreated();
    $this->actingAs($admin)->postJson('/api/leave/requests', filing($e, $t, ['day_portion' => 'half_pm', 'date_from' => '2027-05-03', 'date_to' => '2027-05-03']))->assertCreated();
    $this->actingAs($admin)->postJson('/api/leave/requests', filing($e, $t, ['day_portion' => 'half_pm', 'date_from' => '2027-05-03', 'date_to' => '2027-05-03']))->assertUnprocessable();
});

test('approving cannot take the balance below zero, and unpaid types are not capped', function () {
    $admin = companyUser();
    $e = leaveStaff($admin->company_id);
    $t = vacation($admin->company_id);
    $id = $this->actingAs($admin)->postJson('/api/leave/requests', filing($e, $t))->json('data.id');
    // HR lowers the balance after the request was filed
    $this->actingAs($admin)->postJson('/api/leave/credits', ['employee_ids' => [$e->id], 'leave_type_id' => $t->id, 'days' => 2, 'mode' => 'set'])->assertOk();

    $this->actingAs($admin)->postJson('/api/leave/requests/decide', ['ids' => [$id], 'decision' => 'approved'])->assertStatus(409);
    expect(LeaveRequest::first()->status)->toBe('pending')->and(LeaveLedger::balance($e->id, $t->id))->toBe(2.0);

    $unpaid = LeaveType::create(['company_id' => $admin->company_id, 'name' => 'Unpaid', 'is_paid' => false, 'default_credits' => 0, 'max_carry_over' => 0]);
    $this->actingAs($admin)->postJson('/api/leave/requests', filing($e, $unpaid, ['date_from' => '2027-06-07', 'date_to' => '2027-06-18']))->assertCreated();
});

test('granting credits adds or sets, writing ledger entries', function () {
    $admin = companyUser();
    $e = leaveStaff($admin->company_id);
    $t = vacation($admin->company_id);

    $this->actingAs($admin)->postJson('/api/leave/credits', ['employee_ids' => [$e->id], 'leave_type_id' => $t->id, 'days' => 3, 'mode' => 'add'])->assertOk()->assertJsonPath('data.updated', 1);
    expect(LeaveLedger::balance($e->id, $t->id))->toBe(18.0);
    $this->actingAs($admin)->postJson('/api/leave/credits', ['employee_ids' => [$e->id], 'leave_type_id' => $t->id, 'days' => 8, 'mode' => 'set'])->assertOk();
    expect(LeaveLedger::balance($e->id, $t->id))->toBe(8.0)->and(LeaveLedgerEntry::where('entry_type', 'adjustment')->pluck('days')->all())->toBe([3.0, -10.0]);
});

test('a new hire gets the year credits pro-rated by the month, by tier', function () {
    $admin = companyUser();
    LeaveDefaults::ensure($admin->company_id);
    $t = vacation($admin->company_id);
    $t->update(['tier_credits' => ['executive' => 20, 'managerial' => 18]]);
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    $mk = fn (array $employment) => Employee::factory()->create(['company_id' => $admin->company_id, 'branch_id' => $branch->id, 'employment' => ['department' => 'Sales', 'employmentType' => 'regular', 'status' => 'active', 'category' => 'regular', ...$employment]]);

    // hired in July: 6 of 12 months of 15 = 7.5
    expect(LeaveLedger::yearlyCredits($mk(['position' => 'Clerk', 'dateHired' => '2026-07-10']), $t, 2026))->toBe(7.5)
        // an earlier hire gets the full year; a later hire none yet
        ->and(LeaveLedger::yearlyCredits($mk(['position' => 'Clerk', 'dateHired' => '2024-02-01']), $t, 2026))->toBe(15.0)
        ->and(LeaveLedger::yearlyCredits($mk(['position' => 'Clerk', 'dateHired' => '2027-01-02']), $t, 2026))->toBe(0.0)
        // tiers
        ->and(LeaveLedger::yearlyCredits($mk(['position' => 'Manager', 'dateHired' => '2020-01-01']), $t, 2026))->toBe(20.0)
        ->and(LeaveLedger::yearlyCredits($mk(['position' => 'Team Lead', 'dateHired' => '2020-01-01']), $t, 2026))->toBe(18.0);
});

test('hiring through the API grants credits and the employee shows them from the ledger', function () {
    $admin = companyUser();
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    $payload = [
        'branch_id' => $branch->id,
        'personal' => ['firstName' => 'Maria', 'lastName' => 'Santos', 'birthDate' => '1993-06-14', 'civilStatus' => 'single', 'address' => 'QC', 'contactNumber' => '0917'],
        'employment' => ['position' => 'Clerk', 'department' => 'Finance', 'employmentType' => 'regular', 'dateHired' => '2020-01-05', 'category' => 'regular'],
        'compensation' => ['basicPay' => 20000, 'payType' => 'monthly', 'allowances' => []],
    ];

    $id = $this->actingAs($admin)->postJson('/api/employees', $payload)->assertCreated()->json('data.id');
    $credits = $this->actingAs($admin)->getJson("/api/employees/{$id}")->json('data.benefits.leaveCreditsByType');
    expect($credits)->toMatchArray(['Vacation Leave' => 15, 'Sick Leave' => 10, 'Emergency Leave' => 5, 'Maternity/Paternity Leave' => 7]);

    // editing the credits on the profile becomes an adjustment in the ledger
    $this->actingAs($admin)->putJson("/api/employees/{$id}/benefits", ['benefits' => ['leaveCreditsByType' => ['Vacation Leave' => 12]]])->assertOk();
    expect(LeaveLedger::balance($id, vacation($admin->company_id)->id))->toBe(12.0);
    expect($this->actingAs($admin)->getJson('/api/employees?per_page=5')->json('data.0.benefits.leaveCreditsByType.Vacation Leave'))->toBe(12);
});

test('year end carries over up to the limit, expires the rest, grants the new year, and is safe to repeat', function () {
    $admin = companyUser();
    $e = leaveStaff($admin->company_id);
    $t = vacation($admin->company_id); // 15 a year, carry over up to 5
    $year = now()->year;

    // the employee uses 3 days: 12 left, so 7 expire and 5 carry over
    LeaveLedger::record($e, $t, 'used', -3, 'Leave', null, null, "{$year}-06-01");
    $this->artisan('leave:year-end', ['--year' => $year])->assertSuccessful();

    expect(LeaveLedger::balance($e->id, $t->id))->toBe(20.0) // 5 carried + 15 new
        ->and(LeaveLedgerEntry::where('entry_type', 'expiry')->where('leave_type_id', $t->id)->first()->days)->toBe(-7.0);

    // running it again changes nothing
    $this->artisan('leave:year-end', ['--year' => $year])->assertSuccessful();
    expect(LeaveLedger::balance($e->id, $t->id))->toBe(20.0)->and(LeaveLedgerEntry::where('entry_type', 'grant')->where('leave_year', $year + 1)->count())->toBe(4);
});

test('three year ends in a row never let the balance pass the carry-over plus a year of credits', function () {
    $admin = companyUser();
    $e = leaveStaff($admin->company_id);
    $t = vacation($admin->company_id);
    $start = now()->year;

    foreach ([0, 1, 2] as $i) {
        $this->artisan('leave:year-end', ['--year' => $start + $i])->assertSuccessful();
        expect(LeaveLedger::balance($e->id, $t->id))->toBe(20.0);
    }
});

test('a day of approved leave is skipped by manual attendance logging', function () {
    $admin = companyUser();
    $e = leaveStaff($admin->company_id);
    $t = vacation($admin->company_id);
    $monday = now()->startOfWeek()->addWeek();
    $id = $this->actingAs($admin)->postJson('/api/leave/requests', filing($e, $t, ['date_from' => $monday->toDateString(), 'date_to' => $monday->toDateString()]))->json('data.id');
    $this->actingAs($admin)->postJson('/api/leave/requests/decide', ['ids' => [$id], 'decision' => 'approved'])->assertOk();

    $r = $this->actingAs($admin)->postJson('/api/attendance/log', ['employee_ids' => [$e->id], 'date_from' => $monday->toDateString(), 'date_to' => $monday->toDateString(), 'work_type' => 'onsite', 'time_in' => '09:00', 'time_out' => '18:00', 'reason' => 'x'])->assertOk()->json('data');

    expect($r)->toBe(['created' => 0, 'updated' => 0, 'skipped' => 1])->and(AttendanceRecord::count())->toBe(0);
    $this->actingAs($admin)->getJson('/api/leave/requests?status=approved&from='.$monday->toDateString().'&to='.$monday->toDateString())->assertJsonCount(1, 'data');
});

test('a manager reads their branch but cannot file or approve, and balances stay in scope', function () {
    $admin = companyUser();
    $mine = Branch::factory()->create(['company_id' => $admin->company_id]);
    $other = Branch::factory()->create(['company_id' => $admin->company_id]);
    $manager = companyUser('manager', $admin->company, ['branch_id' => $mine->id]);
    $own = leaveStaff($admin->company_id, $mine->id);
    leaveStaff($admin->company_id, $other->id);
    $t = vacation($admin->company_id);

    $rows = $this->actingAs($manager)->getJson('/api/leave/balances')->assertOk()->json('data');
    expect(collect($rows)->pluck('employee_id')->unique()->all())->toBe([$own->id]);
    $this->actingAs($manager)->postJson('/api/leave/requests', filing($own, $t))->assertForbidden();
    $this->actingAs($manager)->postJson('/api/leave/requests/decide', ['ids' => [1], 'decision' => 'approved'])->assertForbidden();
});
