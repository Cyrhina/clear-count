<?php

use App\Models\CompensationType;
use App\Models\PayrollGroup;

function typePayload(array $overrides = []): array
{
    return ['name' => 'Night Shift Rate', 'kind' => 'hourly_rate', 'is_active' => true, 'config' => ['basic_rate' => 110], ...$overrides];
}

test('the first list opens with the default compensation types and is company-scoped', function () {
    $admin = companyUser('payroll_admin');
    CompensationType::withoutGlobalScopes()->create(['company_id' => otherCompany()->id, 'name' => 'Someone Else', 'kind' => 'daily_rate', 'config' => ['basic_rate' => 1]]);

    $names = collect($this->actingAs($admin)->getJson('/api/payroll-settings/compensation-types')->assertOk()->json('data'))->pluck('name');

    expect($names)->toContain('Monthly Rate', 'Output-Based / Piece-Rate')->not->toContain('Someone Else');
});

test('a payroll admin creates and updates a compensation type', function () {
    $admin = companyUser('payroll_admin');

    $id = $this->actingAs($admin)->postJson('/api/payroll-settings/compensation-types', typePayload())
        ->assertCreated()->assertJsonPath('data.kind', 'hourly_rate')->assertJsonPath('data.config.basic_rate', 110)->json('data.id');

    $this->actingAs($admin)->putJson("/api/payroll-settings/compensation-types/{$id}", typePayload(['name' => 'Night Rate', 'config' => ['basic_rate' => 125], 'is_active' => false]))
        ->assertOk()->assertJsonPath('data.name', 'Night Rate')->assertJsonPath('data.is_active', false);
});

test('the config must match the kind, and keys of other kinds are dropped', function () {
    $admin = companyUser('payroll_admin');

    $this->actingAs($admin)->postJson('/api/payroll-settings/compensation-types', typePayload(['config' => []]))->assertJsonValidationErrors('config.basic_rate');
    $this->actingAs($admin)->postJson('/api/payroll-settings/compensation-types', typePayload(['name' => 'Piece', 'kind' => 'output_based', 'config' => ['output_rates' => []]]))->assertJsonValidationErrors('config.output_rates');
    $this->actingAs($admin)->postJson('/api/payroll-settings/compensation-types', typePayload(['name' => 'Comm', 'kind' => 'commission_based', 'config' => ['commission_type' => 'percentage']]))->assertJsonValidationErrors('config.commission_value');

    $this->actingAs($admin)->postJson('/api/payroll-settings/compensation-types', typePayload(['name' => 'Clean', 'config' => ['basic_rate' => 90, 'commission_value' => 5]]))
        ->assertCreated()->assertJsonPath('data.config', ['basic_rate' => 90]);
});

test('names are unique per company', function () {
    $admin = companyUser('payroll_admin');
    $this->actingAs($admin)->postJson('/api/payroll-settings/compensation-types', typePayload())->assertCreated();

    $this->actingAs($admin)->postJson('/api/payroll-settings/compensation-types', typePayload())->assertJsonValidationErrors('name');
    $this->actingAs(companyUser('payroll_admin'))->postJson('/api/payroll-settings/compensation-types', typePayload())->assertCreated();
});

test('another company cannot be edited, and a role without settings.payroll.edit is refused', function () {
    $other = otherCompany();
    $theirs = CompensationType::withoutGlobalScopes()->create(['company_id' => $other->id, 'name' => 'Theirs', 'kind' => 'daily_rate', 'config' => ['basic_rate' => 1]]);

    $this->actingAs(companyUser('payroll_admin'))->putJson("/api/payroll-settings/compensation-types/{$theirs->id}", typePayload())->assertNotFound();
    $this->actingAs(companyUser('hr_admin'))->postJson('/api/payroll-settings/compensation-types', typePayload())->assertForbidden();
});

test('a payroll group points at a compensation type of its own company only', function () {
    $admin = companyUser('payroll_admin');
    $mine = CompensationType::withoutGlobalScopes()->create(['company_id' => $admin->company_id, 'name' => 'Mine', 'kind' => 'daily_rate', 'config' => ['basic_rate' => 1]]);
    $theirs = CompensationType::withoutGlobalScopes()->create(['company_id' => otherCompany()->id, 'name' => 'Theirs', 'kind' => 'daily_rate', 'config' => ['basic_rate' => 1]]);

    $this->actingAs($admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload(['compensation_type_id' => $theirs->id]))->assertJsonValidationErrors('compensation_type_id');

    $this->actingAs($admin)->postJson('/api/payroll-settings/payroll-groups', groupPayload(['compensation_type_id' => $mine->id]))
        ->assertCreated()->assertJsonPath('data.compensation_type_id', $mine->id)->assertJsonPath('data.compensation', 'Mine');

    // Removing the type (database level) leaves the group without one instead of breaking it.
    $mine->delete();
    expect(PayrollGroup::first()->compensation_type_id)->toBeNull();
});
