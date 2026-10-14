<?php

namespace App\Payroll;

use DateTimeImmutable;

/**
 * 13th month pay of one employee for a calendar year. Port of `thirteenthMonthService.ts` (computeThirteenthMonthLine, basicEarningsByMonth,
 * thirteenthMonthDeductionsFor): pure functions over domain-shaped arrays (types/domain.ts, camelCase), like `ComputeLine`.
 *
 * Pay = (basic salary earned in the months employed, less undertime and unpaid absences) / 12. Months are pro-rated by calendar days in the
 * hire and separation months. Non-taxable up to the ceiling; the excess is withheld at the employee's marginal annual rate.
 *
 * shortcut: the pay rate is the employee's current compensation for every month, not the rate in force each month. Use the compensation history
 * (EmployeeCompensation) per month when a raise in the year has to be reflected.
 */
final class ThirteenthMonth
{
    public const TAX_EXEMPT_CEILING = 90_000;

    private const WORKING_DAYS_PER_MONTH = 22;

    private const HOURS_PER_DAY = 8;

    private const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    /** @return array{start: string, end: string} the whole calendar year, whatever the generation date */
    public static function coverageFor(int $year): array
    {
        return ['start' => "{$year}-01-01", 'end' => "{$year}-12-31"];
    }

    /** @return array{from: string, to: string}|null the part of the coverage the employee was employed, or null if none */
    public static function activeWindow(array $employee, array $coverage): ?array
    {
        $e = $employee['employment'];
        $from = max($e['dateHired'], $coverage['start']);
        $separated = $e['dateSeparated'] ?? null;
        $to = $separated && $separated < $coverage['end'] ? $separated : $coverage['end'];

        return $from <= $to ? ['from' => $from, 'to' => $to] : null;
    }

    public static function isSeparated(array $employee): bool
    {
        return ! empty($employee['employment']['dateSeparated']) || $employee['employment']['status'] !== 'active';
    }

    /** Active and hired by the end of the window, or separated with a last day in or after it. Inactive without a separation date: excluded (the active period is unknown). */
    public static function isEligible(array $employee, array $coverage): bool
    {
        if ($employee['employment']['status'] !== 'active' && empty($employee['employment']['dateSeparated'])) {
            return false;
        }

        return self::activeWindow($employee, $coverage) !== null;
    }

    /**
     * Narrows employees to a batch's selection. A separated employee has a batch of their own; every other mode covers active employees only.
     *
     * @param  list<array>  $employees
     * @param  array{mode: string, employeeIds?: list<string>, payrollGroupId?: string, department?: string}  $selection
     * @param  array<string, list<string>>  $groupMembers  payroll group id => employee ids
     * @return list<array>
     */
    public static function applySelection(array $employees, array $selection, array $groupMembers = []): array
    {
        $ids = array_map('strval', $selection['employeeIds'] ?? []);
        if ($selection['mode'] === 'separated') {
            $separated = array_values(array_filter($employees, fn ($e) => self::isSeparated($e)));

            return $ids ? array_values(array_filter($separated, fn ($e) => in_array($e['id'], $ids, true))) : $separated;
        }
        $active = array_values(array_filter($employees, fn ($e) => ! self::isSeparated($e)));

        return array_values(match ($selection['mode']) {
            'employees' => array_filter($active, fn ($e) => in_array($e['id'], $ids, true)),
            'payroll_group' => array_filter($active, fn ($e) => in_array($e['id'], $groupMembers[(string) ($selection['payrollGroupId'] ?? '')] ?? [], true)),
            'department' => array_filter($active, fn ($e) => ($e['employment']['department'] ?? null) === ($selection['department'] ?? null)),
            default => $active,
        });
    }

    /** A key that is the same for two batches with the same recipients: generating again replaces the draft with the same key. */
    public static function selectionKey(?array $selection): string
    {
        $mode = $selection['mode'] ?? 'all';
        $ids = array_map('strval', $selection['employeeIds'] ?? []);
        sort($ids);

        return match ($mode) {
            'employees', 'separated' => "{$mode}:".implode(',', $ids),
            'payroll_group' => 'payroll_group:'.($selection['payrollGroupId'] ?? ''),
            'department' => 'department:'.($selection['department'] ?? ''),
            default => 'all',
        };
    }

    /**
     * Basic salary earned in each month of the active window: full months earn the monthly basic, the hire and separation months are pro-rated by
     * calendar days.
     *
     * @return list<array{key: string, label: string, detail: string, fraction: float, amount: float}>
     */
    public static function basicEarningsByMonth(array $employee, string $from, string $to): array
    {
        $monthlyBasic = RateBasis::monthlyEquivalent($employee);
        $start = new DateTimeImmutable($from);
        $end = new DateTimeImmutable($to);
        $months = [];
        for ($y = (int) $start->format('Y'), $m = (int) $start->format('n'); $y < (int) $end->format('Y') || ($y === (int) $end->format('Y') && $m <= (int) $end->format('n')); $m === 12 ? [$m, $y] = [1, $y + 1] : $m++) {
            $daysInMonth = (int) (new DateTimeImmutable("{$y}-{$m}-01"))->format('t');
            $firstDay = $y === (int) $start->format('Y') && $m === (int) $start->format('n') ? (int) $start->format('j') : 1;
            $lastDay = $y === (int) $end->format('Y') && $m === (int) $end->format('n') ? (int) $end->format('j') : $daysInMonth;
            $days = $lastDay - $firstDay + 1;
            $fraction = $days / $daysInMonth;
            $short = substr(self::MONTHS[$m - 1], 0, 3);
            $months[] = [
                'key' => "{$y}-{$m}", 'label' => self::MONTHS[$m - 1]." {$y}",
                'detail' => $fraction === 1.0 ? 'Full month' : "{$short} {$firstDay} – {$lastDay} · {$days} of {$daysInMonth} days",
                'fraction' => $fraction, 'amount' => Num::round0($monthlyBasic * $fraction),
            ];
        }

        return $months;
    }

    /**
     * Undertime (charged at the hourly rate) and unpaid absences (at the daily rate, an approved paid leave covers the day) in the window.
     *
     * @param  list<array{date: string, status: string, timeOut?: ?string, scheduleEndTime?: ?string}>  $attendance  this employee's records
     * @param  list<array{dateFrom: string, dateTo: string, dayPortion?: ?string}>  $paidLeaves  this employee's approved paid leave
     */
    public static function deductionsFor(array $employee, string $from, string $to, array $attendance, array $paidLeaves): array
    {
        $dailyRate = RateBasis::monthlyEquivalent($employee) / self::WORKING_DAYS_PER_MONTH;
        $hourlyRate = $dailyRate / self::HOURS_PER_DAY;
        $records = array_values(array_filter($attendance, fn ($r) => $r['date'] >= $from && $r['date'] <= $to));
        usort($records, fn ($a, $b) => strcmp($a['date'], $b['date']));

        $minutes = 0;
        $undertimeDates = [];
        foreach ($records as $r) {
            if ($r['status'] !== 'undertime' || empty($r['timeOut']) || empty($r['scheduleEndTime'])) {
                continue;
            }
            $short = max(0, self::minutesOf($r['scheduleEndTime']) - self::minutesOf($r['timeOut']));
            if ($short > 0) {
                $minutes += $short;
                $undertimeDates[] = $r['date'];
            }
        }
        $undertimeHours = Num::round2($minutes / 60);

        $absenceDates = [];
        $absenceDays = 0.0;
        foreach ($records as $r) {
            if ($r['status'] !== 'absent') {
                continue;
            }
            $covered = 0.0;
            foreach ($paidLeaves as $l) {
                if ($l['dateFrom'] <= $r['date'] && $l['dateTo'] >= $r['date']) {
                    $covered += in_array($l['dayPortion'] ?? 'full', ['half_am', 'half_pm'], true) ? 0.5 : 1;
                }
            }
            $unpaid = 1 - min(1, $covered);
            if ($unpaid > 0) {
                $absenceDates[] = $r['date'];
                $absenceDays += $unpaid;
            }
        }

        return [
            'hourlyRate' => $hourlyRate, 'dailyRate' => $dailyRate,
            'undertime' => ['hours' => $undertimeHours, 'dates' => $undertimeDates, 'amount' => Num::round0($undertimeHours * $hourlyRate)],
            'unpaidAbsences' => ['days' => $absenceDays, 'dates' => $absenceDates, 'amount' => Num::round0($absenceDays * $dailyRate)],
        ];
    }

    /**
     * One employee's line, or null when they were not employed in the coverage.
     *
     * @param  array<string, mixed>  $c  employee, coverage, attendance, paidLeaves, annualMarginalRate (the employee's marginal rate on the annual table)
     * @return array<string, mixed>|null the line in the shape of types/domain.ts ThirteenthMonthLine, with the breakdown the screens show
     */
    public static function computeLine(array $c): ?array
    {
        $employee = $c['employee'];
        $window = self::activeWindow($employee, $c['coverage']);
        if (! $window) {
            return null;
        }

        $months = self::basicEarningsByMonth($employee, $window['from'], $window['to']);
        $monthsCredited = Num::round2(array_sum(array_column($months, 'fraction')));
        $grossBasicEarned = array_sum(array_column($months, 'amount'));
        $d = self::deductionsFor($employee, $window['from'], $window['to'], $c['attendance'] ?? [], $c['paidLeaves'] ?? []);

        $annualBasicEarned = max(0, $grossBasicEarned - $d['undertime']['amount'] - $d['unpaidAbsences']['amount']);
        $pay = Num::round0($annualBasicEarned / 12);
        $taxableExcess = max(0, $pay - self::TAX_EXEMPT_CEILING);
        $tax = $taxableExcess > 0 ? Num::round0($taxableExcess * $c['annualMarginalRate']) : 0.0;

        return [
            'employeeId' => (string) $employee['id'], 'activeFrom' => $window['from'], 'activeTo' => $window['to'], 'separated' => self::isSeparated($employee),
            'monthsCredited' => $monthsCredited, 'grossBasicEarned' => $grossBasicEarned,
            'undertimeHours' => $d['undertime']['hours'], 'undertimeDeduction' => $d['undertime']['amount'],
            'unpaidAbsenceDays' => $d['unpaidAbsences']['days'], 'absenceDeduction' => $d['unpaidAbsences']['amount'],
            'annualBasicEarned' => $annualBasicEarned, 'thirteenthMonthPay' => $pay, 'taxableExcess' => $taxableExcess, 'withholdingTax' => $tax, 'netPay' => $pay - $tax,
            'months' => $months, 'hourlyRate' => $d['hourlyRate'], 'dailyRate' => $d['dailyRate'],
            'undertimeDates' => $d['undertime']['dates'], 'absenceDates' => $d['unpaidAbsences']['dates'],
        ];
    }

    private static function minutesOf(string $time): int
    {
        return (int) substr($time, 0, 2) * 60 + (int) substr($time, 3, 2);
    }
}
