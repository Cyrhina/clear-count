<?php

// Company & Payroll Settings has company tabs (settings.company.edit) and payroll tabs (settings.payroll.edit).
// A payroll admin opens the page and reads everything; only a company admin changes company info and holidays.

test('a payroll admin opens the page and reads company info and holidays', function () {
    $admin = companyUser('payroll_admin');

    $this->actingAs($admin)->get('/company-settings')->assertOk();
    $this->actingAs($admin)->getJson('/api/company-info')->assertOk()->assertJsonStructure(['data' => ['name', 'plan_tier', 'timezone', 'payroll_frequency', 'created_at']]);
    $this->actingAs($admin)->getJson('/api/holidays')->assertOk();
});

test('a payroll admin cannot change company info or holidays', function () {
    $admin = companyUser('payroll_admin');

    $this->actingAs($admin)->putJson('/api/company-info', ['name' => 'X'])->assertForbidden();
    $this->actingAs($admin)->postJson('/api/holidays', ['name' => 'X', 'date' => '2026-12-25', 'type' => 'regular'])->assertForbidden();
    $this->actingAs($admin)->postJson('/api/holidays/import-defaults', [])->assertForbidden();
});

test('an hr admin has no access to company settings at all', function () {
    $admin = companyUser('hr_admin');

    $this->actingAs($admin)->get('/company-settings')->assertForbidden();
    $this->actingAs($admin)->getJson('/api/company-info')->assertForbidden();
    $this->actingAs($admin)->getJson('/api/holidays')->assertForbidden();
});
