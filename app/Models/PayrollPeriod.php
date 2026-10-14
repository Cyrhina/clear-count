<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** One payroll run: its cutoff, pay date and status. Changed only through App\Payroll\PayrollRun; a finalized one is locked. */
#[Hidden(['approved_by', 'finalized_by'])]
#[Fillable(['company_id', 'payroll_group_id', 'payroll_number', 'payroll_year', 'label', 'start_date', 'end_date', 'pay_date', 'status', 'excluded_employee_ids', 'approved_by', 'approved_at', 'finalized_by', 'finalized_at'])]
class PayrollPeriod extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['start_date' => 'date:Y-m-d', 'end_date' => 'date:Y-m-d', 'pay_date' => 'date:Y-m-d', 'excluded_employee_ids' => 'array', 'approved_at' => 'datetime', 'finalized_at' => 'datetime'];
    }

    public function lines(): HasMany
    {
        return $this->hasMany(PayrollLine::class);
    }

    /** The period in the shape `PayrollInputs` takes. */
    public function asEngineInput(): array
    {
        return array_filter([
            'id' => (string) $this->id, 'label' => $this->label, 'startDate' => $this->start_date->toDateString(), 'endDate' => $this->end_date->toDateString(), 'payDate' => $this->pay_date->toDateString(),
            'payrollGroupId' => $this->payroll_group_id ? (string) $this->payroll_group_id : null, 'excludedEmployeeIds' => $this->excluded_employee_ids ?: null,
        ], fn ($v) => $v !== null);
    }
}
