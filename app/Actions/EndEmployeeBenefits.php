<?php

namespace App\Actions;

use App\Models\Employee;
use App\Models\EmployeeBenefit;
use App\Models\EmployeeDeduction;

/**
 * A separation ends what the employee still receives or pays monthly: their benefits and recurring deductions stop on the last day and are
 * kept as history. One-time deductions stay, because the final pay may still take them.
 */
final class EndEmployeeBenefits
{
    /** @return array{benefits: int, deductions: int} how many were ended */
    public static function run(Employee $employee, string $lastDay): array
    {
        $benefits = EmployeeBenefit::where('employee_id', $employee->id)->whereIn('status', ['active', 'paused'])->update(['status' => 'cancelled', 'end_date' => $lastDay]);
        $deductions = EmployeeDeduction::where('employee_id', $employee->id)->where('kind', 'recurring')->whereIn('status', ['active', 'paused'])->update(['status' => 'cancelled', 'end_date' => $lastDay]);

        return ['benefits' => $benefits, 'deductions' => $deductions];
    }
}
