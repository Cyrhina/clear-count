<?php

namespace App\Payroll;

/**
 * Pay rate type + base rate + the period's attendance or approved work logs to the basic (or output) pay of one line, and the daily and
 * hourly rates other steps use. Port of lib/payroll/rateBasis.ts. Employees, periods and records are arrays in the shapes of types/domain.ts.
 */
final class RateBasis
{
    public const STANDARD_WORKING_DAYS_PER_YEAR = 261;

    public const STANDARD_HOURS_PER_DAY = 8;

    public const WORKING_DAYS_PER_MONTH = 22;

    /** Used only when no attendance is recorded for the period, so daily and hourly pay never collapse to zero for lack of records. */
    private const FALLBACK_PAID_DAYS_PER_PERIOD = 11;

    public const HOURLY_WORK_LOG_LABEL = 'Hourly Compensation Pay';

    public const OUTPUT_WORK_LOG_LABEL = 'Output / Piece-Rate Pay';

    /** Paid days in the period: the days not marked absent, or a standard count when nothing is recorded. */
    public static function paidDays(string $employeeId, array $period, array $attendance, float $periodsPerMonth = 2): float
    {
        $records = array_filter($attendance, fn ($r) => (string) $r['employeeId'] === $employeeId && $r['date'] >= $period['startDate'] && $r['date'] <= $period['endDate']);
        if ($records === []) {
            return $periodsPerMonth === 2.0 ? self::FALLBACK_PAID_DAYS_PER_PERIOD : Num::round2(self::WORKING_DAYS_PER_MONTH / $periodsPerMonth);
        }

        return (float) count(array_filter($records, fn ($r) => $r['status'] !== 'absent'));
    }

    /**
     * The work logs of the employee dated inside the period, and the approved ones this run pays: not yet paid by another run.
     *
     * @return array{inRange: list<array>, payable: list<array>}
     */
    public static function workLogsForPeriod(string $employeeId, array $period, array $logs): array
    {
        $inRange = array_values(array_filter($logs, fn ($a) => (string) $a['employeeId'] === $employeeId && $a['workDate'] >= $period['startDate'] && $a['workDate'] <= $period['endDate']));
        $payable = array_values(array_filter($inRange, fn ($a) => $a['status'] === 'approved' && (empty($a['payrollPeriodId']) || (string) $a['payrollPeriodId'] === (string) $period['id'])));

        return ['inRange' => $inRange, 'payable' => $payable];
    }

    /**
     * Basic pay of one line for a run of `$periodsPerMonth` pay periods per month.
     *
     * Hourly and output-based employees with work logs in the period are paid from the approved ones only. Output-based pay comes only from
     * approved work logs: unlike the browser engine, which put in an invented quantity, an output-based employee with no logs is paid 0.
     *
     * @return array{amount: float, label: string}
     */
    public static function basicPay(array $employee, array $period, array $attendance, array $workLogs, float $periodsPerMonth = 2): array
    {
        $rate = (float) $employee['compensation']['basicPay'];
        $payType = $employee['compensation']['payType'];
        $id = (string) $employee['id'];

        if ($payType === 'hourly' || $payType === 'output_based') {
            $logs = self::workLogsForPeriod($id, $period, $workLogs);
            if ($logs['inRange'] !== [] || $payType === 'output_based') {
                $quantity = Num::round2(array_sum(array_column($logs['payable'], 'quantity')));

                return ['amount' => Num::round2($rate * $quantity), 'label' => $payType === 'hourly' ? self::HOURLY_WORK_LOG_LABEL : self::OUTPUT_WORK_LOG_LABEL];
            }
        }

        return match ($payType) {
            'monthly' => ['amount' => Num::round2($rate / $periodsPerMonth), 'label' => 'Basic Pay'],
            'semi_monthly' => ['amount' => Num::round2(($rate * 2) / $periodsPerMonth), 'label' => 'Basic Pay'],
            'daily' => ['amount' => Num::round2($rate * self::paidDays($id, $period, $attendance, $periodsPerMonth)), 'label' => 'Basic Pay'],
            'hourly' => ['amount' => Num::round2($rate * self::paidDays($id, $period, $attendance, $periodsPerMonth) * self::STANDARD_HOURS_PER_DAY), 'label' => 'Basic Pay'],
        };
    }

    /** The monthly figure the statutory and tax tables are applied to, made rate-type-aware. An output-based rate has no reliable baseline: 250 units is a placeholder. */
    public static function monthlyEquivalent(array $employee): float
    {
        $rate = (float) $employee['compensation']['basicPay'];
        $daysPerMonth = self::STANDARD_WORKING_DAYS_PER_YEAR / 12;

        return match ($employee['compensation']['payType']) {
            'monthly' => $rate,
            'semi_monthly' => $rate * 2,
            'daily' => $rate * $daysPerMonth,
            'hourly' => $rate * self::STANDARD_HOURS_PER_DAY * $daysPerMonth,
            'output_based' => $rate * 250,
        };
    }

    /** Daily rate for deductions and premiums: the daily rate itself, or the monthly-equivalent pay over 22 working days. */
    public static function dailyRate(array $employee): float
    {
        $rate = (float) $employee['compensation']['basicPay'];

        return match ($employee['compensation']['payType']) {
            'daily' => $rate,
            'hourly' => $rate * self::STANDARD_HOURS_PER_DAY,
            default => self::monthlyEquivalent($employee) / self::WORKING_DAYS_PER_MONTH,
        };
    }

    /** Hourly rate for overtime and night differential: the daily rate over 8 hours. */
    public static function hourlyRate(array $employee): float
    {
        return self::dailyRate($employee) / self::STANDARD_HOURS_PER_DAY;
    }
}
