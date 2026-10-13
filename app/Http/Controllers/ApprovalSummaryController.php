<?php

namespace App\Http\Controllers;

use App\Models\AttendanceAdjustment;
use App\Models\LeaveRequest;
use App\Models\OvertimeRecord;
use App\Models\WfhArrangement;
use App\Models\WorkLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** The approvals inbox: how many requests of each type wait for the signed-in user, limited to the types they may approve (and, for a manager, their branch). */
class ApprovalSummaryController extends Controller
{
    /** [key, label, permission, link, model] */
    private const TYPES = [
        ['leave', 'Leave requests', 'leave.approve', '/leave', LeaveRequest::class],
        ['attendance_adjustments', 'Attendance adjustments', 'attendance.approve', '/attendance', AttendanceAdjustment::class],
        ['wfh', 'Work from home requests', 'attendance.approve', '/attendance', WfhArrangement::class],
        ['overtime', 'Overtime and night differential', 'overtime.approve', '/overtime', OvertimeRecord::class],
        ['work_logs', 'Hours and output', 'compensation_approvals.manage', '/approvals', WorkLog::class],
    ];

    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $rows = collect(self::TYPES)->filter(fn (array $t) => $user->can($t[2]))
            ->map(fn (array $t) => ['type' => $t[0], 'label' => $t[1], 'link' => $t[3], 'pending' => $t[4]::where('status', 'pending')->count()])->values();

        return response()->json(['data' => $rows, 'total' => $rows->sum('pending')]);
    }
}
