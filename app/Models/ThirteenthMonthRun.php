<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** One 13th month batch for a calendar year: a draft until finalized, then locked. Changed only through App\Payroll\ThirteenthMonthRuns. */
#[Hidden(['finalized_by'])]
#[Fillable(['company_id', 'year', 'generation_date', 'payout_period_label', 'selection', 'coverage_start', 'coverage_end', 'status', 'finalized_by', 'finalized_at'])]
class ThirteenthMonthRun extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['generation_date' => 'date:Y-m-d', 'coverage_start' => 'date:Y-m-d', 'coverage_end' => 'date:Y-m-d', 'selection' => 'array', 'finalized_at' => 'datetime'];
    }

    public function lines(): HasMany
    {
        return $this->hasMany(ThirteenthMonthLine::class);
    }
}
