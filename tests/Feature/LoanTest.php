<?php

use App\Models\Branch;
use App\Models\Employee;
use App\Models\Loan;
use App\Support\LoanLedger;

function loanStaff(int $companyId, int $count = 1): array
{
    $branchId = Branch::factory()->create(['company_id' => $companyId])->id;

    return Employee::factory()->count($count)->create(['company_id' => $companyId, 'branch_id' => $branchId])->all();
}

function loanBody(Employee $e, array $over = []): array
{
    return ['employee_id' => $e->id, 'type' => 'company_loan', 'label' => 'Company Loan', 'principal' => 10000, 'monthly_deduction' => 2500, 'start_date' => '2027-01-01', ...$over];
}

test('loan types start with the built-ins, a custom one gets a unique key, and a built-in or used type cannot be deleted', function () {
    $admin = companyUser('hr_admin');
    $types = $this->actingAs($admin)->getJson('/api/loans/types')->assertOk()->assertJsonCount(7, 'data')->json('data');
    expect(collect($types)->pluck('built_in')->unique()->all())->toBe([true]);

    $body = ['label' => 'Salary Advance', 'provider' => 'Company', 'amount_type' => 'fixed', 'fixed_principal' => 10000, 'fixed_monthly_deduction' => 5000];
    $first = $this->actingAs($admin)->postJson('/api/loans/types', $body)->assertCreated()->json('data');
    $second = $this->actingAs($admin)->postJson('/api/loans/types', $body)->assertCreated()->json('data');
    expect($first['key'])->toBe('custom_salary_advance')->and($second['key'])->toBe('custom_salary_advance_2');

    $this->actingAs($admin)->deleteJson('/api/loans/types/'.$types[0]['id'])->assertUnprocessable();
    [$e] = loanStaff($admin->company_id);
    $this->actingAs($admin)->postJson('/api/loans', loanBody($e, ['type' => 'custom_salary_advance']))->assertCreated();
    $this->actingAs($admin)->deleteJson('/api/loans/types/'.$first['id'])->assertUnprocessable();
    $this->actingAs($admin)->deleteJson('/api/loans/types/'.$second['id'])->assertOk();
});

test('a loan starts with its full principal as the balance, and the principal cannot be edited', function () {
    $admin = companyUser('hr_admin');
    [$e] = loanStaff($admin->company_id);
    $loan = $this->actingAs($admin)->postJson('/api/loans', loanBody($e))->assertCreated()->json('data');
    expect($loan)->balance->toEqual(10000)->status->toBe('active');

    $this->actingAs($admin)->putJson("/api/loans/{$loan['id']}", ['monthly_deduction' => 3000, 'principal' => 1])->assertOk()->assertJsonPath('data.monthly_deduction', 3000)->assertJsonPath('data.principal', 10000);
    $this->actingAs($admin)->postJson('/api/loans', loanBody($e, ['type' => 'nope']))->assertUnprocessable();
});

test('repayments lower the balance, never below zero, and the last one completes the loan', function () {
    $admin = companyUser('hr_admin');
    [$e] = loanStaff($admin->company_id);
    $id = $this->actingAs($admin)->postJson('/api/loans', loanBody($e))->json('data.id');
    $loan = Loan::withoutGlobalScopes()->find($id);

    expect(LoanLedger::repay($loan, 2500, '2027-01-31', 'PR-1'))->toEqual(2500.0);
    $this->actingAs($admin)->getJson('/api/loans')->assertJsonPath('data.0.balance', 7500)->assertJsonPath('data.0.repayment_history.0.remaining_balance_after', 7500);

    expect(LoanLedger::repay($loan, 9000, '2027-02-28', 'PR-2'))->toEqual(7500.0)->and(LoanLedger::repay($loan, 100, '2027-03-31'))->toEqual(0.0);
    $row = $this->actingAs($admin)->getJson('/api/loans')->json('data.0');
    expect($row['balance'])->toEqual(0)->and($row['status'])->toBe('completed')->and($row['repayment_history'])->toHaveCount(2);
    $this->actingAs($admin)->postJson("/api/loans/{$id}/status", ['status' => 'active'])->assertUnprocessable();
});

test('a loan can be paused, resumed and cancelled, and a cancelled one is final', function () {
    $admin = companyUser('hr_admin');
    [$e] = loanStaff($admin->company_id);
    $id = $this->actingAs($admin)->postJson('/api/loans', loanBody($e))->json('data.id');

    $this->actingAs($admin)->postJson("/api/loans/{$id}/status", ['status' => 'suspended'])->assertOk()->assertJsonPath('data.status', 'suspended');
    $this->actingAs($admin)->postJson("/api/loans/{$id}/status", ['status' => 'active'])->assertOk();
    $this->actingAs($admin)->postJson("/api/loans/{$id}/status", ['status' => 'cancelled'])->assertOk();
    $this->actingAs($admin)->postJson("/api/loans/{$id}/status", ['status' => 'active'])->assertUnprocessable();
    $this->actingAs($admin)->putJson("/api/loans/{$id}", ['label' => 'X'])->assertUnprocessable();
});

test('adding loans for many employees uses a fixed type\'s amounts, and skips anyone with a live loan or a missing amount', function () {
    $admin = companyUser('hr_admin');
    [$a, $b, $c] = loanStaff($admin->company_id, 3);
    $fixed = $this->actingAs($admin)->postJson('/api/loans/types', ['label' => 'Advance', 'provider' => 'Company', 'amount_type' => 'fixed', 'fixed_principal' => 6000, 'fixed_monthly_deduction' => 3000])->json('data.id');
    $company = collect($this->actingAs($admin)->getJson('/api/loans/types')->json('data'))->firstWhere('key', 'company_loan')['id'];

    $r = $this->actingAs($admin)->postJson('/api/loans/bulk', ['loan_type_id' => $fixed, 'start_date' => '2027-01-01', 'entries' => [['employee_id' => $a->id], ['employee_id' => $b->id]]])->assertOk()->json('data');
    expect($r)->toBe(['added' => 2, 'skipped' => 0]);
    expect(Loan::where('employee_id', $a->id)->first())->principal->toEqual(6000)->monthly_deduction->toEqual(3000);

    $again = $this->actingAs($admin)->postJson('/api/loans/bulk', ['loan_type_id' => $fixed, 'start_date' => '2027-01-01', 'entries' => [['employee_id' => $a->id], ['employee_id' => $c->id]]])->json('data');
    expect($again)->toBe(['added' => 1, 'skipped' => 1]);

    $custom = $this->actingAs($admin)->postJson('/api/loans/bulk', ['loan_type_id' => $company, 'start_date' => '2027-01-01', 'entries' => [['employee_id' => $a->id, 'principal' => 8000, 'monthly_deduction' => 2000], ['employee_id' => $b->id, 'principal' => 0, 'monthly_deduction' => 100]]])->json('data');
    expect($custom)->toBe(['added' => 1, 'skipped' => 1]);
});

test('only those who manage loans can change them, and an employee sees nothing here', function () {
    $admin = companyUser('hr_admin');
    [$e] = loanStaff($admin->company_id);
    $employee = companyUser('employee', $admin->company);
    $this->actingAs($employee)->getJson('/api/loans')->assertForbidden();
    $this->actingAs($employee)->postJson('/api/loans', loanBody($e))->assertForbidden();
    $this->actingAs($admin)->postJson('/api/loans', loanBody(loanStaff(otherCompany()->id)[0]))->assertNotFound();
});
