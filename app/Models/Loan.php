<?php

namespace App\Models;

use App\Concerns\BelongsToEmployee;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** An amount an employee repays through payroll. The balance is the principal less the ledger (LoanLedger); `repayments` is the history. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'employee_id', 'type', 'label', 'principal', 'monthly_deduction', 'start_date', 'status'])]
class Loan extends Model
{
    use BelongsToEmployee;

    protected function casts(): array
    {
        return ['principal' => 'float', 'monthly_deduction' => 'float', 'start_date' => 'date:Y-m-d'];
    }

    public function repayments(): HasMany
    {
        return $this->hasMany(LoanRepayment::class)->orderBy('paid_on')->orderBy('id');
    }
}
