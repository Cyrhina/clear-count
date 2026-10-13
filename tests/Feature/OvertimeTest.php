<?php

use App\Models\Branch;
use App\Models\Employee;
use App\Models\OvertimeRate;
use App\Models\OvertimeRecord;
use App\Models\WorkLog;

function otStaff(int $companyId, array $compensation = []): Employee
{
    $branchId = Branch::factory()->create(['company_id' => $companyId])->id;

    return Employee::factory()->create(['company_id' => $companyId, 'branch_id' => $branchId, 'compensation' => ['payType' => 'monthly', 'basicPay' => 30000, ...$compensation]]);
}

function otFiling(Employee $e, array $overrides = []): array
{
    return ['employee_id' => $e->id, 'work_date' => '2027-03-01', 'start_time' => '18:00', 'end_time' => '21:30', 'type' => 'regular', ...$overrides];
}

test('filing overtime computes the hours (also across midnight) and copies the multiplier at that moment', function () {
    $admin = companyUser();
    $e = otStaff($admin->company_id);

    $first = $this->actingAs($admin)->postJson('/api/overtime', otFiling($e))->assertCreated()->json('data');
    expect($first['hours'])->toBe(3.5)->and($first['multiplier'])->toBe(1.25)->and($first['status'])->toBe('pending');

    $night = $this->actingAs($admin)->postJson('/api/overtime', otFiling($e, ['start_time' => '22:00', 'end_time' => '02:00', 'type' => 'night_diff']))->assertCreated()->json('data');
    expect($night['hours'])->toEqual(4);

    // A later rate edit does not change a record already filed.
    OvertimeRate::where('key', 'regular')->update(['multiplier' => 1.5]);
    expect(OvertimeRecord::find($first['id'])->multiplier)->toBe(1.25);

    $this->actingAs($admin)->postJson('/api/overtime', otFiling($e, ['end_time' => '18:00']))->assertUnprocessable();
    $this->actingAs($admin)->postJson('/api/overtime', otFiling($e, ['type' => 'nonsense']))->assertUnprocessable();
});

test('overtime is decided once, in bulk, and only by those who approve it', function () {
    $admin = companyUser();
    $e = otStaff($admin->company_id);
    $a = $this->actingAs($admin)->postJson('/api/overtime', otFiling($e))->json('data.id');
    $b = $this->actingAs($admin)->postJson('/api/overtime', otFiling($e, ['work_date' => '2027-03-02']))->json('data.id');

    $this->actingAs($admin)->postJson('/api/overtime/decide', ['ids' => [$a, $b], 'decision' => 'approved'])->assertOk()->assertJsonPath('data.decided', 2);
    expect(OvertimeRecord::find($a))->status->toBe('approved')->decided_by->toBe($admin->id);
    $this->actingAs($admin)->postJson('/api/overtime/decide', ['ids' => [$a], 'decision' => 'rejected'])->assertConflict();

    $employeeUser = companyUser('employee', $admin->company);
    $this->actingAs($employeeUser)->postJson('/api/overtime/decide', ['ids' => [$b], 'decision' => 'approved'])->assertForbidden();
});

test('an employee files and sees only their own overtime', function () {
    $admin = companyUser();
    $mine = Employee::factory()->create(['company_id' => $admin->company_id, 'branch_id' => Branch::factory()->create(['company_id' => $admin->company_id])->id]);
    $other = otStaff($admin->company_id);
    $user = companyUser('employee', $admin->company, ['employee_id' => $mine->id]);

    $this->actingAs($user)->postJson('/api/overtime', otFiling($mine, ['source' => 'ess']))->assertCreated()->assertJsonPath('data.source', 'ess');
    $this->actingAs($user)->postJson('/api/overtime', otFiling($other))->assertNotFound();
    $this->actingAs($admin)->postJson('/api/overtime', otFiling($other))->assertCreated();

    $this->actingAs($user)->getJson('/api/overtime')->assertOk()->assertJsonCount(1, 'data');
    $this->actingAs($admin)->getJson('/api/overtime')->assertOk()->assertJsonCount(2, 'data');
});

test('a work log takes the rate and unit from the employee, and only hourly and output-based employees have them', function () {
    $admin = companyUser();
    $hourly = otStaff($admin->company_id, ['payType' => 'hourly', 'basicPay' => 100]);
    $output = otStaff($admin->company_id, ['payType' => 'output_based', 'basicPay' => 12.5, 'outputUnit' => 'Per Piece']);
    $monthly = otStaff($admin->company_id);

    $h = $this->actingAs($admin)->postJson('/api/work-logs', ['employee_id' => $hourly->id, 'work_date' => '2027-03-01', 'quantity' => 7.5])->assertCreated()->json('data');
    expect($h)->type->toBe('hourly')->and($h['unit_label'])->toBe('hrs')->and($h['amount'])->toEqual(750);
    $o = $this->actingAs($admin)->postJson('/api/work-logs', ['employee_id' => $output->id, 'work_date' => '2027-03-01', 'quantity' => 40])->assertCreated()->json('data');
    expect($o)->type->toBe('output')->and($o['unit_label'])->toBe('Per Piece')->and($o['amount'])->toEqual(500);

    $this->actingAs($admin)->postJson('/api/work-logs', ['employee_id' => $monthly->id, 'work_date' => '2027-03-01', 'quantity' => 1])->assertUnprocessable();
    $this->actingAs($admin)->postJson('/api/work-logs', ['employee_id' => $hourly->id, 'work_date' => '2027-03-01', 'quantity' => 0])->assertUnprocessable();
});

test('work logs are approved in bulk, a decided or paid one is locked, and a pending one can be withdrawn', function () {
    $admin = companyUser();
    $e = otStaff($admin->company_id, ['payType' => 'hourly', 'basicPay' => 100]);
    $ids = collect(['2027-03-01', '2027-03-02', '2027-03-03'])->map(fn ($d) => $this->actingAs($admin)->postJson('/api/work-logs', ['employee_id' => $e->id, 'work_date' => $d, 'quantity' => 8])->json('data.id'));

    $this->actingAs($admin)->postJson('/api/work-logs/decide', ['ids' => [$ids[0]], 'decision' => 'approved'])->assertOk();
    $this->actingAs($admin)->postJson('/api/work-logs/decide', ['ids' => [$ids[0]], 'decision' => 'rejected'])->assertConflict();
    $this->actingAs($admin)->deleteJson("/api/work-logs/{$ids[0]}")->assertConflict();
    $this->actingAs($admin)->deleteJson("/api/work-logs/{$ids[1]}")->assertOk();

    WorkLog::whereKey($ids[2])->update(['payroll_period_id' => 99]);
    $this->actingAs($admin)->postJson('/api/work-logs/decide', ['ids' => [$ids[2]], 'decision' => 'approved'])->assertConflict();
});
