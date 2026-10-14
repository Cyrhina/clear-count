<?php

namespace App\Payroll;

/** Which bonuses a run pays to an employee, and how much. Port of lib/payroll/bonusMatching.ts. */
final class BonusMatching
{
    /** Only bonuses set to "regular payroll" go on the regular payslip; the others are paid on their own payslips. */
    public static function includedInRegularPayroll(array $bonus): bool
    {
        return ($bonus['payoutMode'] ?? 'regular_payroll') === 'regular_payroll';
    }

    /** Whether the bonus's target (an employee, several, a department or everyone) covers the employee. */
    public static function appliesTo(array $bonus, array $employee): bool
    {
        return match ($bonus['targetType']) {
            'company' => true,
            'department' => ($employee['employment']['department'] ?? null) === ($bonus['targetDepartment'] ?? null),
            'employees' => in_array((string) $employee['id'], array_map('strval', $bonus['targetEmployeeIds'] ?? []), true),
            default => (string) $employee['id'] === (string) ($bonus['targetEmployeeId'] ?? ''),
        };
    }

    /** A percentage is a share of the employee's monthly-equivalent basic pay; any other type is a peso amount. */
    public static function amountFor(array $bonus, array $employee): float
    {
        return $bonus['bonusType'] === 'percentage' ? Num::round0(RateBasis::monthlyEquivalent($employee) * ($bonus['amount'] / 100)) : (float) $bonus['amount'];
    }

    /** Case and whitespace-insensitive match between a bonus's period label and the period's label. */
    public static function labelMatches(string $label, array $period): bool
    {
        return mb_strtolower(trim($label)) === mb_strtolower(trim($period['label']));
    }
}
