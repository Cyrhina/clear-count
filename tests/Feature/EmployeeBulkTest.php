<?php

use App\Models\Branch;
use App\Models\BranchDepartment;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function importRow(Branch $branch, array $overrides = []): array
{
    return [
        'line' => 2,
        'branch_id' => $branch->id,
        'personal' => ['firstName' => 'Maria', 'lastName' => 'Santos', 'birthDate' => '1993-06-14', 'civilStatus' => 'single', 'address' => 'QC', 'contactNumber' => '0917'],
        'employment' => ['position' => 'Clerk', 'department' => 'Finance', 'employmentType' => 'regular', 'dateHired' => '2026-01-05', 'category' => 'regular'],
        'compensation' => ['basicPay' => 20000, 'payType' => 'monthly', 'allowances' => []],
        ...$overrides,
    ];
}

function staff(Branch $branch, string $department = 'Sales', array $attrs = []): Employee
{
    return Employee::factory()->create([
        'company_id' => $branch->company_id,
        'branch_id' => $branch->id,
        'employment' => ['position' => 'Staff', 'department' => $department, 'employmentType' => 'regular', 'dateHired' => '2026-01-01', 'status' => 'active', 'category' => 'regular'],
        ...$attrs,
    ]);
}

test('a dry run reports every row and saves nothing', function () {
    $admin = companyUser();
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    $rows = [importRow($branch), importRow($branch, ['line' => 3, 'compensation' => ['basicPay' => 0, 'payType' => 'weekly']])];

    $report = $this->actingAs($admin)->postJson('/api/employees/import', ['rows' => $rows, 'dry_run' => true])->assertOk()->json('data');

    expect($report['rows'][0]['ok'])->toBeTrue()->and($report['rows'][1]['ok'])->toBeFalse()->and($report['rows'][1]['line'])->toBe(3)
        ->and($report['created'])->toBe(0)->and($report['skipped'])->toBe(1)->and(Employee::count())->toBe(0);
});

test('an import adds the valid rows with numbers and departments, and skips the rest', function () {
    $admin = companyUser();
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    $rows = [importRow($branch), importRow($branch, ['line' => 3, 'personal' => [...importRow($branch)['personal'], 'firstName' => 'Jose']]), importRow($branch, ['line' => 4, 'branch_id' => 999999])];

    $report = $this->actingAs($admin)->postJson('/api/employees/import', ['rows' => $rows])->assertOk()->json('data');

    expect($report['created'])->toBe(2)->and($report['skipped'])->toBe(1)->and($report['rows'][2]['ok'])->toBeFalse();
    expect(Employee::pluck('employee_number')->sort()->values()->all())->toBe(['EMP-0001', 'EMP-0002'])
        ->and($branch->departments()->pluck('name')->all())->toBe(['Finance']);
    $this->assertDatabaseCount('employee_compensations', 2);
});

test('a name that exists already, or repeats in the file, is an error on that row', function () {
    $admin = companyUser();
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    staff($branch, 'Sales', ['personal' => ['firstName' => 'Maria', 'lastName' => 'Santos']]);

    $report = $this->actingAs($admin)->postJson('/api/employees/import', ['rows' => [importRow($branch), importRow($branch, ['line' => 3, 'personal' => [...importRow($branch)['personal'], 'firstName' => 'Ana']]), importRow($branch, ['line' => 4, 'personal' => [...importRow($branch)['personal'], 'firstName' => 'Ana']])]])->json('data');

    expect($report['rows'][0]['errors'])->toBe(['An employee with this name already exists'])->and($report['rows'][1]['ok'])->toBeTrue()->and($report['rows'][2]['ok'])->toBeFalse()->and($report['created'])->toBe(1);
});

test('bank details in an import are dropped with a warning for HR, who cannot edit them', function () {
    $hr = companyUser('hr_admin');
    $branch = Branch::factory()->create(['company_id' => $hr->company_id]);

    $report = $this->actingAs($hr)->postJson('/api/employees/import', ['rows' => [importRow($branch, ['bank' => ['bankName' => 'BDO'], 'government' => ['sssNo' => '1']])]])->json('data');

    expect($report['rows'][0]['warnings'])->toBe(['Bank details ignored (you cannot edit them)'])->and(Employee::first()->bank)->toBe([])->and(Employee::first()->government)->toBe(['sssNo' => '1']);
});

test('import needs employees.edit and at most 500 rows', function () {
    $this->actingAs(companyUser('payroll_admin'))->postJson('/api/employees/import', ['rows' => [[]]])->assertForbidden();
    $this->actingAs(companyUser())->postJson('/api/employees/import', ['rows' => array_fill(0, 501, ['line' => 1])])->assertJsonValidationErrors('rows');
});

test('bulk department moves the employees and creates the department in their branch', function () {
    $admin = companyUser();
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    $a = staff($branch, 'Sales');
    $b = staff($branch, 'Ops');
    $foreign = staff(Branch::factory()->create(['company_id' => otherCompany()->id]), 'Sales');

    $this->actingAs($admin)->postJson('/api/employees/bulk/department', ['ids' => [$a->id, $b->id, $foreign->id], 'department' => 'Ops'])->assertOk()->assertJsonPath('data.changed', 1);

    expect($a->fresh()->department)->toBe('Ops')->and($a->fresh()->employment['department'])->toBe('Ops')->and($foreign->fresh()->department)->toBe('Sales')
        ->and(BranchDepartment::where('branch_id', $branch->id)->pluck('name')->all())->toBe(['Ops']);
});

test('bulk branch transfers, and drops the old supervisor seat', function () {
    $admin = companyUser();
    $from = Branch::factory()->create(['company_id' => $admin->company_id]);
    $to = Branch::factory()->create(['company_id' => $admin->company_id]);
    $e = staff($from, 'Sales');
    $seat = BranchDepartment::create(['company_id' => $from->company_id, 'branch_id' => $from->id, 'name' => 'Sales', 'supervisor_employee_id' => $e->id]);

    $this->actingAs($admin)->postJson('/api/employees/bulk/branch', ['ids' => [$e->id], 'branch_id' => $to->id])->assertOk()->assertJsonPath('data.changed', 1);
    $this->actingAs($admin)->postJson('/api/employees/bulk/branch', ['ids' => [$e->id], 'branch_id' => Branch::factory()->create()->id])->assertJsonValidationErrors('branch_id');

    expect($e->fresh()->branch_id)->toBe($to->id)->and($to->departments()->pluck('name')->all())->toBe(['Sales'])->and($seat->fresh()->supervisor_employee_id)->toBeNull();
});

test('bulk status needs employees.separate and clears a separation on reactivation', function () {
    $admin = companyUser();
    $e = staff(Branch::factory()->create(['company_id' => $admin->company_id]), 'Sales', ['employment' => ['position' => 'X', 'department' => 'Sales', 'employmentType' => 'regular', 'dateHired' => '2026-01-01', 'status' => 'archived', 'category' => 'regular', 'dateSeparated' => '2026-05-01', 'separationReason' => 'resigned']]);

    $this->actingAs(companyUser('hr_admin', $admin->company))->postJson('/api/employees/bulk/status', ['ids' => [$e->id], 'status' => 'inactive'])->assertForbidden();
    $this->actingAs($admin)->postJson('/api/employees/bulk/status', ['ids' => [$e->id], 'status' => 'active'])->assertOk()->assertJsonPath('data.changed', 1);

    expect($e->fresh()->status)->toBe('active')->and($e->fresh()->employment)->not->toHaveKey('dateSeparated');
});

test('a mixed pay structure is part of the compensation record and survives a plain pay edit', function () {
    $admin = companyUser();
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    $mixed = ['baseType' => 'monthly', 'baseAmount' => 18000, 'componentType' => 'commission_pct', 'rate' => 5];
    $hire = importRow($branch, ['compensation' => ['basicPay' => 1, 'payType' => 'daily', 'mixed' => $mixed]]);

    $id = $this->actingAs($admin)->postJson('/api/employees', $hire)->assertCreated()
        ->assertJsonPath('data.compensation.mixed.rate', 5)->assertJsonPath('data.compensation.basicPay', 18000)->assertJsonPath('data.compensation.payType', 'monthly')->json('data.id');

    $this->actingAs($admin)->putJson("/api/employees/{$id}/compensation", ['compensation' => ['basicPay' => 20000, 'payType' => 'monthly'], 'reason' => 'x'])->assertOk()
        ->assertJsonPath('data.compensation.mixed.componentType', 'commission_pct')->assertJsonPath('data.compensation.basicPay', 18000);

    $this->actingAs($admin)->putJson("/api/employees/{$id}/compensation", ['compensation' => ['basicPay' => 20000, 'payType' => 'monthly', 'mixed' => null], 'reason' => 'Back to fixed'])->assertOk()
        ->assertJsonPath('data.compensation.basicPay', 20000)->assertJsonMissingPath('data.compensation.mixed');

    $this->actingAs($admin)->postJson('/api/employees', importRow($branch, ['compensation' => ['basicPay' => 1, 'payType' => 'monthly', 'mixed' => [...$mixed, 'componentType' => 'bonus']]]))->assertJsonValidationErrors('compensation.mixed.componentType');
});

test('documents are uploaded, listed for pay viewers, reached only by a signed link, and deleted', function () {
    Storage::fake('local');
    $admin = companyUser();
    $employee = staff(Branch::factory()->create(['company_id' => $admin->company_id]));

    $doc = $this->actingAs($admin)->postJson("/api/employees/{$employee->id}/documents", ['file' => UploadedFile::fake()->create('contract.pdf', 100, 'application/pdf'), 'name' => 'Contract'])
        ->assertCreated()->assertJsonPath('data.name', 'Contract')->assertJsonPath('data.file_type', 'pdf')->json('data');
    Storage::disk('local')->assertExists(EmployeeDocument::first()->path);

    $this->actingAs($admin)->getJson("/api/employees/{$employee->id}")->assertJsonPath('data.documents.0.id', $doc['id']);

    $url = $this->actingAs($admin)->getJson("/api/employees/{$employee->id}/documents/{$doc['id']}/link")->assertOk()->json('data.url');
    $this->actingAs($admin)->get($url)->assertOk()->assertDownload('Contract.pdf');
    $this->actingAs($admin)->get(preg_replace('/signature=[^&]+/', 'signature=bad', $url))->assertForbidden();
    $this->actingAs($admin)->get("/api/employee-documents/{$doc['id']}/download")->assertForbidden();

    $this->actingAs($admin)->deleteJson("/api/employees/{$employee->id}/documents/{$doc['id']}")->assertNoContent();
    expect(EmployeeDocument::count())->toBe(0);
});

test('document types and sizes are limited, and another company cannot reach them', function () {
    Storage::fake('local');
    $admin = companyUser();
    $employee = staff(Branch::factory()->create(['company_id' => $admin->company_id]));
    $foreign = staff(Branch::factory()->create(['company_id' => otherCompany()->id]));

    $this->actingAs($admin)->postJson("/api/employees/{$employee->id}/documents", ['file' => UploadedFile::fake()->create('run.exe', 10)])->assertJsonValidationErrors('file');
    $this->actingAs($admin)->postJson("/api/employees/{$employee->id}/documents", ['file' => UploadedFile::fake()->create('big.pdf', 6000, 'application/pdf')])->assertJsonValidationErrors('file');
    $this->actingAs($admin)->postJson("/api/employees/{$foreign->id}/documents", ['file' => UploadedFile::fake()->create('a.pdf', 10, 'application/pdf')])->assertNotFound();
    $this->actingAs(companyUser('manager', $admin->company))->postJson("/api/employees/{$employee->id}/documents", ['file' => UploadedFile::fake()->create('a.pdf', 10, 'application/pdf')])->assertForbidden();
});
