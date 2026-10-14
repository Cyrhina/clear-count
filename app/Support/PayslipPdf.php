<?php

namespace App\Support;

use App\Models\BonusIncentive;
use App\Models\Company;
use App\Models\Employee;
use App\Models\ThirteenthMonthLine;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Model;

/** Renders a payslip as a PDF: a finalized payroll line (pdf.payslip), a 13th month line (pdf.thirteenth-month) or a separate bonus payslip (pdf.bonus-payslip). */
final class PayslipPdf
{
    public static function fileName(Model $line): string
    {
        $employee = Employee::withoutGlobalScopes()->find($line->employee_id);
        if ($line instanceof ThirteenthMonthLine) {
            $label = '13thMonth-'.$line->run()->withoutGlobalScopes()->value('year');
        } else {
            $period = $line->period()->withoutGlobalScopes()->first();
            $label = "{$period->payroll_number}-{$period->payroll_year}";
        }

        return self::safe("Payslip-{$label} {$employee->name}");
    }

    public static function render(Model $line): string
    {
        $data = ['line' => $line->breakdown, 'employee' => Employee::withoutGlobalScopes()->find($line->employee_id), 'company' => Company::find($line->company_id)];
        $view = $line instanceof ThirteenthMonthLine
            ? ['pdf.thirteenth-month', ['run' => $line->run()->withoutGlobalScopes()->first()]]
            : ['pdf.payslip', ['period' => $line->period()->withoutGlobalScopes()->first()]];

        return Pdf::loadView($view[0], [...$data, ...$view[1]])->setPaper('a4')->output();
    }

    /** @param  array{grossBonus: float, withholdingTax: float, netPay: float, taxRate: float}  $row  from App\Payroll\BonusPayslip */
    public static function renderBonus(BonusIncentive $bonus, Employee $employee, array $row): string
    {
        return Pdf::loadView('pdf.bonus-payslip', ['bonus' => $bonus, 'employee' => $employee, 'row' => $row, 'company' => Company::find($bonus->company_id)])->setPaper('a4')->output();
    }

    public static function bonusFileName(BonusIncentive $bonus, Employee $employee): string
    {
        return self::safe("Payslip-Bonus {$bonus->name} {$employee->name}");
    }

    private static function safe(string $name): string
    {
        return preg_replace('/[^A-Za-z0-9]+/', '-', trim($name)).'.pdf';
    }
}
