<?php

namespace App\Models;

use App\Concerns\BelongsToEmployee;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** One employee's attendance on one date. Times are HH:MM:SS strings. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'employee_id', 'work_schedule_id', 'date', 'time_in', 'time_out', 'break_out', 'break_in', 'status', 'work_type', 'source', 'auto_recorded', 'wfh_id', 'late_minutes', 'undertime_minutes', 'remarks'])]
class AttendanceRecord extends Model
{
    use BelongsToEmployee;

    protected function casts(): array
    {
        return ['date' => 'date:Y-m-d', 'auto_recorded' => 'boolean', 'late_minutes' => 'integer', 'undertime_minutes' => 'integer'];
    }

    public function adjustments(): HasMany
    {
        return $this->hasMany(AttendanceAdjustment::class);
    }
}
