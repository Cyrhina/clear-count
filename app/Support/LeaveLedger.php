<?php

namespace App\Support;

use App\Models\Employee;
use App\Models\LeaveLedgerEntry;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\CarbonImmutable;

/**
 * An employee's leave credits, as a ledger: balance = sum of the entries, nothing edited in place.
 * Entries: grant (yearly credits), adjustment (HR add or set), used (an approved request, negative), reversal (a cancelled
 * approved request, positive), expiry (what carry-over does not keep at year end, negative).
 * Available credits = balance minus what pending requests already hold. Owner rules: the full yearly credits are granted at once,
 * pro-rated for the year the employee was hired; at year end the balance is carried over up to the type's maximum and the rest expires.
 */
final class LeaveLedger
{
    public static function balance(int $employeeId, int $leaveTypeId): float
    {
        return (float) LeaveLedgerEntry::where('employee_id', $employeeId)->where('leave_type_id', $leaveTypeId)->sum('days');
    }

    /** Days that pending requests already hold. */
    public static function pending(int $employeeId, int $leaveTypeId, ?int $exceptRequestId = null): float
    {
        return (float) LeaveRequest::where('employee_id', $employeeId)->where('leave_type_id', $leaveTypeId)->where('status', 'pending')
            ->when($exceptRequestId, fn ($q) => $q->where('id', '!=', $exceptRequestId))->sum('days');
    }

    /** Credit-limited: a paid type the employee has credits for. Unpaid types and types never granted have no cap. */
    public static function isLimited(int $employeeId, LeaveType $type): bool
    {
        return $type->is_paid && LeaveLedgerEntry::where('employee_id', $employeeId)->where('leave_type_id', $type->id)->exists();
    }

    /** Credits still free; null when the type is not credit-limited for the employee. */
    public static function available(int $employeeId, LeaveType $type, ?int $exceptRequestId = null): ?float
    {
        return self::isLimited($employeeId, $type) ? max(0, self::balance($employeeId, $type->id) - self::pending($employeeId, $type->id, $exceptRequestId)) : null;
    }

    public static function record(Employee $employee, LeaveType $type, string $entry, float $days, ?string $reason = null, ?User $by = null, ?LeaveRequest $request = null, ?string $date = null): LeaveLedgerEntry
    {
        $date ??= now()->toDateString();

        return LeaveLedgerEntry::create([
            'company_id' => $employee->company_id, 'employee_id' => $employee->id, 'leave_type_id' => $type->id, 'entry_type' => $entry, 'days' => $days,
            'leave_year' => (int) substr($date, 0, 4), 'effective_date' => $date, 'leave_request_id' => $request?->id, 'reason' => $reason, 'created_by' => $by?->id,
        ]);
    }

    /** Executive, managerial or rank and file: the app has no hierarchy field yet, so it comes from the position title (as the screens do). */
    public static function tierFor(Employee $employee): string
    {
        return match ($employee->employment['position'] ?? '') {
            'Manager' => 'executive',
            'Supervisor', 'Team Lead' => 'managerial',
            default => 'rank_and_file',
        };
    }

    /** The year's credits for an employee: the tier's amount (else the default), pro-rated to the half day for the year they were hired. */
    public static function yearlyCredits(Employee $employee, LeaveType $type, int $year): float
    {
        $credits = (float) ($type->tier_credits[self::tierFor($employee)] ?? $type->default_credits);
        $hired = $employee->employment['dateHired'] ?? null;
        if ($hired) {
            $hired = CarbonImmutable::parse($hired);
            if ($hired->year > $year) {
                return 0;
            }
            if ($hired->year === $year) {
                $credits = round($credits * (13 - $hired->month) / 12 * 2) / 2;
            }
        }

        return $credits;
    }

    /** Grants the year's credits for every leave type the employee has none of for that year yet. Safe to run again. Returns how many grants were made. */
    public static function grantYear(Employee $employee, int $year, ?User $by = null): int
    {
        $made = 0;
        foreach (LeaveType::where('company_id', $employee->company_id)->get() as $type) {
            $granted = LeaveLedgerEntry::where('employee_id', $employee->id)->where('leave_type_id', $type->id)->where('entry_type', 'grant')->where('leave_year', $year)->exists();
            $credits = self::yearlyCredits($employee, $type, $year);
            if ($granted || $credits <= 0) {
                continue;
            }
            self::record($employee, $type, 'grant', $credits, "{$year} credits", $by, null, "{$year}-01-01");
            $made++;
        }

        return $made;
    }

    /** Changes the balance to `$target` with one adjustment entry (none when it already is). */
    public static function setBalance(Employee $employee, LeaveType $type, float $target, ?User $by = null, string $reason = 'Credits set'): void
    {
        $diff = round($target - self::balance($employee->id, $type->id), 1);
        if ($diff !== 0.0) {
            self::record($employee, $type, 'adjustment', $diff, $reason, $by);
        }
    }

    /**
     * Year end for one employee and type: the balance is carried over up to `max_carry_over` and the rest expires.
     * Returns the days that expired. Run once a year (`leave:year-end`); an expiry already on record for the year is not repeated.
     */
    public static function closeYear(Employee $employee, LeaveType $type, int $year): float
    {
        $done = LeaveLedgerEntry::where('employee_id', $employee->id)->where('leave_type_id', $type->id)->where('entry_type', 'expiry')->where('leave_year', $year)->exists();
        if ($done || ! self::isLimited($employee->id, $type)) {
            return 0;
        }
        $expire = round(self::balance($employee->id, $type->id) - $type->max_carry_over, 1);
        if ($expire <= 0) {
            return 0;
        }
        self::record($employee, $type, 'expiry', -$expire, "{$year} credits above the carry-over limit expired", null, null, "{$year}-12-31");

        return $expire;
    }

    /**
     * Balances of many employees at once: [employeeId => [leaveTypeId => balance]].
     *
     * @param  list<int>  $employeeIds
     * @return array<int, array<int, float>>
     */
    public static function balancesFor(array $employeeIds): array
    {
        $out = [];
        foreach (LeaveLedgerEntry::whereIn('employee_id', $employeeIds)->selectRaw('employee_id, leave_type_id, sum(days) as total')->groupBy('employee_id', 'leave_type_id')->get() as $row) {
            $out[$row->employee_id][$row->leave_type_id] = round((float) $row->total, 1);
        }

        return $out;
    }
}
