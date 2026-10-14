<?php

use App\Models\AttendanceRecord;
use App\Models\Branch;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\OvertimeRecord;
use App\Models\WorkLog;
use App\Support\LeaveDefaults;

function dashboardLeave(int $companyId, int $employeeId, string $status, string $from, string $to): void
{
    LeaveDefaults::ensure($companyId);
    LeaveRequest::create(['company_id' => $companyId, 'employee_id' => $employeeId, 'leave_type_id' => LeaveType::where('company_id', $companyId)->first()->id, 'date_from' => $from, 'date_to' => $to, 'days' => 1, 'status' => $status]);
}

test('the overview counts headcount, attendance, leave and overtime of today, and the pay cycle in progress', function () {
    $admin = companyUser('company_admin');
    [$a] = runStaff($admin->company);
    [$b] = runStaff($admin->company);
    [$c] = runStaff($admin->company, [], ['status' => 'inactive']);
    $today = now()->toDateString();
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $a->id, 'date' => $today, 'time_in' => '09:00', 'time_out' => '18:00', 'status' => 'present']);
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $b->id, 'date' => $today, 'status' => 'absent']);
    dashboardLeave($admin->company_id, $b->id, 'approved', $today, $today);
    dashboardLeave($admin->company_id, $a->id, 'pending', $today, $today);
    OvertimeRecord::create(['company_id' => $admin->company_id, 'employee_id' => $a->id, 'work_date' => $today, 'start_time' => '18:00', 'end_time' => '20:30', 'hours' => 2.5, 'type' => 'regular', 'multiplier' => 1.25, 'status' => 'approved']);

    $d = $this->actingAs($admin)->getJson('/api/dashboard/overview')->assertOk()->json('data');
    expect($d['metrics'])->toMatchArray([
        'total_employees' => 3, 'active_employees' => 2, 'inactive_employees' => 1, 'present_today' => 1, 'attendance_rate' => 50,
        'on_leave_today' => 1, 'leave_approved' => 1, 'leave_pending' => 1, 'overtime_employees' => 1,
    ])->and($d['metrics']['overtime_hours'])->toEqual(2.5);
    expect($d['recent_employees'])->toHaveCount(2)->and($d['cycle']['cutoff'])->toBeString()->and($d['cycle']['release'] >= $today)->toBeTrue()
        ->and($d['cycle']['processing'] <= $d['cycle']['release'])->toBeTrue();
    expect($c->fresh()->status)->toBe('inactive');
});

test('the overview of a manager is the team of the manager, and an employee gets no dashboard', function () {
    $admin = companyUser('company_admin');
    $mine = Branch::factory()->create(['company_id' => $admin->company_id]);
    [$a] = runStaff($admin->company);
    [$b] = runStaff($admin->company);
    $a->update(['branch_id' => $mine->id]);

    $manager = companyUser('manager', $admin->company, ['branch_id' => $mine->id]);
    $this->actingAs($manager)->getJson('/api/dashboard/overview')->assertOk()->assertJsonPath('data.metrics.total_employees', 1);
    $this->actingAs(companyUser('employee', $admin->company, ['employee_id' => $b->id]))->getJson('/api/dashboard/overview')->assertForbidden();
});

test('the payroll dashboard follows the run in progress, the trend of the last runs and what looks wrong', function () {
    $admin = companyUser('payroll_admin');
    [$e, $group] = runStaff($admin->company);
    $done = newRun($this, $admin, $group->id, ['label' => 'Sep 16 – 30, 2026', 'start_date' => '2026-09-16', 'end_date' => '2026-09-30', 'pay_date' => '2026-09-30']);
    foreach (['run', 'approve', 'finalize'] as $step) {
        $this->actingAs($admin)->postJson("/api/payroll/{$done}/{$step}")->assertOk();
    }
    $open = newRun($this, $admin, $group->id);
    $this->actingAs($admin)->postJson("/api/payroll/{$open}/run")->assertOk();
    WorkLog::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'type' => 'hourly', 'work_date' => '2026-10-02', 'quantity' => 4, 'unit_label' => 'hrs', 'rate' => 100, 'amount' => 400, 'status' => 'pending']);

    $d = $this->actingAs($admin)->getJson('/api/dashboard/payroll')->assertOk()->json('data');
    expect($d['current']['id'])->toBe($open)->and($d['current']['status'])->toBe('review')->and($d['current']['employees'])->toBe(1);
    expect($d['totals']['gross_pay'])->toEqual(15000)->and($d['totals']['payroll_cost'])->toBeGreaterThan(15000);
    expect($d['counts'])->toMatchArray(['periods' => 2, 'pending_runs' => 1, 'awaiting_approval' => 1, 'approved_not_finalized' => 0]);
    expect($d['trend'])->toHaveCount(2)->and($d['trend'][0]['run'])->toBe('PR001')->and($d['trend'][0]['gross_pay'])->toEqual(15000);
    expect(collect($d['pipeline'])->pluck('runs', 'stage')->all())->toBe(['Draft' => 0, 'In review' => 1, 'Approved' => 0, 'Finalized' => 1]);
    expect(collect($d['deduction_breakdown'])->pluck('name')->all())->toContain('SSS');
    expect(collect($d['exceptions'])->pluck('id')->all())->toContain('no-bank', 'no-gov', 'pending-logs')->and($d['pending_records']['work_logs'])->toBe(1);
});

test('the workforce charts give the last working days and the headcount by department', function () {
    $admin = companyUser('hr_admin');
    [$a] = runStaff($admin->company);
    [$b] = runStaff($admin->company, [], ['department' => 'Ops']);
    foreach (['2026-10-12', '2026-10-13'] as $date) {
        AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $a->id, 'date' => $date, 'time_in' => '09:00', 'time_out' => '18:00', 'status' => 'present']);
    }
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $b->id, 'date' => '2026-10-13', 'status' => 'late', 'time_in' => '09:40']);
    dashboardLeave($admin->company_id, $b->id, 'approved', '2026-10-13', '2026-10-13');

    $d = $this->actingAs($admin)->getJson('/api/dashboard/workforce')->assertOk()->json('data');
    expect($d['attendance'])->toHaveCount(2)->and($d['attendance'][1])->toMatchArray(['day' => 'Oct 13', 'present' => 1, 'late' => 1, 'on_leave' => 1]);
    expect(collect($d['headcount'])->pluck('active', 'department')->all())->toBe(['Ops' => 1, 'Sales' => 1]);
});

test('the payroll lines of a date range come in one request, for the report roles only', function () {
    $admin = companyUser('payroll_admin');
    [$e, $group] = runStaff($admin->company);
    $in = newRun($this, $admin, $group->id, ['start_date' => '2026-09-16', 'end_date' => '2026-09-30', 'pay_date' => '2026-09-30']);
    $out = newRun($this, $admin, $group->id, ['start_date' => '2025-01-01', 'end_date' => '2025-01-15', 'pay_date' => '2025-01-15']);
    foreach ([$in, $out] as $id) {
        $this->actingAs($admin)->postJson("/api/payroll/{$id}/run")->assertOk();
    }

    $d = $this->actingAs($admin)->getJson('/api/reports/payroll-lines?from=2026-01-01&to=2026-12-31')->assertOk()->json('data');
    expect($d['periods'])->toHaveCount(1)->and($d['lines'])->toHaveCount(1)->and($d['lines'][0]['periodId'])->toBe((string) $in)->and($d['lines'][0])->toHaveKey('earnings');
    $this->actingAs($admin)->getJson('/api/reports/payroll-lines?from=2026-12-31&to=2026-01-01')->assertUnprocessable();

    $this->actingAs(companyUser('hr_admin', $admin->company))->getJson('/api/reports/payroll-lines')->assertOk();
    $this->actingAs(companyUser('manager', $admin->company, ['branch_id' => $e->branch_id]))->getJson('/api/reports/payroll-lines')->assertForbidden();
    $this->actingAs(companyUser('employee', $admin->company))->getJson('/api/reports/payroll-lines')->assertForbidden();
});
