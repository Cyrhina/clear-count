<?php

namespace App\Actions;

use App\Models\AttendanceAdjustment;
use App\Support\AttendanceStatusResolver;
use App\Models\Employee;

/** Writes an approved adjustment onto its attendance record and works the status out again from the schedule of that day. */
class ApplyAttendanceAdjustment
{
    public function __invoke(AttendanceAdjustment $adjustment): void
    {
        $record = $adjustment->record;
        $employee = Employee::withoutGlobalScopes()->findOrFail($record->employee_id);
        $in = $this->hhmm($adjustment->requested_time_in);
        $out = $this->hhmm($adjustment->requested_time_out);

        $record->update([
            ...AttendanceStatusResolver::forEmployeeDay($employee, $record->date->toDateString(), $in, $out),
            'time_in' => $in, 'time_out' => $out, 'source' => 'adjustment', 'auto_recorded' => false, 'wfh_id' => null,
        ]);
    }

    private function hhmm(?string $time): ?string
    {
        return $time === null ? null : substr($time, 0, 5);
    }
}
