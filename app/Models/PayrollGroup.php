<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use App\Enums\CompensationType;
use App\Enums\DeductionScheduleType;
use App\Enums\PayrollFrequency;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string|null $description
 * @property PayrollFrequency $frequency
 * @property CompensationType $compensation_type
 * @property array<string, mixed> $cutoff_config
 * @property array<string, mixed> $pay_date_config
 * @property DeductionScheduleType $deduction_schedule
 * @property int|null $work_schedule_id
 * @property \Illuminate\Support\Carbon $effective_date
 * @property string $status
 * @property-read int|null $employees_count Set by withCount('employees').
 */
#[Fillable(['company_id', 'name', 'description', 'frequency', 'compensation_type', 'cutoff_config', 'pay_date_config', 'deduction_schedule', 'work_schedule_id', 'effective_date', 'status'])]
class PayrollGroup extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return [
            'frequency' => PayrollFrequency::class,
            'compensation_type' => CompensationType::class,
            'deduction_schedule' => DeductionScheduleType::class,
            'cutoff_config' => 'array',
            'pay_date_config' => 'array',
            'effective_date' => 'date',
        ];
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function workSchedule(): BelongsTo
    {
        return $this->belongsTo(WorkSchedule::class);
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('status', 'active');
    }

    /**
     * Assigned employee count. Uses the value loaded by withCount('employees') when present, so lists stay one query.
     * (Not an Eloquent accessor name clash: withCount already creates `employees_count`.)
     */
    public function assignedEmployeesCount(): int
    {
        return $this->employees_count ?? $this->employees()->count();
    }
}
