<?php

namespace App\Jobs;

use App\Mail\PayslipMail;
use App\Models\Employee;
use App\Models\PayrollLine;
use App\Models\PayslipEmail;
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
        $line = PayrollLine::withoutGlobalScopes()->where('payroll_period_id', $email->source_id)->where('employee_id', $email->employee_id)->first();
        $to = trim($employee->personal['personalEmail'] ?? '');
        $email->fill(['attempts' => $email->attempts + 1, 'last_attempt_at' => now(), 'recipient' => $to ?: null]);

        if (! $line) {
            $email->fill(['status' => 'failed', 'error' => 'No payslip for this employee in the run'])->save();
        } elseif ($to === '') {
            $email->fill(['status' => 'failed', 'error' => 'No email address on file — add one to the employee profile'])->save();
        } elseif (! filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $email->fill(['status' => 'failed', 'error' => "Invalid email address: {$to}"])->save();
        } else {
            try {
                Mail::to($to)->send(new PayslipMail($line, $email->subject, $employee->personal['firstName'] ?? '', $line->period()->withoutGlobalScopes()->value('label')));
                $email->fill(['status' => 'sent', 'sent_at' => now(), 'error' => null])->save();
            } catch (Throwable $e) {
                $email->fill(['status' => 'failed', 'error' => mb_substr($e->getMessage(), 0, 250)])->save();
            }
        }
    }
}
