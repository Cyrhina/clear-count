<?php

use App\Models\AttendanceRecord;
use App\Models\Branch;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\WfhArrangement;
use App\Models\WorkSchedule;

/** An employee on a Mon-Fri 09:00-18:00 schedule. */
function wfhStaff(int $companyId, ?int $branchId = null): Employee
{
    $branchId ??= Branch::factory()->create(['company_id' => $companyId])->id;
    $schedule = WorkSchedule::firstOrCreate(['company_id' => $companyId, 'name' => 'Day'], [
        'shift_type' => 'day', 'start_time' => '09:00', 'end_time' => '18:00', 'break_minutes' => 60, 'grace_period_minutes' => 10, 'days_of_week' => [1, 2, 3, 4, 5], 'rest_days' => [6, 7],
    ]);
    $employee = Employee::factory()->create(['company_id' => $companyId, 'branch_id' => $branchId]);
    Employee::withoutGlobalScopes()->whereKey($employee->id)->update(['work_schedule_id' => $schedule->id]);

    return $employee;
}

/** Last Monday to last Sunday: always in the past, so approving fills the days at once. */
function lastWeek(): array
{
    $monday = now()->startOfWeek()->subWeek();

    return [$monday->toDateString(), $monday->addDays(6)->toDateString(), $monday];
}

function wfhPayload(array $ids, array $overrides = []): array
{
    [$from, $to] = lastWeek();

    return ['employee_ids' => $ids, 'kind' => 'temporary', 'date_from' => $from, 'date_to' => $to, 'times' => 'default', 'reason' => 'Renovation', ...$overrides];
}

test('an approved arrangement fills the working days with the schedule times and skips rest days and holidays', function () {
    $admin = companyUser();
    $a = wfhStaff($admin->company_id);
    [, , $monday] = lastWeek();
    Holiday::create(['company_id' => $admin->company_id, 'name' => 'Test', 'date' => $monday->addDays(2)->toDateString(), 'type' => 'regular', 'scope' => 'national']);

    $this->actingAs($admin)->postJson('/api/wfh', wfhPayload([$a->id]))->assertCreated()->assertJsonPath('data.created', 1);

    // Mon..Fri minus the Wednesday holiday; Sat and Sun are rest days
    expect(AttendanceRecord::count())->toBe(4)
        ->and(AttendanceRecord::first())->toMatchArray(['work_type' => 'wfh', 'source' => 'wfh', 'auto_recorded' => true, 'status' => 'present'])
        ->and(substr(AttendanceRecord::first()->time_in, 0, 5))->toBe('09:00')
        ->and(substr(AttendanceRecord::first()->break_out, 0, 5))->toBe('12:00')
        ->and(substr(AttendanceRecord::first()->break_in, 0, 5))->toBe('13:00');
    expect(WfhArrangement::first()->status)->toBe('approved');
});

test('real punches win over a WFH day, and running it again adds nothing', function () {
    $admin = companyUser();
    $a = wfhStaff($admin->company_id);
    [, , $monday] = lastWeek();
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $a->id, 'date' => $monday->toDateString(), 'time_in' => '09:00', 'time_out' => '18:00', 'status' => 'present', 'source' => 'biometric']);

    $this->actingAs($admin)->postJson('/api/wfh', wfhPayload([$a->id]))->assertCreated();
    expect(AttendanceRecord::count())->toBe(5)->and(AttendanceRecord::whereDate('date', $monday->toDateString())->first()->source)->toBe('biometric');

    $this->artisan('attendance:materialize-wfh')->assertSuccessful();
    expect(AttendanceRecord::count())->toBe(5);
});

test('a temporary arrangement beats a standing one on its days, and self-logged ones fill nothing', function () {
    $admin = companyUser();
    $a = wfhStaff($admin->company_id);
    [$from, , $monday] = lastWeek();

    $this->actingAs($admin)->postJson('/api/wfh', wfhPayload([$a->id], ['kind' => 'standing', 'date_to' => null, 'days_of_week' => [1, 2], 'times' => 'custom', 'custom' => ['timeIn' => '08:00', 'timeOut' => '17:00']]))->assertCreated();
    $this->actingAs($admin)->postJson('/api/wfh', wfhPayload([$a->id], ['date_to' => $from, 'times' => 'default']))->assertCreated();

    // Monday belongs to the temporary one (default times), Tuesday to the standing one (fixed 08:00)
    expect(substr(AttendanceRecord::whereDate('date', $monday->toDateString())->first()->time_in, 0, 5))->toBe('09:00')
        ->and(substr(AttendanceRecord::whereDate('date', $monday->addDay()->toDateString())->first()->time_in, 0, 5))->toBe('08:00');

    $b = wfhStaff($admin->company_id);
    $this->actingAs($admin)->postJson('/api/wfh', wfhPayload([$b->id], ['times' => 'self_log']))->assertCreated();
    expect(AttendanceRecord::where('employee_id', $b->id)->count())->toBe(0);
});

test('an overlap is skipped unless replaced, and replacing removes the old days', function () {
    $admin = companyUser();
    $a = wfhStaff($admin->company_id);
    $this->actingAs($admin)->postJson('/api/wfh', wfhPayload([$a->id]))->assertCreated();

    $this->actingAs($admin)->postJson('/api/wfh', wfhPayload([$a->id]))->assertCreated()->assertJsonPath('data.created', 0)->assertJsonPath('data.skipped.0.employee_id', $a->id);

    $this->actingAs($admin)->postJson('/api/wfh', wfhPayload([$a->id], ['replace_overlaps' => true, 'times' => 'self_log']))->assertCreated()->assertJsonPath('data.created', 1);
    expect(WfhArrangement::where('status', 'cancelled')->count())->toBe(1)->and(AttendanceRecord::count())->toBe(0);
});

test('cancelling and ending remove the auto days but keep real ones', function () {
    $admin = companyUser();
    $a = wfhStaff($admin->company_id);
    [, , $monday] = lastWeek();
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $a->id, 'date' => $monday->addDay()->toDateString(), 'time_in' => '09:00', 'status' => 'present', 'source' => 'manual']);
    $this->actingAs($admin)->postJson('/api/wfh', wfhPayload([$a->id]))->assertCreated();
    $id = WfhArrangement::first()->id;

    // end after Tuesday: Wednesday-Friday auto days go, Monday stays, Tuesday (real) stays
    $this->actingAs($admin)->postJson('/api/wfh/end', ['ids' => [$id], 'last_day' => $monday->addDay()->toDateString()])->assertOk()->assertJsonPath('data.changed', 1);
    expect(AttendanceRecord::count())->toBe(2);

    $this->actingAs($admin)->postJson('/api/wfh/cancel', ['ids' => [$id]])->assertOk();
    expect(WfhArrangement::first()->status)->toBe('cancelled')->and(AttendanceRecord::count())->toBe(1)->and(AttendanceRecord::first()->source)->toBe('manual');
});

test('an employee can only ask for themselves, and a manager decides', function () {
    $admin = companyUser();
    $a = wfhStaff($admin->company_id);
    $other = wfhStaff($admin->company_id);
    $user = companyUser('employee', $admin->company, ['employee_id' => $a->id]);

    $this->actingAs($user)->postJson('/api/wfh', wfhPayload([$other->id]))->assertCreated()->assertJsonPath('data.created', 1);
    $own = WfhArrangement::first();
    expect($own->employee_id)->toBe($a->id)->and($own->status)->toBe('pending')->and(AttendanceRecord::count())->toBe(0);

    $this->actingAs($user)->postJson('/api/wfh/decide', ['ids' => [$own->id], 'decision' => 'approved'])->assertForbidden();
    $this->actingAs($admin)->postJson('/api/wfh/decide', ['ids' => [$own->id], 'decision' => 'approved'])->assertOk()->assertJsonPath('data.decided', 1);
    expect($own->fresh()->status)->toBe('approved')->and(AttendanceRecord::count())->toBe(5);

    $this->actingAs($admin)->postJson('/api/wfh/decide', ['ids' => [$own->id], 'decision' => 'rejected'])->assertStatus(409);
});

test('the preview counts working days and flags the monthly limit and overlaps', function () {
    $admin = companyUser();
    $a = wfhStaff($admin->company_id);
    $this->actingAs($admin)->putJson('/api/wfh/limit', ['monthly_limit' => 3])->assertOk();
    $this->actingAs($admin)->postJson('/api/wfh', wfhPayload([$a->id]))->assertCreated();

    $rows = $this->actingAs($admin)->postJson('/api/wfh/preview', wfhPayload([$a->id]))->assertOk()->json('data');

    // the five working days already have WFH, so they are "punches" no: auto days do not count as punches; they are work days again
    expect($rows[0]['employee_id'])->toBe($a->id)->and($rows[0]['work_days'])->toBe(5)->and($rows[0]['skipped']['rest'])->toBe(2)
        ->and($rows[0]['overlap_ids'])->toHaveCount(1)->and($rows[0]['over_limit'])->not->toBeEmpty();
    $this->actingAs($admin)->getJson('/api/wfh')->assertOk()->assertJsonPath('meta.monthly_limit', 3)->assertJsonCount(1, 'data');
});

test('a manager sees and applies WFH for their branch only', function () {
    $admin = companyUser();
    $mine = Branch::factory()->create(['company_id' => $admin->company_id]);
    $other = Branch::factory()->create(['company_id' => $admin->company_id]);
    $manager = companyUser('manager', $admin->company, ['branch_id' => $mine->id]);
    $own = wfhStaff($admin->company_id, $mine->id);
    $elsewhere = wfhStaff($admin->company_id, $other->id);

    $this->actingAs($manager)->postJson('/api/wfh', wfhPayload([$own->id, $elsewhere->id]))->assertCreated()->assertJsonPath('data.created', 1);
    $this->actingAs($admin)->postJson('/api/wfh', wfhPayload([$elsewhere->id]))->assertCreated();

    $this->actingAs($manager)->getJson('/api/wfh')->assertJsonCount(1, 'data');
    $this->actingAs($manager)->putJson('/api/wfh/limit', ['monthly_limit' => 2])->assertForbidden(); // managers cannot set the company limit
});
