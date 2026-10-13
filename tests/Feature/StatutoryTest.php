<?php

use App\Models\Branch;
use App\Models\Employee;
use App\Models\PhilhealthRate;
use App\Payroll\Statutory\StatutoryCalculator;
use App\Payroll\Statutory\StatutoryTables;
use App\Payroll\Tax\WithholdingTax;
use Illuminate\Support\Str;

/** The golden fixture the browser engine produced (tests/Fixtures/golden/statutory.json), config in the shape StatutoryTables::for gives. */
function statutoryGolden(): array
{
    $golden = json_decode(file_get_contents(base_path('tests/Fixtures/golden/statutory.json')), true);
    $c = $golden['config'];
    $golden['php_config'] = [
        'sss_brackets' => array_map(fn ($b) => ['min_salary' => $b['minSalary'], 'max_salary' => $b['maxSalary'], 'msc' => $b['msc'], 'employee_share' => $b['employeeShare'], 'employer_share' => $b['employerShare'], 'ec' => $b['ec']], $c['sssBrackets']),
        'philhealth' => ['rate' => $c['philhealthRate'], 'employee_share_percent' => $c['philhealthEmployeeSharePercent'], 'employer_share_percent' => $c['philhealthEmployerSharePercent'], 'salary_floor' => $c['philhealthSalaryFloor'], 'salary_ceiling' => $c['philhealthSalaryCeiling']],
        'pagibig' => ['rate' => $c['pagibigRate'], 'max_fund_salary' => $c['pagibigMaxFundSalary'], 'employee_amount' => $c['pagibigEmployeeAmount'], 'employer_amount' => $c['pagibigEmployerAmount']],
        'tax_tables' => array_map(fn ($rows) => array_map(fn ($b) => ['min' => $b['min'], 'max' => $b['max'], 'rate' => $b['rate'], 'base_tax' => $b['baseTax']], $rows), ['monthly' => $c['taxBrackets'], ...$c['taxBracketTables']]),
    ];

    return $golden;
}

test('the calculator gives the browser engine\'s figures on every golden row', function () {
    $golden = statutoryGolden();
    expect($golden['rows'])->toHaveCount(68);

    foreach ($golden['rows'] as $row) {
        $in = $row['input'];
        $got = StatutoryCalculator::monthlyFor($golden['php_config'], $in['monthlySalary'], $in['frequency'], $in['periodsPerMonth']);
        foreach ($row['output'] as $key => $expected) {
            expect($got[Str::snake($key)])->toEqualWithDelta($expected, 0.0001, "{$key} for ".json_encode($in));
        }
    }
});

test('every tax table gives the golden tax and marginal rate', function () {
    foreach (statutoryGolden()['taxTables'] as $frequency => $table) {
        $brackets = array_map(fn ($b) => ['min' => $b['min'], 'max' => $b['max'], 'rate' => $b['rate'], 'base_tax' => $b['baseTax']], $table['brackets']);
        foreach ($table['samples'] as $s) {
            expect(WithholdingTax::on($s['taxable'], $brackets))->toEqualWithDelta($s['tax'], 0.0001, "{$frequency} tax on {$s['taxable']}");
            expect(WithholdingTax::marginalRate($s['taxable'], $brackets))->toEqualWithDelta($s['marginalRate'], 0.0001);
        }
    }
});

test('the seeded system tables equal the golden configuration', function () {
    $golden = statutoryGolden()['php_config'];
    $tables = StatutoryTables::for(companyUser()->company_id, '2026-10-12');

    expect($tables['sss_brackets'])->toEqual($golden['sss_brackets'])
        ->and($tables['philhealth'])->toEqual($golden['philhealth'])
        ->and($tables['pagibig'])->toEqual($golden['pagibig'])
        ->and($tables['tax_tables'])->toEqual($golden['tax_tables']);
});

test('an edit takes over from its effective date, and the system tables stay for earlier dates', function () {
    $admin = companyUser('payroll_admin');
    $this->actingAs($admin)->getJson('/api/statutory?date=2026-10-12')->assertOk()->assertJsonPath('data.philhealth.rate', 0.05);

    $this->actingAs($admin)->putJson('/api/statutory', ['effective_from' => '2027-01-01', 'philhealth' => ['rate' => 0.055, 'employee_share_percent' => 0.5, 'employer_share_percent' => 0.5, 'salary_floor' => 10000, 'salary_ceiling' => 100000]])
        ->assertOk()->assertJsonPath('data.philhealth.rate', 0.055);

    $this->actingAs($admin)->getJson('/api/statutory?date=2026-12-31')->assertJsonPath('data.philhealth.rate', 0.05);
    $this->actingAs($admin)->getJson('/api/statutory?date=2027-06-01')->assertJsonPath('data.philhealth.rate', 0.055)->assertJsonPath('data.effective_from.philhealth', '2027-01-01')
        ->assertJsonPath('data.pagibig.rate', 0.02);

    // Saving the same date again replaces it instead of adding a second set.
    $this->actingAs($admin)->putJson('/api/statutory', ['effective_from' => '2027-01-01', 'philhealth' => ['rate' => 0.06, 'employee_share_percent' => 0.5, 'employer_share_percent' => 0.5, 'salary_floor' => 10000, 'salary_ceiling' => 100000]])->assertOk();
    expect(PhilhealthRate::where('company_id', $admin->company_id)->count())->toBe(1);

    // Another company is not touched.
    $other = companyUser('payroll_admin');
    $this->actingAs($other)->getJson('/api/statutory?date=2027-06-01')->assertJsonPath('data.philhealth.rate', 0.05);
});

test('editing one pay period\'s tax table leaves the others, and a bad table is refused', function () {
    $admin = companyUser('payroll_admin');
    $rows = [['min' => 0, 'max' => 30000, 'rate' => 0, 'base_tax' => 0], ['min' => 30000, 'max' => null, 'rate' => 0.2, 'base_tax' => 0]];
    $this->actingAs($admin)->putJson('/api/statutory', ['effective_from' => '2027-01-01', 'tax_tables' => ['monthly' => $rows]])->assertOk();

    $after = $this->actingAs($admin)->getJson('/api/statutory?date=2027-02-01')->json('data.tax_tables');
    expect($after['monthly'])->toHaveCount(2)->and($after['semi_monthly'])->toHaveCount(6);

    $this->actingAs($admin)->putJson('/api/statutory', ['tax_tables' => ['monthly' => [['min' => 100, 'max' => null, 'rate' => 0.1, 'base_tax' => 0]]]])->assertUnprocessable();
    $this->actingAs($admin)->putJson('/api/statutory', ['tax_tables' => ['yearly' => $rows]])->assertUnprocessable();
    $this->actingAs($admin)->putJson('/api/statutory', ['effective_from' => '2027-01-01'])->assertUnprocessable();
});

test('the preview uses the tables in force, and only payroll roles can see or edit them', function () {
    $admin = companyUser('payroll_admin');
    $r = $this->actingAs($admin)->postJson('/api/statutory/preview', ['rows' => [['monthly_salary' => 30000, 'frequency' => 'semi_monthly', 'periods_per_month' => 2], ['monthly_salary' => 1000]]])->assertOk()->json('data');
    expect($r[0]['sss_msc'])->toEqual(30000)->and($r[1]['pagibig_employee'])->toEqual(10)->and($r[0]['withholding_tax'])->toBeGreaterThan(0);

    $hr = companyUser('hr_admin', $admin->company);
    $this->actingAs($hr)->putJson('/api/statutory', ['pagibig' => ['rate' => 0.02, 'max_fund_salary' => 10000, 'employee_amount' => 200, 'employer_amount' => 200]])->assertForbidden();
    $this->actingAs(companyUser('employee', $admin->company))->getJson('/api/statutory')->assertForbidden();
});

test('a payroll role sees the active employees\' pay for the contributions screen, without the other record fields', function () {
    $admin = companyUser('payroll_admin');
    $branch = Branch::factory()->create(['company_id' => $admin->company_id]);
    Employee::factory()->create(['company_id' => $admin->company_id, 'branch_id' => $branch->id]);
    Employee::factory()->create(['company_id' => $admin->company_id, 'branch_id' => $branch->id, 'employment' => ['status' => 'inactive', 'department' => 'X']]);
    Employee::factory()->create(['company_id' => otherCompany()->id, 'branch_id' => Branch::factory()->create()->id]);

    $rows = $this->actingAs($admin)->getJson('/api/statutory/employees')->assertOk()->assertJsonCount(1, 'data')->json('data');
    expect(array_keys($rows[0]))->toEqualCanonicalizing(['id', 'employee_number', 'personal', 'employment', 'compensation', 'government']);
});
