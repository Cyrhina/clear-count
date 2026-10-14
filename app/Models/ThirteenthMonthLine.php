<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One employee's 13th month pay in one batch. `breakdown` is the engine's whole line; the columns are its totals. */
#[Fillable(['company_id', 'thirteenth_month_run_id', 'employee_id', 'active_from', 'active_to', 'separated', 'months_credited', 'gross_basic_earned', 'undertime_hours', 'undertime_deduction', 'unpaid_absence_days', 'absence_deduction', 'annual_basic_earned', 'thirteenth_month_pay', 'taxable_excess', 'withholding_tax', 'net_pay', 'breakdown'])]
class ThirteenthMonthLine extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['breakdown' => 'array', 'separated' => 'boolean'];
    }

    public function run(): BelongsTo
    {
        return $this->belongsTo(ThirteenthMonthRun::class, 'thirteenth_month_run_id');
    }

    /** What the screens read: the engine's line with the stored ids (types/domain.ts ThirteenthMonthLine, camelCase). */
    public function toLine(): array
    {
        return [...$this->breakdown, 'id' => (string) $this->id, 'companyId' => (string) $this->company_id, 'runId' => (string) $this->thirteenth_month_run_id, 'employeeId' => (string) $this->employee_id];
    }
}
