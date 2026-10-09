<?php

namespace App\Enums;

enum HolidayType: string
{
    case REGULAR = 'regular';
    case SPECIAL_NON_WORKING = 'special_non_working';
    case SPECIAL_WORKING = 'special_working';
    case DOUBLE_HOLIDAY = 'double_holiday';

    public function label(): string
    {
        return match ($this) {
            self::REGULAR => 'Regular Holiday',
            self::SPECIAL_NON_WORKING => 'Special Non-Working Day',
            self::SPECIAL_WORKING => 'Special Working Day',
            self::DOUBLE_HOLIDAY => 'Double Holiday',
        };
    }

    /** Pay as a multiple of the daily rate when the employee works that day (DOLE holiday pay rules). */
    public function defaultMultiplier(): float
    {
        return match ($this) {
            self::REGULAR => 2.00,              // 100% additional
            self::SPECIAL_NON_WORKING => 1.30,  // 30% additional
            self::SPECIAL_WORKING => 1.00,      // ordinary day: tracked for attendance only
            self::DOUBLE_HOLIDAY => 3.00,       // two regular holidays on one date
        };
    }
}
