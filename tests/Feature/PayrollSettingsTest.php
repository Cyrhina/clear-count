<?php

use App\Enums\PayrollFrequency;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Employee;
use App\Models\PayrollGroup;
use App\Models\User;
use App\Models\WorkSchedule;
use App\Support\PayrollCalendar;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->company = Company::factory()->create();
    $this->branch = Branch::factory()->create(['company_id' => $this->company->id]);
    $this->admin = User::factory()->create(['company_id' => $this->company->id])->assignRole('payroll_admin');
});

const SEMI_CUTOFF = ['periods' => [['start_day' => 1, 'end_day' => 15], ['start_day' => 16, 'end_day' => 'end']]];

function groupPayload(array $overrides = []): array
{
    return [
        'name' => 'Semi-Monthly Regular Payroll',
        'description' => 'Regular rank-and-file employees paid twice a month.',
        'status' => 'active',
        'frequency' => 'semi_monthly',
        'compensation_type' => 'monthly_rate',
        'cutoff_config' => SEMI_CUTOFF,
        'pay_date_config' => ['type' => 'fixed_days', 'days' => [15, 30], 'weekend_rule' => 'previous'],
        'deduction_schedule' => 'DIVIDED',
        'effective_date' => '2024-01-01',
        ...$overrides,
    ];
}

function makeEmployee(Company $company, Branch $branch, array $employment = []): Employee
{
    $employee = Employee::factory()->create(['company_id' => $company->id, 'branch_id' => $branch->id]);
    if ($employment) {
        $employee->update(['employment' => [...$employee->employment, ...$employment]]);
    }

    return $employee;
}

// ---- calendar maths --------------------------------------------------------------------------------------------

test('semi-monthly calendar: 15th and 30th, short February, weekend pay dates move to Friday', function () {
    $periods = collect(PayrollCalendar::periods(PayrollFrequency::SemiMonthly, SEMI_CUTOFF, ['type' => 'fixed_days', 'days' => [15, 30], 'weekend_rule' => 'previous'], 2026));
    $pay = fn (int $i) => $periods[$i]['pay_date'];

    expect($periods)->toHaveCount(24)
        ->and($periods[0])->toMatchArray(['cutoff_start' => '2026-01-01', 'cutoff_end' => '2026-01-15', 'pay_date' => '2026-01-15', 'period_in_month' => 1])
        ->and($periods[1])->toMatchArray(['cutoff_start' => '2026-01-16', 'cutoff_end' => '2026-01-31', 'pay_date' => '2026-01-30', 'period_in_month' => 2])
        ->and($pay(3))->toBe('2026-02-27')   // Feb 28 is a Saturday
        ->and($pay(4))->toBe('2026-03-13')   // Mar 15 is a Sunday
        ->and($periods[3]['cutoff_end'])->toBe('2026-02-28');
});

test('weekend rule next moves to Monday, none keeps the date', function () {
    $config = fn (string $rule) => PayrollCalendar::periods(PayrollFrequency::SemiMonthly, SEMI_CUTOFF, ['type' => 'fixed_days', 'days' => [15, 30], 'weekend_rule' => $rule], 2026)[4]['pay_date'];

    expect($config('next'))->toBe('2026-03-16')->and($config('none'))->toBe('2026-03-15');
});

test('monthly calendar: calendar month, shifted cutoff, last working day', function () {
    $lastWorking = collect(PayrollCalendar::periods(PayrollFrequency::Monthly, ['start_day' => 1], ['type' => 'last_working_day'], 2026));
    expect($lastWorking)->toHaveCount(12)
        ->and($lastWorking[0]['pay_date'])->toBe('2026-01-30')   // Jan 31 is a Saturday
        ->and($lastWorking[4]['pay_date'])->toBe('2026-05-29');  // May 31 is a Sunday

    $shifted = PayrollCalendar::periods(PayrollFrequency::Monthly, ['start_day' => 26], ['type' => 'fixed_days', 'days' => [30]], 2026)[0];
    expect($shifted)->toMatchArray(['cutoff_start' => '2025-12-26', 'cutoff_end' => '2026-01-25', 'pay_date' => '2026-01-30']);
});

test('weekly and bi-weekly calendars: periods ending in the year, pay on the following Friday', function () {
    $weekly = collect(PayrollCalendar::periods(PayrollFrequency::Weekly, ['start_weekday' => 1], ['type' => 'weekday_after_cutoff', 'weekday' => 5, 'weeks_after' => 1], 2026));
    expect($weekly)->toHaveCount(52)
        ->and($weekly[0])->toMatchArray(['cutoff_start' => '2025-12-29', 'cutoff_end' => '2026-01-04', 'pay_date' => '2026-01-09', 'pay_day' => 'Friday'])
        ->and($weekly[1])->toMatchArray(['cutoff_start' => '2026-01-05', 'cutoff_end' => '2026-01-11', 'pay_date' => '2026-01-16']);

    $biweekly = collect(PayrollCalendar::periods(PayrollFrequency::BiWeekly, ['start_weekday' => 1, 'anchor_date' => '2026-01-05'], ['type' => 'weekday_after_cutoff', 'weekday' => 5, 'weeks_after' => 1], 2026));
    expect($biweekly)->toHaveCount(26)
        ->and($biweekly[0])->toMatchArray(['cutoff_start' => '2025-12-22', 'cutoff_end' => '2026-01-04'])
        ->and($biweekly[1])->toMatchArray(['cutoff_start' => '2026-01-05', 'cutoff_end' => '2026-01-18', 'pay_date' => '2026-01-23']);
});

test('display strings match the group card', function () {
    expect(PayrollCalendar::cutoffDisplay(PayrollFrequency::SemiMonthly, SEMI_CUTOFF))->toBe('Period 1: 1st – 15th · Period 2: 16th – End of Month')
        ->and(PayrollCalendar::cutoffDisplay(PayrollFrequency::Weekly, ['start_weekday' => 1]))->toBe('Monday – Sunday')
        ->and(PayrollCalendar::cutoffDisplay(PayrollFrequency::Monthly, ['start_day' => 26]))->toBe('26th – 25th')
        ->and(PayrollCalendar::payDatesDisplay(['type' => 'fixed_days', 'days' => [15, 30]]))->toBe('15th & 30th')
        ->and(PayrollCalendar::payDatesDisplay(['type' => 'weekday_after_cutoff', 'weekday' => 5, 'weeks_after' => 1]))->toBe('Following Friday')
        ->and(PayrollCalendar::payDatesDisplay(['type' => 'last_working_day']))->toBe('Last working day of the month')
        ->and(PayrollCalendar::ordinal(22))->toBe('22nd')->and(PayrollCalendar::ordinal(11))->toBe('11th');
});

// ---- payroll groups -----------------------------------------------------------------------------------------------

test('create returns the card payload and lists with counts and schedule name', function () {
    $schedule = WorkSchedule::create(['company_id' => $this->company->id, 'name' => 'Standard Day Shift', 'shift_type' => 'day', 'start_time' => '09:00', 'end_time' => '18:00', 'break_minutes' => 60, 'grace_period_minutes' => 0, 'days_of_week' => [1, 2, 3, 4, 5]]);

    $created = $this->actingAs($this->admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload(['work_schedule_id' => $schedule->id]))->assertCreated()->json('data');

    expect($created)->toMatchArray([
        'name' => 'Semi-Monthly Regular Payroll',
        'status' => 'active',
        'frequency' => 'Semi-monthly',
        'compensation' => 'Monthly Rate',
        'cutoff_display' => 'Period 1: 1st – 15th · Period 2: 16th – End of Month',
        'pay_dates_display' => '15th & 30th',
        'deduction_schedule_display' => 'Divided Equally (50% Period 1 / 50% Period 2)',
        'work_schedule_name' => 'Standard Day Shift',
        'effective_date' => '2024-01-01',
        'employees_count' => 0,
    ]);

    $list = $this->actingAs($this->admin)->getJson('/api/payroll-settings/payroll-groups')->assertOk()->json('data');
    expect($list)->toHaveCount(1)->and($list[0]['id'])->toBe($created['id']);
});

test('validation: frequency-specific cutoff, pay dates and deduction schedule', function () {
    $post = fn (array $o) => $this->actingAs($this->admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload($o));

    $post(['cutoff_config' => ['periods' => [['start_day' => 1, 'end_day' => 15], ['start_day' => 20, 'end_day' => 'end']]]])->assertUnprocessable()->assertJsonValidationErrors('cutoff_config');
    $post(['pay_date_config' => ['type' => 'last_working_day']])->assertUnprocessable()->assertJsonValidationErrors('pay_date_config');
    $post(['pay_date_config' => ['type' => 'fixed_days', 'days' => [15]]])->assertUnprocessable()->assertJsonValidationErrors('pay_date_config');
    $post(['deduction_schedule' => 'FULL_MONTHLY'])->assertUnprocessable()->assertJsonValidationErrors('deduction_schedule');
    $post(['frequency' => 'yearly'])->assertUnprocessable()->assertJsonValidationErrors('frequency');
    $post(['frequency' => 'bi_weekly', 'cutoff_config' => ['start_weekday' => 1, 'anchor_date' => '2026-01-06'], 'pay_date_config' => ['type' => 'weekday_after_cutoff', 'weekday' => 5, 'weeks_after' => 1], 'deduction_schedule' => 'DIVIDED'])
        ->assertUnprocessable()->assertJsonValidationErrors('cutoff_config'); // Jan 6, 2026 is a Tuesday, not a Monday

    $post(['frequency' => 'weekly', 'cutoff_config' => ['start_weekday' => 1], 'pay_date_config' => ['type' => 'weekday_after_cutoff', 'weekday' => 5, 'weeks_after' => 1], 'deduction_schedule' => 'SECOND_AND_LAST_PERIOD'])->assertCreated();
});

test('group names are unique within a company but not across companies', function () {
    $this->actingAs($this->admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload())->assertCreated();
    $this->actingAs($this->admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload())->assertUnprocessable()->assertJsonValidationErrors('name');

    $other = User::factory()->create(['company_id' => Company::factory()->create()->id])->assignRole('payroll_admin');
    $this->actingAs($other)->postJson('/api/payroll-settings/payroll-groups', groupPayload())->assertCreated();
});

test('update keeps its own name and changes the rules', function () {
    $id = $this->actingAs($this->admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload())->json('data.id');

    $this->actingAs($this->admin)->putJson("/api/payroll-settings/payroll-groups/{$id}", groupPayload(['description' => 'Changed', 'deduction_schedule' => 'FIRST_PERIOD']))
        ->assertOk()->assertJsonPath('data.deduction_schedule_display', '1st Pay Period Only');
});

test('assigning moves employees between groups and unassign only touches members', function () {
    $a = $this->actingAs($this->admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload(['name' => 'A']))->json('data.id');
    $b = $this->actingAs($this->admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload(['name' => 'B']))->json('data.id');
    [$e1, $e2] = [makeEmployee($this->company, $this->branch), makeEmployee($this->company, $this->branch)];

    $this->actingAs($this->admin)->postJson("/api/payroll-settings/payroll-groups/{$a}/employees", ['employee_ids' => [$e1->id, $e2->id]])->assertOk()->assertJsonPath('data.employees_count', 2);
    $this->actingAs($this->admin)->postJson("/api/payroll-settings/payroll-groups/{$b}/employees", ['employee_ids' => [$e2->id]])->assertOk()->assertJsonPath('data.employees_count', 1);
    expect($e2->fresh()->payroll_group_id)->toBe($b)->and($e1->fresh()->payroll_group_id)->toBe($a);

    // Group B is told to remove e1, who belongs to A: nothing changes.
    $this->actingAs($this->admin)->postJson("/api/payroll-settings/payroll-groups/{$b}/employees", ['action' => 'unassign', 'employee_ids' => [$e1->id]])->assertOk()->assertJsonPath('data.changed', 0);
    expect($e1->fresh()->payroll_group_id)->toBe($a);

    $this->actingAs($this->admin)->postJson("/api/payroll-settings/payroll-groups/{$a}/employees", ['action' => 'unassign', 'employee_ids' => [$e1->id]])->assertOk()->assertJsonPath('data.changed', 1);
    expect($e1->fresh()->payroll_group_id)->toBeNull();
});

test('employees of another company cannot be assigned, nor into an inactive group', function () {
    $group = $this->actingAs($this->admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload())->json('data.id');
    $otherCompany = Company::factory()->create();
    $stranger = makeEmployee($otherCompany, Branch::factory()->create(['company_id' => $otherCompany->id]));

    $this->actingAs($this->admin)->postJson("/api/payroll-settings/payroll-groups/{$group}/employees", ['employee_ids' => [$stranger->id]])->assertUnprocessable();

    $inactive = $this->actingAs($this->admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload(['name' => 'Old', 'status' => 'inactive']))->json('data.id');
    $mine = makeEmployee($this->company, $this->branch);
    $this->actingAs($this->admin)->postJson("/api/payroll-settings/payroll-groups/{$inactive}/employees", ['employee_ids' => [$mine->id]])->assertUnprocessable();
});

test('a group with active employees cannot be deleted; an empty one can', function () {
    $id = $this->actingAs($this->admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload())->json('data.id');
    $employee = makeEmployee($this->company, $this->branch);
    $this->actingAs($this->admin)->postJson("/api/payroll-settings/payroll-groups/{$id}/employees", ['employee_ids' => [$employee->id]])->assertOk();

    $this->actingAs($this->admin)->deleteJson("/api/payroll-settings/payroll-groups/{$id}")->assertUnprocessable();
    expect(PayrollGroup::count())->toBe(1);

    $this->actingAs($this->admin)->postJson("/api/payroll-settings/payroll-groups/{$id}/employees", ['action' => 'unassign', 'employee_ids' => [$employee->id]]);
    $this->actingAs($this->admin)->deleteJson("/api/payroll-settings/payroll-groups/{$id}")->assertNoContent();
    expect(PayrollGroup::count())->toBe(0);
});

test('calendar endpoint returns the year of periods; other companies cannot see the group', function () {
    $id = $this->actingAs($this->admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload())->json('data.id');

    $response = $this->actingAs($this->admin)->getJson("/api/payroll-settings/payroll-groups/{$id}/calendar?year=2026")->assertOk();
    expect($response->json('data'))->toHaveCount(24)->and($response->json('meta.year'))->toBe(2026);

    $this->actingAs($this->admin)->getJson("/api/payroll-settings/payroll-groups/{$id}/calendar?year=1900")->assertUnprocessable();

    $other = User::factory()->create(['company_id' => Company::factory()->create()->id])->assignRole('payroll_admin');
    $this->actingAs($other)->getJson("/api/payroll-settings/payroll-groups/{$id}/calendar")->assertNotFound();
});

test('payroll settings need settings.payroll.edit', function () {
    $hr = User::factory()->create(['company_id' => $this->company->id])->assignRole('hr_admin');

    $this->actingAs($hr)->getJson('/api/payroll-settings/payroll-groups')->assertForbidden();
    $this->actingAs($hr)->getJson('/api/payroll-settings/earnings')->assertForbidden();
});

// ---- earnings, deductions, rates, rules, schedules ---------------------------------------------------------------

test('earnings and deductions start with defaults and support create, update and delete', function () {
    $earnings = $this->actingAs($this->admin)->getJson('/api/payroll-settings/earnings')->assertOk()->json('data');
    expect(collect($earnings)->pluck('name'))->toContain('Basic Pay', 'De Minimis Benefits')
        ->and($earnings[0])->not->toHaveKey('company_id');

    $id = $this->actingAs($this->admin)->postJson('/api/payroll-settings/earnings', ['name' => 'Meal Allowance', 'category' => 'Allowance', 'calc_type' => 'fixed', 'taxable' => false])->assertCreated()->json('data.id');
    $this->actingAs($this->admin)->putJson("/api/payroll-settings/earnings/{$id}", ['name' => 'Meal Allowance', 'category' => 'De Minimis', 'calc_type' => 'fixed', 'taxable' => false, 'is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
    $this->actingAs($this->admin)->postJson('/api/payroll-settings/earnings', ['name' => 'Meal Allowance', 'category' => 'x', 'calc_type' => 'fixed', 'taxable' => true])->assertUnprocessable();
    $this->actingAs($this->admin)->deleteJson("/api/payroll-settings/earnings/{$id}")->assertNoContent();

    $deductions = $this->actingAs($this->admin)->getJson('/api/payroll-settings/deductions')->json('data');
    expect(collect($deductions)->pluck('name'))->toContain('SSS', 'PhilHealth', 'Pag-IBIG', 'Withholding Tax');

    $this->actingAs($this->admin)->postJson('/api/payroll-settings/deductions', [
        'name' => 'Union Dues', 'category' => 'other', 'calc_type' => 'fixed', 'recurrence' => 'recurring', 'allocation_method' => 'custom', 'custom_split_percentages' => [60, 30],
    ])->assertUnprocessable()->assertJsonValidationErrors('custom_split_percentages');
    $this->actingAs($this->admin)->postJson('/api/payroll-settings/deductions', [
        'name' => 'Union Dues', 'category' => 'other', 'calc_type' => 'fixed', 'recurrence' => 'recurring', 'allocation_method' => 'custom', 'custom_split_percentages' => [60, 40],
    ])->assertCreated();
});

test('overtime rates: defaults, edit, custom add, built-ins cannot be deleted', function () {
    $data = $this->actingAs($this->admin)->getJson('/api/payroll-settings/overtime-rates')->assertOk()->json('data');
    expect($data['overtime'][0])->toMatchArray(['key' => 'regular', 'multiplier' => 1.25])
        ->and(collect($data['holiday'])->firstWhere('key', 'regular_holiday_worked')['multiplier'])->toEqual(2);

    $this->actingAs($this->admin)->putJson("/api/payroll-settings/overtime-rates/{$data['overtime'][0]['id']}", ['multiplier' => 1.3])->assertOk()->assertJsonPath('data.multiplier', 1.3);
    $this->actingAs($this->admin)->putJson("/api/payroll-settings/overtime-rates/{$data['overtime'][0]['id']}", ['multiplier' => 125])->assertUnprocessable();
    $this->actingAs($this->admin)->deleteJson("/api/payroll-settings/overtime-rates/{$data['overtime'][0]['id']}")->assertUnprocessable();

    $custom = $this->actingAs($this->admin)->postJson('/api/payroll-settings/overtime-rates', ['label' => 'Weekend Premium', 'multiplier' => 1.5])->assertCreated()->json('data');
    $this->actingAs($this->admin)->deleteJson("/api/payroll-settings/overtime-rates/{$custom['id']}")->assertNoContent();
});

test('payroll rules have defaults, keep unsent values, and validate default deduction schedules', function () {
    $this->actingAs($this->admin)->getJson('/api/payroll-settings/rules')->assertOk()->assertJsonPath('data.rounding_decimal_precision', 2);

    $this->actingAs($this->admin)->putJson('/api/payroll-settings/rules', ['late_grace_period_minutes' => 10, 'default_deduction_schedules' => ['semi_monthly' => 'LAST_PERIOD']])
        ->assertOk()->assertJsonPath('data.late_grace_period_minutes', 10)->assertJsonPath('data.rounding_method', 'nearest');
    expect($this->company->fresh()->payroll_rules['late_grace_period_minutes'])->toBe(10);

    $this->actingAs($this->admin)->putJson('/api/payroll-settings/rules', ['default_deduction_schedules' => ['monthly' => 'DIVIDED']])->assertUnprocessable();
    $this->actingAs($this->admin)->putJson('/api/payroll-settings/rules', ['rounding_method' => 'banker'])->assertUnprocessable();
});

test('work schedules: create, block deleting one a group uses', function () {
    $id = $this->actingAs($this->admin)->postJson('/api/payroll-settings/work-schedules', [
        'name' => 'Night Shift', 'shift_type' => 'night', 'start_time' => '22:00', 'end_time' => '06:00', 'break_minutes' => 60, 'grace_period_minutes' => 5, 'days_of_week' => [1, 2, 3, 4, 5],
    ])->assertCreated()->json('data.id');

    $this->actingAs($this->admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload(['work_schedule_id' => $id]))->assertCreated();
    $this->actingAs($this->admin)->deleteJson("/api/payroll-settings/work-schedules/{$id}")->assertUnprocessable();

    $this->actingAs($this->admin)->postJson('/api/payroll-settings/work-schedules', ['name' => 'Bad', 'shift_type' => 'day', 'start_time' => '9am', 'end_time' => '18:00', 'break_minutes' => 60, 'grace_period_minutes' => 0, 'days_of_week' => [8]])
        ->assertUnprocessable()->assertJsonValidationErrors(['start_time', 'days_of_week.0']);
});
