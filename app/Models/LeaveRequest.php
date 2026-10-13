<?php

namespace App\Models;

use App\Concerns\BelongsToEmployee;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Hidden(['company_id'])]
#[Fillable(['company_id', 'employee_id', 'leave_type_id', 'date_from', 'date_to', 'day_portion', 'days', 'reason', 'status', 'requested_by', 'decided_by', 'decided_at'])]
class LeaveRequest extends Model
{
    use BelongsToEmployee;

    protected function casts(): array
    {
        return ['date_from' => 'date:Y-m-d', 'date_to' => 'date:Y-m-d', 'days' => 'float', 'decided_at' => 'datetime'];
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }

    /** True when the employee has approved leave covering the date (a half day counts too). */
    public static function approvedOn(int $employeeId, string $date): bool
    {
        return self::where('employee_id', $employeeId)->where('status', 'approved')->whereDate('date_from', '<=', $date)->whereDate('date_to', '>=', $date)->exists();
    }
}
