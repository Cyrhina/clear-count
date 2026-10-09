<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

/** One row of the overtime / holiday multiplier table. The multiplier is stored as a decimal: 1.25 means 125%. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'key', 'group', 'label', 'multiplier', 'is_custom'])]
class OvertimeRate extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['multiplier' => 'float', 'is_custom' => 'boolean'];
    }
}
