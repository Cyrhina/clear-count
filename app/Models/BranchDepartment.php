<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A department of one branch. Employees still carry the department as a name (`employees.department`); a rename and the
 * "has employees" check go through that name until the Employees module (P3) replaces it with a foreign key.
 */
#[Fillable(['company_id', 'branch_id', 'name', 'supervisor_employee_id'])]
class BranchDepartment extends Model
{
    use BelongsToCompany;

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /** Employees (any status) of this branch whose department is this one. */
    public function employees()
    {
        return Employee::where('branch_id', $this->branch_id)->where('department', $this->name);
    }
}
