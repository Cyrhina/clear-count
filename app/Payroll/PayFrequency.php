<?php

namespace App\Payroll;

use DateTimeImmutable;

/**
 * How often a run pays and where a period sits in its month. Every monthly amount (statutory contributions, tax, loans, recurring
 * deductions) is split by these rules. Port of lib/payroll/payFrequency.ts.
 *
 * Monthly split per frequency: monthly ÷ 1, semi-monthly ÷ 2, weekly ÷ 4 (a 5th pay week collects nothing), daily ÷ the month's working
 * days (22, or 26 for a 6-day schedule), bi-weekly and custom ÷ the pay periods that occur in the month.
 *
 * A pay schedule is `['frequency', 'periodsPerMonth', 'periodsPerCycle', 'cutoffIndex', 'cutoffsCovered']`. Groups and periods are arrays in the
 * shapes of types/domain.ts (camelCase keys); a work schedule's `daysOfWeek` counts Sunday as 0.
 */
final class PayFrequency
{
    /** Which Payroll Settings deduction entry governs each loan type's collection schedule. */
    private const LOAN_CONFIG_NAME = [
        'sss_salary_loan' => 'SSS Salary Loan', 'sss_calamity_loan' => 'SSS Salary Loan',
        'pagibig_multipurpose_loan' => 'Pag-IBIG Loan', 'pagibig_calamity_loan' => 'Pag-IBIG Loan', 'pagibig_mp2' => 'Pag-IBIG Loan',
        'company_loan' => 'Company Loan', 'other_deduction' => 'Late/Undertime Adjustment',
    ];

    /** Loan types the company adds itself are collected like a Company Loan. */
    public static function loanConfigNameFor(string $loanType): string
    {
        return self::LOAN_CONFIG_NAME[$loanType] ?? self::LOAN_CONFIG_NAME['company_loan'];
    }

    /** Standard working days per month for a work schedule: 26 for 6-day weeks, 22 otherwise. */
    public static function workingDaysPerMonthFor(?array $workSchedule): int
    {
        return count($workSchedule['daysOfWeek'] ?? [1, 2, 3, 4, 5]) >= 6 ? 26 : 22;
    }

    /** Average pay periods per month for a frequency (custom groups use their configured count, default 2). */
    public static function periodsPerMonthFor(string $frequency, ?array $group = null, ?array $workSchedule = null): float
    {
        return match ($frequency) {
            'custom' => (float) ($group['periodsPerMonth'] ?? 2),
            'daily' => (float) self::workingDaysPerMonthFor($workSchedule),
            'weekly' => 52 / 12,
            'biweekly' => 26 / 12,
            'semi_monthly' => 2.0,
            default => 1.0,
        };
    }

    /** A run's frequency comes from its Payroll Group; a run without one is inferred from the period's length. */
    public static function frequencyForPeriod(array $period, ?array $group): string
    {
        if ($group) {
            return $group['frequency'];
        }
        $days = self::daysBetween($period['startDate'], $period['endDate']);

        return match (true) {
            $days <= 1 => 'daily',
            $days <= 9 => 'weekly',
            $days <= 14 => 'biweekly',
            $days <= 17 => 'semi_monthly',
            default => 'monthly',
        };
    }

    /**
     * The schedule a payroll line is computed on. A run for a Payroll Group uses that group's frequency. An "All Employees" run uses each
     * employee's own group frequency, and when it spans several of that employee's cutoffs the line covers each of them.
     *
     * @return array{frequency: string, periodsPerMonth: float, periodsPerCycle: int, cutoffIndex: int, cutoffsCovered: list<int>}
     */
    public static function payScheduleFor(array $period, ?array $group, ?array $workSchedule = null, ?array $employeeGroup = null): array
    {
        $runDays = self::daysBetween($period['startDate'], $period['endDate']);
        $useEmployeeGroup = ! $group && $employeeGroup && $runDays >= self::typicalPeriodDays($employeeGroup['frequency'], $employeeGroup);
        $effectiveGroup = $group ?? ($useEmployeeGroup ? $employeeGroup : null);
        $frequency = self::frequencyForPeriod($period, $effectiveGroup);
        $periodsPerMonth = self::periodsPerMonthFor($frequency, $effectiveGroup, $workSchedule);
        $ctx = ['group' => $effectiveGroup, 'workSchedule' => $workSchedule, 'anchorDate' => $period['startDate'], 'periodDays' => $runDays];
        $first = self::cutoffAt($frequency, $period['startDate'], $ctx);

        // Cutoffs of this month the run covers (a run is clamped to the month it starts in).
        $start = self::date($period['startDate']);
        $monthEnd = $start->modify('last day of this month');
        $endIso = self::date($period['endDate']) > $monthEnd ? $monthEnd->format('Y-m-d') : $period['endDate'];
        $last = self::cutoffAt($frequency, $endIso, $ctx);
        $covered = $useEmployeeGroup ? range($first['index'], max($first['index'], $last['index'])) : [$first['index']];

        return ['frequency' => $frequency, 'periodsPerMonth' => $periodsPerMonth, 'periodsPerCycle' => $first['count'], 'cutoffIndex' => $first['index'], 'cutoffsCovered' => $covered];
    }

    /**
     * The share of a monthly amount collected this period, per the Payroll Settings allocation method: equal split (every cutoff but the
     * last floored to the centavo, the last takes the remainder), one specific cutoff, or a custom percentage per cutoff. A run covering
     * several cutoffs collects the sum of each covered cutoff's share.
     *
     * @param  array{cutoffIndex: int, cutoffsCovered?: list<int>, periodsPerCycle: int}  $schedule
     * @param  array<string, mixed>|null  $config  a deduction type: allocationMethod, specificCutoffPeriod, customSplitPercentages
     */
    public static function allocateMonthly(float $monthlyAmount, array $schedule, ?array $config): float
    {
        $covered = ! empty($schedule['cutoffsCovered']) ? $schedule['cutoffsCovered'] : [$schedule['cutoffIndex']];
        $sum = 0.0;
        foreach ($covered as $index) {
            $sum += self::allocateOne($monthlyAmount, $schedule['periodsPerCycle'], $index, $config);
        }

        return Num::round2($sum);
    }

    private static function allocateOne(float $monthlyAmount, int $n, int $cutoffIndex, ?array $config): float
    {
        $method = $config['allocationMethod'] ?? 'equal_split';
        if ($n <= 1) {
            return Num::round2($monthlyAmount);
        }
        if ($method === 'specific_cutoff') {
            return $cutoffIndex === min($config['specificCutoffPeriod'] ?? $n, $n) ? Num::round2($monthlyAmount) : 0.0;
        }
        if ($method === 'custom') {
            return Num::round2($monthlyAmount * (($config['customSplitPercentages'][$cutoffIndex - 1] ?? 0) / 100));
        }
        if ($cutoffIndex > $n) {
            return 0.0;
        }
        $share = floor(($monthlyAmount / $n) * 100) / 100;

        return $cutoffIndex < $n ? $share : Num::round2($monthlyAmount - $share * ($n - 1));
    }

    private static function date(string $iso): DateTimeImmutable
    {
        return new DateTimeImmutable($iso.' 00:00:00');
    }

    private static function daysBetween(string $start, string $end): int
    {
        return (int) round((self::date($end)->getTimestamp() - self::date($start)->getTimestamp()) / 86400) + 1;
    }

    /** Typical length in days of one pay period, used to tell whether a run spans several of an employee's cutoffs. */
    private static function typicalPeriodDays(string $frequency, ?array $group): int
    {
        return match ($frequency) {
            'daily' => 1, 'weekly' => 7, 'biweekly' => 14, 'semi_monthly' => 15, 'monthly' => 28,
            default => (int) floor(30 / max(1, $group['periodsPerMonth'] ?? 2)),
        };
    }

    /**
     * Where `date` sits in its month for a frequency: the month's split divisor and the 1-based cutoff number.
     *
     * @return array{count: int, index: int}
     */
    private static function cutoffAt(string $frequency, string $date, array $ctx): array
    {
        $day = (int) self::date($date)->format('j');

        return match ($frequency) {
            'monthly' => ['count' => 1, 'index' => 1],
            'semi_monthly' => ['count' => 2, 'index' => $day <= 15 ? 1 : 2],
            // Split ÷ 4; the 5th pay week of a long month is index 5 and collects nothing.
            'weekly' => ['count' => 4, 'index' => min((int) ceil($day / 7), 5)],
            'daily' => ['count' => self::workingDaysPerMonthFor($ctx['workSchedule']), 'index' => self::workingDayIndex($date, $ctx['workSchedule'])],
            'biweekly' => self::periodsOccurringAt($ctx['anchorDate'], $date, 14),
            default => self::customCutoff($day, $date, $ctx),
        };
    }

    /** @return array{count: int, index: int} */
    private static function customCutoff(int $day, string $date, array $ctx): array
    {
        // The group's configured periods per month, else count the periods of this length in the month.
        if (! empty($ctx['group']['periodsPerMonth'])) {
            $count = max(1, (int) Num::round0((float) $ctx['group']['periodsPerMonth']));

            return ['count' => $count, 'index' => min(max((int) ceil(($day / 31) * $count), 1), $count)];
        }

        return self::periodsOccurringAt($ctx['anchorDate'], $date, $ctx['periodDays']);
    }

    /**
     * How many fixed-length pay periods (repeating every `stepDays` from the start) begin in the month, and which of them this one is.
     *
     * @return array{count: int, index: int}
     */
    private static function periodsOccurringInMonth(string $startDate, int $stepDays): array
    {
        $start = self::date($startDate);
        $day = (int) $start->format('j');
        $daysInMonth = (int) $start->format('t');
        $step = max(1, $stepDays);
        $earliest = (($day - 1) % $step) + 1;

        return ['count' => (int) floor(($daysInMonth - $earliest) / $step) + 1, 'index' => (int) floor(($day - $earliest) / $step) + 1];
    }

    /** @return array{count: int, index: int} */
    private static function periodsOccurringAt(string $anchorDate, string $date, int $stepDays): array
    {
        $anchor = self::periodsOccurringInMonth($anchorDate, $stepDays);
        $step = max(1, $stepDays);
        $offset = (int) floor(((int) self::date($date)->format('j') - (int) self::date($anchorDate)->format('j')) / $step);

        return ['count' => $anchor['count'], 'index' => min($anchor['index'] + max($offset, 0), $anchor['count'])];
    }

    /** 1-based working-day number of `date` within its month, per the work schedule's days of the week. */
    private static function workingDayIndex(string $date, ?array $workSchedule): int
    {
        $target = self::date($date);
        $workDays = $workSchedule['daysOfWeek'] ?? [1, 2, 3, 4, 5];
        $count = 0;
        for ($d = 1, $last = (int) $target->format('j'); $d <= $last; $d++) {
            if (in_array((int) $target->setDate((int) $target->format('Y'), (int) $target->format('n'), $d)->format('w'), $workDays, true)) {
                $count++;
            }
        }

        return max($count, 1);
    }
}
