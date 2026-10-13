<?php

use App\Models\Branch;
use App\Models\Employee;

/** An hourly employee in `$branch`, with their own login. */
function notifiedEmployee($company, Branch $branch): array
{
    $employee = Employee::factory()->create(['company_id' => $company->id, 'branch_id' => $branch->id, 'compensation' => ['payType' => 'hourly', 'basicPay' => 100]]);

    return [$employee, companyUser('employee', $company, ['employee_id' => $employee->id, 'branch_id' => $branch->id])];
}

function otBody(Employee $e): array
{
    return ['employee_id' => $e->id, 'work_date' => '2027-03-01', 'start_time' => '18:00', 'end_time' => '20:00', 'type' => 'regular'];
}

test('a new request notifies the approvers of that employee, not the person who filed it', function () {
    $admin = companyUser();
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    $otherBranch = Branch::factory()->create(['company_id' => $admin->company_id]);
    $sameBranchManager = companyUser('manager', $admin->company, ['branch_id' => $branch->id]);
    $otherBranchManager = companyUser('manager', $admin->company, ['branch_id' => $otherBranch->id]);
    [$employee, $employeeUser] = notifiedEmployee($admin->company, $branch);

    $this->actingAs($employeeUser)->postJson('/api/work-logs', ['employee_id' => $employee->id, 'work_date' => '2027-03-01', 'quantity' => 8])->assertCreated();

    $this->actingAs($admin)->getJson('/api/notifications')->assertOk()->assertJsonPath('unread', 1)->assertJsonPath('data.0.link', '/approvals')->assertJsonPath('data.0.tone', 'warning');
    $this->actingAs($sameBranchManager)->getJson('/api/notifications')->assertJsonPath('unread', 1);
    $this->actingAs($otherBranchManager)->getJson('/api/notifications')->assertJsonPath('unread', 0);
    $this->actingAs($employeeUser)->getJson('/api/notifications')->assertJsonPath('unread', 0);
});

test('a decision notifies the requester and the employee it is for, on every kind of approval', function () {
    $admin = companyUser();
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    [$employee, $employeeUser] = notifiedEmployee($admin->company, $branch);

    $ot = $this->actingAs($employeeUser)->postJson('/api/overtime', otBody($employee))->assertCreated()->json('data.id');
    $log = $this->actingAs($employeeUser)->postJson('/api/work-logs', ['employee_id' => $employee->id, 'work_date' => '2027-03-01', 'quantity' => 8])->json('data.id');

    $this->actingAs($admin)->postJson('/api/overtime/decide', ['ids' => [$ot], 'decision' => 'approved'])->assertOk();
    $this->actingAs($admin)->postJson('/api/work-logs/decide', ['ids' => [$log], 'decision' => 'rejected'])->assertOk();

    $messages = collect($this->actingAs($employeeUser)->getJson('/api/notifications')->assertJsonPath('unread', 2)->json('data'))->pluck('message', 'tone');
    expect($messages['success'])->toBe('Your overtime request was approved')->and($messages['danger'])->toBe('Your work log was rejected');
    // The approver who decided is not told about their own decision.
    $this->actingAs($admin)->getJson('/api/notifications')->assertJsonCount(2, 'data');
});

test('a rolled-back or repeated decision sends nothing new', function () {
    $admin = companyUser();
    [$employee, $employeeUser] = notifiedEmployee($admin->company, Branch::factory()->create(['company_id' => $admin->company_id]));
    $ot = $this->actingAs($employeeUser)->postJson('/api/overtime', otBody($employee))->json('data.id');

    $this->actingAs($admin)->postJson('/api/overtime/decide', ['ids' => [$ot], 'decision' => 'approved'])->assertOk();
    $this->actingAs($admin)->postJson('/api/overtime/decide', ['ids' => [$ot], 'decision' => 'rejected'])->assertConflict();

    $this->actingAs($employeeUser)->getJson('/api/notifications')->assertJsonPath('unread', 1);
});

test('notifications are marked read one at a time or all at once, and only your own', function () {
    $admin = companyUser();
    [$employee, $employeeUser] = notifiedEmployee($admin->company, Branch::factory()->create(['company_id' => $admin->company_id]));
    $this->actingAs($employeeUser)->postJson('/api/overtime', otBody($employee))->assertCreated();
    $this->actingAs($employeeUser)->postJson('/api/work-logs', ['employee_id' => $employee->id, 'work_date' => '2027-03-01', 'quantity' => 8])->assertCreated();

    $ids = collect($this->actingAs($admin)->getJson('/api/notifications')->assertJsonPath('unread', 2)->json('data'))->pluck('id');
    $this->actingAs($employeeUser)->postJson("/api/notifications/{$ids[0]}/read")->assertNotFound();
    $this->actingAs($admin)->postJson("/api/notifications/{$ids[0]}/read")->assertOk();
    $this->actingAs($admin)->getJson('/api/notifications')->assertJsonPath('unread', 1);
    $this->actingAs($admin)->postJson('/api/notifications/read-all')->assertOk();
    $this->actingAs($admin)->getJson('/api/notifications')->assertJsonPath('unread', 0)->assertJsonPath('data.0.read', true);
});

test('the approvals summary counts what waits for the user, only for the types they may approve', function () {
    $admin = companyUser();
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    [$employee, $employeeUser] = notifiedEmployee($admin->company, $branch);
    $this->actingAs($employeeUser)->postJson('/api/overtime', otBody($employee))->assertCreated();
    $this->actingAs($employeeUser)->postJson('/api/work-logs', ['employee_id' => $employee->id, 'work_date' => '2027-03-01', 'quantity' => 8])->assertCreated();

    $all = $this->actingAs($admin)->getJson('/api/approvals/summary')->assertOk()->assertJsonPath('total', 2)->json('data');
    expect(collect($all)->pluck('pending', 'type')->all())->toMatchArray(['overtime' => 1, 'work_logs' => 1, 'leave' => 0]);

    // A manager approves work logs but not overtime, leave or attendance.
    $manager = companyUser('manager', $admin->company, ['branch_id' => $branch->id]);
    $types = collect($this->actingAs($manager)->getJson('/api/approvals/summary')->assertOk()->json('data'))->pluck('type')->all();
    expect($types)->toBe(['work_logs']);

    $this->actingAs($employeeUser)->getJson('/api/approvals/summary')->assertForbidden();
});
