<?php

use App\Enums\HolidayType;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Holiday;
use App\Models\User;
use App\Support\PhilippineHolidays;
use Database\Seeders\PhilippineHolidaysSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->company = Company::factory()->create();
    $this->admin = User::factory()->create(['company_id' => $this->company->id])->assignRole('company_admin');
});

function holidayPayload(array $overrides = []): array
{
    return ['name' => 'Company Anniversary', 'date' => '2026-03-14', 'type' => 'special_non_working', 'scope' => 'national', ...$overrides];
}

// ---- the Philippine calendar --------------------------------------------------------------------------------------

test('2026 calendar: 10 regular and 6 special non-working holidays on the right dates', function () {
    $byName = collect(PhilippineHolidays::forYear(2026))->keyBy('name');

    expect($byName)->toHaveCount(16)
        ->and($byName->where('type', HolidayType::REGULAR))->toHaveCount(10)
        ->and($byName->where('type', HolidayType::SPECIAL_NON_WORKING))->toHaveCount(6)
        ->and($byName['Maundy Thursday']['date'])->toBe('2026-04-02')   // Easter is April 5, 2026
        ->and($byName['Good Friday']['date'])->toBe('2026-04-03')
        ->and($byName['Black Saturday']['date'])->toBe('2026-04-04')
        ->and($byName['National Heroes Day']['date'])->toBe('2026-08-31') // last Monday of August
        ->and($byName['Rizal Day']['date'])->toBe('2026-12-30')
        ->and($byName['Ninoy Aquino Day']['type'])->toBe(HolidayType::SPECIAL_NON_WORKING);
});

test('two regular holidays on one date become a double holiday', function () {
    // Easter 2020 was April 12, so Maundy Thursday fell on April 9: Araw ng Kagitingan.
    $apr9 = collect(PhilippineHolidays::forYear(2020))->firstWhere('date', '2020-04-09');

    expect($apr9['name'])->toBe('Maundy Thursday / Araw ng Kagitingan')
        ->and($apr9['type'])->toBe(HolidayType::DOUBLE_HOLIDAY)
        ->and($apr9['type']->defaultMultiplier())->toBe(3.0);
});

test('type labels and multipliers', function () {
    expect(HolidayType::REGULAR->defaultMultiplier())->toBe(2.0)
        ->and(HolidayType::SPECIAL_NON_WORKING->defaultMultiplier())->toBe(1.3)
        ->and(HolidayType::SPECIAL_WORKING->defaultMultiplier())->toBe(1.0)
        ->and(HolidayType::REGULAR->label())->toBe('Regular Holiday');
});

test('the seeder fills the shared system calendar once, however often it runs', function () {
    $this->seed(PhilippineHolidaysSeeder::class);
    $first = Holiday::systemDefaults()->count();
    $this->seed(PhilippineHolidaysSeeder::class);

    expect($first)->toBeGreaterThan(40)->and(Holiday::systemDefaults()->count())->toBe($first);
});

// ---- API ------------------------------------------------------------------------------------------------------------

test('create, list by year in date order, with the resource shape', function () {
    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['name' => 'B', 'date' => '2026-06-01']))->assertCreated();
    $created = $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['name' => 'A', 'date' => '2026-02-01', 'type' => 'regular']))->assertCreated()->json('data');
    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['name' => 'Other year', 'date' => '2027-01-05']))->assertCreated();

    expect($created)->toMatchArray([
        'name' => 'A', 'date' => '2026-02-01', 'formatted_date' => 'Feb 1, 2026', 'type' => 'regular', 'type_label' => 'Regular Holiday',
        'multiplier' => 2, 'scope' => 'national', 'is_custom' => true,
    ]);

    $list = $this->actingAs($this->admin)->getJson('/api/holidays?year=2026')->assertOk();
    expect(collect($list->json('data'))->pluck('name')->all())->toBe(['A', 'B'])->and($list->json('meta.year'))->toBe(2026);
});

test('multiplier defaults to the type and can be overridden', function () {
    $special = $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload())->json('data.multiplier');
    $custom = $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['date' => '2026-03-15', 'pay_rate_multiplier' => 1.5]))->json('data.multiplier');

    expect($special)->toBe(1.3)->and($custom)->toBe(1.5);
});

test('validation: required fields, date format, type, branch rules', function () {
    $this->actingAs($this->admin)->postJson('/api/holidays', [])->assertUnprocessable()->assertJsonValidationErrors(['name', 'date', 'type']);
    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['date' => '14/03/2026', 'type' => 'fiesta']))->assertUnprocessable()->assertJsonValidationErrors(['date', 'type']);
    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['scope' => 'branch_specific']))->assertUnprocessable()->assertJsonValidationErrors('branch_ids');

    $foreign = Branch::factory()->create(['company_id' => Company::factory()->create()->id]);
    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['scope' => 'branch_specific', 'branch_ids' => [$foreign->id]]))->assertUnprocessable()->assertJsonValidationErrors('branch_ids.0');
});

test('one holiday per date, unless the branches differ or overlap is allowed', function () {
    [$a, $b] = [Branch::factory()->create(['company_id' => $this->company->id]), Branch::factory()->create(['company_id' => $this->company->id])];

    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload())->assertCreated();
    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['name' => 'Duplicate']))->assertUnprocessable()->assertJsonValidationErrors('date');
    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['name' => 'Forced', 'allow_overlap' => true]))->assertCreated();

    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['date' => '2026-05-05', 'scope' => 'branch_specific', 'branch_ids' => [$a->id], 'name' => 'Fiesta A']))->assertCreated();
    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['date' => '2026-05-05', 'scope' => 'branch_specific', 'branch_ids' => [$b->id], 'name' => 'Fiesta B']))->assertCreated();
    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['date' => '2026-05-05', 'scope' => 'branch_specific', 'branch_ids' => [$a->id, $b->id], 'name' => 'Both']))->assertUnprocessable();
    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['date' => '2026-05-05', 'name' => 'National that day']))->assertUnprocessable();
});

test('update keeps its own date, marks the holiday as custom, and delete hides it', function () {
    $this->seed(PhilippineHolidaysSeeder::class);
    $this->actingAs($this->admin)->postJson('/api/holidays/import-defaults', ['year' => 2026])->assertOk();
    $christmas = Holiday::activeForCompany($this->company->id)->where('name', 'Christmas Day')->firstOrFail();
    expect($christmas->is_default)->toBeTrue();

    $this->actingAs($this->admin)->putJson("/api/holidays/{$christmas->id}", holidayPayload(['name' => 'Christmas Day', 'date' => '2026-12-25', 'type' => 'regular', 'description' => 'Moved party']))
        ->assertOk()->assertJsonPath('data.is_custom', true)->assertJsonPath('data.description', 'Moved party');

    $this->actingAs($this->admin)->deleteJson("/api/holidays/{$christmas->id}")->assertNoContent();
    expect(Holiday::activeForCompany($this->company->id)->where('name', 'Christmas Day')->exists())->toBeFalse()
        ->and(Holiday::withTrashed()->find($christmas->id)->trashed())->toBeTrue();
});

test('import defaults adds the calendar to the company, and never touches other companies', function () {
    $other = Company::factory()->create();
    Holiday::create(['company_id' => $other->id, 'name' => 'Theirs', 'date' => '2026-01-01', 'type' => 'regular', 'scope' => 'national', 'pay_rate_multiplier' => 2]);

    $response = $this->actingAs($this->admin)->postJson('/api/holidays/import-defaults', ['year' => 2026])->assertOk();

    expect($response->json('meta.added'))->toBe(16)->and($response->json('data'))->toHaveCount(16)
        ->and(collect($response->json('data'))->every(fn ($h) => $h['is_custom'] === false))->toBeTrue()
        ->and(Holiday::activeForCompany($other->id)->count())->toBe(1);
});

test('import missing skips taken dates; reset restores untouched defaults but keeps custom holidays', function () {
    $this->actingAs($this->admin)->postJson('/api/holidays', holidayPayload(['name' => 'Our New Year party', 'date' => '2026-01-01', 'type' => 'special_non_working']))->assertCreated();

    $missing = $this->actingAs($this->admin)->postJson('/api/holidays/import-defaults', ['year' => 2026])->json('meta');
    expect($missing['added'])->toBe(15)->and($missing['skipped'])->toBe(1);

    // Delete a default, then "reset": it comes back; the company's own holiday stays.
    $good = Holiday::activeForCompany($this->company->id)->where('name', 'Good Friday')->firstOrFail();
    $this->actingAs($this->admin)->deleteJson("/api/holidays/{$good->id}")->assertNoContent();

    $reset = $this->actingAs($this->admin)->postJson('/api/holidays/import-defaults', ['year' => 2026, 'mode' => 'reset'])->json('meta');
    expect($reset['removed'])->toBe(15)->and($reset['added'])->toBe(15);
    expect(Holiday::activeForCompany($this->company->id)->forYear(2026)->where('name', 'Good Friday')->exists())->toBeTrue()
        ->and(Holiday::activeForCompany($this->company->id)->where('name', 'Our New Year party')->exists())->toBeTrue();
});

test('other companies cannot read, edit or delete a holiday; scopes work', function () {
    $mine = Holiday::create(['company_id' => $this->company->id, 'name' => 'Mine', 'date' => now()->addDays(10), 'type' => 'regular', 'scope' => 'national', 'pay_rate_multiplier' => 2]);
    Holiday::create(['company_id' => $this->company->id, 'name' => 'Past', 'date' => now()->subDays(10), 'type' => 'regular', 'scope' => 'national', 'pay_rate_multiplier' => 2]);

    $stranger = User::factory()->create(['company_id' => Company::factory()->create()->id])->assignRole('company_admin');
    $this->actingAs($stranger)->putJson("/api/holidays/{$mine->id}", holidayPayload())->assertNotFound();
    $this->actingAs($stranger)->deleteJson("/api/holidays/{$mine->id}")->assertNotFound();
    expect($this->actingAs($stranger)->getJson('/api/holidays?year='.now()->addDays(10)->year)->json('data'))->toBe([]);

    expect(Holiday::activeForCompany($this->company->id)->upcoming()->pluck('name')->all())->toBe(['Mine']);
});

test('holidays need settings.company.edit', function () {
    $payroll = User::factory()->create(['company_id' => $this->company->id])->assignRole('hr_admin');

    $this->actingAs($payroll)->getJson('/api/holidays')->assertForbidden();
});
