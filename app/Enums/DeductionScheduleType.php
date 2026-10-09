<?php

namespace App\Enums;

/** When a group's monthly statutory and recurring deductions (SSS, PhilHealth, Pag-IBIG, tax, loans) are taken across the month's pay runs. */
enum DeductionScheduleType: string
{
    case Divided = 'DIVIDED';
    case FirstPeriod = 'FIRST_PERIOD';
    case LastPeriod = 'LAST_PERIOD';
    case SecondAndLastPeriod = 'SECOND_AND_LAST_PERIOD';
    case CustomSplit = 'CUSTOM_SPLIT';
    case FullMonthly = 'FULL_MONTHLY';

    /** Label as shown on the group card; "Divided" reads differently for semi-monthly groups. */
    public function label(PayrollFrequency $frequency): string
    {
        return match ($this) {
            self::Divided => $frequency === PayrollFrequency::SemiMonthly
                ? 'Divided Equally (50% Period 1 / 50% Period 2)'
                : 'Divided Equally Across All Pay Periods',
            self::FirstPeriod => $frequency === PayrollFrequency::SemiMonthly ? '1st Pay Period Only' : 'First Pay Period of the Month',
            self::LastPeriod => $frequency === PayrollFrequency::SemiMonthly ? '2nd / Last Pay Period Only' : 'Last Pay Period of the Month',
            self::SecondAndLastPeriod => '2nd & Last Pay Periods',
            self::CustomSplit => 'Custom Split (statutory on Period 1, loans and voluntary on Period 2)',
            self::FullMonthly => 'Full Amount on Monthly Pay Date',
        };
    }
}
