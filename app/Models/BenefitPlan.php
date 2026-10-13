<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

/** A plan employees can be enrolled in, such as an HMO plan or a cash allowance. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'category', 'name', 'provider', 'coverage', 'monthly_value', 'amount_type', 'employee_share', 'notes', 'status'])]
class BenefitPlan extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['monthly_value' => 'float', 'employee_share' => 'float'];
    }
}
