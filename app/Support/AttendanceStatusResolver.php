<?php

namespace App\Support;

use App\Models\Employee;
use App\Models\Holiday;
use App\Models\WorkSchedule;

/** Late, undertime or present for one day's punches against a shift (ports lib/attendance/status.ts), and whether a day can be logged. */
final class AttendanceStatusResolver
{
    /** @return array{status: 'present'|'late'|'undertime', late_minutes: int, undertime_minutes: int} */
    public static function forPunch(string $timeIn, ?string $timeOut, string $start, string $end, int $graceMinutes): array
    {
        $in = self::minutes($timeIn);
        $startM = self::minutes($start);
        $endM = self::minutes($end);
        $out = $timeOut === null ? null : self::minutes($timeOut);

        // A night shift ends the next morning: both the end and an early-morning punch-out sit on the following day.
        if ($endM <= $startM) {
            $endM += 1440;
            if ($out !== null && $out < $startM) {
                $out += 1440;
            }
        }

        $late = max(0, $in - $startM);
        $under = $out !== null ? max(0, $endM - $out) : 0;
        $status = $in > $startM + $graceMinutes ? 'late' : ($under > 0 ? 'undertime' : 'present');

        return ['status' => $status, 'late_minutes' => $status === 'late' ? $late : 0, 'undertime_minutes' => $under];
    }

    /** Status of a punch for this employee and date, from the schedule they follow that day. No schedule: present. */
    public static function forEmployeeDay(Employee $employee, string $date, ?string $timeIn, ?string $timeOut, ?WorkSchedule $schedule = null): array
    {
        if ($timeIn === null) {
            return ['status' => 'absent', 'late_minutes' => 0, 'undertime_minutes' => 0];
        }
        $schedule ??= ScheduleResolver::for($employee, $date)['schedule'];
        if (! $schedule) {
            return ['status' => 'present', 'late_minutes' => 0, 'undertime_minutes' => 0];
        }

        return self::forPunch($timeIn, $timeOut, $schedule->start_time, $schedule->end_time, $schedule->grace_period_minutes);
    }

    /** True when the company has a holiday that day that covers the employee's branch. */
    public static function isHoliday(Employee $employee, string $date): bool
    {
        return Holiday::activeForCompany($employee->company_id)->whereDate('date', $date)->get()
            ->contains(fn (Holiday $h) => $employee->branch_id === null || $h->appliesToBranch($employee->branch_id));
    }

    private static function minutes(string $time): int
    {
        [$h, $m] = array_map('intval', explode(':', $time));

        return $h * 60 + $m;
    }
}
