<?php

namespace App\Support;

use App\Models\Employee;
use App\Models\ShiftAssignment;
use App\Models\WorkSchedule;
use Carbon\CarbonImmutable;

/**
 * Which schedule an employee follows on a date. First match wins:
 *   1. the roster entry for that day (a shift, or a rostered rest day),
 *   2. the employee's own work schedule,
 *   3. the schedule of the employee's payroll group.
 * Steps 2 and 3 rest on the days outside the schedule's working days. Nothing found: no schedule, not a rest day.
 */
final class ScheduleResolver
{
    /** @return array{schedule: WorkSchedule|null, is_rest_day: bool, source: 'roster'|'employee'|'payroll_group'|null} */
    public static function for(Employee $employee, string $date): array
    {
        $entry = ShiftAssignment::where('employee_id', $employee->id)->whereDate('date', $date)->first();
        if ($entry) {
            return ['schedule' => $entry->workSchedule, 'is_rest_day' => $entry->work_schedule_id === null, 'source' => 'roster'];
        }

        foreach (['employee' => $employee->workSchedule, 'payroll_group' => $employee->payrollGroup?->workSchedule] as $source => $schedule) {
            if ($schedule) {
                // days_of_week: 1 = Monday ... 7 = Sunday, the same as Carbon's isoWeekday().
                return ['schedule' => $schedule, 'is_rest_day' => ! in_array(CarbonImmutable::parse($date)->isoWeekday(), $schedule->days_of_week, true), 'source' => $source];
            }
        }

        return ['schedule' => null, 'is_rest_day' => false, 'source' => null];
    }
}
