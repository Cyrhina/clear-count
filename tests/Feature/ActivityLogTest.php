<?php

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\User;
use App\Support\ActivityLogger;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->company = Company::factory()->create();
    $this->admin = User::factory()->create(['company_id' => $this->company->id, 'first_name' => 'Andrea', 'last_name' => 'Villareal'])->assignRole('company_admin');
});

function logFor(Company $company, ?User $user, array $attrs = []): ActivityLog
{
    return ActivityLog::factory()->create(['company_id' => $company->id, 'user_id' => $user?->id, 'actor' => $user?->name ?? 'System', ...$attrs]);
}

test('index returns the table payload newest first with user, role and formatted dates', function () {
    logFor($this->company, $this->admin, ['module' => 'Attendance', 'action' => 'Approved', 'title' => 'Attendance Adjustment', 'description' => 'Time in / time out correction', 'created_at' => now()->subHour()]);
    logFor($this->company, $this->admin, ['title' => 'Newest', 'created_at' => now()]);

    $response = $this->actingAs($this->admin)->getJson('/api/activity-logs')->assertOk();

    expect($response->json('data.0.title'))->toBe('Newest')
        ->and($response->json('data.1'))->toMatchArray([
            'module' => 'Attendance', 'action' => 'Approved', 'title' => 'Attendance Adjustment', 'description' => 'Time in / time out correction',
        ])
        ->and($response->json('data.1.user'))->toBe(['id' => $this->admin->id, 'name' => 'Andrea Villareal', 'initials' => 'AV', 'role' => 'Company Admin'])
        ->and($response->json('data.1.formatted_date'))->toBe(now()->subHour()->format('M j, Y'))
        ->and($response->json('meta.total'))->toBe(2);
});

test('only the own company is visible, including by id', function () {
    $other = Company::factory()->create();
    $theirs = logFor($other, null, ['title' => 'Secret']);
    logFor($this->company, $this->admin, ['title' => 'Mine']);

    $titles = collect($this->actingAs($this->admin)->getJson('/api/activity-logs')->json('data'))->pluck('title');
    expect($titles->all())->toBe(['Mine']);

    $this->actingAs($this->admin)->getJson("/api/activity-logs/{$theirs->id}")->assertNotFound();
});

test('filters by date range, module, user and search', function () {
    $other = User::factory()->create(['company_id' => $this->company->id])->assignRole('hr_admin');
    logFor($this->company, $this->admin, ['module' => 'Payroll', 'title' => 'Payroll run', 'description' => 'October cut-off', 'created_at' => now()]);
    logFor($this->company, $other, ['module' => 'Leave', 'title' => 'Leave request', 'created_at' => now()->subDays(10)]);
    logFor($this->company, $other, ['module' => 'Leave', 'title' => 'Old leave', 'created_at' => now()->subDays(60)]);

    $titles = fn (string $query) => collect($this->actingAs($this->admin)->getJson("/api/activity-logs?{$query}")->assertOk()->json('data'))->pluck('title')->all();

    expect($titles(''))->toBe(['Payroll run', 'Leave request'])                       // default: last 30 days
        ->and($titles('date_range=today'))->toBe(['Payroll run'])
        ->and($titles('date_range=7_days'))->toBe(['Payroll run'])
        ->and($titles('date_range=custom&start_date='.now()->subDays(70)->toDateString().'&end_date='.now()->toDateString()))->toHaveCount(3)
        ->and($titles('module=Leave'))->toBe(['Leave request'])
        ->and($titles("user_id={$other->id}"))->toBe(['Leave request'])
        ->and($titles('search=cut-off'))->toBe(['Payroll run']);
});

test('filter validation: custom needs dates, user must be in the company, per_page is capped', function () {
    $outsider = User::factory()->create(['company_id' => Company::factory()->create()->id]);

    $this->actingAs($this->admin)->getJson('/api/activity-logs?date_range=custom')->assertUnprocessable()->assertJsonValidationErrors(['start_date', 'end_date']);
    $this->actingAs($this->admin)->getJson("/api/activity-logs?user_id={$outsider->id}")->assertUnprocessable()->assertJsonValidationErrors('user_id');
    $this->actingAs($this->admin)->getJson('/api/activity-logs?per_page=500')->assertUnprocessable();
});

test('pagination defaults to 10 and reports totals', function () {
    ActivityLog::factory()->count(12)->create(['company_id' => $this->company->id, 'user_id' => $this->admin->id]);

    $meta = $this->actingAs($this->admin)->getJson('/api/activity-logs')->json('meta');

    expect($meta)->toMatchArray(['per_page' => 10, 'total' => 12, 'from' => 1, 'to' => 10, 'last_page' => 2]);
});

test('listing does not query per row (no N+1)', function () {
    ActivityLog::factory()->count(15)->create(['company_id' => $this->company->id, 'user_id' => fn () => User::factory()->create(['company_id' => $this->company->id])->assignRole('manager')->id]);

    DB::enableQueryLog();
    $this->actingAs($this->admin)->getJson('/api/activity-logs?per_page=15')->assertOk();
    $queries = collect(DB::getQueryLog())->filter(fn ($q) => str_contains($q['query'], 'activity_logs') || str_contains($q['query'], '"users"') || str_contains($q['query'], '"roles"') || str_contains($q['query'], 'model_has_roles'));

    expect($queries->count())->toBeLessThanOrEqual(6);
});

test('show returns drill-down details; filters endpoint lists modules and users', function () {
    $log = logFor($this->company, $this->admin, ['module' => 'Payroll', 'properties' => ['ip' => '10.0.0.1']]);

    $this->actingAs($this->admin)->getJson("/api/activity-logs/{$log->id}")->assertOk()->assertJsonPath('data.properties.ip', '10.0.0.1');
    $this->actingAs($this->admin)->getJson('/api/activity-logs/filters')->assertOk()
        ->assertJsonPath('data.modules', ['Payroll'])
        ->assertJsonPath('data.users.0.name', 'Andrea Villareal');
});

test('without users.manage the log is forbidden', function () {
    $hr = User::factory()->create(['company_id' => $this->company->id])->assignRole('hr_admin');

    $this->actingAs($hr)->getJson('/api/activity-logs')->assertForbidden();
});

test('ActivityLogger records actor, module, subject and request context', function () {
    $this->actingAs($this->admin);

    $entry = ActivityLogger::log(module: 'Employees', action: 'Updated', title: 'Employee', description: 'Juan', subject: $this->admin);

    expect($entry->company_id)->toBe($this->company->id)
        ->and($entry->actor)->toBe('Andrea Villareal')
        ->and($entry->subject->is($this->admin))->toBeTrue()
        ->and($entry->properties)->toHaveKey('ip');
});

test('user management actions are written to the activity log', function () {
    $this->actingAs($this->admin)->postJson('/api/users', [
        'first_name' => 'Ana', 'last_name' => 'Cruz', 'email' => 'ana.log@example.com', 'role' => 'employee',
    ])->assertCreated();

    $this->assertDatabaseHas('activity_logs', ['company_id' => $this->company->id, 'module' => 'User Access', 'action' => 'Invited', 'title' => 'User invitation']);
});
