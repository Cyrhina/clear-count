<?php

namespace App\Models;

use App\Concerns\BelongsToEmployee;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

/** A benefit an employee receives. Cash allowances are paid as earnings; the rest are employer-paid, with any employee share taken as a deduction. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'employee_id', 'benefit_plan_id', 'category', 'name', 'provider', 'coverage', 'monthly_value', 'employee_share', 'start_date', 'end_date', 'status', 'notes'])]
class EmployeeBenefit extends Model
{
    use BelongsToEmployee;

    protected function casts(): array
    {
        return ['monthly_value' => 'float', 'employee_share' => 'float', 'start_date' => 'date:Y-m-d', 'end_date' => 'date:Y-m-d'];
    }
}
