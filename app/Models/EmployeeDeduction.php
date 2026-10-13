<?php

namespace App\Models;

use App\Concerns\BelongsToEmployee;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

/** A deduction from an employee's pay that is not a loan or a government contribution. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'employee_id', 'deduction_plan_id', 'name', 'kind', 'amount', 'start_date', 'end_date', 'due_date', 'status', 'settled_in_period_id', 'reason'])]
class EmployeeDeduction extends Model
{
    use BelongsToEmployee;

    protected function casts(): array
    {
        return ['amount' => 'float', 'start_date' => 'date:Y-m-d', 'end_date' => 'date:Y-m-d', 'due_date' => 'date:Y-m-d'];
    }
}
