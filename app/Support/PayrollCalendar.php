<?php

namespace App\Support;

use App\Enums\PayDateType;
use App\Enums\PayrollFrequency;
use Carbon\CarbonImmutable;

/**
 * Turns a payroll group's frequency, cutoff rule and pay-date rule into concrete pay periods, and into the
 * short descriptions shown on the group card. Pure functions: nothing here reads or writes the database.
 *
 * Config shapes (validated by the group form requests):
 *   cutoff_config
 *     semi_monthly  {"periods":[{"start_day":1,"end_day":15},{"start_day":16,"end_day":"end"}]}
 *     monthly       {"start_day":1}   (26 means the 26th of last month to the 25th)
 *     weekly        {"start_weekday":1}   (1 = Monday ... 7 = Sunday)
 *     bi_weekly     {"start_weekday":1,"anchor_date":"2026-01-05"}   (any period start; every 14 days from it)
 *   pay_date_config
 *     {"type":"fixed_days","days":[15,30],"weekend_rule":"previous"}
 *     {"type":"last_working_day"}
 *     {"type":"weekday_after_cutoff","weekday":5,"weeks_after":1,"weekend_rule":"previous"}
 *
 * A period belongs to the year its cutoff ends in. Public holidays are not considered when moving a pay date off a
 * weekend: only Saturdays and Sundays.
 */
final class PayrollCalendar
{
    private const WEEKDAYS = [1 => 'Monday', 2 => 'Tuesday', 3 => 'Wednesday', 4 => 'Thursday', 5 => 'Friday', 6 => 'Saturday', 7 => 'Sunday'];

    /**
     * @param  array<string, mixed>  $cutoff
     * @param  array<string, mixed>  $payDates
     * @return list<array<string, mixed>>
     */
    public static function periods(PayrollFrequency $frequency, array $cutoff, array $payDates, int $year): array
    {
        $raw = match ($frequency) {
            PayrollFrequency::SemiMonthly => self::semiMonthly($cutoff, $year),
            PayrollFrequency::Monthly => self::monthly($cutoff, $year),
            PayrollFrequency::Weekly => self::stepped($cutoff, $year, 7),
            PayrollFrequency::BiWeekly => self::stepped($cutoff, $year, 14),
        };

        $out = [];
        foreach ($raw as $i => ['start' => $start, 'end' => $end, 'in_month' => $inMonth]) {
            $pay = self::payDate($payDates, $start, $end, $inMonth);
            $out[] = [
                'period_no' => $i + 1,
                'month' => $end->format('Y-m'),
                'period_in_month' => $inMonth + 1,
                'label' => $start->format('M j').' – '.$end->format('M j'),
                'cutoff_start' => $start->toDateString(),
                'cutoff_end' => $end->toDateString(),
                'pay_date' => $pay->toDateString(),
                'pay_day' => $pay->format('l'),
            ];
        }

        return $out;
    }

    /** @param array<string, mixed> $cutoff @return list<array{start: CarbonImmutable, end: CarbonImmutable, in_month: int}> */
    private static function semiMonthly(array $cutoff, int $year): array
    {
        $out = [];
        for ($month = 1; $month <= 12; $month++) {
            $first = CarbonImmutable::create($year, $month, 1);
            foreach ($cutoff['periods'] as $i => $period) {
                $end = $period['end_day'] === 'end' ? $first->endOfMonth()->startOfDay() : $first->day(min((int) $period['end_day'], $first->daysInMonth));
                $out[] = ['start' => $first->day(min((int) $period['start_day'], $first->daysInMonth)), 'end' => $end, 'in_month' => $i];
            }
        }

        return $out;
    }

    /** @param array<string, mixed> $cutoff @return list<array{start: CarbonImmutable, end: CarbonImmutable, in_month: int}> */
    private static function monthly(array $cutoff, int $year): array
    {
        $startDay = (int) ($cutoff['start_day'] ?? 1);
        $out = [];
        for ($month = 1; $month <= 12; $month++) {
            $first = CarbonImmutable::create($year, $month, 1);
            if ($startDay === 1) {
                $out[] = ['start' => $first, 'end' => $first->endOfMonth()->startOfDay(), 'in_month' => 0];

                continue;
            }
            // "26th": from the 26th of the previous month to the 25th of this one, labelled by the month it ends in.
            $previous = $first->subMonthNoOverflow();
            $out[] = ['start' => $previous->day(min($startDay, $previous->daysInMonth)), 'end' => $first->day(min($startDay - 1, $first->daysInMonth)), 'in_month' => 0];
        }

        return $out;
    }

    /** Weekly (7) or bi-weekly (14) periods that end in $year. @param array<string, mixed> $cutoff @return list<array{start: CarbonImmutable, end: CarbonImmutable, in_month: int}> */
    private static function stepped(array $cutoff, int $year, int $length): array
    {
        $jan1 = CarbonImmutable::create($year, 1, 1);

        if ($length === 14) {
            $anchor = CarbonImmutable::parse($cutoff['anchor_date'])->startOfDay();
            $start = $anchor->addDays(intdiv((int) $anchor->diffInDays($jan1, false), 14) * 14);
            if ($start->gt($jan1)) { // diffInDays truncates toward zero, so step back for dates before the anchor
                $start = $start->subDays(14);
            }
        } else {
            $weekday = (int) $cutoff['start_weekday'];
            $start = $jan1->subDays(($jan1->dayOfWeekIso - $weekday + 7) % 7);
        }

        $out = [];
        $seenInMonth = [];
        while (($end = $start->addDays($length - 1))->year <= $year) {
            if ($end->year === $year) {
                $key = $end->format('Y-m');
                $out[] = ['start' => $start, 'end' => $end, 'in_month' => $seenInMonth[$key] = ($seenInMonth[$key] ?? -1) + 1];
            }
            $start = $start->addDays($length);
        }

        return $out;
    }

    /** @param array<string, mixed> $config */
    private static function payDate(array $config, CarbonImmutable $start, CarbonImmutable $end, int $inMonth): CarbonImmutable
    {
        $rule = $config['weekend_rule'] ?? 'previous';

        return match (PayDateType::from($config['type'])) {
            PayDateType::FixedDays => self::adjust(self::dayOfMonth($end, (int) $config['days'][min($inMonth, count($config['days']) - 1)]), $rule),
            PayDateType::LastWorkingDay => self::adjust($end->endOfMonth()->startOfDay(), 'previous'),
            PayDateType::WeekdayAfterCutoff => self::adjust(self::weekdayAfter($end, (int) $config['weekday'], (int) ($config['weeks_after'] ?? 1)), $rule),
        };
    }

    /** Day N of the month $reference falls in; a day past the month's end (e.g. 30 in February) means its last day. */
    private static function dayOfMonth(CarbonImmutable $reference, int $day): CarbonImmutable
    {
        return $reference->startOfMonth()->day(min($day, $reference->daysInMonth));
    }

    /** First $weekday strictly after $date, then (weeks_after - 1) more weeks. */
    private static function weekdayAfter(CarbonImmutable $date, int $weekday, int $weeksAfter): CarbonImmutable
    {
        $next = $date->addDays(((($weekday - $date->dayOfWeekIso + 6) % 7) + 1));

        return $next->addWeeks(max($weeksAfter, 1) - 1);
    }

    /** Moves a Saturday / Sunday pay date to the Friday before ('previous'), the Monday after ('next'), or leaves it ('none'). */
    private static function adjust(CarbonImmutable $date, string $rule): CarbonImmutable
    {
        if ($rule === 'none' || $date->dayOfWeekIso < 6) {
            return $date;
        }

        return $rule === 'next'
            ? $date->addDays(8 - $date->dayOfWeekIso)
            : $date->subDays($date->dayOfWeekIso - 5);
    }

    /** @param array<string, mixed> $cutoff */
    public static function cutoffDisplay(PayrollFrequency $frequency, array $cutoff): string
    {
        return match ($frequency) {
            PayrollFrequency::SemiMonthly => collect($cutoff['periods'])
                ->map(fn (array $p, int $i) => 'Period '.($i + 1).': '.self::ordinal((int) $p['start_day']).' – '.self::dayLabel($p['end_day']))
                ->implode(' · '),
            PayrollFrequency::Monthly => ((int) ($cutoff['start_day'] ?? 1)) === 1
                ? '1st – End of Month'
                : self::ordinal((int) $cutoff['start_day']).' – '.self::ordinal((int) $cutoff['start_day'] - 1),
            PayrollFrequency::Weekly => self::WEEKDAYS[(int) $cutoff['start_weekday']].' – '.self::WEEKDAYS[(((int) $cutoff['start_weekday'] + 5) % 7) + 1],
            PayrollFrequency::BiWeekly => self::WEEKDAYS[(int) $cutoff['start_weekday']].' – '.self::WEEKDAYS[(((int) $cutoff['start_weekday'] + 5) % 7) + 1].' (every 2 weeks)',
        };
    }

    /** @param array<string, mixed> $config */
    public static function payDatesDisplay(array $config): string
    {
        return match (PayDateType::from($config['type'])) {
            PayDateType::FixedDays => collect($config['days'])->map(fn ($d) => self::ordinal((int) $d))->implode(' & '),
            PayDateType::LastWorkingDay => 'Last working day of the month',
            PayDateType::WeekdayAfterCutoff => ($weeks = (int) ($config['weeks_after'] ?? 1)) <= 1
                ? 'Following '.self::WEEKDAYS[(int) $config['weekday']]
                : self::WEEKDAYS[(int) $config['weekday']].', '.$weeks.' weeks after cutoff',
        };
    }

    private static function dayLabel(int|string $day): string
    {
        return $day === 'end' ? 'End of Month' : self::ordinal((int) $day);
    }

    public static function ordinal(int $n): string
    {
        $suffix = ($n % 100 >= 11 && $n % 100 <= 13) ? 'th' : ([1 => 'st', 2 => 'nd', 3 => 'rd'][$n % 10] ?? 'th');

        return $n.$suffix;
    }
}
