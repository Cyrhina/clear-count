<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Database\Factories\EmployeeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Nested sections (personal, employment, ...) are JSON and mirror frontend-ops `Employee`.
 * `name`, `department`, `status` are denormalised from them for search/filter.
 */
#[Fillable(['company_id', 'branch_id', 'employee_number', 'name', 'department', 'status', 'personal', 'employment', 'compensation', 'benefits', 'government', 'bank'])]
class Employee extends Model
{
    /** @use HasFactory<EmployeeFactory> */
    use BelongsToCompany, HasFactory;

    protected function casts(): array
    {
        return [
            'personal' => 'array',
            'employment' => 'array',
            'compensation' => 'array',
            'benefits' => 'array',
            'government' => 'array',
            'bank' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Employee $employee): void {
            $employee->name = trim(($employee->personal['firstName'] ?? '').' '.($employee->personal['lastName'] ?? ''));
            $employee->department = $employee->employment['department'] ?? null;
            $employee->status = $employee->employment['status'] ?? 'active';
        });
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
