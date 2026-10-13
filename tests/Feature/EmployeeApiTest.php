<?php

use App\Models\Branch;
use App\Models\BranchDepartment;
use App\Models\Employee;
use App\Models\PayrollGroup;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

function newHire(Branch $branch, array $overrides = []): array
{
    return [
        'branch_id' => $branch->id,
        'personal' => ['firstName' => 'Ana', 'lastName' => 'Cruz', 'birthDate' => '1995-04-01', 'civilStatus' => 'single', 'address' => 'Iloilo City', 'contactNumber' => '09171234567'],
        'employment' => ['position' => 'Cashier', 'department' => 'Sales', 'employmentType' => 'regular', 'dateHired' => '2026-01-05', 'category' => 'regular'],
        'compensation' => ['basicPay' => 20000, 'payType' => 'monthly', 'allowances' => [['label' => 'Rice', 'amount' => 1000]]],
        ...$overrides,
    ];
}

function hired(Branch $branch, array $attrs = []): Employee
{
    return Employee::factory()->create(['company_id' => $branch->company_id, 'branch_id' => $branch->id, ...$attrs]);
}

test('hiring creates the record, the next employee number, the department and the first pay row', function () {
    $hr = companyUser('hr_admin');
    $branch = Branch::factory()->create(['company_id' => $hr->company_id]);

    $first = $this->actingAs($hr)->postJson('/api/employees', newHire($branch))->assertCreated()
        ->assertJsonPath('data.employee_number', 'EMP-0001')->assertJsonPath('data.employment.status', 'active')->json('data');
    $this->actingAs($hr)->postJson('/api/employees', newHire($branch))->assertJsonPath('data.employee_number', 'EMP-0002');

    expect($first['compensation_history'])->toHaveCount(1)->and($first['compensation_history'][0]['type'])->toBe('Initial Hire')
        ->and(BranchDepartment::where('branch_id', $branch->id)->pluck('name')->all())->toBe(['Sales']);
});

test('the number skips one that is already taken', function () {
    $hr = companyUser('hr_admin');
    $branch = Branch::factory()->create(['company_id' => $hr->company_id]);
    hired($branch, ['employee_number' => 'EMP-0001']);

    $this->actingAs($hr)->postJson('/api/employees', newHire($branch))->assertJsonPath('data.employee_number', 'EMP-0002');
});

test('hiring validates the record and the pay', function () {
    $hr = companyUser('hr_admin');
    $branch = Branch::factory()->create(['company_id' => $hr->company_id]);

    $this->actingAs($hr)->postJson('/api/employees', newHire($branch, ['compensation' => ['basicPay' => -1, 'payType' => 'weekly']]))
        ->assertJsonValidationErrors(['compensation.basicPay', 'compensation.payType']);
    $foreign = PayrollGroup::withoutGlobalScopes()->create(['company_id' => otherCompany()->id, 'name' => 'Theirs', 'status' => 'active', 'frequency' => 'monthly', 'cutoff_config' => ['start_day' => 1], 'pay_date_config' => ['type' => 'last_working_day'], 'deduction_schedule' => 'FULL_MONTHLY', 'effective_date' => '2024-01-01']);
    $this->actingAs($hr)->postJson('/api/employees', newHire($branch, ['payroll_group_id' => $foreign->id]))->assertJsonValidationErrors('payroll_group_id');
});

test('bank and government details are only taken from users who may edit them', function () {
    $hr = companyUser('hr_admin'); // may edit government IDs, not bank details
    $branch = Branch::factory()->create(['company_id' => $hr->company_id]);

    $data = $this->actingAs($hr)->postJson('/api/employees', newHire($branch, ['government' => ['sssNo' => '33-1'], 'bank' => ['bankName' => 'BDO']]))->assertCreated()->json('data');

    expect($data['government'])->toBe(['sssNo' => '33-1'])->and($data['bank'])->toBe([]);
});

test('the list is paginated, company scoped and filtered', function () {
    $admin = companyUser();
    $a = Branch::factory()->create(['company_id' => $admin->company_id]);
    $b = Branch::factory()->create(['company_id' => $admin->company_id]);
    hired($a, ['personal' => ['firstName' => 'Maria', 'lastName' => 'Santos'], 'employment' => ['department' => 'Sales', 'status' => 'active']]);
    hired($b, ['personal' => ['firstName' => 'Jose', 'lastName' => 'Reyes'], 'employment' => ['department' => 'HR', 'status' => 'inactive']]);
    hired(Branch::factory()->create(['company_id' => otherCompany()->id]));

    $this->actingAs($admin)->getJson('/api/employees')->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('meta.total', 2);
    $this->actingAs($admin)->getJson('/api/employees?search=santos')->assertJsonCount(1, 'data');
    $this->actingAs($admin)->getJson("/api/employees?branch_id={$b->id}")->assertJsonCount(1, 'data')->assertJsonPath('data.0.personal.firstName', 'Jose');
    $this->actingAs($admin)->getJson('/api/employees?status=inactive')->assertJsonCount(1, 'data');
    $this->actingAs($admin)->getJson('/api/employees?department=Sales')->assertJsonCount(1, 'data');
    $this->actingAs($admin)->getJson('/api/employees?per_page=1')->assertJsonCount(1, 'data')->assertJsonPath('meta.last_page', 2);
    $this->actingAs($admin)->getJson('/api/employees?sort=salary')->assertJsonValidationErrors('sort');
});

test('a manager sees only their branch and no pay fields; an employee cannot list', function () {
    $company = otherCompany();
    $mine = Branch::factory()->create(['company_id' => $company->id]);
    $other = Branch::factory()->create(['company_id' => $company->id]);
    hired($mine);
    $elsewhere = hired($other);
    $manager = companyUser('manager', $company, ['branch_id' => $mine->id]);

    $data = $this->actingAs($manager)->getJson('/api/employees')->assertOk()->assertJsonCount(1, 'data')->json('data.0');
    expect($data)->not->toHaveKeys(['compensation', 'bank']);
    $this->actingAs($manager)->getJson("/api/employees/{$elsewhere->id}")->assertNotFound();
    $this->actingAs(companyUser('employee'))->getJson('/api/employees')->assertForbidden();
});

test('the profile carries pay and history for HR, and another company is a 404', function () {
    $hr = companyUser('hr_admin');
    $employee = hired(Branch::factory()->create(['company_id' => $hr->company_id]));
    $foreign = hired(Branch::factory()->create(['company_id' => otherCompany()->id]));

    $this->actingAs($hr)->getJson("/api/employees/{$employee->id}")->assertOk()->assertJsonStructure(['data' => ['compensation', 'bank', 'compensation_history', 'history']]);
    $this->actingAs($hr)->getJson("/api/employees/{$foreign->id}")->assertNotFound();
});

test('each section is behind its own capability', function () {
    $branch = Branch::factory()->create();
    $employee = hired($branch);
    $hr = companyUser('hr_admin', $branch->company); // employees.edit and government.edit; no compensation, bank or separate
    $personal = ['personal' => ['firstName' => 'A', 'lastName' => 'B', 'birthDate' => '1990-01-01', 'civilStatus' => 'single', 'address' => 'X', 'contactNumber' => '1']];

    $this->actingAs($hr)->putJson("/api/employees/{$employee->id}/personal", $personal)->assertOk();
    $this->actingAs($hr)->putJson("/api/employees/{$employee->id}/government", ['government' => ['tinNo' => '1']])->assertOk();
    $this->actingAs($hr)->putJson("/api/employees/{$employee->id}/compensation", ['compensation' => ['basicPay' => 1, 'payType' => 'daily'], 'reason' => 'x'])->assertForbidden();
    $this->actingAs($hr)->putJson("/api/employees/{$employee->id}/bank", ['bank' => ['bankName' => 'BDO']])->assertForbidden();
    $this->actingAs($hr)->putJson("/api/employees/{$employee->id}/status", ['status' => 'inactive'])->assertForbidden();

    $payroll = companyUser('payroll_admin', $branch->company);
    $this->actingAs($payroll)->putJson("/api/employees/{$employee->id}/personal", $personal)->assertForbidden();
});

test('a transfer moves the employee, creates the department and drops the old supervisor seat', function () {
    $admin = companyUser();
    $from = Branch::factory()->create(['company_id' => $admin->company_id]);
    $to = Branch::factory()->create(['company_id' => $admin->company_id]);
    $employee = hired($from, ['employment' => ['position' => 'Clerk', 'department' => 'Sales', 'employmentType' => 'regular', 'dateHired' => '2026-01-01', 'status' => 'active', 'category' => 'regular']]);
    $seat = BranchDepartment::create(['company_id' => $from->company_id, 'branch_id' => $from->id, 'name' => 'Sales', 'supervisor_employee_id' => $employee->id]);

    $this->actingAs($admin)->putJson("/api/employees/{$employee->id}/employment", [
        'employment' => ['position' => 'Clerk', 'department' => 'Sales', 'employmentType' => 'regular', 'dateHired' => '2026-01-01', 'category' => 'regular'],
        'branch_id' => $to->id,
    ])->assertOk()->assertJsonPath('data.branch_id', $to->id)->assertJsonPath('data.employment.status', 'active');

    expect($to->departments()->pluck('name')->all())->toBe(['Sales'])->and($seat->fresh()->supervisor_employee_id)->toBeNull();
});

test('a pay change writes a history row, refreshes the current pay and ignores a no-op', function () {
    $admin = companyUser();
    $employee = hired(Branch::factory()->create(['company_id' => $admin->company_id]), ['compensation' => ['basicPay' => 20000.0, 'payType' => 'monthly', 'outputUnit' => null, 'allowances' => []]]);
    $raise = ['compensation' => ['basicPay' => 25000, 'payType' => 'monthly'], 'reason' => 'Annual Merit Increase'];

    $this->actingAs($admin)->putJson("/api/employees/{$employee->id}/compensation", $raise)->assertOk()
        ->assertJsonPath('data.compensation.basicPay', 25000)
        ->assertJsonPath('data.compensation_history.0.type', 'Annual Merit Increase')
        ->assertJsonPath('data.compensation_history.0.new_salary', 25000);
    $this->actingAs($admin)->putJson("/api/employees/{$employee->id}/compensation", $raise)->assertOk();

    expect($employee->compensations()->count())->toBe(1);
    $this->actingAs($admin)->putJson("/api/employees/{$employee->id}/compensation", [...$raise, 'effective_from' => now()->addDay()->toDateString()])->assertJsonValidationErrors('effective_from');
});

test('payroll finds the pay in force on a date', function () {
    $admin = companyUser();
    $employee = hired(Branch::factory()->create(['company_id' => $admin->company_id]));
    foreach ([['2026-01-01', 20000], ['2026-06-01', 25000]] as [$from, $rate]) {
        $employee->compensations()->create(['company_id' => $employee->company_id, 'effective_from' => $from, 'rate_type' => 'monthly', 'basic_rate' => $rate, 'allowances' => [], 'reason' => 'x']);
    }

    expect((float) $employee->compensations()->effectiveOn('2026-03-15')->first()->basic_rate)->toBe(20000.0)
        ->and((float) $employee->compensations()->effectiveOn('2026-06-01')->first()->basic_rate)->toBe(25000.0)
        ->and($employee->compensations()->effectiveOn('2025-12-31')->first())->toBeNull();
});

test('a separation sets the reason and last day, and going back to active clears them', function () {
    $admin = companyUser();
    $employee = hired(Branch::factory()->create(['company_id' => $admin->company_id]));

    $this->actingAs($admin)->putJson("/api/employees/{$employee->id}/status", ['status' => 'inactive', 'separation' => ['reason' => 'resigned', 'date' => '2026-09-30']])->assertOk()
        ->assertJsonPath('data.employment.separationReason', 'resigned')->assertJsonPath('data.employment.dateSeparated', '2026-09-30');
    expect($employee->fresh()->status)->toBe('inactive');

    $this->actingAs($admin)->putJson("/api/employees/{$employee->id}/status", ['status' => 'active', 'separation' => ['reason' => 'resigned', 'date' => '2026-09-30']])->assertJsonValidationErrors('separation');
    $this->actingAs($admin)->putJson("/api/employees/{$employee->id}/status", ['status' => 'active'])->assertOk()->assertJsonMissingPath('data.employment.dateSeparated');
});

test('changes show up in the history', function () {
    $admin = companyUser();
    $employee = hired(Branch::factory()->create(['company_id' => $admin->company_id]));

    $this->actingAs($admin)->putJson("/api/employees/{$employee->id}/benefits", ['benefits' => ['hmoPlan' => 'Gold', 'leaveCreditsByType' => ['Vacation Leave' => 15]]])->assertOk();

    $this->actingAs($admin)->getJson("/api/employees/{$employee->id}")->assertJsonPath('data.history.0.action', 'Benefits updated');
});

test('an account is created for an employee once, with an invite', function () {
    Notification::fake();
    $admin = companyUser();
    $employee = hired(Branch::factory()->create(['company_id' => $admin->company_id]));

    $this->actingAs($admin)->postJson("/api/employees/{$employee->id}/account", ['email' => 'ana@example.com'])->assertCreated();
    $user = User::where('email', 'ana@example.com')->firstOrFail();
    expect($user->employee_id)->toBe($employee->id)->and($user->company_id)->toBe($admin->company_id)->and($user->hasRole('employee'))->toBeTrue();

    $this->actingAs($admin)->postJson("/api/employees/{$employee->id}/account", ['email' => 'other@example.com'])->assertStatus(422);
    $this->actingAs(companyUser('hr_admin', $admin->company))->postJson("/api/employees/{$employee->id}/account", ['email' => 'x@example.com'])->assertForbidden();
});
