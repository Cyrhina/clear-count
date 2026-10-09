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

    /**
     * Which row of Payroll Settings > Overtime & Holiday Rates pays this type when worked. The rates themselves live
     * there (one place, edited by the company); a holiday only says what type of day it is. Null: an ordinary day.
     */
    public function rateKey(): ?string
    {
        return match ($this) {
            self::REGULAR => 'regular_holiday_worked',
            self::SPECIAL_NON_WORKING => 'special_holiday_worked',
            self::SPECIAL_WORKING => null,
            self::DOUBLE_HOLIDAY => 'double_holiday_worked',
        };
    }
}
