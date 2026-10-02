<?php

use App\Models\Branch;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

function userFor(Company $company, string $role, array $attrs = []): User
{
    return User::factory()->create(['company_id' => $company->id, ...$attrs])->assignRole($role);
}

function employeePayload(Branch $branch): array
{
    return Employee::factory()->make(['branch_id' => $branch->id, 'company_id' => $branch->company_id])
        ->only(['branch_id', 'employee_number', 'personal', 'employment', 'compensation', 'benefits', 'government', 'bank']);
}

test('employee queries are scoped to the user company', function () {
    $mine = Company::factory()->create();
    $other = Company::factory()->create();
    $myBranch = Branch::factory()->create(['company_id' => $mine->id]);
    $otherBranch = Branch::factory()->create(['company_id' => $other->id]);
    Employee::factory()->create(['branch_id' => $myBranch->id, 'company_id' => $mine->id]);
    Employee::factory()->create(['branch_id' => $otherBranch->id, 'company_id' => $other->id]);

    $this->actingAs(userFor($mine, 'company_admin'));

    expect(Employee::count())->toBe(1);
});

test('employees page renders through the ops root view with its page key', function () {
    $company = Company::factory()->create();

    $this->actingAs(userFor($company, 'company_admin'))
        ->get(route('employees.show', ['id' => 'emp_1']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('ops', false)
            ->where('page', 'employees.show')
            ->where('params.id', 'emp_1'));
});

test('employee role cannot view the employees page', function () {
    $company = Company::factory()->create();

    $this->actingAs(userFor($company, 'employee'))
        ->get(route('employees.index'))
        ->assertForbidden();
});

test('employee role can open ess pages', function () {
    $company = Company::factory()->create();

    $this->actingAs(userFor($company, 'employee'))
        ->get(route('ess.home'))
        ->assertOk();
});

test('hr admin can create an employee and denormalised columns are set', function () {
    $company = Company::factory()->create();
    $branch = Branch::factory()->create(['company_id' => $company->id]);

    $this->actingAs(userFor($company, 'hr_admin'))
        ->post(route('employees.store'), employeePayload($branch))
        ->assertRedirect();

    $employee = Employee::withoutGlobalScopes()->firstOrFail();
    expect($employee->company_id)->toBe($company->id)
        ->and($employee->name)->not->toBeEmpty()
        ->and($employee->status)->toBe('active');
});

test('payroll admin cannot edit employees', function () {
    $company = Company::factory()->create();
    $branch = Branch::factory()->create(['company_id' => $company->id]);

    $this->actingAs(userFor($company, 'payroll_admin'))
        ->post(route('employees.store'), employeePayload($branch))
        ->assertForbidden();
});

test('cannot assign employee to another company branch', function () {
    $company = Company::factory()->create();
    $foreignBranch = Branch::factory()->create();

    $this->actingAs(userFor($company, 'company_admin'))
        ->post(route('employees.store'), employeePayload($foreignBranch))
        ->assertSessionHasErrors('branch_id');
});

test('inactive user is logged out', function () {
    $company = Company::factory()->create();

    $this->actingAs(userFor($company, 'company_admin', ['is_active' => false]))
        ->get(route('dashboard'))
        ->assertRedirect(route('login'));
});
