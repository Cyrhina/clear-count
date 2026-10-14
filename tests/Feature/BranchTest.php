<?php

use App\Models\Branch;
use App\Models\BranchDepartment;
use App\Models\Employee;

function staffIn(Branch $branch, string $department, string $status = 'active'): Employee
{
    return Employee::factory()->create([
        'company_id' => $branch->company_id,
        'branch_id' => $branch->id,
        'employment' => ['position' => 'Staff', 'department' => $department, 'status' => $status],
    ]);
}

function departmentIn(Branch $branch, string $name = 'Finance'): BranchDepartment
{
    return BranchDepartment::create(['company_id' => $branch->company_id, 'branch_id' => $branch->id, 'name' => $name]);
}

test('a branch is created, listed with its headcount and updated', function () {
    $admin = companyUser();

    $id = $this->actingAs($admin)->postJson('/api/branches', ['name' => 'Iloilo', 'code' => 'ILO', 'email' => 'ilo@example.com'])
        ->assertCreated()->assertJsonPath('data.headcount', 0)->json('data.id');
    staffIn(Branch::find($id), 'Sales');
    staffIn(Branch::find($id), 'Sales', 'archived');

    $this->actingAs($admin)->getJson('/api/branches')->assertOk()->assertJsonPath('data.0.headcount', 2)->assertJsonPath('data.0.active_count', 1);
    $this->actingAs($admin)->putJson("/api/branches/{$id}", ['name' => 'Iloilo City'])->assertOk()->assertJsonPath('data.name', 'Iloilo City');
});

test('branch names are unique per company and the email must be valid', function () {
    $admin = companyUser();
    Branch::factory()->create(['company_id' => $admin->company_id, 'name' => 'Cebu']);
    Branch::factory()->create(['company_id' => otherCompany()->id, 'name' => 'Davao']);

    $this->actingAs($admin)->postJson('/api/branches', ['name' => 'Cebu'])->assertJsonValidationErrors('name');
    $this->actingAs($admin)->postJson('/api/branches', ['name' => 'Davao', 'email' => 'nope'])->assertJsonValidationErrors('email')->assertJsonMissingValidationErrors('name');
});

test('only the own company is visible and a branch with employees cannot be deleted', function () {
    $admin = companyUser();
    $mine = Branch::factory()->create(['company_id' => $admin->company_id]);
    $theirs = Branch::factory()->create(['company_id' => otherCompany()->id]);
    staffIn($mine, 'Sales');

    $this->actingAs($admin)->getJson('/api/branches')->assertJsonCount(1, 'data');
    $this->actingAs($admin)->putJson("/api/branches/{$theirs->id}", ['name' => 'X'])->assertNotFound();
    $this->actingAs($admin)->deleteJson("/api/branches/{$mine->id}")->assertStatus(422);

    $empty = Branch::factory()->create(['company_id' => $admin->company_id]);
    $this->actingAs($admin)->deleteJson("/api/branches/{$empty->id}")->assertNoContent();
});

test('summaries carry the headcount and no pay totals yet', function () {
    $admin = companyUser();
    staffIn(Branch::factory()->create(['company_id' => $admin->company_id]), 'Sales');

    $this->actingAs($admin)->getJson('/api/branches/summaries')->assertOk()
        ->assertJsonPath('data.0.headcount', 1)->assertJsonPath('data.0.gross_pay', null)->assertJsonPath('data.0.net_pay', null);
});

test('branches need the branches.manage permission', function () {
    // The report and payroll roles read the list for their branch filters, but never change it.
    $payroll = companyUser('payroll_admin');
    $this->actingAs($payroll)->getJson('/api/branches')->assertOk();
    $this->actingAs($payroll)->postJson('/api/branches', ['name' => 'X'])->assertForbidden();
    $this->actingAs(companyUser('employee'))->getJson('/api/branches')->assertForbidden();
    $this->actingAs(companyUser('employee'))->postJson('/api/branches', ['name' => 'X'])->assertForbidden();
});

test('departments are added, listed per branch, and a name is unique inside its branch only', function () {
    $admin = companyUser();
    $a = Branch::factory()->create(['company_id' => $admin->company_id]);
    $b = Branch::factory()->create(['company_id' => $admin->company_id]);

    $this->actingAs($admin)->postJson('/api/branch-departments', ['branch_id' => $a->id, 'name' => 'Finance'])->assertCreated();
    $this->actingAs($admin)->postJson('/api/branch-departments', ['branch_id' => $a->id, 'name' => 'Finance'])->assertJsonValidationErrors('name');
    $this->actingAs($admin)->postJson('/api/branch-departments', ['branch_id' => $b->id, 'name' => 'Finance'])->assertCreated();

    $this->actingAs($admin)->getJson("/api/branch-departments?branch_id={$a->id}")->assertJsonCount(1, 'data');
    $this->actingAs($admin)->postJson('/api/branch-departments', ['branch_id' => Branch::factory()->create(['company_id' => otherCompany()->id])->id, 'name' => 'X'])->assertNotFound();
});

test('copy adds only the departments the other branch does not have', function () {
    $admin = companyUser();
    $from = Branch::factory()->create(['company_id' => $admin->company_id]);
    $to = Branch::factory()->create(['company_id' => $admin->company_id]);
    departmentIn($from, 'Finance');
    departmentIn($from, 'Sales');
    departmentIn($to, 'finance');

    $this->actingAs($admin)->postJson('/api/branch-departments/copy', ['from_branch_id' => $from->id, 'to_branch_id' => $to->id])->assertOk()->assertJsonPath('meta.added', 1);
    expect($to->departments()->pluck('name')->sort()->values()->all())->toBe(['Sales', 'finance']);
});

test('renaming a department renames it on its employees; the other branches are untouched', function () {
    $admin = companyUser();
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    $other = Branch::factory()->create(['company_id' => $admin->company_id]);
    $department = departmentIn($branch, 'Finance');
    $member = staffIn($branch, 'Finance');
    $elsewhere = staffIn($other, 'Finance');

    $this->actingAs($admin)->putJson("/api/branch-departments/{$department->id}", ['name' => 'Accounting'])->assertOk()->assertJsonPath('data.employee_count', 1);

    expect($member->fresh()->employment['department'])->toBe('Accounting')->and($member->fresh()->department)->toBe('Accounting')
        ->and($elsewhere->fresh()->department)->toBe('Finance');
});

test('a department with employees cannot be removed, an empty one can', function () {
    $admin = companyUser();
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    $busy = departmentIn($branch, 'Finance');
    $empty = departmentIn($branch, 'Sales');
    staffIn($branch, 'Finance');

    $this->actingAs($admin)->deleteJson("/api/branch-departments/{$busy->id}")->assertStatus(422);
    $this->actingAs($admin)->deleteJson("/api/branch-departments/{$empty->id}")->assertNoContent();
});

test('the supervisor must be an employee of that department in that branch', function () {
    $admin = companyUser();
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    $department = departmentIn($branch, 'Finance');
    $member = staffIn($branch, 'Finance');
    $outsider = staffIn($branch, 'Sales');

    $this->actingAs($admin)->putJson("/api/branch-departments/{$department->id}/supervisor", ['employee_id' => $outsider->id])->assertJsonValidationErrors('employee_id');
    $this->actingAs($admin)->putJson("/api/branch-departments/{$department->id}/supervisor", ['employee_id' => $member->id])->assertOk()->assertJsonPath('data.supervisor_employee_id', $member->id);
    $this->actingAs($admin)->putJson("/api/branch-departments/{$department->id}/supervisor", ['employee_id' => null])->assertOk()->assertJsonPath('data.supervisor_employee_id', null);
});
