<?php

use App\Models\Branch;
use App\Models\Company;
use App\Models\Employee;
use App\Support\PayrollDefaults;

test('a bare company has nothing done and is not ready for payroll', function () {
    $admin = companyUser('company_admin', Company::factory()->create(['email' => null]));

    $this->actingAs($admin)->getJson('/api/onboarding')->assertOk()
        ->assertJsonPath('data.ready_for_payroll', false)
        ->assertJsonPath('data.steps.company_info', false)
        ->assertJsonPath('data.steps.branches', false)
        ->assertJsonPath('data.steps.employees', false)
        ->assertJsonPath('data.steps.users', false);
});

test('the checklist follows the real data', function () {
    $company = Company::factory()->create(['email' => 'hello@example.com']);
    $admin = companyUser('company_admin', $company);
    $branch = Branch::factory()->create(['company_id' => $company->id]);
    Employee::factory()->create(['company_id' => $company->id, 'branch_id' => $branch->id]);
    PayrollDefaults::ensureDeductions($company->id);

    $this->actingAs($admin)->getJson('/api/onboarding')->assertOk()
        ->assertJsonPath('data.steps.company_info', true)
        ->assertJsonPath('data.steps.branches', true)
        ->assertJsonPath('data.steps.employees', true)
        ->assertJsonPath('data.steps.statutory', true)
        ->assertJsonPath('data.steps.payroll_groups', false)
        ->assertJsonPath('data.ready_for_payroll', false);
});

test('only people with onboarding.manage open the checklist', function () {
    $this->actingAs(companyUser('payroll_admin'))->getJson('/api/onboarding')->assertForbidden();
});
