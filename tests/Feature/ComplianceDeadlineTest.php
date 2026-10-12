<?php

use App\Models\ComplianceDeadline;

function deadlinePayload(array $overrides = []): array
{
    return [
        'name' => "Renew Mayor's Permit",
        'category' => 'Other',
        'description' => 'Renew before the January 20 deadline.',
        'frequency' => 'yearly',
        'due_day' => 20,
        'due_month' => 0,
        'remind_days_before' => 30,
        ...$overrides,
    ];
}

test('the first list opens with the built-in government deadlines and is company-scoped', function () {
    $admin = companyUser('payroll_admin');
    ComplianceDeadline::withoutGlobalScopes()->create([...deadlinePayload(['name' => 'Theirs']), 'company_id' => otherCompany()->id, 'is_custom' => true]);

    $rows = collect($this->actingAs($admin)->getJson('/api/payroll-settings/compliance-deadlines')->assertOk()->json('data'));

    expect($rows->pluck('name'))->toContain('SSS Contribution Due', '13th Month Pay Deadline')->not->toContain('Theirs')
        ->and($rows->where('is_custom', true))->toHaveCount(0)
        ->and($rows->firstWhere('name', 'SSS Contribution Due'))->toMatchArray(['frequency' => 'monthly', 'due_day' => 10, 'link' => '/reports/sss-contribution']);
});

test('custom reminders are created, switched off, and deleted', function () {
    $admin = companyUser('payroll_admin');

    $id = $this->actingAs($admin)->postJson('/api/payroll-settings/compliance-deadlines', deadlinePayload())
        ->assertCreated()->assertJsonPath('data.is_custom', true)->assertJsonPath('data.enabled', true)->json('data.id');

    $this->actingAs($admin)->putJson("/api/payroll-settings/compliance-deadlines/{$id}", ['enabled' => false])
        ->assertOk()->assertJsonPath('data.enabled', false)->assertJsonPath('data.name', "Renew Mayor's Permit");

    $this->actingAs($admin)->deleteJson("/api/payroll-settings/compliance-deadlines/{$id}")->assertNoContent();
    expect(ComplianceDeadline::count())->toBe(0);
});

test('a built-in deadline can be edited and switched off but not deleted', function () {
    $admin = companyUser('payroll_admin');
    $sss = collect($this->actingAs($admin)->getJson('/api/payroll-settings/compliance-deadlines')->json('data'))->firstWhere('name', 'SSS Contribution Due');

    $this->actingAs($admin)->putJson("/api/payroll-settings/compliance-deadlines/{$sss['id']}", ['due_day' => 12, 'enabled' => false])->assertOk()->assertJsonPath('data.due_day', 12);
    $this->actingAs($admin)->deleteJson("/api/payroll-settings/compliance-deadlines/{$sss['id']}")->assertUnprocessable();
});

test('the fields follow the frequency', function () {
    $admin = companyUser('payroll_admin');

    $this->actingAs($admin)->postJson('/api/payroll-settings/compliance-deadlines', deadlinePayload(['due_month' => null]))->assertJsonValidationErrors('due_month');
    $this->actingAs($admin)->postJson('/api/payroll-settings/compliance-deadlines', deadlinePayload(['frequency' => 'one_time', 'due_day' => null, 'due_month' => null]))->assertJsonValidationErrors('due_date');

    $this->actingAs($admin)->postJson('/api/payroll-settings/compliance-deadlines', deadlinePayload(['name' => 'One off', 'frequency' => 'one_time', 'due_date' => '2026-12-01']))
        ->assertCreated()->assertJsonPath('data.due_date', '2026-12-01')->assertJsonPath('data.due_day', null)->assertJsonPath('data.due_month', null);

    $this->actingAs($admin)->postJson('/api/payroll-settings/compliance-deadlines', deadlinePayload(['name' => 'Monthly', 'frequency' => 'monthly']))
        ->assertCreated()->assertJsonPath('data.due_month', null);
});

test('a link cannot be set through the api', function () {
    $this->actingAs(companyUser('payroll_admin'))->postJson('/api/payroll-settings/compliance-deadlines', deadlinePayload(['link' => 'https://evil.example']))
        ->assertCreated()->assertJsonPath('data.link', null);
});

test('another company cannot be edited, and a role without settings.payroll.edit is refused', function () {
    $theirs = ComplianceDeadline::withoutGlobalScopes()->create([...deadlinePayload(), 'company_id' => otherCompany()->id, 'is_custom' => true]);

    $this->actingAs(companyUser('payroll_admin'))->putJson("/api/payroll-settings/compliance-deadlines/{$theirs->id}", ['enabled' => false])->assertNotFound();
    $this->actingAs(companyUser('hr_admin'))->getJson('/api/payroll-settings/compliance-deadlines')->assertForbidden();
});
