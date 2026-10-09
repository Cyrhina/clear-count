<?php

namespace App\Enums;

enum PayDateType: string
{
    /** Specific days of the month, one per pay period (e.g. 15 and 30). A day past the month's end means its last day. */
    case FixedDays = 'fixed_days';

    /** Monthly groups: the last working day of the month. */
    case LastWorkingDay = 'last_working_day';

    /** Weekly / bi-weekly groups: a weekday after the cutoff ends (e.g. "following Friday"). */
    case WeekdayAfterCutoff = 'weekday_after_cutoff';
}
