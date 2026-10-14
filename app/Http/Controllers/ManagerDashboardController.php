<?php

namespace App\Http\Controllers;

use App\Models\AttendanceAdjustment;
use App\Models\AttendanceRecord;
use App\Models\Branch;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\OvertimeRecord;
use App\Models\WorkLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** What a manager's team looks like today and what waits on them. Every query is cut down by the model scopes, so a manager sees their branch only. */
class ManagerDashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $today = now()->toDateString();
        $active = Employee::where('status', 'active');
        $attendanceDate = AttendanceRecord::where('date', '<=', $today)->max('date');
        $attendanceDate = $attendanceDate ? substr((string) $attendanceDate, 0, 10) : $today;

        $day = AttendanceRecord::with('employee:id,name')->whereDate('date', $attendanceDate)->get();
        $status = fn (string $s) => $day->where('status', $s)->count();
        $approved = fn () => LeaveRequest::where('status', 'approved');
        $pending = fn (string $model, array $where = []) => $model::where('status', 'pending')->where($where)->count();

        return response()->json(['data' => [
            'team_name' => $request->user()->branch_id ? (Branch::find($request->user()->branch_id)?->name ?? 'My Team') : 'My Team',
            'headcount' => (clone $active)->count(),
            'departments' => (clone $active)->distinct()->count('department'),
            'attendance_date' => $attendanceDate,
            'present' => $day->where('status', '!=', 'absent')->count(),
            'late' => $status('late'),
            'undertime' => $status('undertime'),
            'absent' => $status('absent'),
            'missing_records' => $day->where('status', '!=', 'absent')->filter(fn ($r) => ! $r->time_in || ! $r->time_out)->count(),
            'on_leave_today' => $approved()->whereDate('date_from', '<=', $today)->whereDate('date_to', '>=', $today)->count(),
            'pending' => [
                'leave' => $pending(LeaveRequest::class),
                'overtime' => OvertimeRecord::where('status', 'pending')->where('type', '!=', 'night_diff')->count(),
                'night_diff' => $pending(OvertimeRecord::class, ['type' => 'night_diff']),
                'hours' => $pending(WorkLog::class, ['type' => 'hourly']),
                'output' => $pending(WorkLog::class, ['type' => 'output']),
                'corrections' => $pending(AttendanceAdjustment::class),
            ],
            'upcoming_leave' => $approved()->with(['employee:id,name', 'leaveType:id,name'])->whereDate('date_to', '>=', $today)->whereDate('date_from', '<=', now()->addDays(14)->toDateString())
                ->orderBy('date_from')->limit(6)->get()
                ->map(fn (LeaveRequest $l) => ['id' => $l->id, 'employee' => $l->employee?->name, 'leave_type' => $l->leaveType?->name ?? 'Leave', 'date_from' => $l->date_from->toDateString(), 'date_to' => $l->date_to->toDateString(), 'days' => (float) $l->days, 'half_day' => ['half_am' => 'AM', 'half_pm' => 'PM'][$l->day_portion] ?? null])->all(),
            // Absent first, then late, then undertime; the names in order inside each.
            'attention' => $day->whereIn('status', ['absent', 'late', 'undertime'])->sortBy(fn ($r) => $r->status.'|'.$r->employee?->name)->take(8)->values()
                ->map(fn ($r) => ['id' => $r->id, 'employee' => $r->employee?->name, 'status' => $r->status])->all(),
        ]]);
    }
}
