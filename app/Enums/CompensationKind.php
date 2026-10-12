<?php

namespace App\Enums;

/** How a compensation type pays: a rate per period, per piece of output, a commission, or a mix. */
enum CompensationKind: string
{
    case MonthlyRate = 'monthly_rate';
    case SemiMonthlyRate = 'semi_monthly_rate';
    case DailyRate = 'daily_rate';
    case HourlyRate = 'hourly_rate';
    case OutputBased = 'output_based';
    case CommissionBased = 'commission_based';
    case Mixed = 'mixed';

    /** The kinds whose config carries a single basic rate. @return list<string> */
    public static function rateKinds(): array
    {
        return [self::MonthlyRate->value, self::SemiMonthlyRate->value, self::DailyRate->value, self::HourlyRate->value];
    }
}
