<?php

namespace App\Support;

use App\Models\Loan;
use App\Models\LoanRepayment;
use Illuminate\Support\Facades\DB;

/**
 * A loan's balance is its principal less its ledger entries; nothing is edited in place. Recording the entry that brings the balance to
 * zero completes the loan. Payroll calls `repay` when a run finalizes (P10).
 */
final class LoanLedger
{
    public static function balance(Loan $loan): float
    {
        return round($loan->principal - (float) $loan->repayments()->sum('amount'), 2);
    }

    /** Takes `amount` (never more than the balance) off the loan; returns what was taken. */
    public static function repay(Loan $loan, float $amount, string $paidOn, ?string $reference = null, ?int $periodId = null): float
    {
        return DB::transaction(function () use ($loan, $amount, $paidOn, $reference, $periodId): float {
            $loan = Loan::withoutGlobalScopes()->lockForUpdate()->findOrFail($loan->id);
            $taken = round(min($amount, max(0, self::balance($loan))), 2);
            if ($taken <= 0) {
                return 0.0;
            }
            LoanRepayment::create(['loan_id' => $loan->id, 'entry_type' => 'repayment', 'amount' => $taken, 'paid_on' => $paidOn, 'payroll_reference' => $reference, 'payroll_period_id' => $periodId]);
            if (self::balance($loan) <= 0.004) {
                $loan->update(['status' => 'completed']);
            }

            return $taken;
        });
    }
}
