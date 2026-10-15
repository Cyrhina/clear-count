<?php

use App\Jobs\SendPayslipEmail;
use App\Mail\PayslipMail;
use App\Models\AttendanceRecord;
use App\Models\PayslipEmail;
use App\Models\ThirteenthMonthRun;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Mail;

function batchBody(array $over = []): array
{
    return ['year' => 2026, 'generation_date' => '2026-12-15', 'payout_period_label' => 'December 2026', 'selection' => ['mode' => 'all'], ...$over];
}

test('generating makes a draft with one line per eligible active employee, computed from the records', function () {
    $admin = companyUser('payroll_admin');
    [$a] = runStaff($admin->company);
    [$b] = runStaff($admin->company, ['basicPay' => 24000]);
    $gone = runStaff($admin->company, [], ['status' => 'inactive', 'dateSeparated' => '2026-06-30'])[0];
    AttendanceRecord::create(['company_id' => $admin->company_id, 'employee_id' => $a->id, 'date' => '2026-03-02', 'status' => 'absent']);

    $preview = $this->actingAs($admin)->postJson('/api/thirteenth-month/preview', ['year' => 2026, 'selection' => ['mode' => 'all']])->assertOk()->json('data');
    expect($preview['included_ids'])->toBe([$a->id, $b->id])->and($preview['eligible_ids'])->toContain($gone->id)->and($preview['coverage'])->toBe(['start' => '2026-01-01', 'end' => '2026-12-31']);

    $run = $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody())->assertCreated()->assertJsonPath('data.status', 'draft')->assertJsonPath('meta.skipped_already_paid', 0)->json('data');
    $lines = collect($this->actingAs($admin)->getJson("/api/thirteenth-month/{$run['id']}/lines")->assertOk()->json('data'))->keyBy('employeeId');

    // 30,000 x 12 = 360,000; one unpaid absence at 30,000 / 22 = 1,364; (360,000 - 1,364) / 12 = 29,886.
    expect($lines)->toHaveCount(2)->and($lines[(string) $a->id])->toMatchArray(['grossBasicEarned' => 360000, 'unpaidAbsenceDays' => 1, 'absenceDeduction' => 1364, 'thirteenthMonthPay' => 29886, 'netPay' => 29886, 'monthsCredited' => 12]);
    expect($lines[(string) $a->id]['months'])->toHaveCount(12)->and($lines[(string) $a->id]['absenceDates'])->toBe(['2026-03-02'])->and($lines[(string) $b->id]['thirteenthMonthPay'])->toEqual(24000);
});

test('a separated employee has a batch of their own, pro-rated to their last day', function () {
    $admin = companyUser('payroll_admin');
    runStaff($admin->company);
    $gone = runStaff($admin->company, [], ['status' => 'inactive', 'dateSeparated' => '2026-06-30'])[0];

    $run = $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody(['selection' => ['mode' => 'separated']]))->assertCreated()->json('data');
    $line = $this->actingAs($admin)->getJson("/api/thirteenth-month/{$run['id']}/lines")->assertJsonCount(1, 'data')->json('data.0');

    expect($line['employeeId'])->toBe((string) $gone->id)->and($line['separated'])->toBeTrue()->and($line['activeTo'])->toBe('2026-06-30')->and($line['monthsCredited'])->toEqual(6)->and($line['thirteenthMonthPay'])->toEqual(15000);
});

test('generating again replaces the draft with the same recipients, and a finalized batch is locked and never paid twice', function () {
    $admin = companyUser('payroll_admin');
    [$a] = runStaff($admin->company);
    [$b] = runStaff($admin->company);

    $first = $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody())->json('data.id');
    $second = $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody())->json('data.id');
    expect(ThirteenthMonthRun::pluck('id')->all())->toBe([$second])->and($first)->not->toBe($second);

    $one = $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody(['selection' => ['mode' => 'employees', 'employee_ids' => [$a->id]]]))->json('data.id');
    expect(ThirteenthMonthRun::count())->toBe(2);

    $this->actingAs($admin)->postJson("/api/thirteenth-month/{$one}/finalize")->assertOk()->assertJsonPath('data.status', 'finalized');
    $this->actingAs($admin)->postJson("/api/thirteenth-month/{$one}/finalize")->assertConflict();

    // The finalized batch paid employee a: a new all-batch skips them.
    $again = $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody())->assertCreated()->assertJsonPath('meta.skipped_already_paid', 1)->json('data.id');
    expect(collect($this->actingAs($admin)->getJson("/api/thirteenth-month/{$again}/lines")->json('data'))->pluck('employeeId')->all())->toBe([(string) $b->id]);
});

test('a draft listing someone paid in another batch meanwhile cannot be finalized', function () {
    $admin = companyUser('payroll_admin');
    [$a] = runStaff($admin->company);
    $all = $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody())->json('data.id');
    $one = $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody(['selection' => ['mode' => 'employees', 'employee_ids' => [$a->id]]]))->json('data.id');

    $this->actingAs($admin)->postJson("/api/thirteenth-month/{$one}/finalize")->assertOk();
    $this->actingAs($admin)->postJson("/api/thirteenth-month/{$all}/finalize")->assertConflict();
});

test('a batch needs its permission, the selection must belong to the company, and a foreign batch is not found', function () {
    $admin = companyUser('payroll_admin');
    runStaff($admin->company);
    $id = $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody())->json('data.id');

    $hr = companyUser('hr_admin', $admin->company);
    $this->actingAs($hr)->getJson('/api/thirteenth-month')->assertOk();
    $this->actingAs($hr)->postJson('/api/thirteenth-month', batchBody())->assertForbidden();
    $this->actingAs(companyUser('employee', $admin->company))->getJson('/api/thirteenth-month')->assertForbidden();

    $foreign = companyUser('payroll_admin', otherCompany());
    $this->actingAs($foreign)->getJson("/api/thirteenth-month/{$id}/lines")->assertNotFound();
    $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody(['selection' => ['mode' => 'employees', 'employee_ids' => [runStaff($foreign->company)[0]->id]]]))->assertUnprocessable();
    $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody(['selection' => ['mode' => 'nope']]))->assertUnprocessable();
});

test('the 13th month payslip is a PDF only once finalized, for the payroll role and the employee it is about', function () {
    $admin = companyUser('payroll_admin');
    fillCompanyAddress($admin->company);
    [$e] = runStaff($admin->company);
    $self = companyUser('employee', $admin->company, ['employee_id' => $e->id]);
    $run = $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody())->json('data.id');
    $lineId = $this->actingAs($admin)->getJson("/api/thirteenth-month/{$run}/lines")->json('data.0.id');

    $this->actingAs($admin)->get("/api/thirteenth-month/lines/{$lineId}/pdf")->assertNotFound();
    $this->actingAs($admin)->postJson("/api/thirteenth-month/{$run}/finalize")->assertOk();

    $res = $this->actingAs($admin)->get("/api/thirteenth-month/lines/{$lineId}/pdf")->assertOk()->assertHeader('Content-Type', 'application/pdf');
    expect(substr($res->getContent(), 0, 5))->toBe('%PDF-')->and($res->headers->get('Content-Disposition'))->toContain('Payslip-13thMonth-2026-');
    $this->actingAs($self)->get("/api/thirteenth-month/lines/{$lineId}/pdf")->assertOk();
    $this->actingAs(companyUser('employee', $admin->company, ['employee_id' => runStaff($admin->company)[0]->id]))->get("/api/thirteenth-month/lines/{$lineId}/pdf")->assertNotFound();
});

test('13th month payslips are emailed through the same queue, only after finalizing, by a role that manages them', function () {
    Mail::fake();
    $admin = companyUser('payroll_admin');
    [$e] = runStaff($admin->company);
    $e->update(['personal' => [...$e->personal, 'personalEmail' => 'juan@example.com']]);
    $run = $this->actingAs($admin)->postJson('/api/thirteenth-month', batchBody())->json('data.id');
    $body = ['kind' => 'thirteenth_month', 'source_id' => $run, 'targets' => [['employee_id' => $e->id, 'subject' => 'Your 13th month pay']]];

    $this->actingAs($admin)->postJson('/api/payslip-emails', $body)->assertConflict();
    $this->actingAs($admin)->postJson("/api/thirteenth-month/{$run}/finalize")->assertOk();

    Bus::fake();
    $this->actingAs($admin)->postJson('/api/payslip-emails', $body)->assertStatus(202)->assertJsonPath('data.0.status', 'queued');
    Bus::assertDispatched(SendPayslipEmail::class, 1);
    (new SendPayslipEmail(PayslipEmail::first()->id))->handle();

    expect(PayslipEmail::first()->status)->toBe('sent')->and(PayslipEmail::first()->kind)->toBe('thirteenth_month');
    Mail::assertSent(PayslipMail::class, fn ($m) => $m->hasTo('juan@example.com') && count($m->attachments()) === 1);
    $this->actingAs($admin)->getJson("/api/payslip-emails?kind=thirteenth_month&source_id={$run}")->assertJsonPath('data.0.status', 'sent');
    // HR can read the 13th month but not send.
    $this->actingAs(companyUser('hr_admin', $admin->company))->postJson('/api/payslip-emails', $body)->assertForbidden();
});
