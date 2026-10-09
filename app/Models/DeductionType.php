<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

/** Master list of deductions (SSS, PhilHealth, Pag-IBIG, withholding tax, cash advance, loans ...). */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'name', 'category', 'calc_type', 'recurrence', 'allocation_method', 'specific_cutoff_period', 'custom_split_percentages', 'is_active'])]
class DeductionType extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['custom_split_percentages' => 'array', 'is_active' => 'boolean', 'specific_cutoff_period' => 'integer'];
    }
}
