<?php

use App\Models\Company;
use App\Models\User;
use Database\Seeders\RoleSeeder;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users with dashboard access can visit the dashboard', function () {
    $this->seed(RoleSeeder::class);
    $user = User::factory()->create(['company_id' => Company::factory()->create()->id])->assignRole('company_admin');
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('users without dashboard access are forbidden', function () {
    $this->seed(RoleSeeder::class);
    $this->actingAs(User::factory()->create());

    $this->get(route('dashboard'))->assertForbidden();
});
