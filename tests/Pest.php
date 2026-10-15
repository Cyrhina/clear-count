<?php

use App\Models\Branch;
use App\Models\Company;
use App\Models\Employee;
use App\Models\EmployeeCompensation;
use App\Models\PayrollGroup;
use App\Models\User;
use App\Models\WorkSchedule;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

/** A signed-in-ready user of `$company` (a fresh company when omitted) holding `$role`. Roles are seeded on first use. */
function companyUser(string $role = 'company_admin', ?Company $company = null, array $attrs = []): User
{
    if (! Role::where('name', $role)->exists()) {
        test()->seed(RoleSeeder::class);
    }

    $company ??= Company::factory()->create();

    return User::factory()->create(['company_id' => $company->id, ...$attrs])->assignRole($role);
}

/** The company profile as the form saves it: addresses are arrays (street, city ...), which the PDFs must print as a line. */
function fillCompanyAddress(Company $company): Company
{
    $address = ['building_unit' => '', 'street' => '1 Test Street', 'barangay' => 'Poblacion', 'city' => 'Makati City', 'province' => 'Metro Manila', 'region' => 'NCR', 'zip_code' => '1200', 'country' => 'Philippines'];
    $company->update(['registered_address' => $address, 'office_address' => $address, 'same_as_registered' => true]);

    return $company;
}

/** A second company, to prove a row of another tenant is a 404 and never leaks. */
function otherCompany(): Company
{
    return Company::factory()->create();
}

/** A semi-monthly group with one salaried employee on a Mon-Fri schedule. */
function runStaff(Company $company, array $compensation = [], array $employment = []): array
{
    $schedule = WorkSchedule::firstOrCreate(['company_id' => $company->id, 'name' => 'Day'], ['shift_type' => 'day', 'start_time' => '09:00', 'end_time' => '18:00', 'break_minutes' => 60, 'grace_period_minutes' => 10, 'days_of_week' => [1, 2, 3, 4, 5], 'rest_days' => [6, 7]]);
    $group = PayrollGroup::firstOrCreate(['company_id' => $company->id, 'name' => 'Semi'], [
        'frequency' => 'semi_monthly', 'cutoff_config' => ['start_day' => 1], 'pay_date_config' => ['type' => 'fixed'], 'deduction_schedule' => 'DIVIDED', 'work_schedule_id' => $schedule->id, 'effective_date' => '2024-01-01',
    ]);
    $employee = Employee::factory()->create([
        'company_id' => $company->id, 'branch_id' => Branch::factory()->create(['company_id' => $company->id])->id, 'payroll_group_id' => $group->id,
        'employment' => ['position' => 'Clerk', 'department' => 'Sales', 'employmentType' => 'regular', 'dateHired' => '2020-01-01', 'status' => 'active', 'category' => 'regular', ...$employment],
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
