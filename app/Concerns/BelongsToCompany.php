<?php

namespace App\Concerns;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Scopes every query to the authenticated user's company (ports frontend-ops tenantScope).
 * Managers see their branch only; employees see only their own record.
 * super_admin sees all companies.
 */
trait BelongsToCompany
{
    public static function bootBelongsToCompany(): void
    {
        static::addGlobalScope('company', function (Builder $query): void {
            /** @var User|null $user */
            $user = auth()->user();
            if (! $user || $user->hasRole('super_admin')) {
                return;
            }

            $table = $query->getModel()->getTable();
            $query->where("{$table}.company_id", $user->company_id);

            if ($table === 'employees') {
                if ($user->hasRole('manager') && $user->branch_id) {
                    $query->where("{$table}.branch_id", $user->branch_id);
                } elseif ($user->hasRole('employee')) {
                    $query->where("{$table}.id", $user->employee_id ?? 0);
                }
            }
        });

        static::creating(function ($model): void {
            if (! $model->company_id && auth()->user()?->company_id) {
                $model->company_id = auth()->user()->company_id;
            }
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
