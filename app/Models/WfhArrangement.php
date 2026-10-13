<?php

namespace App\Models;

use App\Concerns\BelongsToEmployee;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A work-from-home arrangement of one employee: a standing pattern or temporary dates. See WfhPlanner for how a day is decided. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'employee_id', 'kind', 'date_from', 'date_to', 'days_of_week', 'times', 'custom', 'reason', 'status', 'requested_by', 'decided_by', 'decided_at', 'batch_id'])]
class WfhArrangement extends Model
{
    use BelongsToEmployee;

    protected function casts(): array
    {
        return ['date_from' => 'date:Y-m-d', 'date_to' => 'date:Y-m-d', 'days_of_week' => 'array', 'custom' => 'array', 'decided_at' => 'datetime'];
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
