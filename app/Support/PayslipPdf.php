<?php

namespace App\Support;

use App\Models\Company;
use App\Models\Employee;
use App\Models\PayrollLine;
use Barryvdh\DomPDF\Facade\Pdf;

/** Renders a finalized payroll line as the payslip PDF (resources/views/pdf/payslip.blade.php). */
final class PayslipPdf
{
    public static function fileName(PayrollLine $line): string
    {
        $period = $line->period()->withoutGlobalScopes()->first();
        $employee = Employee::withoutGlobalScopes()->find($line->employee_id);

        return 'Payslip-'.preg_replace('/[^A-Za-z0-9]+/', '-', trim("{$period->payroll_number}-{$period->payroll_year} {$employee->name}"), -1).'.pdf';
    }

    public static function render(PayrollLine $line): string
    {
        return Pdf::loadView('pdf.payslip', [
            'line' => $line->breakdown,
            'period' => $line->period()->withoutGlobalScopes()->first(),
            'employee' => Employee::withoutGlobalScopes()->find($line->employee_id),
            'company' => Company::find($line->company_id),
        ])->setPaper('a4')->output();
    }
}
