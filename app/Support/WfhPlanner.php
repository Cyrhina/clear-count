<?php

namespace App\Support;

use App\Models\AttendanceRecord;
use App\Models\Employee;
use App\Models\WfhArrangement;
use App\Models\WorkSchedule;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Work-from-home rules (ports wfhService.ts). Which arrangement decides a day:
 * approved leave / rest day / holiday  >  temporary  >  standing  >  onsite. Approved arrangements fill the day's attendance
 * by themselves (`materialize`): the daily command and a backfill when an arrangement is approved both call it.
 */
final class WfhPlanner
{
    /** How far back approved arrangements are filled in. */
    public const MATERIALIZE_DAYS = 92;

    /** Open-ended standing arrangements are previewed over this many days. */
    public const PREVIEW_DAYS = 56;

    /** Does the arrangement cover the date (range and chosen weekdays)? Leave, rest days and holidays are judged elsewhere. */
    public static function covers(WfhArrangement $a, string $date): bool
    {
        if ($date < $a->date_from->toDateString() || ($a->date_to && $date > $a->date_to->toDateString())) {
            return false;
        }

        return $a->days_of_week === [] || in_array(CarbonImmutable::parse($date)->dayOfWeek, $a->days_of_week, true);
    }

    /**
     * The approved arrangement that decides an employee's day: a temporary one beats a standing one; the newest wins a tie.
     *
     * @param  Collection<int, WfhArrangement>  $approved  approved arrangements of that employee
     */
    public static function ownerFor(Collection $approved, string $date): ?WfhArrangement
    {
        return $approved->filter(fn (WfhArrangement $a) => self::covers($a, $date))
            ->sortBy([fn ($a, $b) => ($b->kind === 'temporary') <=> ($a->kind === 'temporary'), fn ($a, $b) => $b->id <=> $a->id])
            ->first();
    }

    /** A schedule's own four times: lunch starts three hours into the shift, and lasts the schedule's break. */
    public static function defaultTimes(WorkSchedule $schedule): array
    {
        [$h, $m] = array_map('intval', explode(':', $schedule->start_time));
        $out = ($h * 60 + $m + 180) % 1440;
        $back = ($out + $schedule->break_minutes) % 1440;
        $hhmm = fn (int $n) => sprintf('%02d:%02d', intdiv($n, 60), $n % 60);

        return ['timeIn' => substr($schedule->start_time, 0, 5), 'breakOut' => $hhmm($out), 'breakIn' => $hhmm($back), 'timeOut' => substr($schedule->end_time, 0, 5)];
    }

    /**
     * Fills attendance for approved WFH days that have come (or are today) and have no record yet. Never touches a day that
     * already has a record: real punches win. Safe to run again. Returns how many days were filled in.
     */
    public static function materialize(?WfhArrangement $only = null): int
    {
        $today = CarbonImmutable::today();
        $horizon = $today->subDays(self::MATERIALIZE_DAYS)->toDateString();
        $created = 0;

        $arrangements = $only ? collect([$only]) : WfhArrangement::where('status', 'approved')->where('times', '!=', 'self_log')->get();
        foreach ($arrangements->groupBy('employee_id') as $employeeId => $mine) {
            $employee = Employee::with(['workSchedule', 'payrollGroup.workSchedule'])->find($employeeId);
            if (! $employee || $employee->status !== 'active') {
                continue;
            }
            $approved = WfhArrangement::where('employee_id', $employeeId)->where('status', 'approved')->get();

            foreach ($mine as $a) {
                if ($a->status !== 'approved' || $a->times === 'self_log') {
                    continue;
                }
                $from = max($a->date_from->toDateString(), $horizon);
                $to = min($a->date_to?->toDateString() ?? $today->toDateString(), $today->toDateString());
                if ($from > $to) {
                    continue;
                }
                $have = AttendanceRecord::where('employee_id', $employeeId)->whereBetween('date', [$from, $to])->get()->keyBy(fn ($r) => $r->date->toDateString());

                for ($d = CarbonImmutable::parse($from); $d->toDateString() <= $to; $d = $d->addDay()) {
                    $date = $d->toDateString();
                    $existing = $have->get($date);
                    // A real punch or hand-logged day stays; so does a day another arrangement still owns. A day an older arrangement filled in
                    // is taken over when this one now decides it (a temporary beats a standing one).
                    if (($existing && (! $existing->auto_recorded || $existing->wfh_id === $a->id)) || self::ownerFor($approved, $date)?->id !== $a->id || AttendanceStatusResolver::isHoliday($employee, $date)) {
                        continue;
                    }
                    $resolved = ScheduleResolver::for($employee, $date);
                    if (! $resolved['schedule'] || $resolved['is_rest_day']) {
                        continue;
                    }
                    $schedule = $resolved['schedule'];
                    $times = $a->times === 'custom' && $a->custom ? $a->custom : self::defaultTimes($schedule);
                    // Default times are the schedule's own, so they are never late; fixed times are checked like any punch.
                    $status = $a->times === 'custom'
                        ? AttendanceStatusResolver::forPunch($times['timeIn'], $times['timeOut'], $schedule->start_time, $schedule->end_time, $schedule->grace_period_minutes)
                        : ['status' => 'present', 'late_minutes' => 0, 'undertime_minutes' => 0];

                    $existing?->delete();
                    AttendanceRecord::create([
                        ...$status,
                        'company_id' => $a->company_id, 'employee_id' => $employeeId, 'work_schedule_id' => $schedule->id, 'date' => $date,
                        'time_in' => $times['timeIn'], 'time_out' => $times['timeOut'], 'break_out' => $times['breakOut'] ?? null, 'break_in' => $times['breakIn'] ?? null,
                        'work_type' => 'wfh', 'source' => 'wfh', 'auto_recorded' => true, 'wfh_id' => $a->id,
                    ]);
                    $created++;
                }
            }
        }

        return $created;
    }

    /** Removes the days arrangements filled in by themselves (after `$after`, when given). Real punches and hand-logged days stay. */
    public static function removeAutoDays(array $arrangementIds, ?string $after = null): void
    {
        AttendanceRecord::where('auto_recorded', true)->whereIn('wfh_id', $arrangementIds)
            ->when($after, fn ($q) => $q->where('date', '>', $after))->delete();
    }
}
