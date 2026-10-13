<?php

namespace App\Models;

use App\Concerns\BelongsToEmployee;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One employee's shift (or rostered rest day, `work_schedule_id` null) on one date. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'employee_id', 'date', 'work_schedule_id', 'is_rest_day'])]
class ShiftAssignment extends Model
{
    use BelongsToEmployee;

    protected function casts(): array
    {
        return ['date' => 'date:Y-m-d', 'is_rest_day' => 'boolean'];
    }

    public function workSchedule(): BelongsTo
    {
        return $this->belongsTo(WorkSchedule::class);
    }
}
