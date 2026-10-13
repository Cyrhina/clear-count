<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

/** A recurring deduction employees can be enrolled in, such as cooperative savings. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'name', 'amount', 'amount_type', 'reason', 'status'])]
class DeductionPlan extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['amount' => 'float'];
    }
}
