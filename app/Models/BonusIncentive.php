<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A bonus or incentive for one employee, several, a department or the whole company. Approved ones are paid by the payroll run whose label matches `period_label`. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'name', 'bonus_type', 'target_type', 'target_employee_id', 'target_employee_ids', 'target_department', 'amount', 'period_label', 'taxable', 'frequency', 'payout_mode', 'notes', 'status', 'created_by', 'decided_by', 'decided_at'])]
class BonusIncentive extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['amount' => 'float', 'taxable' => 'boolean', 'target_employee_ids' => 'array', 'decided_at' => 'datetime'];
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
