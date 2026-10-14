<?php

use App\Models\Company;
use App\Models\SubscriptionPayment;
use App\Models\User;
use App\Notifications\UserInvitation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

/** The super admin belongs to no company. */
function superAdmin(): User
{
    companyUser(); // seeds the roles

    return User::factory()->create(['company_id' => null])->assignRole('super_admin');
}

function payFor(string $tier, array $override = []): array
{
    return [
        'to_tier' => $tier, 'payment_reference' => 'FBS-PRO-'.random_int(10000, 99999), 'receipt_reference' => '1234 5678 9012',
        'proof' => UploadedFile::fake()->createWithContent('receipt.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')), 'terms_accepted' => '1', ...$override,
    ];
}

test('the super admin onboards a company with its head office and first company admin, who is invited', function () {
    Notification::fake();
    $super = superAdmin();

    $res = $this->actingAs($super)->postJson('/api/platform/companies', [
        'name' => 'Acme Foods', 'plan_tier' => 'standard', 'admin_first_name' => 'Ana', 'admin_last_name' => 'Cruz', 'admin_email' => 'ana@acme.test',
    ])->assertCreated()->assertJsonPath('data.plan_tier', 'standard')->assertJsonPath('data.status', 'active');

    $company = Company::findOrFail($res->json('data.id'));
    $admin = User::where('email', 'ana@acme.test')->firstOrFail();
    expect($admin->company_id)->toBe($company->id)->and($admin->hasRole('company_admin'))->toBeTrue()
        ->and($company->branches()->withoutGlobalScopes()->where('is_head_office', true)->count())->toBe(1)
        ->and($company->plan_renews_on)->not->toBeNull();
    Notification::assertSentTo($admin, UserInvitation::class);

    $this->actingAs($super)->postJson('/api/platform/companies', ['name' => 'Dup', 'plan_tier' => 'basic', 'admin_first_name' => 'A', 'admin_last_name' => 'B', 'admin_email' => 'ana@acme.test'])->assertUnprocessable();
    $this->actingAs($admin)->getJson('/api/platform/companies')->assertForbidden();
    $this->actingAs($super)->getJson('/api/platform/companies')->assertOk()->assertJsonPath('data.0.name', 'Acme Foods')->assertJsonPath('data.0.admin.email', 'ana@acme.test');
});

test('a suspended company is signed out and can come back when it is activated', function () {
    $admin = companyUser('company_admin');
    $super = superAdmin();

    $this->actingAs($admin)->getJson('/api/company')->assertOk();
    $this->actingAs($super)->patchJson("/api/platform/companies/{$admin->company_id}/status", ['status' => 'suspended'])->assertOk()->assertJsonPath('data.status', 'suspended');
    $this->actingAs($admin->fresh())->getJson('/api/company')->assertUnauthorized();

    $this->actingAs($super)->patchJson("/api/platform/companies/{$admin->company_id}/status", ['status' => 'active'])->assertOk();
    $this->actingAs($admin->fresh())->getJson('/api/company')->assertOk()->assertJsonPath('data.status', 'active');
});

test('the plan decides which modules can be changed, and the message names the plan that has it', function () {
    $basic = companyUser('company_admin', Company::factory()->create(['plan_tier' => 'basic']));

    $this->actingAs($basic)->getJson('/api/loans')->assertOk();
    $this->actingAs($basic)->postJson('/api/loans', [])->assertForbidden()->assertJsonPath('message', 'Benefits, Loans & Deductions is available in the Standard plan.');
    $this->actingAs($basic)->postJson('/api/schedules/roster', [])->assertForbidden()->assertJsonPath('message', 'Schedules is available in the Professional Plus plan.');

    $standard = companyUser('company_admin', Company::factory()->create(['plan_tier' => 'standard']));
    $this->actingAs($standard)->postJson('/api/loans', [])->assertUnprocessable();
});

test('the seats of the plan are a hard limit, and employee logins do not take one', function () {
    Notification::fake();
    $company = Company::factory()->create(['plan_tier' => 'basic']); // 3 seats
    $admin = companyUser('company_admin', $company);
    companyUser('hr_admin', $company);
    companyUser('payroll_admin', $company);
    $invite = ['first_name' => 'Mae', 'last_name' => 'Lim', 'email' => 'mae@x.test', 'role' => 'manager'];

    $this->actingAs($admin)->postJson('/api/users', $invite)->assertUnprocessable()->assertJsonValidationErrors('users');
    $this->actingAs($admin)->postJson('/api/users', [...$invite, 'role' => 'employee'])->assertCreated();

    $company->forceFill(['plan_tier' => 'standard'])->save();
    $this->actingAs($admin)->postJson('/api/users', [...$invite, 'email' => 'mae2@x.test'])->assertCreated();
});

test('a company can pay for an upgrade: the plan changes only when the super admin confirms it', function () {
    Storage::fake('local');
    $company = Company::factory()->create(['plan_tier' => 'basic']);
    $admin = companyUser('company_admin', $company);
    $super = superAdmin();

    $this->actingAs($admin)->getJson('/api/subscription/quote/standard')->assertOk()->assertJsonPath('data.amount', 3000);
    $this->actingAs($admin)->getJson('/api/subscription/quote/enterprise')->assertOk()->assertJsonPath('data.amount', null);

    $payment = $this->actingAs($admin)->post('/api/subscription/payments', payFor('standard', ['payment_reference' => 'FBS-STA-48213']), ['Accept' => 'application/json'])
        ->assertCreated()->assertJsonPath('data.status', 'pending')->assertJsonPath('data.amount', 3000)->json('data');
    expect($company->fresh()->plan_tier)->toBe('basic');
    expect($super->notifications()->count())->toBe(1);

    // One at a time; a smaller or quoted plan cannot be paid for; the terms must be accepted.
    $this->actingAs($admin)->post('/api/subscription/payments', payFor('professional'), ['Accept' => 'application/json'])->assertUnprocessable();
    $this->actingAs($admin)->getJson('/api/subscription')->assertJsonPath('data.pending_payment.id', $payment['id']);

    // The receipt is private: the paying company and the super admin open it, nobody else.
    $this->actingAs($admin)->get($payment['proof_url'])->assertOk();
    $this->actingAs($super)->get($payment['proof_url'])->assertOk();
    $this->actingAs(companyUser('company_admin'))->get($payment['proof_url'])->assertNotFound();

    $this->actingAs($admin)->postJson("/api/platform/payments/{$payment['id']}/decision", ['decision' => 'approved'])->assertForbidden();
    $this->actingAs($super)->getJson('/api/platform/payments')->assertOk()->assertJsonPath('data.0.company_name', $company->name)->assertJsonPath('data.0.status', 'pending');
    $this->actingAs($super)->postJson("/api/platform/payments/{$payment['id']}/decision", ['decision' => 'approved'])->assertOk()->assertJsonPath('data.status', 'approved');

    expect($company->fresh()->plan_tier)->toBe('standard')->and($company->fresh()->plan_renews_on)->not->toBeNull();
    expect($admin->notifications()->count())->toBe(1);
    $this->actingAs($super)->postJson("/api/platform/payments/{$payment['id']}/decision", ['decision' => 'rejected'])->assertStatus(409);
});

test('a rejected payment leaves the plan as it is and tells the company why', function () {
    Storage::fake('local');
    $company = Company::factory()->create(['plan_tier' => 'basic']);
    $admin = companyUser('company_admin', $company);
    $super = superAdmin();

    $id = $this->actingAs($admin)->post('/api/subscription/payments', payFor('standard'), ['Accept' => 'application/json'])->assertCreated()->json('data.id');
    $this->actingAs($super)->postJson("/api/platform/payments/{$id}/decision", ['decision' => 'rejected', 'remarks' => 'Amount does not match'])->assertOk();

    expect($company->fresh()->plan_tier)->toBe('basic')->and(SubscriptionPayment::withoutGlobalScopes()->find($id)->decision_remarks)->toBe('Amount does not match');
    expect($admin->notifications()->first()->data['message'])->toContain('rejected')->toContain('Amount does not match');
    // A new payment can be filed once the last one is decided.
    $this->actingAs($admin)->post('/api/subscription/payments', payFor('standard'), ['Accept' => 'application/json'])->assertCreated();
});

test('a downgrade applies right away when the company fits in the smaller plan', function () {
    $company = Company::factory()->create(['plan_tier' => 'standard']); // 8 seats
    $admin = companyUser('company_admin', $company);
    companyUser('hr_admin', $company);
    companyUser('payroll_admin', $company);
    companyUser('manager', $company);

    $this->actingAs($admin)->postJson('/api/subscription/downgrade', ['plan_tier' => 'basic'])->assertUnprocessable(); // 4 admin accounts, 3 seats
    User::where('company_id', $company->id)->role('manager')->update(['is_active' => false]);
    $this->actingAs($admin)->postJson('/api/subscription/downgrade', ['plan_tier' => 'basic'])->assertOk()->assertJsonPath('data.plan_tier', 'basic');
    $this->actingAs($admin)->postJson('/api/subscription/downgrade', ['plan_tier' => 'professional'])->assertUnprocessable();
    $this->actingAs($admin)->postJson('/api/subscription/downgrade', ['plan_tier' => 'basic'])->assertUnprocessable();
});

test('the super admin has no company to write into, but sees every company', function () {
    $super = superAdmin();
    companyUser('company_admin');

    $this->actingAs($super)->postJson('/api/employees', [])->assertUnprocessable()->assertJsonPath('message', 'This account does not belong to a company. Sign in with a company account to change company data.');
    $this->actingAs($super)->getJson('/api/employees')->assertOk();
});

test('the platform dashboard counts the companies, accounts and employees', function () {
    $super = superAdmin();
    $admin = companyUser('company_admin');
    runStaff($admin->company);
    runStaff($admin->company, [], ['status' => 'inactive']);
    otherCompany();

    $d = $this->actingAs($super)->getJson('/api/platform/dashboard')->assertOk()->json('data');
    expect($d['totals'])->toMatchArray(['companies' => 3, 'employees' => 2, 'active_employees' => 1, 'pending_payments' => 0])
        ->and(collect($d['users_by_role'])->pluck('count', 'role')->all())->toMatchArray(['super_admin' => 1, 'company_admin' => 2])
        ->and($d['employees_by_company'])->toHaveCount(3);
    $this->actingAs($admin)->getJson('/api/platform/dashboard')->assertForbidden();
});

test('the plans shared with the screens come from the config', function () {
    $admin = companyUser('company_admin');
    $this->actingAs($admin)->get('/subscription')->assertInertia(fn ($page) => $page->where('plans.tiers.basic.user_limit', 3)->where('plans.order.4', 'enterprise'));
});
