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

    /** Makes sure the branch has a department of that name (an employee is always in one). Returns true when it was created. */
    public static function ensure(int $branchId, string $name): bool
    {
        $branch = Branch::withoutGlobalScopes()->findOrFail($branchId);
        $exists = static::withoutGlobalScopes()->where('branch_id', $branchId)->whereRaw('lower(name) = ?', [mb_strtolower($name)])->exists();
        if ($exists) {
            return false;
        }
        static::withoutGlobalScopes()->create(['company_id' => $branch->company_id, 'branch_id' => $branchId, 'name' => $name]);

        return true;
    }

    /** Clears the supervisor seat of every department the employee no longer belongs to (after a transfer or department change). */
    public static function releaseSupervisor(Employee $employee): void
    {
        static::where('supervisor_employee_id', $employee->id)
            ->where(fn ($q) => $q->where('branch_id', '!=', $employee->branch_id)->orWhere('name', '!=', $employee->department))
            ->update(['supervisor_employee_id' => null]);
    }

    /** Employees (any status) of this branch whose department is this one. */
    public function employees()
    {
        return Employee::where('branch_id', $this->branch_id)->where('department', $this->name);
    }
}
