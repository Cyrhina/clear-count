<?php

namespace App\Concerns;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * For tables owned by one employee. A query only sees rows of employees the user can see, so it inherits the
 * Employee scope: company, a manager's branch, an employee's own record. The super admin sees everything.
 */
trait BelongsToEmployee
{
    public static function bootBelongsToEmployee(): void
    {
        static::addGlobalScope('employee', function (Builder $query): void {
            $user = auth()->user();
            if (! $user || $user->hasRole('super_admin')) {
                return;
            }

            $query->whereIn($query->getModel()->getTable().'.employee_id', Employee::select('id'));
        });
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
