<?php

use App\Models\Branch;
use App\Models\Employee;
use App\Models\PayrollGroup;
use App\Models\ShiftAssignment;
use App\Models\WorkSchedule;
use App\Support\ScheduleResolver;
use Illuminate\Support\Facades\DB;

function shiftTemplate(int $companyId, string $name = 'Day', array $attrs = []): WorkSchedule
{
    return WorkSchedule::create([
        'company_id' => $companyId, 'name' => $name, 'shift_type' => 'day', 'start_time' => '09:00', 'end_time' => '18:00',
        'break_minutes' => 60, 'grace_period_minutes' => 10, 'days_of_week' => [1, 2, 3, 4, 5], 'rest_days' => [6, 7], ...$attrs,
    ]);
}

function rosterStaff(int $companyId, ?int $branchId = null, array $attrs = []): Employee
{
    $branchId ??= Branch::factory()->create(['company_id' => $companyId])->id;

    return Employee::factory()->create(['company_id' => $companyId, 'branch_id' => $branchId, ...$attrs]);
}

test('assigning writes one row per employee per day, and writing again replaces it', function () {
    $admin = companyUser();
    $day = shiftTemplate($admin->company_id);
    $night = shiftTemplate($admin->company_id, 'Night');
    $a = rosterStaff($admin->company_id);
    $b = rosterStaff($admin->company_id);
    $payload = ['employee_ids' => [$a->id, $b->id], 'dates' => ['2026-03-02', '2026-03-03'], 'work_schedule_id' => $day->id];

    $this->actingAs($admin)->postJson('/api/schedules/roster', $payload)->assertOk()->assertJsonPath('data.changed', 4);
    $this->actingAs($admin)->postJson('/api/schedules/roster', [...$payload, 'work_schedule_id' => $night->id])->assertOk();

    expect(ShiftAssignment::count())->toBe(4)->and(ShiftAssignment::where('work_schedule_id', $night->id)->count())->toBe(4);

    $this->actingAs($admin)->getJson('/api/schedules/roster?from=2026-03-02&to=2026-03-03')->assertOk()->assertJsonCount(4, 'data');
    $this->actingAs($admin)->getJson('/api/schedules/roster?from=2026-03-03&to=2026-03-03')->assertOk()->assertJsonCount(2, 'data');
});

test('no schedule is a rest day, and clear takes the day back to not scheduled', function () {
    $admin = companyUser();
    $a = rosterStaff($admin->company_id);

    $this->actingAs($admin)->postJson('/api/schedules/roster', ['employee_ids' => [$a->id], 'dates' => ['2026-03-07'], 'work_schedule_id' => null])->assertOk();
    expect(ShiftAssignment::first()->is_rest_day)->toBeTrue();

    $this->actingAs($admin)->postJson('/api/schedules/roster/clear', ['employee_ids' => [$a->id], 'dates' => ['2026-03-07']])->assertOk()->assertJsonPath('data.changed', 1);
    expect(ShiftAssignment::count())->toBe(0);
});

test('copy week lands each day on the same weekday of the target week and skips empty days', function () {
    $admin = companyUser();
    $day = shiftTemplate($admin->company_id);
    $a = rosterStaff($admin->company_id);
    $this->actingAs($admin)->postJson('/api/schedules/roster', ['employee_ids' => [$a->id], 'dates' => ['2026-03-02', '2026-03-04'], 'work_schedule_id' => $day->id])->assertOk();

    $this->actingAs($admin)->postJson('/api/schedules/roster/copy-week', ['employee_ids' => [$a->id], 'from_start' => '2026-03-02', 'to_start' => '2026-03-09'])
        ->assertOk()->assertJsonPath('data.changed', 2);

    expect(ShiftAssignment::whereBetween('date', ['2026-03-09', '2026-03-15'])->pluck('date')->map->toDateString()->sort()->values()->all())->toBe(['2026-03-09', '2026-03-11']);
});

test('a manager rosters only their branch and a stray employee id is ignored', function () {
    $admin = companyUser();
    $mine = Branch::factory()->create(['company_id' => $admin->company_id]);
    $other = Branch::factory()->create(['company_id' => $admin->company_id]);
    $manager = companyUser('manager', $admin->company, ['branch_id' => $mine->id]);
    $day = shiftTemplate($admin->company_id);
    $own = rosterStaff($admin->company_id, $mine->id);
    $elsewhere = rosterStaff($admin->company_id, $other->id);

    $this->actingAs($manager)->postJson('/api/schedules/roster', ['employee_ids' => [$own->id, $elsewhere->id], 'dates' => ['2026-03-02'], 'work_schedule_id' => $day->id])
        ->assertOk()->assertJsonPath('data.changed', 1);

    expect(ShiftAssignment::withoutGlobalScopes()->pluck('employee_id')->all())->toBe([$own->id]);
    $this->actingAs($manager)->getJson('/api/schedules/roster?from=2026-03-01&to=2026-03-31')->assertJsonCount(1, 'data');
});

test('a shift template from another company is refused, and an employee cannot write the roster', function () {
    $admin = companyUser();
    $foreign = shiftTemplate(otherCompany()->id, 'Foreign');
    $a = rosterStaff($admin->company_id);

    $this->actingAs($admin)->postJson('/api/schedules/roster', ['employee_ids' => [$a->id], 'dates' => ['2026-03-02'], 'work_schedule_id' => $foreign->id])->assertUnprocessable();

    $employee = companyUser('employee', $admin->company);
    // Self-service reads its own roster (none here: the account has no employee record) but never writes it.
    $this->actingAs($employee)->getJson('/api/schedules/roster?from=2026-03-01&to=2026-03-31')->assertOk()->assertJsonCount(0, 'data');
    $this->actingAs($employee)->postJson('/api/schedules/roster', ['employee_ids' => [$a->id], 'dates' => ['2026-03-02']])->assertForbidden();
});

test('a work schedule can be given to employees, and one in use cannot be deleted', function () {
    $admin = companyUser();
    $day = shiftTemplate($admin->company_id);
    $a = rosterStaff($admin->company_id);

    $this->actingAs($admin)->postJson("/api/payroll-settings/work-schedules/{$day->id}/employees", ['employee_ids' => [$a->id]])->assertOk()->assertJsonPath('data.employees_count', 1);
    expect($a->fresh()->work_schedule_id)->toBe($day->id);

    $this->actingAs($admin)->deleteJson("/api/payroll-settings/work-schedules/{$day->id}")->assertUnprocessable();

    $this->actingAs($admin)->postJson("/api/payroll-settings/work-schedules/{$day->id}/employees", ['employee_ids' => [$a->id], 'action' => 'unassign'])->assertOk()->assertJsonPath('data.employees_count', 0);
    $this->actingAs($admin)->deleteJson("/api/payroll-settings/work-schedules/{$day->id}")->assertNoContent();
});

test('a template still on the roster for upcoming days cannot be deleted', function () {
    $admin = companyUser();
    $day = shiftTemplate($admin->company_id);
    $a = rosterStaff($admin->company_id);
    $this->actingAs($admin)->postJson('/api/schedules/roster', ['employee_ids' => [$a->id], 'dates' => [now()->addDays(3)->toDateString()], 'work_schedule_id' => $day->id])->assertOk();

    $this->actingAs($admin)->deleteJson("/api/payroll-settings/work-schedules/{$day->id}")->assertUnprocessable();
});

test('the resolver prefers the roster, then the employee schedule, then the payroll group schedule', function () {
    $company = companyUser()->company;
    $rostered = shiftTemplate($company->id, 'Rostered');
    $own = shiftTemplate($company->id, 'Own');
    $grouped = shiftTemplate($company->id, 'Grouped', ['days_of_week' => [1, 2, 3]]);
    $group = PayrollGroup::create([
        'company_id' => $company->id, 'name' => 'Monthly', 'frequency' => 'monthly', 'cutoff_config' => ['start_day' => 1], 'pay_date_config' => ['type' => 'last_working_day'],
        'deduction_schedule' => 'FULL_MONTHLY', 'work_schedule_id' => $grouped->id, 'effective_date' => '2024-01-01',
    ]);
    $employee = rosterStaff($company->id, null, ['payroll_group_id' => $group->id]);
    $monday = '2026-03-02';
    $saturday = '2026-03-07';

    // payroll group only: working on its days, resting on the others
    expect(ScheduleResolver::for($employee, $monday))->toMatchArray(['source' => 'payroll_group', 'is_rest_day' => false])
        ->and(ScheduleResolver::for($employee, '2026-03-05'))->toMatchArray(['source' => 'payroll_group', 'is_rest_day' => true]);

    // the employee's own schedule beats the group's
    Employee::whereKey($employee->id)->update(['work_schedule_id' => $own->id]);
    expect(ScheduleResolver::for($employee->fresh(), $monday)['schedule']->id)->toBe($own->id)
        ->and(ScheduleResolver::for($employee->fresh(), $saturday)['is_rest_day'])->toBeTrue();

    // a roster entry beats both, and a rostered rest day rests even on a working weekday
    DB::table('shift_assignments')->insert([
        ['company_id' => $company->id, 'employee_id' => $employee->id, 'date' => $saturday, 'work_schedule_id' => $rostered->id, 'is_rest_day' => false],
        ['company_id' => $company->id, 'employee_id' => $employee->id, 'date' => $monday, 'work_schedule_id' => null, 'is_rest_day' => true],
    ]);
    expect(ScheduleResolver::for($employee->fresh(), $saturday))->toMatchArray(['source' => 'roster', 'is_rest_day' => false])
        ->and(ScheduleResolver::for($employee->fresh(), $saturday)['schedule']->id)->toBe($rostered->id)
        ->and(ScheduleResolver::for($employee->fresh(), $monday))->toMatchArray(['source' => 'roster', 'is_rest_day' => true, 'schedule' => null]);

    // nothing at all
    $nobody = rosterStaff($company->id);
    expect(ScheduleResolver::for($nobody, $monday))->toBe(['schedule' => null, 'is_rest_day' => false, 'source' => null]);
});

test('a request for too many days at once is refused', function () {
    $admin = companyUser();
    $dates = collect(range(0, 99))->map(fn (int $i) => now()->addDays($i)->toDateString())->all();

    $this->actingAs($admin)->postJson('/api/schedules/roster', ['employee_ids' => range(1, 300), 'dates' => $dates])->assertUnprocessable();
});
