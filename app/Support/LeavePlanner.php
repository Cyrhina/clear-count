<?php

namespace App\Support;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\CarbonImmutable;

/** Works out what a leave request would use and whether it can be filed: working days, overlaps, enough credits. */
final class LeavePlanner
{
    /**
     * Credits the request uses: the employee's working days in the range (rest days and holidays do not count), or 0.5 for a half day.
     */
    public static function days(Employee $employee, string $from, string $to, string $portion): float
    {
        $days = 0.0;
        for ($d = CarbonImmutable::parse($from); $d->toDateString() <= $to; $d = $d->addDay()) {
            $date = $d->toDateString();
            if (! ScheduleResolver::for($employee, $date)['is_rest_day'] && ! AttendanceStatusResolver::isHoliday($employee, $date)) {
                $days += $portion === 'full' ? 1 : 0.5;
            }
        }

        return $days;
    }

    /** @return array{days: float, available: float|null, error?: string} */
    public static function plan(Employee $employee, LeaveType $type, string $from, string $to, string $portion, ?int $exceptRequestId = null): array
    {
        $to = $portion === 'full' ? $to : $from; // a half day is one date
        $available = LeaveLedger::available($employee->id, $type, $exceptRequestId);
        if ($to < $from) {
            return ['days' => 0.0, 'available' => $available, 'error' => 'The end date must be on or after the start date.'];
        }
        if (CarbonImmutable::parse($from)->diffInDays($to) > 365) {
            return ['days' => 0.0, 'available' => $available, 'error' => 'A leave request can cover a year at most.'];
        }

        $days = self::days($employee, $from, $to, $portion);
        $base = ['days' => $days, 'available' => $available];
        if ($days === 0.0) {
            return [...$base, 'error' => $portion === 'full' ? 'These dates are all rest days or days off, so there is nothing to file leave for.' : 'That date is a rest day or a holiday, so a half day cannot be filed for it.'];
        }

        $clash = LeaveRequest::where('employee_id', $employee->id)->whereIn('status', ['pending', 'approved'])
            ->whereDate('date_from', '<=', $to)->whereDate('date_to', '>=', $from)
            ->when($exceptRequestId, fn ($q) => $q->where('id', '!=', $exceptRequestId))->get()
            // The only allowed overlap: a morning half day and an afternoon half day on the same single date.
            ->first(fn (LeaveRequest $r) => ! ($portion !== 'full' && $r->day_portion !== 'full' && $r->date_from->toDateString() === $from && $r->day_portion !== $portion));
        if ($clash) {
            $span = $clash->date_from->equalTo($clash->date_to) ? $clash->date_from->toDateString() : $clash->date_from->toDateString().' to '.$clash->date_to->toDateString();

            return [...$base, 'error' => "This employee already has {$clash->status} leave on {$span}."];
        }

        if ($available !== null && $days > $available) {
            return [...$base, 'error' => "Not enough {$type->name} credits: {$available} day".($available === 1.0 ? '' : 's')." available, {$days} requested."];
        }

        return $base;
    }
}
