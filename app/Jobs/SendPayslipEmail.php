<?php

namespace App\Jobs;

use App\Mail\PayslipMail;
use App\Models\BonusIncentive;
use App\Models\Employee;
use App\Models\PayrollLine;
use App\Models\PayslipEmail;
use App\Models\ThirteenthMonthLine;
use App\Payroll\BonusPayslip;
use App\Support\PayslipPdf;
use Closure;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Throwable;

/** Sends one payslip email and records the outcome on its `payslip_emails` row. A missing or invalid address fails the row without trying. */
class SendPayslipEmail implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(public int $emailId) {}

    public function handle(): void
    {
        $email = PayslipEmail::withoutGlobalScopes()->findOrFail($this->emailId);
        $employee = Employee::withoutGlobalScopes()->find($email->employee_id);
        $to = trim($employee->personal['personalEmail'] ?? '');
        $email->fill(['attempts' => $email->attempts + 1, 'last_attempt_at' => now(), 'recipient' => $to ?: null]);

        $payslip = $this->payslip($email, $employee);
        if (! $payslip) {
            $email->fill(['status' => 'failed', 'error' => 'No payslip for this employee in the run'])->save();
        } elseif ($to === '') {
            $email->fill(['status' => 'failed', 'error' => 'No email address on file — add one to the employee profile'])->save();
        } elseif (! filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $email->fill(['status' => 'failed', 'error' => "Invalid email address: {$to}"])->save();
        } else {
            try {
                Mail::to($to)->send(new PayslipMail($email->subject, $employee->personal['firstName'] ?? '', $payslip['label'], $payslip['pdf'], $payslip['fileName']));
                $email->fill(['status' => 'sent', 'sent_at' => now(), 'error' => null])->save();
            } catch (Throwable $e) {
                $email->fill(['status' => 'failed', 'error' => mb_substr($e->getMessage(), 0, 250)])->save();
            }
        }
    }

    /** @return array{label: string, pdf: Closure, fileName: string}|null what to attach, or null when the employee has no payslip in this source */
    private function payslip(PayslipEmail $email, Employee $employee): ?array
    {
        if ($email->kind === 'bonus') {
            $bonus = BonusIncentive::withoutGlobalScopes()->find($email->source_id);
            $row = collect($bonus ? BonusPayslip::rows($bonus) : [])->firstWhere('employeeId', (string) $employee->id);

            return $row ? ['label' => "{$bonus->name} ({$bonus->period_label})", 'pdf' => fn () => PayslipPdf::renderBonus($bonus, $employee, $row), 'fileName' => PayslipPdf::bonusFileName($bonus, $employee)] : null;
        }

        $line = $email->kind === 'thirteenth_month'
            ? ThirteenthMonthLine::withoutGlobalScopes()->where('thirteenth_month_run_id', $email->source_id)->where('employee_id', $email->employee_id)->first()
            : PayrollLine::withoutGlobalScopes()->where('payroll_period_id', $email->source_id)->where('employee_id', $email->employee_id)->first();
        if (! $line) {
            return null;
        }
        $label = $email->kind === 'thirteenth_month' ? $line->run()->withoutGlobalScopes()->value('payout_period_label') : $line->period()->withoutGlobalScopes()->value('label');

        return ['label' => $label, 'pdf' => fn () => PayslipPdf::render($line), 'fileName' => PayslipPdf::fileName($line)];
    }
}
