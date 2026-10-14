<?php

use App\Models\Company;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\WebhookDelivery;
use App\Models\WebhookEndpoint;
use App\Support\LeaveDefaults;
use Illuminate\Support\Facades\Http;

const HOOK_URL = 'https://8.8.8.8/hooks/fbs';

/** Each request in a test reuses the guards of the one before: a call with another token needs fresh ones. */
function freshGuards(): void
{
    app('auth')->forgetGuards();
}

function makeKey($test, $admin, array $abilities = ['employees.read'], array $extra = []): string
{
    return $test->actingAs($admin)->postJson('/api/integrations/api-keys', ['label' => 'Accounting', 'abilities' => $abilities, ...$extra])->assertCreated()->json('token');
}

function makeHook($test, $admin, array $events = ['employee.created'], string $url = HOOK_URL): array
{
    $res = $test->actingAs($admin)->postJson('/api/integrations/webhooks', ['url' => $url, 'events' => $events])->assertCreated();

    return [$res->json('data.id'), $res->json('secret')];
}

test('an API key is shown once, reads only what its abilities allow, and stops working when revoked', function () {
    $admin = companyUser('company_admin');
    runStaff($admin->company);

    $token = makeKey($this, $admin, ['employees.read']);
    expect($token)->toMatch('/^\d+\|fbs_/');
    $this->actingAs($admin)->getJson('/api/integrations/api-keys')->assertOk()->assertJsonPath('data.0.label', 'Accounting')->assertJsonPath('data.0.abilities', ['employees.read'])->assertJsonMissingPath('data.0.token');

    freshGuards();
    $this->withToken($token)->getJson('/api/v1/employees')->assertOk()->assertJsonCount(1, 'data');
    freshGuards();
    $this->withToken($token)->getJson('/api/v1/attendance?date=2026-01-01')->assertForbidden()->assertJsonPath('message', 'This API key does not have the attendance.read ability.');
    freshGuards();
    $this->withToken($token)->getJson('/api/v1/payroll')->assertForbidden();
    freshGuards();
    $this->withToken('nope')->getJson('/api/v1/employees')->assertUnauthorized();

    $id = $this->actingAs($admin)->getJson('/api/integrations/api-keys')->json('data.0.id');
    $this->actingAs($admin)->deleteJson("/api/integrations/api-keys/{$id}")->assertOk();
    freshGuards();
    $this->withToken($token)->getJson('/api/v1/employees')->assertUnauthorized();
});

test('a key never sees another company, and a browser session is not a key', function () {
    $admin = companyUser('company_admin');
    runStaff($admin->company);
    $other = companyUser('company_admin');
    runStaff($other->company);
    runStaff($other->company);

    $token = makeKey($this, $admin);
    freshGuards();
    $this->withToken($token)->getJson('/api/v1/employees')->assertOk()->assertJsonCount(1, 'data');

    // The other company can neither list nor revoke this key.
    $keyId = $this->actingAs($admin)->getJson('/api/integrations/api-keys')->json('data.0.id');
    $this->actingAs($other)->getJson('/api/integrations/api-keys')->assertOk()->assertJsonCount(0, 'data');
    $this->actingAs($other)->deleteJson("/api/integrations/api-keys/{$keyId}")->assertNotFound();

    $this->actingAs($admin)->getJson('/api/v1/employees')->assertUnauthorized();
});

test('a key is refused when its owner is deactivated, its company is suspended or the plan has no API', function () {
    $company = Company::factory()->create(['plan_tier' => 'enterprise']);
    $admin = companyUser('company_admin', $company);
    $token = makeKey($this, $admin);

    freshGuards();
    $this->withToken($token)->getJson('/api/v1/employees')->assertOk();

    $company->forceFill(['plan_tier' => 'professional_plus'])->save();
    freshGuards();
    $this->withToken($token)->getJson('/api/v1/employees')->assertForbidden()->assertJsonPath('message', 'API access is not included in the plan of this company.');
    $company->forceFill(['plan_tier' => 'enterprise', 'status' => 'suspended'])->save();
    freshGuards();
    $this->withToken($token)->getJson('/api/v1/employees')->assertUnauthorized();
    $company->forceFill(['status' => 'active'])->save();
    $admin->forceFill(['is_active' => false])->save();
    freshGuards();
    $this->withToken($token)->getJson('/api/v1/employees')->assertUnauthorized();
});

test('keys and webhooks are for companies whose plan has the API, and a key cannot outrun its expiry', function () {
    $pro = companyUser('company_admin', Company::factory()->create(['plan_tier' => 'professional_plus']));
    $this->actingAs($pro)->postJson('/api/integrations/api-keys', ['label' => 'x', 'abilities' => ['employees.read']])->assertForbidden()
        ->assertJsonPath('message', 'Integrations & API Access is available in the Enterprise plan.');
    $this->actingAs($pro)->postJson('/api/integrations/webhooks', ['url' => HOOK_URL, 'events' => ['employee.created']])->assertForbidden();

    $admin = companyUser('company_admin');
    $this->actingAs($admin)->postJson('/api/integrations/api-keys', ['label' => 'x', 'abilities' => ['nope']])->assertUnprocessable();
    $this->actingAs($admin)->postJson('/api/integrations/api-keys', ['label' => 'x', 'abilities' => ['employees.read'], 'expires_in_days' => 7])->assertUnprocessable();

    $token = makeKey($this, $admin, ['employees.read'], ['expires_in_days' => 30]);
    $this->travel(31)->days();
    freshGuards();
    $this->withToken($token)->getJson('/api/v1/employees')->assertUnauthorized();
});

test('a webhook address must be on the public internet', function () {
    $admin = companyUser('company_admin');

    foreach (['https://127.0.0.1/x', 'https://10.0.0.5/x', 'https://192.168.1.10/x', 'https://169.254.169.254/latest/meta-data', 'http://8.8.8.8/x', 'https://user:pw@8.8.8.8/x', 'ftp://8.8.8.8/x', 'https://nonexistent.invalid/x'] as $url) {
        $this->actingAs($admin)->postJson('/api/integrations/webhooks', ['url' => $url, 'events' => ['employee.created']])->assertUnprocessable();
    }
    $this->actingAs($admin)->postJson('/api/integrations/webhooks', ['url' => HOOK_URL, 'events' => ['nope']])->assertUnprocessable();
    expect(WebhookEndpoint::withoutGlobalScopes()->count())->toBe(0);
});

test('an event is delivered signed to the endpoints that subscribed to it, and logged', function () {
    Http::fake(['8.8.8.8/*' => Http::response(['ok' => true], 200)]);
    $admin = companyUser('company_admin');
    [$id, $secret] = makeHook($this, $admin, ['employee.created']);
    makeHook($this, $admin, ['leave.approved'], 'https://8.8.4.4/other');

    $hired = Employee::factory()->create(['company_id' => $admin->company_id]);

    Http::assertSentCount(1);
    [$request] = Http::recorded()[0];
    $body = $request->body();
    preg_match('/^t=([0-9]+),v1=([a-f0-9]{64})$/', $request->header('X-FBS-Signature')[0], $m);
    expect($request->url())->toBe(HOOK_URL)->and($request->header('X-FBS-Event')[0])->toBe('employee.created')
        ->and(hash_equals(hash_hmac('sha256', "{$m[1]}.{$body}", $secret), $m[2]))->toBeTrue()
        ->and(json_decode($body, true))->toMatchArray(['event' => 'employee.created'])->and(json_decode($body, true)['data']['name'])->toBe($hired->name);
    $this->actingAs($admin)->getJson("/api/integrations/webhooks/{$id}/deliveries")->assertOk()
        ->assertJsonPath('data.0.status', 'success')->assertJsonPath('data.0.response_code', 200)->assertJsonPath('data.0.attempts', 1);
    // The secret is never listed again.
    $this->actingAs($admin)->getJson('/api/integrations/webhooks')->assertOk()->assertJsonMissingPath('data.0.secret')->assertJsonPath('data.1.last_delivery.status', 'success')->assertJsonPath('data.0.last_delivery', null);
});

test('a failing endpoint is retried, can be turned off, and a failed delivery can be sent again', function () {
    Http::fake(['8.8.8.8/*' => Http::sequence()->push('boom', 500)->whenEmpty(Http::response('ok', 200))]);
    $admin = companyUser('company_admin');
    [$id] = makeHook($this, $admin, ['employee.created']);

    Employee::factory()->create(['company_id' => $admin->company_id]);
    $delivery = WebhookDelivery::withoutGlobalScopes()->firstOrFail();
    // The sync queue of the tests gives the job one try: the answer is recorded and the delivery is failed (a real queue retries with the backoff first).
    expect($delivery->status)->toBe('failed')->and($delivery->response_code)->toBe(500)->and($delivery->attempts)->toBe(1);

    $this->actingAs($admin)->postJson("/api/integrations/webhook-deliveries/{$delivery->id}/retry")->assertOk();
    expect($delivery->fresh()->status)->toBe('success')->and($delivery->fresh()->attempts)->toBe(1);

    $this->actingAs($admin)->patchJson("/api/integrations/webhooks/{$id}", ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
    Employee::factory()->create(['company_id' => $admin->company_id]);
    Http::assertSentCount(2); // the first try and the manual retry; the turned-off endpoint heard nothing more
});

test('payroll finalized and leave approved are sent, and a company without the API sends nothing', function () {
    Http::fake(['8.8.8.8/*' => Http::response('ok', 200)]);
    $admin = companyUser('company_admin');
    [$e, $group] = runStaff($admin->company);
    makeHook($this, $admin, ['payroll.finalized', 'leave.approved']);
    Http::fake(['8.8.8.8/*' => Http::response('ok', 200)]);

    LeaveDefaults::ensure($admin->company_id);
    $leave = LeaveRequest::create(['company_id' => $admin->company_id, 'employee_id' => $e->id, 'leave_type_id' => LeaveType::where('company_id', $admin->company_id)->first()->id, 'date_from' => '2026-03-02', 'date_to' => '2026-03-02', 'days' => 1, 'status' => 'pending']);
    $leave->update(['status' => 'approved']);
    $run = newRun($this, $admin, $group->id);
    foreach (['run', 'approve', 'finalize'] as $step) {
        $this->actingAs($admin)->postJson("/api/payroll/{$run}/{$step}")->assertOk();
    }

    $events = WebhookDelivery::withoutGlobalScopes()->orderBy('id')->pluck('event')->all();
    expect($events)->toBe(['leave.approved', 'payroll.finalized']);
    expect(WebhookDelivery::withoutGlobalScopes()->where('event', 'payroll.finalized')->first()->payload)->toMatchArray(['id' => $run, 'employees' => 1]);

    Company::whereKey($admin->company_id)->first()->forceFill(['plan_tier' => 'professional_plus'])->save();
    $leave->update(['status' => 'pending']);
    $leave->update(['status' => 'approved']);
    expect(WebhookDelivery::withoutGlobalScopes()->count())->toBe(2);
});
