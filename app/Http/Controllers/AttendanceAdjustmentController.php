<?php

namespace App\Http\Controllers;

use App\Actions\ApplyAttendanceAdjustment;
use App\Exceptions\ConflictException;
use App\Models\AttendanceAdjustment;
use App\Models\AttendanceRecord;
use App\Models\Employee;
use App\Support\ActivityLogger;
use App\Support\Approval;
use App\Support\ScheduleResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Requests to correct a day's punches, and their approval. */
class AttendanceAdjustmentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => AttendanceAdjustment::with(['record:id,date', 'decider:id,name'])->latest()->get()]);
    }

    /** From an existing record, or from an employee and date (a day with no record yet becomes an absent one). */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'attendance_record_id' => ['required_without:employee_id', 'nullable', 'integer'],
            'employee_id' => ['required_without:attendance_record_id', 'nullable', 'integer'],
            'date' => ['required_with:employee_id', 'nullable', 'date_format:Y-m-d'],
            'requested_time_in' => ['nullable', 'date_format:H:i'],
            'requested_time_out' => ['nullable', 'date_format:H:i'],
            'reason' => ['required', 'string', 'max:255'],
            'reason_category' => ['nullable', 'string', 'max:60'],
        ]);
        if (! ($data['requested_time_in'] ?? null) && ! ($data['requested_time_out'] ?? null)) {
            return response()->json(['message' => 'Enter the corrected time in or time out.', 'errors' => ['requested_time_in' => ['Enter the corrected time in or time out.']]], 422);
        }

        if (isset($data['attendance_record_id'])) {
            $record = AttendanceRecord::findOrFail($data['attendance_record_id']);
        } else {
            $employee = Employee::findOrFail($data['employee_id']);
            $record = AttendanceRecord::where('employee_id', $employee->id)->whereDate('date', $data['date'])->first()
                ?? AttendanceRecord::create([
                    'company_id' => $employee->company_id, 'employee_id' => $employee->id, 'date' => $data['date'], 'status' => 'absent',
                    'work_schedule_id' => ScheduleResolver::for($employee, $data['date'])['schedule']?->id, 'source' => 'manual',
                ]);
        }

        if ($record->adjustments()->where('status', 'pending')->exists()) {
            throw new ConflictException('This day already has an adjustment waiting for approval.');
        }

        $adjustment = AttendanceAdjustment::create([
            'company_id' => $record->company_id, 'employee_id' => $record->employee_id, 'attendance_record_id' => $record->id,
            'requested_time_in' => $data['requested_time_in'] ?? null, 'requested_time_out' => $data['requested_time_out'] ?? null,
            'reason' => $data['reason'], 'reason_category' => $data['reason_category'] ?? null, 'requested_by' => $request->user()->id,
        ]);
        ActivityLogger::log(module: 'Attendance', action: 'Added', title: 'Attendance adjustment', description: "Requested for {$record->date->toDateString()}: {$data['reason']}", subject: $adjustment);

        return response()->json(['data' => $adjustment], 201);
    }

    /** Approve or reject several at once. Returns how many were decided; ones already decided are left alone. */
    public function decide(Request $request, ApplyAttendanceAdjustment $apply): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['integer'],
            'decision' => ['required', Rule::in(['approved', 'rejected'])],
        ]);

        $decided = 0;
        foreach (AttendanceAdjustment::whereIn('id', $data['ids'])->where('status', 'pending')->get() as $adjustment) {
            try {
                Approval::decide($adjustment, $data['decision'], $request->user(), fn (AttendanceAdjustment $a) => $apply($a));
            } catch (ConflictException) {
                continue;
            }
            $decided++;
            ActivityLogger::log(module: 'Attendance', action: ucfirst(rtrim($data['decision'], 'd')).'d', title: 'Attendance adjustment', description: "{$data['decision']} for {$adjustment->record->date->toDateString()}", subject: $adjustment);
        }
        if ($decided === 0) {
            throw new ConflictException('Nothing to decide: those requests were already decided.');
        }

        return response()->json(['data' => ['decided' => $decided]]);
    }
}
