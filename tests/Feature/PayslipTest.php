<?php

use App\Jobs\SendPayslipEmail;
use App\Mail\PayslipMail;
use App\Models\Employee;
use App\Models\PayslipEmail;
use App\Models\User;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Mail;

/** A finalized run of one salaried employee, plus a login for that employee. @return array{0: User, 1: int, 2: Employee, 3: User} */
function finalizedRun($test, string $personalEmail = 'juan@example.com'): array
{
    $admin = companyUser('payroll_admin');
    [$e, $group] = runStaff($admin->company);
    $e->update(['personal' => [...$e->personal, 'personalEmail' => $personalEmail]]);
    $self = companyUser('employee', $admin->company, ['employee_id' => $e->id]);
    $id = newRun($test, $admin, $group->id);
    $test->actingAs($admin)->postJson("/api/payroll/{$id}/run")->assertOk();
    $test->actingAs($admin)->postJson("/api/payroll/{$id}/approve")->assertOk();

    return [$admin, $id, $e, $self];
}

test('a payslip exists only once the run is finalized, and finalizing tells the employee', function () {
    [$admin, $id, $e, $self] = finalizedRun($this);
    $lineId = $this->actingAs($admin)->getJson("/api/payroll/{$id}/lines")->json('data.0.id');

    $this->actingAs($admin)->getJson("/api/payslips/{$lineId}/pdf")->assertNotFound();
    $this->actingAs($self)->getJson('/api/payslips')->assertOk()->assertJsonCount(0, 'data');

    $this->actingAs($admin)->postJson("/api/payroll/{$id}/finalize")->assertOk();
    $notice = $self->notifications()->first()->data;
    expect($notice['message'])->toContain('is now available')->and($notice['link'])->toBe('/ess/payslips')->and($notice['highlight_id'])->toBe((int) $lineId);
    $list = $this->actingAs($self)->getJson('/api/payslips')->assertOk()->assertJsonCount(1, 'data')->json('data.0');
    expect($list['line']['id'])->toBe($lineId)->and($list['period']['payroll_number'])->toBe('PR001');
});

test('the payslip PDF downloads for payroll and for its own employee, and for nobody else', function () {
    [$admin, $id, $e, $self] = finalizedRun($this);
    $this->actingAs($admin)->postJson("/api/payroll/{$id}/finalize")->assertOk();
    $lineId = $this->actingAs($admin)->getJson("/api/payroll/{$id}/lines")->json('data.0.id');

    $res = $this->actingAs($admin)->get("/api/payslips/{$lineId}/pdf")->assertOk()->assertHeader('Content-Type', 'application/pdf');
    expect($res->headers->get('Content-Disposition'))->toContain('Payslip-PR001-')->and(substr($res->getContent(), 0, 5))->toBe('%PDF-');
    $this->actingAs($self)->get("/api/payslips/{$lineId}/pdf")->assertOk();
    $this->actingAs($self)->getJson("/api/payslips/{$lineId}")->assertOk()->assertJsonPath('data.employeeId', (string) $e->id);

    [, , , $other] = finalizedRun($this);
    $this->actingAs($other)->getJson("/api/payslips/{$lineId}")->assertNotFound();
    $this->actingAs(companyUser('payroll_admin'))->get("/api/payslips/{$lineId}/pdf")->assertNotFound();
});

test('emailing queues one job per employee, records the outcome, and fails a missing address with the reason', function () {
    Mail::fake();
    [$admin, $id, $e] = finalizedRun($this);
    $body = ['kind' => 'payroll', 'source_id' => $id, 'targets' => [['employee_id' => $e->id, 'subject' => 'Your payslip']]];

    $this->actingAs($admin)->postJson('/api/payslip-emails', $body)->assertConflict();
    $this->actingAs($admin)->postJson("/api/payroll/{$id}/finalize")->assertOk();

    Bus::fake();
    $this->actingAs($admin)->postJson('/api/payslip-emails', $body)->assertStatus(202)->assertJsonPath('data.0.status', 'queued');
    Bus::assertDispatched(SendPayslipEmail::class, 1);

    $record = PayslipEmail::first();
    (new SendPayslipEmail($record->id))->handle();
    expect($record->fresh()->status)->toBe('sent')->and($record->fresh()->recipient)->toBe('juan@example.com')->and($record->fresh()->attempts)->toBe(1);
    Mail::assertSent(PayslipMail::class, fn ($m) => $m->hasTo('juan@example.com') && count($m->attachments()) === 1);
    $this->actingAs($admin)->getJson("/api/payslip-emails?kind=payroll&source_id={$id}")->assertJsonPath('data.0.status', 'sent');

    $e->update(['personal' => [...$e->personal, 'personalEmail' => '']]);
    (new SendPayslipEmail($record->id))->handle();
    expect($record->fresh()->status)->toBe('failed')->and($record->fresh()->error)->toContain('No email address')->and($record->fresh()->attempts)->toBe(2);

    // Only a role with payslips.generate may send.
    $this->actingAs(companyUser('hr_admin', $admin->company))->postJson('/api/payslip-emails', $body)->assertForbidden();
});
