<?php

namespace App\Models;

use App\Concerns\BelongsToEmployee;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A request to correct one day's punches. Approving it rewrites the attendance record (ApplyAttendanceAdjustment). */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'employee_id', 'attendance_record_id', 'requested_time_in', 'requested_time_out', 'reason', 'reason_category', 'status', 'requested_by', 'decided_by', 'decided_at'])]
class AttendanceAdjustment extends Model
{
    use BelongsToEmployee;

    protected function casts(): array
    {
        return ['decided_at' => 'datetime'];
    }

    public function record(): BelongsTo
    {
        return $this->belongsTo(AttendanceRecord::class, 'attendance_record_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
