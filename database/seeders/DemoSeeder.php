<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\BranchDepartment;
use App\Models\Company;
use App\Models\CompensationType;
use App\Models\Employee;
use App\Models\EmployeeCompensation;
use App\Models\PayrollGroup;
use App\Models\User;
use App\Models\WorkSchedule;
use App\Support\PayrollDefaults;
use Illuminate\Database\Seeder;

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
    }
}
