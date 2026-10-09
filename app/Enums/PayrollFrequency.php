<?php

namespace App\Enums;

enum PayrollFrequency: string
{
    case Monthly = 'monthly';
    case SemiMonthly = 'semi_monthly';
    case Weekly = 'weekly';
    case BiWeekly = 'bi_weekly';

    public function label(): string
    {
        return match ($this) {
            self::Monthly => 'Monthly',
            self::SemiMonthly => 'Semi-monthly',
            self::Weekly => 'Weekly',
            self::BiWeekly => 'Bi-weekly',
        };
    }

    /** Deduction schedules that make sense for this frequency (see DeductionScheduleType). @return list<DeductionScheduleType> */
    public function deductionSchedules(): array
    {
        return match ($this) {
            self::Monthly => [DeductionScheduleType::FullMonthly],
            self::SemiMonthly => [DeductionScheduleType::Divided, DeductionScheduleType::FirstPeriod, DeductionScheduleType::LastPeriod, DeductionScheduleType::CustomSplit],
            self::Weekly, self::BiWeekly => [DeductionScheduleType::Divided, DeductionScheduleType::FirstPeriod, DeductionScheduleType::LastPeriod, DeductionScheduleType::SecondAndLastPeriod],
        };
    }
}
