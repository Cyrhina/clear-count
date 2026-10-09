<?php

use App\Models\Company;
use App\Models\User;
use App\Notifications\UserInvitation;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->company = Company::factory()->create();
    $this->admin = makeUser($this->company, 'company_admin');
});

function makeUser(Company $company, string $role, array $attrs = []): User
{
    return User::factory()->create(['company_id' => $company->id, ...$attrs])->assignRole($role);
}

test('lists only users of the own company, hides super admins, and filters', function () {
    makeUser($this->company, 'employee', ['first_name' => 'Zed', 'is_active' => false]);
    makeUser($this->company, 'manager', ['first_name' => 'Zyxmara']);
    makeUser($this->company, 'super_admin');
    makeUser(Company::factory()->create(), 'employee', ['first_name' => 'Outsider']);

    $names = fn ($response) => collect($response->json('data'))->pluck('first_name');

    $all = $this->actingAs($this->admin)->getJson('/api/users')->assertOk();
    expect($names($all))->toContain('Zed', 'Zyxmara')->not->toContain('Outsider')
        ->and($all->json('data'))->toHaveCount(3); // admin, Zed, Mara — no super admin

    expect($names($this->actingAs($this->admin)->getJson('/api/users?status=inactive')))->toEqual(collect(['Zed']))
        ->and($names($this->actingAs($this->admin)->getJson('/api/users?role=manager')))->toEqual(collect(['Zyxmara']))
        ->and($names($this->actingAs($this->admin)->getJson('/api/users?search=zyxmara')))->toEqual(collect(['Zyxmara']));
});

test('resource flags the current user and per-row abilities', function () {
    $rows = collect($this->actingAs($this->admin)->getJson('/api/users')->json('data'));
    $me = $rows->firstWhere('id', $this->admin->id);

    expect($me['is_current_user'])->toBeTrue()
        ->and($me['can']['toggle_status'])->toBeFalse()
        ->and($me['can']['update_role'])->toBeFalse()
        ->and($me['role'])->toBe('company_admin')
        ->and($me['status'])->toBe('active');
});

test('users without users.manage are refused', function () {
    $this->actingAs(makeUser($this->company, 'hr_admin'))->getJson('/api/users')->assertForbidden();
});

test('inviting creates a pending user with the role and emails a link', function () {
    Notification::fake();

    $response = $this->actingAs($this->admin)->postJson('/api/users', [
        'first_name' => 'Ana', 'last_name' => 'Cruz', 'email' => 'ana@example.com', 'role' => 'hr_admin',
    ])->assertCreated()
        ->assertJsonPath('data.role', 'hr_admin')
        ->assertJsonPath('data.invite_pending', true);

    $user = User::where('email', 'ana@example.com')->firstOrFail();
    expect($user->company_id)->toBe($this->company->id)->and($user->hasRole('hr_admin'))->toBeTrue();
    Notification::assertSentTo($user, UserInvitation::class);
    expect($response->json('data'))->not->toHaveKey('password');
});

test('inviting validates email uniqueness and role', function () {
    $this->actingAs($this->admin)->postJson('/api/users', [
        'first_name' => 'A', 'last_name' => 'B', 'email' => $this->admin->email, 'role' => 'wizard',
    ])->assertUnprocessable()->assertJsonValidationErrors(['email', 'role']);
});

test('only a super admin can grant the super_admin role', function () {
    $this->actingAs($this->admin)->postJson('/api/users', [
        'first_name' => 'A', 'last_name' => 'B', 'email' => 'x@example.com', 'role' => 'super_admin',
    ])->assertUnprocessable()->assertJsonValidationErrors('role');

    $target = makeUser($this->company, 'employee');
    $this->actingAs($this->admin)->patchJson("/api/users/{$target->id}/role", ['role' => 'super_admin'])
        ->assertUnprocessable();
});

test('role can be changed, but not on yourself, a super admin, or another company', function () {
    $target = makeUser($this->company, 'employee');
    $this->actingAs($this->admin)->patchJson("/api/users/{$target->id}/role", ['role' => 'manager'])
        ->assertOk()->assertJsonPath('data.role', 'manager');

    $this->actingAs($this->admin)->patchJson("/api/users/{$this->admin->id}/role", ['role' => 'employee'])->assertForbidden();

    $super = makeUser($this->company, 'super_admin');
    $this->actingAs($this->admin)->patchJson("/api/users/{$super->id}/role", ['role' => 'employee'])->assertForbidden();

    $outsider = makeUser(Company::factory()->create(), 'employee');
    $this->actingAs($this->admin)->patchJson("/api/users/{$outsider->id}/role", ['role' => 'manager'])->assertForbidden();
});

test('status toggles, honours an explicit value, and cannot deactivate yourself', function () {
    $target = makeUser($this->company, 'employee');

    $this->actingAs($this->admin)->patchJson("/api/users/{$target->id}/status")->assertOk()->assertJsonPath('data.status', 'inactive');
    $this->actingAs($this->admin)->patchJson("/api/users/{$target->id}/status", ['status' => 'inactive'])->assertOk()->assertJsonPath('data.status', 'inactive');
    $this->actingAs($this->admin)->patchJson("/api/users/{$target->id}/status", ['status' => 'active'])->assertOk()->assertJsonPath('data.status', 'active');

    $this->actingAs($this->admin)->patchJson("/api/users/{$this->admin->id}/status")->assertForbidden();
    expect($this->admin->fresh()->is_active)->toBeTrue();
});

test('resend invite works for pending users only', function () {
    Notification::fake();
    $pending = makeUser($this->company, 'employee', ['invited_at' => now()->subDay()]);
    $active = makeUser($this->company, 'employee', ['last_login_at' => now()]);

    $this->actingAs($this->admin)->postJson("/api/users/{$pending->id}/invite")->assertOk();
    Notification::assertSentTo($pending, UserInvitation::class);

    $this->actingAs($this->admin)->postJson("/api/users/{$active->id}/invite")->assertUnprocessable();
});

test('reset access sends the standard reset link', function () {
    Notification::fake();
    $target = makeUser($this->company, 'employee');

    $this->actingAs($this->admin)->postJson("/api/users/{$target->id}/reset-access")->assertOk();
    Notification::assertSentTo($target, Illuminate\Auth\Notifications\ResetPassword::class);
});

test('signing in records last_login_at', function () {
    $user = makeUser($this->company, 'employee', ['password' => 'secret-pass-1']);

    $this->post('/login', ['email' => $user->email, 'password' => 'secret-pass-1']);

    expect($user->fresh()->last_login_at)->not->toBeNull();
});

test('password rules: 8+ chars, upper and lower case, number and special character', function (string $password, bool $valid) {
    $rule = Illuminate\Validation\Rules\Password::default();
    $passes = ! validator(['p' => $password], ['p' => [$rule]])->fails();

    expect($passes)->toBe($valid);
})->with([
    'too short' => ['Ab1!xyz', false],
    'no uppercase' => ['abcdefg1!', false],
    'no lowercase' => ['ABCDEFG1!', false],
    'no number' => ['Abcdefgh!', false],
    'no special character' => ['Abcdefg12', false],
    'all rules met' => ['Abcdef1!', true],
]);

test('invite and reset emails render the branded templates with the link', function () {
    $user = makeUser($this->company, 'employee', ['first_name' => 'Maria']);

    $invite = (string) (new UserInvitation('tok123', 'Employee'))->toMail($user)->render();
    expect($invite)->toContain('Create Your Password', 'Hi Maria', 'Password Requirements', 'tok123', '24 hours');

    $reset = (string) (new Illuminate\Auth\Notifications\ResetPassword('tok456'))->toMail($user)->render();
    expect($reset)->toContain('Reset Your Password', 'Hi Maria', 'Having trouble?', 'tok456', '24 hours');
});

test('permission map lists every role with counts, areas and a preview', function () {
    $roles = collect($this->actingAs($this->admin)->getJson('/api/permission-map')->assertOk()->json('data'));

    expect($roles->pluck('slug')->all())->toBe(['super_admin', 'company_admin', 'hr_admin', 'payroll_admin', 'manager', 'employee']);

    foreach ($roles as $role) {
        $stored = Spatie\Permission\Models\Role::findByName($role['slug'])->permissions->count();
        expect($role['capabilities_count'])->toBe($stored)
            ->and($role['areas_count'])->toBe(count($role['capabilities_by_area']))
            ->and($role['capabilities_preview'])->toHaveCount(min(3, $stored));
    }

    $employee = $roles->firstWhere('slug', 'employee');
    expect($employee['capabilities_count'])->toBe(2)->and($employee['areas_count'])->toBe(2)
        ->and($roles->firstWhere('slug', 'hr_admin')['name'])->toBe('HR Admin');
});

test('permission map show returns the matrix split into granted and not granted', function () {
    $hr = Spatie\Permission\Models\Role::findByName('hr_admin');
    $data = $this->actingAs($this->admin)->getJson("/api/permission-map/{$hr->id}")->assertOk()->json('data');

    $granted = collect($data['areas'])->flatMap(fn ($a) => collect($a['granted'])->pluck('name'));
    $denied = collect($data['areas'])->flatMap(fn ($a) => collect($a['not_granted'])->pluck('name'));

    expect($granted)->toContain('employees.edit')->not->toContain('payroll.run', 'payroll.view')
        ->and($denied)->toContain('payroll.run')
        ->and($granted->count())->toBe($data['capabilities_count'])
        ->and($data['areas'])->toHaveCount(10);
});

test('capabilities are grouped by area and every seeded permission has display metadata', function () {
    $response = $this->actingAs($this->admin)->getJson('/api/permission-map/capabilities')->assertOk();

    expect($response->json('meta.capabilities_count'))->toBe(Spatie\Permission\Models\Permission::count())
        ->and(collect($response->json('data'))->pluck('key'))->toContain('workforce', 'payroll', 'platform');
});

test('permission map needs users.manage', function () {
    $this->actingAs(makeUser($this->company, 'hr_admin'))->getJson('/api/permission-map')->assertForbidden();
});

test('the invitation is queued, not sent while the request waits', function () {
    expect((new UserInvitation('t', 'Employee')) instanceof Illuminate\Contracts\Queue\ShouldQueue)->toBeTrue();
});

test('invite and reset-access are throttled per target user', function () {
    Notification::fake();
    $target = makeUser($this->company, 'employee', ['invited_at' => now()]);
    $other = makeUser($this->company, 'employee', ['invited_at' => now()]);

    foreach (range(1, 3) as $i) {
        $this->actingAs($this->admin)->postJson("/api/users/{$target->id}/invite")->assertOk();
    }

    // A fourth email to the same person within 10 minutes is refused, whichever of the two endpoints it comes through...
    $this->actingAs($this->admin)->postJson("/api/users/{$target->id}/invite")->assertStatus(429)->assertHeader('Retry-After');
    $this->actingAs($this->admin)->postJson("/api/users/{$target->id}/reset-access")->assertStatus(429);

    // ...but someone else's inbox is unaffected.
    $this->actingAs($this->admin)->postJson("/api/users/{$other->id}/invite")->assertOk();
});
