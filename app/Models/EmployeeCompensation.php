<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use App\Concerns\EffectiveDated;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * One pay change of an employee, effective from a date. Never edited: a new change is a new row.
 *
 * @property int $id
 * @property int $employee_id
 * @property Carbon $effective_from
 * @property string $rate_type
 * @property numeric-string $basic_rate
 * @property string|null $output_unit
 * @property array<int, array{label: string, amount: float}>|null $allowances
 * @property string $reason
 */
#[Fillable(['company_id', 'employee_id', 'effective_from', 'rate_type', 'basic_rate', 'output_unit', 'allowances', 'reason', 'changed_by'])]
class EmployeeCompensation extends Model
{
    use BelongsToCompany, EffectiveDated;

    // "compensation" has no plural, so the default table name would be wrong.
    protected $table = 'employee_compensations';

    protected function casts(): array
    {
        return ['effective_from' => 'date:Y-m-d', 'basic_rate' => 'decimal:2', 'allowances' => 'array'];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
