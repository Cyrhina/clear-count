<?php

namespace App\Support;

use App\Enums\HolidayType;
use App\Models\Holiday;
use Carbon\CarbonImmutable;

/**
 * The Philippine national holiday calendar for any year, worked out from the law (RA 9492 and later proclamations).
 *
 * Included: the holidays whose date is fixed by law or follows a rule (Holy Week from Easter, National Heroes Day on the
 * last Monday of August). NOT included: holidays proclaimed fresh each year - Eid'l Fitr, Eid'l Adha, Chinese New Year,
 * EDSA anniversary and any one-off special non-working days. Add those as custom holidays when they are announced.
 */
final class PhilippineHolidays
{
    /**
     * @return list<array{name: string, date: string, type: HolidayType, description: string|null}> sorted by date
     */
    public static function forYear(int $year): array
    {
        $easter = self::easter($year);

        $raw = [
            ["New Year's Day", "$year-01-01", HolidayType::REGULAR],
            ['Maundy Thursday', $easter->subDays(3)->toDateString(), HolidayType::REGULAR],
            ['Good Friday', $easter->subDays(2)->toDateString(), HolidayType::REGULAR],
            ['Black Saturday', $easter->subDay()->toDateString(), HolidayType::SPECIAL_NON_WORKING],
            ['Araw ng Kagitingan', "$year-04-09", HolidayType::REGULAR],
            ['Labor Day', "$year-05-01", HolidayType::REGULAR],
            ['Independence Day', "$year-06-12", HolidayType::REGULAR],
            ['Ninoy Aquino Day', "$year-08-21", HolidayType::SPECIAL_NON_WORKING],
            ['National Heroes Day', CarbonImmutable::parse("last monday of august $year")->toDateString(), HolidayType::REGULAR],
            ["All Saints' Day", "$year-11-01", HolidayType::SPECIAL_NON_WORKING],
            ['Bonifacio Day', "$year-11-30", HolidayType::REGULAR],
            ['Feast of the Immaculate Conception', "$year-12-08", HolidayType::SPECIAL_NON_WORKING],
            ['Christmas Eve', "$year-12-24", HolidayType::SPECIAL_NON_WORKING],
            ['Christmas Day', "$year-12-25", HolidayType::REGULAR],
            ['Rizal Day', "$year-12-30", HolidayType::REGULAR],
            ["New Year's Eve", "$year-12-31", HolidayType::SPECIAL_NON_WORKING],
        ];

        $byDate = [];
        foreach ($raw as [$name, $date, $type]) {
            $byDate[$date][] = ['name' => $name, 'type' => $type];
        }
        ksort($byDate);

        $out = [];
        foreach ($byDate as $date => $holidays) {
            $regular = array_values(array_filter($holidays, fn ($h) => $h['type'] === HolidayType::REGULAR));
            $names = implode(' / ', array_column($holidays, 'name'));

            // Two regular holidays on one date (e.g. Maundy Thursday on Apr 9, 2020) is a double holiday: 300% when worked.
            $type = count($regular) >= 2 ? HolidayType::DOUBLE_HOLIDAY : ($regular ? HolidayType::REGULAR : $holidays[0]['type']);

            $out[] = [
                'name' => $names,
                'date' => $date,
                'type' => $type,
                'description' => count($holidays) > 1 ? 'Falls on the same date as another holiday.' : null,
            ];
        }

        return $out;
    }

    /**
     * Makes sure the shared system rows (company_id NULL) exist for the year and returns them. Safe to call repeatedly.
     *
     * @return \Illuminate\Support\Collection<int, Holiday>
     */
    public static function ensureSystemDefaults(int $year): \Illuminate\Support\Collection
    {
        foreach (self::forYear($year) as $h) {
            Holiday::withTrashed()->systemDefaults()->firstOrCreate(
                ['date' => $h['date'], 'name' => $h['name']],
                ['type' => $h['type'], 'scope' => 'national', 'pay_rate_multiplier' => $h['type']->defaultMultiplier(), 'description' => $h['description'], 'is_default' => true],
            );
        }

        return Holiday::systemDefaults()->forYear($year)->orderBy('date')->get();
    }

    /** Gregorian Easter Sunday (Meeus/Jones/Butcher). Done by hand because PHP's easter_date() needs the optional calendar extension. */
    private static function easter(int $year): CarbonImmutable
    {
        $a = $year % 19;
        $b = intdiv($year, 100);
        $c = $year % 100;
        $d = intdiv($b, 4);
        $e = $b % 4;
        $f = intdiv($b + 8, 25);
        $g = intdiv($b - $f + 1, 3);
        $h = (19 * $a + $b - $d - $g + 15) % 30;
        $i = intdiv($c, 4);
        $k = $c % 4;
        $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7;
        $m = intdiv($a + 11 * $h + 22 * $l, 451);
        $month = intdiv($h + $l - 7 * $m + 114, 31);
        $day = (($h + $l - 7 * $m + 114) % 31) + 1;

        return CarbonImmutable::create($year, $month, $day);
    }
}
