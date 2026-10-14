<?php

namespace Database\Seeders;

use App\Http\Controllers\OvertimeController;
use App\Models\AttendanceRecord;
use App\Models\BenefitPlan;
use App\Models\BonusIncentive;
use App\Models\Branch;
use App\Models\BranchDepartment;
use App\Models\Company;
use App\Models\CompensationType;
use App\Models\DeductionPlan;
use App\Models\Employee;
use App\Models\EmployeeBenefit;
use App\Models\EmployeeCompensation;
use App\Models\EmployeeDeduction;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Loan;
use App\Models\OvertimeRate;
use App\Models\OvertimeRecord;
use App\Models\PayrollGroup;
use App\Models\ShiftAssignment;
use App\Models\User;
use App\Models\WfhArrangement;
use App\Models\WorkLog;
use App\Models\WorkSchedule;
use App\Support\AttendanceStatusResolver;
use App\Support\LeaveDefaults;
use App\Support\LeaveLedger;
use App\Support\LeavePlanner;
use App\Support\LoanDefaults;
use App\Support\LoanLedger;
use App\Support\Notifier;
use App\Support\PayrollDefaults;
use App\Support\WfhPlanner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::create(['name' => 'Frontline Business Solutions', 'plan_tier' => 'professional_plus']);
        $head = Branch::withoutGlobalScopes()->create([
            'company_id' => $company->id, 'name' => 'Head Office', 'code' => 'FBS-HO', 'is_head_office' => true,
        ]);

        Employee::factory()->count(12)->create(['company_id' => $company->id, 'branch_id' => $head->id]);
        $this->seedPayrollSetup($company);
        // The pay history starts with the hire, like a real hire through the API.
        Employee::withoutGlobalScopes()->where('company_id', $company->id)->get()->each(fn (Employee $e) => EmployeeCompensation::create([
            'company_id' => $company->id, 'employee_id' => $e->id, 'effective_from' => $e->employment['dateHired'], 'rate_type' => $e->compensation['payType'],
            'basic_rate' => $e->compensation['basicPay'], 'allowances' => $e->compensation['allowances'], 'reason' => 'Initial Hire',
        ]));
        Employee::withoutGlobalScopes()->where('branch_id', $head->id)->distinct()->pluck('department')->filter()
            ->each(fn ($name) => BranchDepartment::create(['company_id' => $company->id, 'branch_id' => $head->id, 'name' => $name]));
        $own = Employee::withoutGlobalScopes()->where('company_id', $company->id)->first();

        $accounts = [
            ['Andrea', 'Villareal', 'andrea.villareal@fbs.com', 'company_admin', null],
            ['Grace', 'Ocampo', 'hr@fbs.com', 'hr_admin', null],
            ['Payroll', 'Manager', 'payroll@fbs.com', 'payroll_admin', null],
            ['Demo', 'Employee', 'employee@fbs.com', 'employee', $own?->id],
        ];

        $users = new UserSeeder;

        foreach ($accounts as [$firstName, $lastName, $email, $role, $employeeId]) {
            $users->createUser($firstName, $lastName, $email, $role, attributes: [
                'company_id' => $company->id,
                'branch_id' => $head->id,
                'employee_id' => $employeeId,
            ]);
        }

        // The accounts listed on the login page (UserSeeder) belong to the demo company too: without a company
        // they would see no users, no company profile and no activity log. The super admin stays company-less.
        User::whereIn('email', UserSeeder::DEMO_LOGIN_EMAILS)->update(['company_id' => $company->id, 'branch_id' => $head->id]);

        // Last, so the approvers belong to the company by now.
        $this->notifyPending();
    }

    /** Work schedules and payroll groups of the demo company, with its employees spread over the groups. */
    private function seedPayrollSetup(Company $company): void
    {
        PayrollDefaults::ensureCompensationTypes($company->id);
        $type = fn (string $name) => CompensationType::withoutGlobalScopes()->where('company_id', $company->id)->where('name', $name)->value('id');

        $schedules = [];
        foreach ([
            ['Standard Day Shift', 'day', '09:00', '18:00', [1, 2, 3, 4, 5], [6, 7], 'teal'],
            ['Mid Shift', 'day', '12:00', '21:00', [1, 2, 3, 4, 5, 6, 7], [], 'amber'],
            ['Night Shift', 'night', '22:00', '06:00', [1, 2, 3, 4, 5, 6, 7], [], 'violet'],
        ] as [$name, $shift, $start, $end, $days, $rest, $color]) {
            $schedules[$name] = WorkSchedule::create([
                'company_id' => $company->id, 'name' => $name, 'shift_type' => $shift, 'start_time' => $start, 'end_time' => $end,
                'break_minutes' => 60, 'grace_period_minutes' => 10, 'days_of_week' => $days, 'rest_days' => $rest, 'color' => $color,
            ]);
        }

        $weekly = ['start_weekday' => 1];
        $friday = ['type' => 'weekday_after_cutoff', 'weekday' => 5, 'weeks_after' => 1, 'weekend_rule' => 'previous'];
        $groups = [
            ['Monthly Admin Payroll', 'Admin staff and back-office roles paid once a month.', 'monthly', ['start_day' => 1], ['type' => 'last_working_day'], 'FULL_MONTHLY', 'Monthly Rate', 'Standard Day Shift'],
            ['Semi-Monthly Regular Payroll', 'Regular rank-and-file employees paid twice a month.', 'semi_monthly', ['periods' => [['start_day' => 1, 'end_day' => 15], ['start_day' => 16, 'end_day' => 'end']]], ['type' => 'fixed_days', 'days' => [15, 30], 'weekend_rule' => 'previous'], 'DIVIDED', 'Monthly Rate', 'Standard Day Shift'],
            ['Weekly Production Payroll', 'Output-based production workers paid weekly.', 'weekly', $weekly, $friday, 'DIVIDED', 'Output-Based / Piece-Rate', null],
            ['Weekly Daily Workers', 'Daily-wage field and contractual workers paid weekly.', 'weekly', $weekly, $friday, 'LAST_PERIOD', 'Daily Rate', null],
        ];

        $created = [];
        foreach ($groups as [$name, $description, $frequency, $cutoff, $payDates, $deduction, $compensation, $schedule]) {
            $created[] = PayrollGroup::create([
                'company_id' => $company->id, 'name' => $name, 'description' => $description, 'status' => 'active', 'frequency' => $frequency,
                'compensation_type_id' => $type($compensation), 'cutoff_config' => $cutoff, 'pay_date_config' => $payDates, 'deduction_schedule' => $deduction,
                'work_schedule_id' => $schedule ? $schedules[$schedule]->id : null, 'effective_date' => '2024-01-01',
            ]);
        }

        Employee::withoutGlobalScopes()->where('company_id', $company->id)->orderBy('id')->get()
            ->each(fn (Employee $employee, int $i) => $employee->update(['payroll_group_id' => $created[$i % count($created)]->id]));

        $this->seedRoster($company, array_values($schedules));
    }

    /** A default work schedule per employee (spread over the three templates) and this week's roster: the shift on its working days, rest on the others. */
    private function seedRoster(Company $company, array $schedules): void
    {
        $monday = now()->startOfWeek();
        $rows = [];

        Employee::withoutGlobalScopes()->where('company_id', $company->id)->orderBy('id')->get()->each(function (Employee $employee, int $i) use ($schedules, $monday, $company, &$rows): void {
            $schedule = $schedules[$i % count($schedules)];
            Employee::withoutGlobalScopes()->whereKey($employee->id)->update(['work_schedule_id' => $schedule->id]);

            for ($d = 0; $d < 7; $d++) {
                $works = in_array($d + 1, $schedule->days_of_week, true);
                $rows[] = [
                    'company_id' => $company->id, 'employee_id' => $employee->id, 'date' => $monday->addDays($d)->toDateString(),
                    'work_schedule_id' => $works ? $schedule->id : null, 'is_rest_day' => ! $works, 'created_at' => now(), 'updated_at' => now(),
                ];
            }
        });

        ShiftAssignment::insert($rows);
        $this->seedAttendance($company, $schedules);
        $this->seedWfh($company);
        $this->seedLeave($company);
        $this->seedOvertime($company);
        $this->seedBenefits($company);
    }

    /** The pending requests above wait for their approvers: send the notices once, whatever the model events did while seeding. */
    private function notifyPending(): void
    {
        DB::table('notifications')->delete();
        // The roles were seeded in this same process: drop the permission list cached before they existed.
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        foreach ([LeaveRequest::class, OvertimeRecord::class, WorkLog::class, WfhArrangement::class] as $model) {
            $model::withoutGlobalScopes()->where('status', 'pending')->get()->each(fn ($request) => Notifier::requested($request));
        }
    }

    /** The default leave types, this year's credits for everyone, and a few requests: one approved (today and tomorrow), one approved and one pending for next week. */
    private function seedLeave(Company $company): void
    {
        LeaveDefaults::ensure($company->id);
        $employees = Employee::withoutGlobalScopes()->where('company_id', $company->id)->orderBy('id')->get();
        $employees->each(fn (Employee $e) => LeaveLedger::grantYear($e, now()->year));
        $vacation = LeaveType::withoutGlobalScopes()->where('company_id', $company->id)->where('name', 'Vacation Leave')->first();
        $nextMonday = now()->startOfWeek()->addWeek()->toImmutable();

        foreach ([[3, now(), now()->addDay(), 'approved'], [4, $nextMonday, $nextMonday->addDay(), 'approved'], [5, $nextMonday->addDays(2), $nextMonday->addDays(4), 'pending']] as [$i, $from, $to, $status]) {
            $employee = $employees[$i] ?? null;
            $days = $employee ? LeavePlanner::days($employee, $from->toDateString(), $to->toDateString(), 'full') : 0;
            if (! $employee || $days === 0.0 || LeaveLedger::balance($employee->id, $vacation->id) < $days) {
                continue;
            }
            $request = LeaveRequest::create([
                'company_id' => $company->id, 'employee_id' => $employee->id, 'leave_type_id' => $vacation->id, 'date_from' => $from->toDateString(), 'date_to' => $to->toDateString(),
                'days' => $days, 'reason' => 'Family trip', 'status' => $status, 'decided_at' => $status === 'approved' ? now() : null,
            ]);
            if ($status === 'approved') {
                LeaveLedger::record($employee, $vacation, 'used', -$days, 'Approved leave', null, $request, $from->toDateString());
            }
        }
    }

    /** Two HMO plans and a rice allowance with some employees enrolled, a cooperative savings plan, one one-time deduction, and three loans. */
    private function seedBenefits(Company $company): void
    {
        $employees = Employee::withoutGlobalScopes()->where('company_id', $company->id)->orderBy('id')->get();
        $start = now()->startOfYear()->toDateString();
        $plan = fn (array $attributes) => BenefitPlan::create(['company_id' => $company->id, ...$attributes]);
        $enroll = fn (BenefitPlan $p, $people) => $people->each(fn (Employee $e) => EmployeeBenefit::create([
            'company_id' => $company->id, 'employee_id' => $e->id, 'benefit_plan_id' => $p->id, 'category' => $p->category, 'name' => $p->name, 'provider' => $p->provider,
            'coverage' => $p->coverage, 'monthly_value' => $p->monthly_value, 'employee_share' => $p->employee_share, 'start_date' => $start,
        ]));

        $enroll($plan(['category' => 'hmo', 'name' => 'HMO Plan A', 'provider' => 'MaxiCare', 'coverage' => 'Employee only', 'monthly_value' => 1500, 'employee_share' => 0]), $employees->slice(0, 4));
        $enroll($plan(['category' => 'hmo', 'name' => 'HMO Plan B', 'provider' => 'MaxiCare', 'coverage' => 'Employee + 1 dependent', 'monthly_value' => 2800, 'employee_share' => 400]), $employees->slice(4, 3));
        $enroll($plan(['category' => 'allowance', 'name' => 'Rice Subsidy', 'monthly_value' => 1000, 'employee_share' => 0]), $employees->slice(0, 8));

        $coop = DeductionPlan::create(['company_id' => $company->id, 'name' => 'Cooperative Savings', 'amount' => 500, 'reason' => 'Monthly share capital']);
        $employees->slice(2, 4)->each(fn (Employee $e) => EmployeeDeduction::create([
            'company_id' => $company->id, 'employee_id' => $e->id, 'deduction_plan_id' => $coop->id, 'name' => $coop->name, 'kind' => 'recurring', 'amount' => 500, 'start_date' => $start, 'reason' => $coop->reason,
        ]));
        if ($employees->has(1)) {
            EmployeeDeduction::create(['company_id' => $company->id, 'employee_id' => $employees[1]->id, 'name' => 'Uniform', 'kind' => 'one_time', 'amount' => 900, 'due_date' => now()->addDays(10)->toDateString(), 'reason' => 'Company uniform']);
        }

        foreach ([['Year-end Bonus', 'company', 'approved', 'December '.now()->year, 5000], ['Sales Incentive', 'department', 'pending', now()->format('F Y'), 3000], ['Spot Award', 'employee', 'draft', now()->format('F Y'), 1500]] as [$name, $target, $status, $label, $amount]) {
            BonusIncentive::create([
                'company_id' => $company->id, 'name' => $name, 'bonus_type' => 'fixed_amount', 'target_type' => $target, 'target_department' => $target === 'department' ? 'Sales' : null,
                'target_employee_id' => $target === 'employee' ? $employees[0]->id : null, 'amount' => $amount, 'period_label' => $label, 'taxable' => true, 'frequency' => 'one_time',
                'payout_mode' => 'regular_payroll', 'status' => $status, 'decided_at' => $status === 'approved' ? now() : null,
            ]);
        }

        LoanDefaults::ensure($company->id);
        foreach ([[0, 'sss_salary_loan', 'SSS Loan – Salary', 24000, 2000, 3], [1, 'company_loan', 'Company Loan / Emergency Advance', 10000, 2500, 1], [2, 'pagibig_multipurpose_loan', 'Pag-IBIG Loan – Multi-Purpose', 30000, 1500, 0]] as [$i, $type, $label, $principal, $monthly, $paid]) {
            if (! isset($employees[$i])) {
                continue;
            }
            $loan = Loan::create(['company_id' => $company->id, 'employee_id' => $employees[$i]->id, 'type' => $type, 'label' => $label, 'principal' => $principal, 'monthly_deduction' => $monthly, 'start_date' => now()->subMonths($paid)->startOfMonth()->toDateString()]);
            for ($m = 0; $m < $paid; $m++) {
                LoanLedger::repay($loan, $monthly, now()->subMonths($paid - $m)->endOfMonth()->toDateString(), 'Payroll '.now()->subMonths($paid - $m)->format('M Y'));
            }
        }
    }

    /** A few overtime requests (two pending), and work logs for up to three hourly or output-based employees. */
    private function seedOvertime(Company $company): void
    {
        PayrollDefaults::ensureOvertimeRates($company->id);
        $employees = Employee::withoutGlobalScopes()->where('company_id', $company->id)->orderBy('id')->get();
        $rate = fn (string $key) => OvertimeRate::withoutGlobalScopes()->where('company_id', $company->id)->where('key', $key)->value('multiplier');

        foreach ([[0, 12, '18:00', '22:00', 'regular', 'approved'], [1, 4, '22:00', '02:00', 'night_diff', 'pending'], [2, 2, '18:00', '20:30', 'regular', 'pending'], [3, 20, '19:00', '23:30', 'regular', 'rejected']] as [$i, $ago, $start, $end, $type, $status]) {
            if (! isset($employees[$i])) {
                continue;
            }
            OvertimeRecord::create([
                'company_id' => $company->id, 'employee_id' => $employees[$i]->id, 'work_date' => now()->subDays($ago)->toDateString(), 'start_time' => $start, 'end_time' => $end,
                'hours' => OvertimeController::hours($start, $end), 'type' => $type, 'multiplier' => $rate($type), 'reason' => 'Project deadline', 'status' => $status,
                'decided_at' => $status === 'pending' ? null : now(),
            ]);
        }

        foreach ($employees->filter(fn (Employee $e) => in_array($e->compensation['payType'] ?? null, ['hourly', 'output_based'], true))->take(3) as $employee) {
            $output = $employee->compensation['payType'] === 'output_based';
            $rateAmount = (float) $employee->compensation['basicPay'];
            foreach ([[5, 'approved'], [2, 'pending'], [1, 'pending']] as [$ago, $status]) {
                $quantity = $output ? 30 : 8;
                WorkLog::create([
                    'company_id' => $company->id, 'employee_id' => $employee->id, 'type' => $output ? 'output' : 'hourly', 'work_date' => now()->subDays($ago)->toDateString(), 'quantity' => $quantity,
                    'unit_label' => $output ? ($employee->compensation['outputUnit'] ?? 'Per Unit') : 'hrs', 'rate' => $rateAmount, 'amount' => round($quantity * $rateAmount, 2),
                    'description' => $output ? 'Units completed' : 'Regular hours', 'status' => $status, 'decided_at' => $status === 'approved' ? now() : null,
                ]);
            }
        }
    }

    /** Two employees work from home on Wednesdays (a standing arrangement), and the days that have come are filled in. */
    private function seedWfh(Company $company): void
    {
        Employee::withoutGlobalScopes()->where('company_id', $company->id)->orderBy('id')->take(2)->get()->each(fn (Employee $employee) => WfhArrangement::create([
            'company_id' => $company->id, 'employee_id' => $employee->id, 'kind' => 'standing', 'date_from' => now()->subDays(30)->toDateString(), 'date_to' => null,
            'days_of_week' => [3], 'times' => 'default', 'reason' => 'Standing mid-week WFH', 'status' => 'approved', 'decided_at' => now(),
        ]));

        WfhPlanner::materialize();
    }

    /** The last ten days of punches on each employee's schedule: mostly on time, some late, and a missing day here and there (absent). */
    private function seedAttendance(Company $company, array $schedules): void
    {
        $rows = [];

        Employee::withoutGlobalScopes()->where('company_id', $company->id)->orderBy('id')->get()->each(function (Employee $employee, int $i) use ($schedules, $company, &$rows): void {
            $schedule = $schedules[$i % count($schedules)];
            for ($back = 1; $back <= 10; $back++) {
                $date = now()->subDays($back);
                if (! in_array($date->isoWeekday(), $schedule->days_of_week, true)) {
                    continue;
                }
                if (($i + $back) % 9 === 0) {
                    $rows[] = ['company_id' => $company->id, 'employee_id' => $employee->id, 'work_schedule_id' => $schedule->id, 'date' => $date->toDateString(), 'status' => 'absent', 'work_type' => 'onsite', 'source' => 'manual', 'late_minutes' => 0, 'undertime_minutes' => 0, 'time_in' => null, 'time_out' => null, 'created_at' => now(), 'updated_at' => now()];

                    continue;
                }
                $in = substr($schedule->start_time, 0, 5);
                if (($i + $back) % 4 === 0) {
                    $in = date('H:i', strtotime($in) + 25 * 60);
                }
                $out = substr($schedule->end_time, 0, 5);
                $rows[] = [
                    ...AttendanceStatusResolver::forPunch($in, $out, $schedule->start_time, $schedule->end_time, $schedule->grace_period_minutes),
                    'company_id' => $company->id, 'employee_id' => $employee->id, 'work_schedule_id' => $schedule->id, 'date' => $date->toDateString(),
                    'time_in' => $in, 'time_out' => $out, 'work_type' => 'onsite', 'source' => 'biometric', 'created_at' => now(), 'updated_at' => now(),
                ];
            }
        });

        foreach (array_chunk($rows, 100) as $chunk) {
            AttendanceRecord::insert($chunk);
        }
    }
}
