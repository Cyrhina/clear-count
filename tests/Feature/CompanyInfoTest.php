<?php

use App\Models\Company;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    Storage::fake('public');
    $this->company = Company::factory()->create(['name' => 'Frontline Business Solutions']);
    $this->admin = User::factory()->create(['company_id' => $this->company->id])->assignRole('company_admin');
});

/** A real 1x1 PNG (the test machine has no GD extension, so UploadedFile::fake()->image() is unavailable). */
function png(string $name, int $padBytes = 0): UploadedFile
{
    $bytes = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');

    return UploadedFile::fake()->createWithContent($name, $bytes.str_repeat(chr(0), $padBytes));
}

function companyPayload(array $overrides = []): array
{
    return [
        'name' => 'Frontline Business Solutions Inc.',
        'trade_name' => 'Frontline',
        'company_type' => 'corporation',
        'industry' => 'Business Process Outsourcing',
        'website' => 'https://frontline.example.com',
        'email' => 'info@frontline.example.com',
        'phone' => '+63 2 8123 4567',
        'description' => 'Payroll and HR services.',
        'use_logo_colors' => true,
        'brand_color' => '#2d9450',
        'sec_number' => 'CS202201234',
        'tin' => '123-456-789-000',
        'rdo_code' => 'RDO 047 - East Makati',
        'philhealth_pen' => '13-000123456-7',
        'sss_number' => '03-9876543-2',
        'pagibig_hdmf' => '1234-5678-9012',
        'business_permit_number' => 'BP-2026-0001',
        'registered_address' => ['building_unit' => '12F Tower', 'street' => 'Ayala Ave', 'barangay' => 'Bel-Air', 'city' => 'Makati', 'province' => 'Metro Manila', 'region' => 'NCR', 'zip_code' => '1209', 'country' => 'Philippines'],
        'same_as_registered' => false,
        'office_address' => ['city' => 'Quezon City', 'country' => 'Philippines'],
        'primary_contact' => ['name' => 'Andrea Villareal', 'position' => 'CEO', 'email' => 'andrea@frontline.example.com', 'contact_number' => '0917 123 4567'],
        'payroll_contact' => ['name' => 'Pat', 'email' => 'payroll@frontline.example.com', 'contact_number' => '0917 111 2222'],
        'hr_contact' => ['name' => 'Hana', 'email' => 'hr@frontline.example.com', 'contact_number' => '0917 333 4444'],
        ...$overrides,
    ];
}

test('show returns every field with safe defaults for empty sections', function () {
    $data = $this->actingAs($this->admin)->getJson('/api/company-info')->assertOk()->json('data');

    expect($data['name'])->toBe('Frontline Business Solutions')
        ->and($data['logo_url'])->toBeNull()
        ->and($data['registered_address'])->toMatchArray(['street' => '', 'zip_code' => '', 'country' => 'Philippines'])
        ->and($data['primary_contact'])->toHaveKeys(['name', 'position', 'email', 'contact_number'])
        ->and($data['payroll_contact'])->not->toHaveKey('position')
        ->and($data['registration'])->toHaveKeys(['sec_number', 'dti_number', 'tin', 'rdo_code', 'philhealth_pen', 'sss_number', 'pagibig_hdmf', 'business_permit_number']);
});

test('update saves the profile, registrations, addresses and contacts', function () {
    $response = $this->actingAs($this->admin)->putJson('/api/company-info', companyPayload())->assertOk();

    expect($response->json('data.registration.tin'))->toBe('123-456-789-000')
        ->and($response->json('data.registered_address.city'))->toBe('Makati')
        ->and($response->json('data.hr_contact.email'))->toBe('hr@frontline.example.com')
        ->and($response->json('data.use_logo_colors'))->toBeTrue();

    $this->assertDatabaseHas('companies', ['id' => $this->company->id, 'name' => 'Frontline Business Solutions Inc.', 'sss_number' => '03-9876543-2']);
    $this->assertDatabaseHas('activity_logs', ['company_id' => $this->company->id, 'module' => 'Company Settings', 'title' => 'Company information']);
});

test('same as registered copies the registered address to the office address', function () {
    $response = $this->actingAs($this->admin)->putJson('/api/company-info', companyPayload(['same_as_registered' => true]))->assertOk();

    expect($response->json('data.office_address'))->toBe($response->json('data.registered_address'))
        ->and($response->json('data.office_address.city'))->toBe('Makati');
});

test('required fields and formats are validated', function () {
    $this->actingAs($this->admin)->putJson('/api/company-info', [])->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'company_type', 'email']);

    $this->actingAs($this->admin)->putJson('/api/company-info', companyPayload([
        'email' => 'not-an-email', 'company_type' => 'cooperative', 'tin' => '12345', 'sss_number' => '123', 'philhealth_pen' => 'abc',
        'pagibig_hdmf' => '1', 'primary_contact' => ['email' => 'bad'], 'hr_contact' => ['email' => 'bad'],
        'registered_address' => ['zip_code' => '12'], 'website' => 'ftp://x',
    ]))->assertUnprocessable()->assertJsonValidationErrors([
        'email', 'company_type', 'tin', 'sss_number', 'philhealth_pen', 'pagibig_hdmf', 'primary_contact.email', 'hr_contact.email', 'registered_address.zip_code', 'website',
    ]);
});

test('uploading a logo stores it and replaces the old file', function () {
    $first = $this->actingAs($this->admin)->post('/api/company-info/logo', ['logo' => png('a.png')], ['Accept' => 'application/json'])->assertOk();
    $firstPath = $this->company->fresh()->logo_path;
    Storage::disk('public')->assertExists($firstPath);
    expect($first->json('data.logo_url'))->toContain('/storage/company-logos/');

    $this->actingAs($this->admin)->post('/api/company-info', companyPayload(['logo' => png('b.png')]), ['Accept' => 'application/json'])->assertOk();
    $secondPath = $this->company->fresh()->logo_path;

    expect($secondPath)->not->toBe($firstPath);
    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($secondPath);
});

test('logo validation: png, jpg and webp only, up to 2 MB', function () {
    $post = fn ($file) => $this->actingAs($this->admin)->post('/api/company-info/logo', ['logo' => $file], ['Accept' => 'application/json']);
    $webp = base64_decode('UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==');
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>';

    $post(UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'))->assertUnprocessable();
    $post(png('big.png', 3 * 1024 * 1024))->assertUnprocessable();
    $post(UploadedFile::fake()->createWithContent('logo.svg', $svg))->assertUnprocessable()->assertJsonValidationErrors('logo'); // SVG can carry script
    $post(UploadedFile::fake()->createWithContent('logo.webp', $webp))->assertOk();
    expect($this->company->fresh()->logo_path)->toEndWith('.webp');
});

test('removing the logo deletes the file', function () {
    $this->actingAs($this->admin)->post('/api/company-info/logo', ['logo' => png('a.png')], ['Accept' => 'application/json']);
    $path = $this->company->fresh()->logo_path;

    $this->actingAs($this->admin)->deleteJson('/api/company-info/logo')->assertOk()->assertJsonPath('data.logo_url', null);

    Storage::disk('public')->assertMissing($path);
});

test('only users who can edit company settings may use it, and only for their own company', function () {
    $hr = User::factory()->create(['company_id' => $this->company->id])->assignRole('hr_admin');
    $this->actingAs($hr)->getJson('/api/company-info')->assertForbidden();

    $otherCompany = Company::factory()->create(['name' => 'Other Co']);
    $otherAdmin = User::factory()->create(['company_id' => $otherCompany->id])->assignRole('company_admin');
    $this->actingAs($otherAdmin)->putJson('/api/company-info', companyPayload(['name' => 'Renamed']))->assertOk();

    expect($this->company->fresh()->name)->toBe('Frontline Business Solutions')
        ->and($otherCompany->fresh()->name)->toBe('Renamed');
});
