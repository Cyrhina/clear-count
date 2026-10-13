<?php

namespace App\Models;

use App\Concerns\BelongsToEmployee;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Overtime or night differential of one employee on one date. The server works out `hours`; `multiplier` is copied from the rate table when filed. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'employee_id', 'work_date', 'start_time', 'end_time', 'hours', 'type', 'multiplier', 'reason', 'source', 'status', 'requested_by', 'decided_by', 'decided_at'])]
class OvertimeRecord extends Model
{
    use BelongsToEmployee;

    protected function casts(): array
    {
        return ['work_date' => 'date:Y-m-d', 'hours' => 'float', 'multiplier' => 'float', 'decided_at' => 'datetime'];
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
