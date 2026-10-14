<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One employee's pay in one run. `breakdown` is the engine's whole line; the columns are its totals. */
#[Fillable(['company_id', 'payroll_period_id', 'employee_id', 'gross_pay', 'total_deductions', 'net_pay', 'withholding_tax', 'sss_employee', 'sss_employer', 'philhealth_employee', 'philhealth_employer', 'pagibig_employee', 'pagibig_employer', 'breakdown'])]
class PayrollLine extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['breakdown' => 'array'];
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(PayrollPeriod::class, 'payroll_period_id');
    }

    /** What the screens read: the engine's line with the stored ids (types/domain.ts PayrollLine, camelCase). */
    public function toLine(): array
    {
        return [...$this->breakdown, 'id' => (string) $this->id, 'companyId' => (string) $this->company_id, 'periodId' => (string) $this->payroll_period_id, 'employeeId' => (string) $this->employee_id];
    }
}
