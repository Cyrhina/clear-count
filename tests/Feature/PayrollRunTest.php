<?php

use App\Models\AttendanceRecord;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Employee;
use App\Models\EmployeeCompensation;
use App\Models\EmployeeDeduction;
use App\Models\Loan;
use App\Models\PayrollGroup;
use App\Models\WorkLog;
use App\Models\WorkSchedule;

/** A semi-monthly group with one salaried employee on a Mon-Fri schedule. */
function runStaff(Company $company, array $compensation = []): array
{
    $schedule = WorkSchedule::firstOrCreate(['company_id' => $company->id, 'name' => 'Day'], ['shift_type' => 'day', 'start_time' => '09:00', 'end_time' => '18:00', 'break_minutes' => 60, 'grace_period_minutes' => 10, 'days_of_week' => [1, 2, 3, 4, 5], 'rest_days' => [6, 7]]);
    $group = PayrollGroup::firstOrCreate(['company_id' => $company->id, 'name' => 'Semi'], [
        'frequency' => 'semi_monthly', 'cutoff_config' => ['start_day' => 1], 'pay_date_config' => ['type' => 'fixed'], 'deduction_schedule' => 'DIVIDED', 'work_schedule_id' => $schedule->id, 'effective_date' => '2024-01-01',
    ]);
    $employee = Employee::factory()->create([
        'company_id' => $company->id, 'branch_id' => Branch::factory()->create(['company_id' => $company->id])->id, 'payroll_group_id' => $group->id,
        'employment' => ['position' => 'Clerk', 'department' => 'Sales', 'employmentType' => 'regular', 'dateHired' => '2020-01-01', 'status' => 'active', 'category' => 'regular'],
        'compensation' => ['payType' => 'monthly', 'basicPay' => 30000, 'allowances' => [], ...$compensation],
    ]);
    EmployeeCompensation::create(['company_id' => $company->id, 'employee_id' => $employee->id, 'effective_from' => '2020-01-01', 'rate_type' => $employee->compensation['payType'], 'basic_rate' => $employee->compensation['basicPay'], 'allowances' => [], 'reason' => 'Initial Hire']);

    return [$employee, $group];
}

function newRun($test, $admin, ?int $groupId, array $over = []): int
{
    return $test->actingAs($admin)->postJson('/api/payroll', ['label' => 'Oct 1 – 15, 2026', 'start_date' => '2026-10-01', 'end_date' => '2026-10-15', 'pay_date' => '2026-10-15', 'payroll_group_id' => $groupId, ...$over])
        ->assertCreated()->json('data.id');
}

test('a run goes draft, review, approved, finalized; finalizing posts the loan, settles the one-time deduction and locks the run', function () {
    $admin = companyUser('payroll_admin');
    [$e, $group] = runStaff($admin->company);
    $loan = Loan::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'type' => 'sss_salary_loan', 'label' => 'SSS Salary Loan', 'principal' => 10000, 'monthly_deduction' => 2000, 'start_date' => '2026-09-01']);
    $uniform = EmployeeDeduction::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'name' => 'Uniform', 'kind' => 'one_time', 'amount' => 900, 'due_date' => '2026-10-10']);

    $id = newRun($this, $admin, $group->id);
    $this->actingAs($admin)->getJson("/api/payroll/{$id}/lines")->assertOk()->assertJsonCount(0, 'data');
    $this->actingAs($admin)->postJson("/api/payroll/{$id}/approve")->assertConflict();

    $this->actingAs($admin)->postJson("/api/payroll/{$id}/run")->assertOk()->assertJsonPath('data.status', 'review');
    $line = $this->actingAs($admin)->getJson("/api/payroll/{$id}/lines")->assertJsonCount(1, 'data')->json('data.0');
    expect($line['employeeId'])->toBe((string) $e->id)->and($line['grossPay'])->toEqual(15000)->and($line['loanDeductions'])->toEqual([['label' => 'SSS Salary Loan', 'amount' => 1000]]);
    $this->actingAs($admin)->getJson("/api/payroll/lines/{$line['id']}")->assertOk()->assertJsonPath('data.netPay', $line['netPay']);

    $this->actingAs($admin)->postJson("/api/payroll/{$id}/finalize")->assertConflict();
    $this->actingAs($admin)->postJson("/api/payroll/{$id}/approve")->assertOk()->assertJsonPath('data.status', 'approved');
    expect(Loan::find($loan->id)->repayments()->count())->toBe(0);

    $this->actingAs($admin)->postJson("/api/payroll/{$id}/finalize")->assertOk()->assertJsonPath('data.status', 'finalized');
    expect($loan->repayments()->first()->amount)->toEqual(1000)->and($uniform->fresh()->status)->toBe('completed')->and($uniform->fresh()->settled_in_period_id)->toBe($id);

    foreach (['run', 'approve', 'finalize'] as $step) {
        $this->actingAs($admin)->postJson("/api/payroll/{$id}/{$step}")->assertConflict();
    }
    $this->actingAs($admin)->postJson("/api/payroll/{$id}/hold", ['employee_ids' => [$e->id]])->assertConflict();
    $this->actingAs($admin)->postJson("/api/payroll/{$id}/release", ['employee_ids' => [$e->id]])->assertConflict();
    expect(Loan::find($loan->id)->repayments()->count())->toBe(1);
});

test('run numbers count up per pay-date year and start again each year', function () {
    $admin = companyUser('payroll_admin');
    $this->actingAs($admin)->getJson('/api/payroll/next-number?pay_date=2026-10-15')->assertJsonPath('data.payroll_number', 'PR001');
    $first = newRun($this, $admin, null);
    $second = newRun($this, $admin, null, ['label' => 'Oct 16 – 31, 2026', 'start_date' => '2026-10-16', 'end_date' => '2026-10-31', 'pay_date' => '2026-10-31']);
    $next = newRun($this, $admin, null, ['label' => 'Jan 1 – 15, 2027', 'start_date' => '2027-01-01', 'end_date' => '2027-01-15', 'pay_date' => '2027-01-15']);

    $numbers = collect($this->actingAs($admin)->getJson('/api/payroll')->json('data'))->pluck('payroll_number', 'id');
    expect($numbers[$first])->toBe('PR001')->and($numbers[$second])->toBe('PR002')->and($numbers[$next])->toBe('PR001');
    // Newest cutoff first.
    expect(collect($this->actingAs($admin)->getJson('/api/payroll')->json('data'))->pluck('id')->first())->toBe($next);
});

test('a held employee has no line, and is computed again when released', function () {
    $admin = companyUser('payroll_admin');
    [$e, $group] = runStaff($admin->company);
    [$other] = runStaff($admin->company);
    $id = newRun($this, $admin, $group->id);
    $this->actingAs($admin)->postJson("/api/payroll/{$id}/run")->assertOk();

    $this->actingAs($admin)->postJson("/api/payroll/{$id}/hold", ['employee_ids' => [$e->id]])->assertOk()->assertJsonPath('data.count', 1);
    $this->actingAs($admin)->postJson("/api/payroll/{$id}/hold", ['employee_ids' => [$e->id]])->assertJsonPath('data.count', 0);
    expect(collect($this->actingAs($admin)->getJson("/api/payroll/{$id}/lines")->json('data'))->pluck('employeeId')->all())->toBe([(string) $other->id]);
    // A re-run keeps the employee out.
    $this->actingAs($admin)->postJson("/api/payroll/{$id}/run")->assertOk()->assertJsonPath('data.excluded_employee_ids', [$e->id]);
    $this->actingAs($admin)->getJson("/api/payroll/{$id}/lines")->assertJsonCount(1, 'data');

    $this->actingAs($admin)->postJson("/api/payroll/{$id}/release", ['employee_ids' => [$e->id]])->assertOk()->assertJsonPath('data.count', 1);
    $this->actingAs($admin)->getJson("/api/payroll/{$id}/lines")->assertJsonCount(2, 'data');
});

test('running locks the approved work logs it pays, and a run cannot pay a log another run already took', function () {
    $admin = companyUser('payroll_admin');
    [$e, $group] = runStaff($admin->company, ['payType' => 'hourly', 'basicPay' => 100]);
    $log = fn (string $date, string $status) => WorkLog::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'type' => 'hourly', 'work_date' => $date, 'quantity' => 8, 'unit_label' => 'hrs', 'rate' => 100, 'amount' => 800, 'status' => $status]);
    $paid = $log('2026-10-05', 'approved');
    $pending = $log('2026-10-06', 'pending');
    $outside = $log('2026-10-20', 'approved');

    $first = newRun($this, $admin, $group->id);
    $second = newRun($this, $admin, $group->id);
    $this->actingAs($admin)->postJson("/api/payroll/{$first}/run")->assertOk();
    expect($paid->fresh()->payroll_period_id)->toBe($first)->and($pending->fresh()->payroll_period_id)->toBeNull()->and($outside->fresh()->payroll_period_id)->toBeNull();

    $this->actingAs($admin)->postJson("/api/payroll/{$second}/run")->assertOk();
    expect($this->actingAs($admin)->getJson("/api/payroll/{$second}/lines")->json('data.0.earnings.0.amount'))->toEqual(0);

    // Holding the employee frees the log; the first run pays it again when released.
    $this->actingAs($admin)->postJson("/api/payroll/{$first}/hold", ['employee_ids' => [$e->id]])->assertOk();
    expect($paid->fresh()->payroll_period_id)->toBeNull();
    $this->actingAs($admin)->postJson("/api/payroll/{$first}/release", ['employee_ids' => [$e->id]])->assertOk();
    expect($paid->fresh()->payroll_period_id)->toBe($first);
});

test('each step needs its own permission, and a run of another company cannot be reached', function () {
    $admin = companyUser('payroll_admin');
    $id = newRun($this, $admin, null);

    $hr = companyUser('hr_admin');
    $this->actingAs($hr)->postJson('/api/payroll', ['label' => 'x', 'start_date' => '2026-10-01', 'end_date' => '2026-10-15', 'pay_date' => '2026-10-15'])->assertForbidden();
    $this->actingAs(companyUser('employee'))->getJson('/api/payroll')->assertForbidden();

    $foreign = companyUser('payroll_admin', otherCompany());
    $this->actingAs($foreign)->postJson("/api/payroll/{$id}/run")->assertNotFound();
    $this->actingAs($foreign)->getJson("/api/payroll/{$id}/lines")->assertNotFound();
    $this->actingAs($admin)->postJson('/api/payroll', ['label' => 'x', 'start_date' => '2026-10-15', 'end_date' => '2026-10-01', 'pay_date' => '2026-10-15'])->assertUnprocessable();
    $this->actingAs($admin)->postJson('/api/payroll', ['label' => 'x', 'start_date' => '2026-10-01', 'end_date' => '2026-10-15', 'pay_date' => '2026-10-15', 'payroll_group_id' => runStaff(otherCompany())[1]->id])->assertUnprocessable();
});

test('payroll inputs list the period\'s time, output, and other records', function () {
    $admin = companyUser('payroll_admin');
    [$e, $group] = runStaff($admin->company);
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'date' => '2026-10-05', 'time_in' => '09:00', 'time_out' => '18:00', 'status' => 'present']);
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'date' => '2026-10-06', 'status' => 'absent']);
    $id = newRun($this, $admin, $group->id);

    $data = $this->actingAs($admin)->getJson("/api/payroll-inputs/{$id}")->assertOk()->json('data');
    expect($data['time'][0])->toMatchArray(['employeeId' => $e->id, 'daysPresent' => 1, 'absent' => 1, 'regularHours' => 8])
        ->and($data['pending'])->toBe(['output' => 0, 'overtime' => 0, 'leave' => 0, 'adjustments' => 0]);
});

test('the payroll role can read who the runs are about without opening the employee records', function () {
    $admin = companyUser('payroll_admin');
    [$e] = runStaff($admin->company);
    runStaff(otherCompany());

    $this->actingAs($admin)->getJson('/api/employees')->assertForbidden();
    $rows = $this->actingAs($admin)->getJson('/api/payroll/employees')->assertOk()->json('data');
    expect($rows)->toHaveCount(1)->and($rows[0]['id'])->toBe($e->id)->and($rows[0]['compensation']['basicPay'])->toEqual(30000)->and($rows[0]['personal'])->toHaveKeys(['firstName', 'lastName']);
    $this->actingAs(companyUser('employee'))->getJson('/api/payroll/employees')->assertForbidden();
});

test('the period records give the payroll role the attendance, overtime and work logs of the cutoff only', function () {
    $admin = companyUser('payroll_admin');
    [$e, $group] = runStaff($admin->company);
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'date' => '2026-10-05', 'status' => 'present']);
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'date' => '2026-10-20', 'status' => 'present']);
    WorkLog::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'type' => 'hourly', 'work_date' => '2026-10-06', 'quantity' => 8, 'unit_label' => 'hrs', 'rate' => 100, 'amount' => 800, 'status' => 'approved']);
    $id = newRun($this, $admin, $group->id);

    $this->actingAs($admin)->getJson('/api/attendance?date=2026-10-05')->assertForbidden();
    $data = $this->actingAs($admin)->getJson("/api/payroll/{$id}/records")->assertOk()->json('data');
    expect($data['attendance'])->toHaveCount(1)->and($data['work_logs'])->toHaveCount(1)->and($data['overtime'])->toBe([]);
    $this->actingAs(companyUser('hr_admin', $admin->company))->getJson("/api/payroll/{$id}/records")->assertForbidden();
});
