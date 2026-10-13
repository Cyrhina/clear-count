<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One entry of a loan's ledger. A repayment is positive and lowers the balance. */
#[Fillable(['loan_id', 'entry_type', 'amount', 'paid_on', 'payroll_reference', 'payroll_period_id'])]
class LoanRepayment extends Model
{
    protected function casts(): array
    {
        return ['amount' => 'float', 'paid_on' => 'date:Y-m-d'];
    }

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }
}
