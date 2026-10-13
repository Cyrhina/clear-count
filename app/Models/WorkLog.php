<?php

namespace App\Models;

use App\Concerns\BelongsToEmployee;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Hours (hourly pay) or units (output-based pay) an employee logged. Amount = quantity x rate, set by the server when filed. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'employee_id', 'type', 'work_date', 'quantity', 'unit_label', 'rate', 'amount', 'description', 'status', 'requested_by', 'decided_by', 'decided_at', 'payroll_period_id'])]
class WorkLog extends Model
{
    use BelongsToEmployee;

    protected function casts(): array
    {
        return ['work_date' => 'date:Y-m-d', 'quantity' => 'float', 'rate' => 'float', 'amount' => 'float', 'decided_at' => 'datetime'];
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
