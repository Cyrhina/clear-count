<?php

namespace App\Enums;

/** When an employee's late count (Late #1, #2, …) starts again. Part of the Late Policy in Payroll Settings. */
enum LateCountingPeriod: string
{
    case CalendarYear = 'calendar_year';
    case Rolling = 'rolling';
    case Anniversary = 'anniversary';
    case Custom = 'custom';
    case Monthly = 'monthly';
}
