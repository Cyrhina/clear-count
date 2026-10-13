<?php

use App\Models\Branch;
use App\Models\Employee;
use App\Models\EmployeeBenefit;
use App\Models\EmployeeDeduction;

function benefitStaff(int $companyId, int $count = 1): array
{
    $branchId = Branch::factory()->create(['company_id' => $companyId])->id;

    return Employee::factory()->count($count)->create(['company_id' => $companyId, 'branch_id' => $branchId])->all();
}

function hmoPlan($test, $admin, string $name, array $over = []): int
{
    return $test->actingAs($admin)->postJson('/api/benefits/plans', ['category' => 'hmo', 'name' => $name, 'provider' => 'MaxiCare', 'monthly_value' => 1500, 'employee_share' => 300, ...$over])->assertCreated()->json('data.id');
}

test('plan names are unique per category, and only those who manage loans and deductions can change anything', function () {
    $admin = companyUser('hr_admin');
    hmoPlan($this, $admin, 'Plan A');
    $this->actingAs($admin)->postJson('/api/benefits/plans', ['category' => 'hmo', 'name' => 'plan a', 'monthly_value' => 1, 'employee_share' => 0])->assertUnprocessable()->assertJsonPath('message', 'plan a already exists.');
    $this->actingAs($admin)->postJson('/api/benefits/plans', ['category' => 'allowance', 'name' => 'Plan A', 'monthly_value' => 1, 'employee_share' => 0])->assertCreated();

    $employee = companyUser('employee', $admin->company);
    $this->actingAs($employee)->getJson('/api/benefits/plans')->assertForbidden();
    $this->actingAs($employee)->postJson('/api/benefits/plans', ['category' => 'hmo', 'name' => 'X', 'monthly_value' => 1, 'employee_share' => 0])->assertForbidden();
});

test('enrolling skips employees already in the plan, and for HMO anyone in another HMO plan', function () {
    $admin = companyUser('hr_admin');
    [$a, $b, $c] = benefitStaff($admin->company_id, 3);
    $planA = hmoPlan($this, $admin, 'Plan A');
    $planB = hmoPlan($this, $admin, 'Plan B');

    $this->actingAs($admin)->postJson("/api/benefits/plans/{$planA}/enroll", ['employee_ids' => [$a->id, $b->id], 'start_date' => '2027-01-01'])->assertOk()->assertJsonPath('data.added', 2);
    $r = $this->actingAs($admin)->postJson("/api/benefits/plans/{$planB}/enroll", ['employee_ids' => [$a->id, $c->id], 'start_date' => '2027-01-01'])->assertOk()->json('data');
    expect($r)->toBe(['added' => 1, 'skipped' => 1]);
    $this->actingAs($admin)->postJson("/api/benefits/plans/{$planA}/enroll", ['employee_ids' => [$a->id], 'start_date' => '2027-01-01'])->assertJsonPath('data.skipped', 1);
});

test('a custom allowance takes each employee\'s own amount, and a plan edit reaches the live enrolments but not a custom amount', function () {
    $admin = companyUser('hr_admin');
    [$a, $b] = benefitStaff($admin->company_id, 2);
    $plan = $this->actingAs($admin)->postJson('/api/benefits/plans', ['category' => 'allowance', 'name' => 'Rice', 'monthly_value' => 500, 'amount_type' => 'custom', 'employee_share' => 0])->json('data.id');
    $this->actingAs($admin)->postJson("/api/benefits/plans/{$plan}/enroll", ['employee_ids' => [$a->id, $b->id], 'start_date' => '2027-01-01', 'amounts' => [$a->id => 800]])->assertOk();
    expect(EmployeeBenefit::where('employee_id', $a->id)->value('monthly_value'))->toEqual(800)->and(EmployeeBenefit::where('employee_id', $b->id)->value('monthly_value'))->toEqual(500);

    $this->actingAs($admin)->putJson("/api/benefits/plans/{$plan}", ['name' => 'Rice Subsidy', 'monthly_value' => 600])->assertOk()->assertJsonPath('updated_enrollments', 2);
    expect(EmployeeBenefit::where('employee_id', $a->id)->first())->name->toBe('Rice Subsidy')->monthly_value->toEqual(800);

    $hmo = hmoPlan($this, $admin, 'Plan A');
    $this->actingAs($admin)->postJson("/api/benefits/plans/{$hmo}/enroll", ['employee_ids' => [$a->id], 'start_date' => '2027-01-01']);
    $this->actingAs($admin)->putJson("/api/benefits/plans/{$hmo}", ['monthly_value' => 1800])->assertOk();
    expect(EmployeeBenefit::where('benefit_plan_id', $hmo)->value('monthly_value'))->toEqual(1800);
});

test('a transfer ends the old enrolment the day before and starts the new one, and a plan with people cannot be archived', function () {
    $admin = companyUser('hr_admin');
    [$a, $b] = benefitStaff($admin->company_id, 2);
    $from = hmoPlan($this, $admin, 'Plan A');
    $to = hmoPlan($this, $admin, 'Plan B', ['monthly_value' => 2000]);
    $this->actingAs($admin)->postJson("/api/benefits/plans/{$from}/enroll", ['employee_ids' => [$a->id], 'start_date' => '2026-01-01'])->assertOk();

    $this->actingAs($admin)->postJson("/api/benefits/plans/{$from}/status", ['status' => 'archived'])->assertUnprocessable();
    $r = $this->actingAs($admin)->postJson('/api/benefits/plans/transfer', ['from_plan_id' => $from, 'to_plan_id' => $to, 'employee_ids' => [$a->id, $b->id], 'effective_date' => '2027-02-01'])->assertOk()->json('data');
    expect($r)->toBe(['moved' => 1, 'skipped' => 1]);

    $old = EmployeeBenefit::where('employee_id', $a->id)->where('benefit_plan_id', $from)->first();
    expect($old->status)->toBe('cancelled')->and($old->end_date->toDateString())->toBe('2027-01-31');
    $new = EmployeeBenefit::where('employee_id', $a->id)->where('benefit_plan_id', $to)->first();
    expect($new->start_date->toDateString())->toBe('2027-02-01')->and($new->monthly_value)->toEqual(2000);

    $this->actingAs($admin)->postJson("/api/benefits/plans/{$from}/status", ['status' => 'archived'])->assertOk();
});

test('an employee benefit can be paused, resumed and cancelled, and a cancelled one is final', function () {
    $admin = companyUser('hr_admin');
    [$a] = benefitStaff($admin->company_id);
    $id = $this->actingAs($admin)->postJson('/api/benefits', ['employee_id' => $a->id, 'category' => 'other', 'name' => 'Gym', 'monthly_value' => 700, 'start_date' => '2027-01-01'])->assertCreated()->json('data.id');

    $this->actingAs($admin)->putJson("/api/benefits/{$id}", ['status' => 'paused'])->assertOk();
    $this->actingAs($admin)->putJson("/api/benefits/{$id}", ['status' => 'active', 'monthly_value' => 750])->assertOk();
    $this->actingAs($admin)->putJson("/api/benefits/{$id}", ['status' => 'cancelled'])->assertOk();
    $this->actingAs($admin)->putJson("/api/benefits/{$id}", ['status' => 'active'])->assertUnprocessable();
});

test('deduction plans enrol, transfer and carry edits like benefit plans, and skip a zero amount', function () {
    $admin = companyUser('hr_admin');
    [$a, $b] = benefitStaff($admin->company_id, 2);
    $coop = $this->actingAs($admin)->postJson('/api/deductions/plans', ['name' => 'Coop Savings', 'amount' => 500])->assertCreated()->json('data.id');
    $dues = $this->actingAs($admin)->postJson('/api/deductions/plans', ['name' => 'Union Dues', 'amount' => 200])->json('data.id');
    $custom = $this->actingAs($admin)->postJson('/api/deductions/plans', ['name' => 'Savings Plus', 'amount' => 0, 'amount_type' => 'custom'])->json('data.id');
    $this->actingAs($admin)->postJson('/api/deductions/plans', ['name' => 'coop savings', 'amount' => 1])->assertUnprocessable();

    $this->actingAs($admin)->postJson("/api/deductions/plans/{$coop}/enroll", ['employee_ids' => [$a->id, $b->id], 'start_date' => '2027-01-01'])->assertJsonPath('data.added', 2);
    $this->actingAs($admin)->postJson("/api/deductions/plans/{$coop}/enroll", ['employee_ids' => [$a->id], 'start_date' => '2027-01-01'])->assertJsonPath('data.skipped', 1);
    $this->actingAs($admin)->postJson("/api/deductions/plans/{$custom}/enroll", ['employee_ids' => [$a->id], 'start_date' => '2027-01-01'])->assertJsonPath('data.skipped', 1);

    $this->actingAs($admin)->putJson("/api/deductions/plans/{$coop}", ['amount' => 600])->assertOk()->assertJsonPath('updated_enrollments', 2);
    expect(EmployeeDeduction::where('employee_id', $a->id)->value('amount'))->toEqual(600);

    $this->actingAs($admin)->postJson('/api/deductions/plans/transfer', ['from_plan_id' => $coop, 'to_plan_id' => $dues, 'employee_ids' => [$a->id], 'effective_date' => '2027-03-01'])->assertJsonPath('data.moved', 1);
    expect(EmployeeDeduction::where('employee_id', $a->id)->where('deduction_plan_id', $coop)->first())->status->toBe('cancelled')->end_date->toDateString()->toBe('2027-02-28');
});

test('one-time deductions need a due date, recurring ones a start date', function () {
    $admin = companyUser('hr_admin');
    [$a] = benefitStaff($admin->company_id);
    $this->actingAs($admin)->postJson('/api/deductions', ['employee_id' => $a->id, 'name' => 'Uniform', 'kind' => 'one_time', 'amount' => 900])->assertUnprocessable();
    $this->actingAs($admin)->postJson('/api/deductions', ['employee_id' => $a->id, 'name' => 'Uniform', 'kind' => 'one_time', 'amount' => 900, 'due_date' => '2027-03-15'])->assertCreated();
    $this->actingAs($admin)->postJson('/api/deductions', ['employee_id' => $a->id, 'name' => 'Dues', 'kind' => 'recurring', 'amount' => 100])->assertUnprocessable();
    $this->actingAs($admin)->postJson('/api/deductions', ['employee_id' => $a->id, 'name' => 'Dues', 'kind' => 'recurring', 'amount' => 100, 'start_date' => '2027-01-01'])->assertCreated();
});

test('separating an employee ends their benefits and recurring deductions on the last day but keeps one-time deductions', function () {
    $admin = companyUser();
    [$a] = benefitStaff($admin->company_id);
    $hr = companyUser('hr_admin', $admin->company);
    $this->actingAs($hr)->postJson('/api/benefits', ['employee_id' => $a->id, 'category' => 'hmo', 'name' => 'HMO', 'monthly_value' => 1000, 'start_date' => '2026-01-01']);
    $this->actingAs($hr)->postJson('/api/deductions', ['employee_id' => $a->id, 'name' => 'Dues', 'kind' => 'recurring', 'amount' => 100, 'start_date' => '2026-01-01']);
    $this->actingAs($hr)->postJson('/api/deductions', ['employee_id' => $a->id, 'name' => 'Uniform', 'kind' => 'one_time', 'amount' => 900, 'due_date' => '2027-03-15']);

    $this->actingAs($admin)->putJson("/api/employees/{$a->id}/status", ['status' => 'inactive', 'separation' => ['reason' => 'resigned', 'date' => '2027-02-15']])->assertOk();

    expect(EmployeeBenefit::first())->status->toBe('cancelled')->end_date->toDateString()->toBe('2027-02-15');
    expect(EmployeeDeduction::where('kind', 'recurring')->first())->status->toBe('cancelled');
    expect(EmployeeDeduction::where('kind', 'one_time')->first()->status)->toBe('active');
});
