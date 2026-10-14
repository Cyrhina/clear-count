<?php

use App\Models\Branch;
use App\Models\Employee;

function bonusBody(array $over = []): array
{
    return ['name' => 'Year-end', 'bonus_type' => 'fixed_amount', 'target_type' => 'company', 'amount' => 5000, 'period_label' => 'December 2026', 'taxable' => true, 'frequency' => 'one_time', 'payout_mode' => 'regular_payroll', ...$over];
}

function bonusStaff(int $companyId, int $count = 2): array
{
    $branchId = Branch::factory()->create(['company_id' => $companyId])->id;

    return Employee::factory()->count($count)->create(['company_id' => $companyId, 'branch_id' => $branchId])->all();
}

test('a bonus starts as a draft, goes to approval, and is decided once; a decided one is locked', function () {
    $admin = companyUser('payroll_admin');
    $id = $this->actingAs($admin)->postJson('/api/bonuses', bonusBody())->assertCreated()->assertJsonPath('data.status', 'draft')->json('data.id');

    $this->actingAs($admin)->postJson("/api/bonuses/{$id}/decision", ['decision' => 'approved'])->assertConflict();
    $this->actingAs($admin)->putJson("/api/bonuses/{$id}", bonusBody(['amount' => 6000]))->assertOk()->assertJsonPath('data.amount', 6000);
    $this->actingAs($admin)->postJson("/api/bonuses/{$id}/submit")->assertOk()->assertJsonPath('data.status', 'pending');
    $this->actingAs($admin)->postJson("/api/bonuses/{$id}/submit")->assertConflict();

    $this->actingAs($admin)->postJson("/api/bonuses/{$id}/decision", ['decision' => 'approved'])->assertOk()->assertJsonPath('data.status', 'approved')->assertJsonPath('data.decided_by', $admin->id);
    $this->actingAs($admin)->postJson("/api/bonuses/{$id}/decision", ['decision' => 'rejected'])->assertConflict();
    $this->actingAs($admin)->putJson("/api/bonuses/{$id}", bonusBody())->assertConflict();
});

test('a bonus can be filed straight for approval', function () {
    $admin = companyUser('payroll_admin');
    $this->actingAs($admin)->postJson('/api/bonuses', bonusBody(['status' => 'pending']))->assertCreated()->assertJsonPath('data.status', 'pending');
    $this->actingAs($admin)->postJson('/api/bonuses', bonusBody(['status' => 'approved']))->assertUnprocessable();
});

test('the target must match its type: one employee, a list, a department or everyone', function () {
    $admin = companyUser('payroll_admin');
    [$a, $b] = bonusStaff($admin->company_id);
    $foreign = bonusStaff(otherCompany()->id, 1)[0];

    $this->actingAs($admin)->postJson('/api/bonuses', bonusBody(['target_type' => 'employee']))->assertUnprocessable();
    $this->actingAs($admin)->postJson('/api/bonuses', bonusBody(['target_type' => 'employee', 'target_employee_id' => $foreign->id]))->assertUnprocessable();
    $one = $this->actingAs($admin)->postJson('/api/bonuses', bonusBody(['target_type' => 'employee', 'target_employee_id' => $a->id, 'target_department' => 'Stray']))->assertCreated()->json('data');
    expect($one['target_employee_id'])->toBe($a->id)->and($one['target_department'])->toBeNull();

    $this->actingAs($admin)->postJson('/api/bonuses', bonusBody(['target_type' => 'employees', 'target_employee_ids' => []]))->assertUnprocessable();
    $many = $this->actingAs($admin)->postJson('/api/bonuses', bonusBody(['target_type' => 'employees', 'target_employee_ids' => [$a->id, $b->id]]))->assertCreated()->json('data');
    expect($many['target_employee_ids'])->toBe([$a->id, $b->id]);

    $this->actingAs($admin)->postJson('/api/bonuses', bonusBody(['target_type' => 'department']))->assertUnprocessable();
    $this->actingAs($admin)->postJson('/api/bonuses', bonusBody(['target_type' => 'department', 'target_department' => 'Sales']))->assertCreated();
});

test('a percentage bonus cannot pass 100, and an amount must be positive', function () {
    $admin = companyUser('payroll_admin');
    $this->actingAs($admin)->postJson('/api/bonuses', bonusBody(['bonus_type' => 'percentage', 'amount' => 150]))->assertUnprocessable();
    $this->actingAs($admin)->postJson('/api/bonuses', bonusBody(['bonus_type' => 'percentage', 'amount' => 10]))->assertCreated();
    $this->actingAs($admin)->postJson('/api/bonuses', bonusBody(['amount' => 0]))->assertUnprocessable();
});

test('bonuses are per company, and only those who manage them can change them', function () {
    $admin = companyUser('payroll_admin');
    $id = $this->actingAs($admin)->postJson('/api/bonuses', bonusBody())->json('data.id');

    $other = companyUser('payroll_admin');
    $this->actingAs($other)->getJson('/api/bonuses')->assertOk()->assertJsonCount(0, 'data');
    $this->actingAs($other)->postJson("/api/bonuses/{$id}/submit")->assertNotFound();

    $employee = companyUser('employee', $admin->company);
    $this->actingAs($employee)->getJson('/api/bonuses')->assertForbidden();
    $this->actingAs($employee)->postJson('/api/bonuses', bonusBody())->assertForbidden();
});
