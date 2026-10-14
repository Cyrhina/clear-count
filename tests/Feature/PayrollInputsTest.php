<?php

use App\Models\AttendanceRecord;
use App\Models\BonusIncentive;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Employee;
use App\Models\EmployeeBenefit;
use App\Models\EmployeeCompensation;
use App\Models\EmployeeDeduction;
use App\Models\Loan;
use App\Models\OvertimeRecord;
use App\Models\PayrollGroup;
use App\Models\WorkLog;
use App\Models\WorkSchedule;
use App\Payroll\PayrollInputs;

const OCT_FIRST_HALF = ['id' => 'p1', 'label' => 'Oct 1 – 15, 2026', 'startDate' => '2026-10-01', 'endDate' => '2026-10-15', 'payDate' => '2026-10-15'];

/** A semi-monthly group with one monthly-paid employee on a Mon-Fri schedule. */
function payrollStaff(Company $company, array $compensation = [], array $employment = []): array
{
    $schedule = WorkSchedule::firstOrCreate(['company_id' => $company->id, 'name' => 'Day'], ['shift_type' => 'day', 'start_time' => '09:00', 'end_time' => '18:00', 'break_minutes' => 60, 'grace_period_minutes' => 10, 'days_of_week' => [1, 2, 3, 4, 5], 'rest_days' => [6, 7]]);
    $group = PayrollGroup::firstOrCreate(['company_id' => $company->id, 'name' => 'Semi'], [
        'frequency' => 'semi_monthly', 'cutoff_config' => ['start_day' => 1], 'pay_date_config' => ['type' => 'fixed'], 'deduction_schedule' => 'DIVIDED', 'work_schedule_id' => $schedule->id, 'effective_date' => '2024-01-01',
    ]);
    $branch = Branch::factory()->create(['company_id' => $company->id]);
    $employee = Employee::factory()->create([
        'company_id' => $company->id, 'branch_id' => $branch->id, 'payroll_group_id' => $group->id,
        'employment' => ['position' => 'Clerk', 'department' => 'Sales', 'employmentType' => 'regular', 'dateHired' => '2020-01-01', 'status' => 'active', 'category' => 'regular', ...$employment],
        'compensation' => ['payType' => 'monthly', 'basicPay' => 30000, 'allowances' => [], ...$compensation],
    ]);
    EmployeeCompensation::create(['company_id' => $company->id, 'employee_id' => $employee->id, 'effective_from' => '2020-01-01', 'rate_type' => $employee->compensation['payType'], 'basic_rate' => $employee->compensation['basicPay'], 'allowances' => $employee->compensation['allowances'], 'reason' => 'Initial Hire']);

    return [$employee, $group];
}

function lineOf(Company $company, Employee $employee, array $period = [], array $over = []): array
{
    $period = [...OCT_FIRST_HALF, ...$period, 'payrollGroupId' => (string) $employee->payroll_group_id, ...$over];

    return collect(PayrollInputs::lines($company->id, $period))->firstWhere('employeeId', (string) $employee->id);
}

test('a salaried line takes the semi-monthly share, the absence, overtime, a bonus and a loan from the database', function () {
    $company = Company::factory()->create();
    [$e] = payrollStaff($company);
    AttendanceRecord::create(['company_id' => $company->id, 'employee_id' => $e->id, 'date' => '2026-10-06', 'status' => 'absent']);
    OvertimeRecord::create(['company_id' => $company->id, 'employee_id' => $e->id, 'work_date' => '2026-10-07', 'start_time' => '18:00', 'end_time' => '20:00', 'hours' => 2, 'type' => 'regular', 'multiplier' => 1.25, 'status' => 'approved']);
    OvertimeRecord::create(['company_id' => $company->id, 'employee_id' => $e->id, 'work_date' => '2026-10-08', 'start_time' => '18:00', 'end_time' => '20:00', 'hours' => 2, 'type' => 'regular', 'multiplier' => 1.25, 'status' => 'pending']);
    BonusIncentive::create(['company_id' => $company->id, 'name' => 'Spot', 'bonus_type' => 'fixed_amount', 'target_type' => 'company', 'amount' => 1000, 'period_label' => 'oct 1 – 15, 2026', 'taxable' => true, 'frequency' => 'one_time', 'payout_mode' => 'regular_payroll', 'status' => 'approved']);
    Loan::create(['company_id' => $company->id, 'employee_id' => $e->id, 'type' => 'sss_salary_loan', 'label' => 'SSS Salary Loan', 'principal' => 10000, 'monthly_deduction' => 2000, 'start_date' => '2026-09-01']);

    $line = lineOf($company, $e);

    expect($line['payFrequency'])->toBe('semi_monthly')->and($line['cutoffIndex'])->toBe(1);
    expect(collect($line['earnings'])->pluck('amount', 'label')->all())->toEqual(['Basic Pay' => 15000, 'Overtime Pay' => 426.14, 'Spot' => 1000]);
    expect(collect($line['otherDeductions'])->firstWhere('label', 'Absences')['amount'])->toEqual(1364);
    expect($line['loanDeductions'])->toEqual([['label' => 'SSS Salary Loan', 'amount' => 1000.0]]);
    expect($line['netPay'])->toEqual(round($line['grossPay'] - $line['totalDeductions']));
    // 30,000 a month: SSS employee share 1,500 (MSC 30,000 x 5%), half in each cutoff.
    expect($line['sssEmployeeShare'])->toEqual(750);
});

test('only approved work logs not yet paid by another run pay an hourly employee', function () {
    $company = Company::factory()->create();
    [$e] = payrollStaff($company, ['payType' => 'hourly', 'basicPay' => 100]);
    $log = fn (string $date, string $status, ?int $locked = null) => WorkLog::create(['company_id' => $company->id, 'employee_id' => $e->id, 'type' => 'hourly', 'work_date' => $date, 'quantity' => 8, 'unit_label' => 'hrs', 'rate' => 100, 'amount' => 800, 'status' => $status, 'payroll_period_id' => $locked]);
    $log('2026-10-05', 'approved');
    $log('2026-10-06', 'approved');
    $log('2026-10-07', 'pending');
    $log('2026-10-08', 'approved', 99);

    expect(lineOf($company, $e)['earnings'][0])->toEqual(['label' => 'Hourly Compensation Pay', 'amount' => 1600.0]);
    // The run's own locked logs still count when it is computed again.
    expect(lineOf($company, $e, ['id' => '99'])['earnings'][0]['amount'])->toEqual(2400);
});

test('an output-based employee with no approved work logs is paid nothing for output', function () {
    $company = Company::factory()->create();
    [$e] = payrollStaff($company, ['payType' => 'output_based', 'basicPay' => 12.5, 'outputUnit' => 'Per Piece']);

    expect(lineOf($company, $e)['earnings'][0])->toEqual(['label' => 'Output / Piece-Rate Pay', 'amount' => 0.0]);
});

test('the pay rate is the compensation row in force on the last day of the period', function () {
    $company = Company::factory()->create();
    [$e] = payrollStaff($company);
    EmployeeCompensation::create(['company_id' => $company->id, 'employee_id' => $e->id, 'effective_from' => '2026-10-10', 'rate_type' => 'monthly', 'basic_rate' => 40000, 'allowances' => [], 'reason' => 'Raise']);
    EmployeeCompensation::create(['company_id' => $company->id, 'employee_id' => $e->id, 'effective_from' => '2026-11-01', 'rate_type' => 'monthly', 'basic_rate' => 50000, 'allowances' => [], 'reason' => 'Later']);

    expect(lineOf($company, $e)['earnings'][0]['amount'])->toEqual(20000);
});

test('benefits and deductions are taken in the period they are active, and a one-time deduction in the period of its due date', function () {
    $company = Company::factory()->create();
    [$e] = payrollStaff($company);
    EmployeeBenefit::create(['company_id' => $company->id, 'employee_id' => $e->id, 'category' => 'allowance', 'name' => 'Rice', 'monthly_value' => 1000, 'start_date' => '2026-01-01']);
    EmployeeBenefit::create(['company_id' => $company->id, 'employee_id' => $e->id, 'category' => 'hmo', 'name' => 'HMO', 'monthly_value' => 1500, 'employee_share' => 300, 'start_date' => '2026-01-01']);
    EmployeeBenefit::create(['company_id' => $company->id, 'employee_id' => $e->id, 'category' => 'hmo', 'name' => 'Old HMO', 'monthly_value' => 900, 'start_date' => '2025-01-01', 'end_date' => '2026-09-30']);
    EmployeeDeduction::create(['company_id' => $company->id, 'employee_id' => $e->id, 'name' => 'Coop', 'kind' => 'recurring', 'amount' => 500, 'start_date' => '2026-01-01']);
    EmployeeDeduction::create(['company_id' => $company->id, 'employee_id' => $e->id, 'name' => 'Uniform', 'kind' => 'one_time', 'amount' => 900, 'due_date' => '2026-10-10']);
    EmployeeDeduction::create(['company_id' => $company->id, 'employee_id' => $e->id, 'name' => 'Later', 'kind' => 'one_time', 'amount' => 700, 'due_date' => '2026-10-20']);

    $line = lineOf($company, $e);

    expect(collect($line['earnings'])->pluck('amount', 'label')->all())->toMatchArray(['Rice' => 500]);
    expect($line['benefitsProvided'])->toEqual([['label' => 'HMO', 'category' => 'hmo', 'amount' => 750.0]])->and($line['benefitAllowances'])->toBe(['Rice']);
    expect(collect($line['otherDeductions'])->pluck('amount', 'label')->all())->toEqual(['HMO – Employee Share' => 150, 'Coop' => 250, 'Uniform' => 900]);
});

test('a separated employee gets final pay in the run of their last day, held employees are left out, and a settled one-time deduction is not taken twice', function () {
    $company = Company::factory()->create();
    [$e, $group] = payrollStaff($company, [], ['status' => 'inactive', 'dateSeparated' => '2026-10-07']);
    [$held] = payrollStaff($company);
    [$gone] = payrollStaff($company, [], ['status' => 'inactive', 'dateSeparated' => '2026-09-01']);
    EmployeeDeduction::create(['company_id' => $company->id, 'employee_id' => $held->id, 'name' => 'Uniform', 'kind' => 'one_time', 'amount' => 900, 'due_date' => '2026-10-10', 'status' => 'completed', 'settled_in_period_id' => 5]);

    $lines = collect(PayrollInputs::lines($company->id, [...OCT_FIRST_HALF, 'payrollGroupId' => (string) $group->id, 'excludedEmployeeIds' => [$held->id]]));
    expect($lines->pluck('employeeId')->all())->toBe([(string) $e->id]);
    // 7 of 15 days: 15,000 x 7/15 = 7,000.
    expect($lines[0]['earnings'][0])->toEqual(['label' => 'Basic Pay (final pay, prorated to 2026-10-07)', 'amount' => 7000.0]);

    $all = collect(PayrollInputs::lines($company->id, [...OCT_FIRST_HALF, 'payrollGroupId' => (string) $group->id]));
    expect($all->pluck('employeeId')->sort()->values()->all())->toBe([(string) $e->id, (string) $held->id]);
    expect(collect($all->firstWhere('employeeId', (string) $held->id)['otherDeductions'])->pluck('label')->all())->not->toContain('Uniform');
});
