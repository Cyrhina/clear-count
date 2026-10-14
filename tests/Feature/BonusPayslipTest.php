<?php

use App\Jobs\SendPayslipEmail;
use App\Mail\PayslipMail;
use App\Models\BonusIncentive;
use App\Models\PayslipEmail;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Mail;

function separateBonus(int $companyId, array $over = []): BonusIncentive
{
    return BonusIncentive::create(['company_id' => $companyId, 'name' => 'Spot Bonus', 'bonus_type' => 'fixed_amount', 'target_type' => 'company', 'amount' => 10000, 'period_label' => 'October 2026', 'taxable' => true, 'frequency' => 'one_time', 'payout_mode' => 'separate_payslip', 'status' => 'approved', ...$over]);
}

test('a separate bonus payslip carries only the bonus, taxed at the marginal rate of the employee', function () {
    $admin = companyUser('payroll_admin');
    [$low] = runStaff($admin->company, ['basicPay' => 12000]);
    [$high] = runStaff($admin->company, ['basicPay' => 400000]);
    $bonus = separateBonus($admin->company_id);

    $rows = collect($this->actingAs($admin)->getJson("/api/bonuses/{$bonus->id}/payslips")->assertOk()->json('data'))->keyBy('employeeId');
    expect($rows)->toHaveCount(2)->and($rows[(string) $low->id]['grossBonus'])->toEqual(10000);
    expect($rows[(string) $low->id]['taxRate'])->toEqual(0)->and($rows[(string) $low->id]['netPay'])->toEqual(10000);
    // Taxable at a marginal rate above zero: tax = gross x rate, rounded, and net = gross less tax.
    $row = $rows[(string) $high->id];
    expect($row['taxRate'])->toBeGreaterThan(0)->and($row['withholdingTax'])->toEqual(round(10000 * $row['taxRate']))->and($row['netPay'])->toEqual(10000 - $row['withholdingTax']);

    // Not taxable: no withholding at all.
    $free = separateBonus($admin->company_id, ['taxable' => false]);
    expect(collect($this->actingAs($admin)->getJson("/api/bonuses/{$free->id}/payslips")->json('data'))->pluck('withholdingTax')->unique()->all())->toEqual([0]);
});

test('a percentage bonus is a share of the monthly pay, and a bonus with no payslip of its own has none', function () {
    $admin = companyUser('payroll_admin');
    [$e] = runStaff($admin->company, ['basicPay' => 30000]);
    $percent = separateBonus($admin->company_id, ['bonus_type' => 'percentage', 'amount' => 10, 'taxable' => false]);

    expect($this->actingAs($admin)->getJson("/api/bonuses/{$percent->id}/payslips")->json('data.0.grossBonus'))->toEqual(3000);

    foreach ([['payout_mode' => 'regular_payroll'], ['status' => 'pending'], ['status' => 'draft']] as $over) {
        $other = separateBonus($admin->company_id, $over);
        $this->actingAs($admin)->getJson("/api/bonuses/{$other->id}/payslips")->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($admin)->get("/api/bonuses/{$other->id}/payslips/{$e->id}/pdf")->assertNotFound();
    }
});

test('the bonus payslip PDF downloads for a covered employee only, and only for the roles that see bonuses', function () {
    $admin = companyUser('payroll_admin');
    [$e] = runStaff($admin->company);
    [$left] = runStaff($admin->company);
    $bonus = separateBonus($admin->company_id, ['target_type' => 'employee', 'target_employee_id' => $e->id]);

    $res = $this->actingAs($admin)->get("/api/bonuses/{$bonus->id}/payslips/{$e->id}/pdf")->assertOk()->assertHeader('Content-Type', 'application/pdf');
    expect(substr($res->getContent(), 0, 5))->toBe('%PDF-')->and($res->headers->get('Content-Disposition'))->toContain('Payslip-Bonus-Spot-Bonus-');
    $this->actingAs($admin)->get("/api/bonuses/{$bonus->id}/payslips/{$left->id}/pdf")->assertNotFound();
    $this->actingAs(companyUser('employee', $admin->company))->getJson("/api/bonuses/{$bonus->id}/payslips")->assertForbidden();
    $this->actingAs(companyUser('payroll_admin', otherCompany()))->getJson("/api/bonuses/{$bonus->id}/payslips")->assertNotFound();
});

test('bonus payslips are emailed through the same queue by a role that manages bonuses', function () {
    Mail::fake();
    $admin = companyUser('payroll_admin');
    [$e] = runStaff($admin->company);
    $e->update(['personal' => [...$e->personal, 'personalEmail' => 'juan@example.com']]);
    $bonus = separateBonus($admin->company_id);
    $body = ['kind' => 'bonus', 'source_id' => $bonus->id, 'targets' => [['employee_id' => $e->id, 'subject' => 'Your bonus payslip']]];

    Bus::fake();
    $this->actingAs($admin)->postJson('/api/payslip-emails', $body)->assertStatus(202)->assertJsonPath('data.0.status', 'queued');
    Bus::assertDispatched(SendPayslipEmail::class, 1);
    (new SendPayslipEmail(PayslipEmail::first()->id))->handle();

    expect(PayslipEmail::first()->status)->toBe('sent')->and(PayslipEmail::first()->kind)->toBe('bonus');
    Mail::assertSent(PayslipMail::class, fn ($m) => $m->hasTo('juan@example.com') && count($m->attachments()) === 1);

    $bonus->update(['status' => 'rejected']);
    $this->actingAs($admin)->postJson('/api/payslip-emails', $body)->assertConflict();
    $this->actingAs(companyUser('hr_admin', $admin->company))->postJson('/api/payslip-emails', $body)->assertStatus(409);
});
