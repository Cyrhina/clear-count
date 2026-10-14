<?php

namespace App\Support;

use App\Models\AttendanceAdjustment;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\OvertimeRecord;
use App\Models\User;
use App\Models\WfhArrangement;
use App\Models\WorkLog;
use App\Notifications\ApprovalNotice;
use Illuminate\Database\Eloquent\Model;

/**
 * Stored notifications for the approval flow. A new pending request notifies the people who can approve it (a manager only for
 * their own branch); a decision notifies whoever filed it and the employee it is for. Hooked once: `watch()` on model creation
 * and a call from `Approval::decide`, so every approval type is covered from one place.
 */
final class Notifier
{
    /** Per model: what to call it, the permission that approves it, where it lives in the app, and the tab to open there. */
    private const KINDS = [
        AttendanceAdjustment::class => ['attendance adjustment', 'attendance.approve', '/attendance', 'adjustments'],
        WfhArrangement::class => ['work from home request', 'attendance.approve', '/attendance', 'wfh'],
        LeaveRequest::class => ['leave request', 'leave.approve', '/leave', null],
        OvertimeRecord::class => ['overtime request', 'overtime.approve', '/overtime', null],
        WorkLog::class => ['work log', 'compensation_approvals.manage', '/approvals', null],
    ];

    /** Notifies the approvers when a pending request of one of these models is created. */
    public static function watch(): void
    {
        foreach (array_keys(self::KINDS) as $model) {
            $model::created(fn (Model $request) => self::requested($request));
        }
    }

    public static function requested(Model $request): void
    {
        // The column default is not on a model that was just created.
        $status = $request->status ?? $request->newQuery()->withoutGlobalScopes()->whereKey($request->getKey())->value('status');
        if ($status !== 'pending' || self::isRepeatInBatch($request, 'pending')) {
            return;
        }

        [$label, $permission, $link, $tab] = self::KINDS[$request::class];
        $employee = Employee::withoutGlobalScopes()->find($request->employee_id);
        if (! $employee) {
            return;
        }

        $approvers = User::where('company_id', $employee->company_id)->where('is_active', true)->permission($permission)->get()
            ->filter(fn (User $u) => $u->id !== $request->requested_by && (! $u->hasRole('manager') || ! $u->branch_id || $u->branch_id === $employee->branch_id));

        $a = preg_match('/^[aeiou]/i', $label) ? 'an' : 'a';
        $notice = new ApprovalNotice("{$employee->name} filed {$a} {$label} awaiting your approval", 'warning', $link, $tab, $request->getKey());
        $approvers->each(fn (User $u) => $u->notify($notice));
    }

    /** Tells whoever filed the request, and the employee it is for, how it was decided. */
    public static function decided(Model $request): void
    {
        // Bonuses and other approvals without an employee have no notice yet.
        if (! isset(self::KINDS[$request::class])) {
            return;
        }

        if (self::isRepeatInBatch($request, $request->status)) {
            return;
        }

        [$label, , $link, $tab] = self::KINDS[$request::class];
        $notice = new ApprovalNotice("Your {$label} was {$request->status}", $request->status === 'approved' ? 'success' : 'danger', $link, $tab, $request->getKey());

        $recipients = User::whereIn('id', array_filter([$request->requested_by]))
            ->orWhere(fn ($q) => $q->where('employee_id', $request->employee_id)->where('company_id', $request->company_id))->get()
            ->unique('id')->reject(fn (User $u) => $u->id === $request->decided_by);
        $recipients->each(fn (User $u) => $u->notify($notice));
    }

    /** A work-from-home request of many dates is one row per date: only the first row of a batch with this status speaks for it. */
    private static function isRepeatInBatch(Model $request, string $status): bool
    {
        return $request instanceof WfhArrangement && $request->batch_id
            && WfhArrangement::withoutGlobalScopes()->where('batch_id', $request->batch_id)->where('status', $status)->where('id', '<', $request->id)->exists();
    }
}
