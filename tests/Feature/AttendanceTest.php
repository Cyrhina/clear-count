<?php

use App\Models\AttendanceAdjustment;
use App\Models\AttendanceRecord;
use App\Models\Branch;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\WorkSchedule;
use App\Support\AttendanceStatusResolver;

const MON = '2026-03-02';
const SAT = '2026-03-07';

/** An employee on a Mon-Fri 09:00-18:00 schedule (10 minutes grace). */
function attStaff(int $companyId, ?int $branchId = null): Employee
{
    $branchId ??= Branch::factory()->create(['company_id' => $companyId])->id;
    $schedule = WorkSchedule::firstOrCreate(['company_id' => $companyId, 'name' => 'Day'], [
        'shift_type' => 'day', 'start_time' => '09:00', 'end_time' => '18:00', 'break_minutes' => 60, 'grace_period_minutes' => 10, 'days_of_week' => [1, 2, 3, 4, 5], 'rest_days' => [6, 7],
    ]);
    $employee = Employee::factory()->create(['company_id' => $companyId, 'branch_id' => $branchId]);
    Employee::withoutGlobalScopes()->whereKey($employee->id)->update(['work_schedule_id' => $schedule->id]);

    return $employee;
}

function logPayload(array $employeeIds, array $overrides = []): array
{
    return ['employee_ids' => $employeeIds, 'date_from' => MON, 'date_to' => MON, 'work_type' => 'onsite', 'time_in' => '09:00', 'time_out' => '18:00', 'reason' => 'Biometrics was down', ...$overrides];
}

test('status follows grace, lateness and undertime, including a night shift', function () {
    expect(AttendanceStatusResolver::forPunch('09:10', '18:00', '09:00', '18:00', 10))->toBe(['status' => 'present', 'late_minutes' => 0, 'undertime_minutes' => 0])
        ->and(AttendanceStatusResolver::forPunch('09:11', '18:00', '09:00', '18:00', 10))->toBe(['status' => 'late', 'late_minutes' => 11, 'undertime_minutes' => 0])
        ->and(AttendanceStatusResolver::forPunch('09:00', '17:00', '09:00', '18:00', 10))->toBe(['status' => 'undertime', 'late_minutes' => 0, 'undertime_minutes' => 60])
        ->and(AttendanceStatusResolver::forPunch('09:30', '17:00', '09:00', '18:00', 10)['status'])->toBe('late')
        ->and(AttendanceStatusResolver::forPunch('22:00', null, '22:00', '06:00', 0)['status'])->toBe('present')
        ->and(AttendanceStatusResolver::forPunch('22:00', '06:00', '22:00', '06:00', 0)['status'])->toBe('present')
        ->and(AttendanceStatusResolver::forPunch('22:00', '04:00', '22:00', '06:00', 0))->toMatchArray(['status' => 'undertime', 'undertime_minutes' => 120]);
});

test('logging writes one record per working day and skips rest days, holidays and existing records', function () {
    $admin = companyUser();
    $a = attStaff($admin->company_id);
    Holiday::create(['company_id' => $admin->company_id, 'name' => 'Test Day', 'date' => '2026-03-04', 'type' => 'regular', 'scope' => 'national']);

    // Mon..Sun: 5 working days minus the Wednesday holiday = 4 created; Sat and Sun skipped, plus the holiday
    $r = $this->actingAs($admin)->postJson('/api/attendance/log', logPayload([$a->id], ['date_to' => '2026-03-08', 'time_in' => '09:30']))->assertOk()->json('data');
    expect($r)->toBe(['created' => 4, 'updated' => 0, 'skipped' => 3])
        ->and(AttendanceRecord::first())->toMatchArray(['status' => 'late', 'late_minutes' => 30, 'source' => 'manual']);

    // again without overwrite leaves the existing days alone
    expect($this->actingAs($admin)->postJson('/api/attendance/log', logPayload([$a->id]))->json('data'))->toBe(['created' => 0, 'updated' => 0, 'skipped' => 1]);
    // with overwrite it replaces them
    expect($this->actingAs($admin)->postJson('/api/attendance/log', logPayload([$a->id], ['overwrite' => true]))->json('data.updated'))->toBe(1)
        ->and(AttendanceRecord::whereDate('date', MON)->first()->status)->toBe('present');
});

test('attendance is read by day, range and employee, and only the permitted can write', function () {
    $admin = companyUser();
    $a = attStaff($admin->company_id);
    $b = attStaff($admin->company_id);
    $this->actingAs($admin)->postJson('/api/attendance/log', logPayload([$a->id, $b->id], ['date_to' => '2026-03-03']))->assertOk();

    $this->actingAs($admin)->getJson('/api/attendance?date='.MON)->assertOk()->assertJsonCount(2, 'data');
    $this->actingAs($admin)->getJson('/api/attendance?from='.MON.'&to=2026-03-03')->assertJsonCount(4, 'data');
    $this->actingAs($admin)->getJson('/api/attendance?from='.MON.'&to=2026-03-03&employee_id='.$a->id)->assertJsonCount(2, 'data');
    $this->actingAs($admin)->getJson('/api/attendance')->assertUnprocessable();

    $employee = companyUser('employee', $admin->company);
    $this->actingAs($employee)->getJson('/api/attendance?date='.MON)->assertForbidden();
    $this->actingAs($employee)->postJson('/api/attendance/log', logPayload([$a->id]))->assertForbidden();
});

test('a manager sees and logs only their branch', function () {
    $admin = companyUser();
    $mine = Branch::factory()->create(['company_id' => $admin->company_id]);
    $other = Branch::factory()->create(['company_id' => $admin->company_id]);
    $manager = companyUser('manager', $admin->company, ['branch_id' => $mine->id]);
    $own = attStaff($admin->company_id, $mine->id);
    $elsewhere = attStaff($admin->company_id, $other->id);

    $this->actingAs($manager)->postJson('/api/attendance/log', logPayload([$own->id, $elsewhere->id]))->assertOk()->assertJsonPath('data.created', 1);
    $this->actingAs($admin)->postJson('/api/attendance/log', logPayload([$elsewhere->id]))->assertOk();

    $this->actingAs($manager)->getJson('/api/attendance?date='.MON)->assertJsonCount(1, 'data');
});

test('a biometrics import previews, reports unmatched employees, then commits and replaces the day', function () {
    $admin = companyUser();
    $a = attStaff($admin->company_id);
    $rows = [
        ['line' => 2, 'employee_id' => $a->id, 'date' => MON, 'time_in' => '09:20', 'time_out' => '18:00', 'break_out' => '12:00', 'break_in' => '13:00'],
        ['line' => 3, 'employee_id' => 999999, 'date' => MON, 'time_in' => '09:00'],
        ['line' => 4, 'employee_id' => $a->id, 'date' => 'bad', 'time_in' => '09:00'],
    ];

    $dry = $this->actingAs($admin)->postJson('/api/attendance/biometrics', ['rows' => $rows, 'dry_run' => true])->assertOk()->json('data');
    expect(array_column($dry['rows'], 'ok'))->toBe([true, false, false])->and(AttendanceRecord::count())->toBe(0);

    $this->actingAs($admin)->postJson('/api/attendance/biometrics', ['rows' => $rows])->assertOk()->assertJsonPath('data.created', 1);
    expect(AttendanceRecord::first())->toMatchArray(['status' => 'late', 'source' => 'biometric', 'late_minutes' => 20]);

    // the same day again replaces, never duplicates
    $this->actingAs($admin)->postJson('/api/attendance/biometrics', ['rows' => [['employee_id' => $a->id, 'date' => MON, 'time_in' => '09:00', 'time_out' => '18:00']]])->assertOk();
    expect(AttendanceRecord::count())->toBe(1)->and(AttendanceRecord::first()->status)->toBe('present');

    $hr = companyUser('manager', $admin->company, ['branch_id' => $a->branch_id]);
    $this->actingAs($hr)->postJson('/api/attendance/biometrics', ['rows' => $rows])->assertForbidden(); // managers cannot import
});

test('an adjustment is filed for an employee and date, approved once, and rewrites the record', function () {
    $admin = companyUser();
    $a = attStaff($admin->company_id);
    $manager = companyUser('manager', $admin->company, ['branch_id' => $a->branch_id]);

    // an unlogged day becomes an absent record the request hangs on
    $id = $this->actingAs($manager)->postJson('/api/attendance/adjustments', [
        'employee_id' => $a->id, 'date' => MON, 'requested_time_in' => '09:05', 'requested_time_out' => '18:00', 'reason' => 'Forgot to punch', 'reason_category' => 'Missed Time In/Out',
    ])->assertCreated()->json('data.id');
    expect(AttendanceRecord::first()->status)->toBe('absent');

    // a second request on the same day while one waits is refused
    $this->actingAs($manager)->postJson('/api/attendance/adjustments', ['employee_id' => $a->id, 'date' => MON, 'requested_time_in' => '09:00', 'reason' => 'again'])->assertStatus(409);

    // managers file but cannot approve
    $this->actingAs($manager)->postJson('/api/attendance/adjustments/decide', ['ids' => [$id], 'decision' => 'approved'])->assertForbidden();

    $this->actingAs($admin)->postJson('/api/attendance/adjustments/decide', ['ids' => [$id], 'decision' => 'approved'])->assertOk()->assertJsonPath('data.decided', 1);
    expect(AttendanceRecord::first())->toMatchArray(['status' => 'present', 'source' => 'adjustment'])
        ->and(AttendanceAdjustment::first()->status)->toBe('approved')->and(AttendanceAdjustment::first()->decided_by)->toBe($admin->id);

    // deciding it again is a conflict, and changes nothing
    $this->actingAs($admin)->postJson('/api/attendance/adjustments/decide', ['ids' => [$id], 'decision' => 'rejected'])->assertStatus(409);
    expect(AttendanceAdjustment::first()->status)->toBe('approved');

    $this->actingAs($admin)->getJson('/api/attendance/adjustments')->assertOk()->assertJsonCount(1, 'data');
});

test('a rejected adjustment leaves the record alone', function () {
    $admin = companyUser();
    $a = attStaff($admin->company_id);
    $id = $this->actingAs($admin)->postJson('/api/attendance/adjustments', ['employee_id' => $a->id, 'date' => MON, 'requested_time_in' => '09:00', 'reason' => 'x'])->json('data.id');

    $this->actingAs($admin)->postJson('/api/attendance/adjustments/decide', ['ids' => [$id], 'decision' => 'rejected'])->assertOk();

    expect(AttendanceRecord::first()->status)->toBe('absent')->and(AttendanceAdjustment::first()->status)->toBe('rejected');
});

test('late dates list the days an employee was late', function () {
    $admin = companyUser();
    $a = attStaff($admin->company_id);
    $day = now()->startOfWeek()->toDateString();
    $this->actingAs($admin)->postJson('/api/attendance/biometrics', ['rows' => [['employee_id' => $a->id, 'date' => $day, 'time_in' => '10:00']]])->assertOk();

    $this->actingAs($admin)->getJson('/api/attendance/late-dates')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.employee_id', $a->id);
});
