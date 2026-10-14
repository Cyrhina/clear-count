<?php

namespace App\Payroll;

use App\Models\BonusIncentive;
use App\Models\Employee;
use App\Models\PayrollGroup;
use App\Payroll\Statutory\StatutoryCalculator;
use App\Payroll\Statutory\StatutoryTables;

/**
 * The standalone payslip of an approved bonus set to "Generate Separate Payslip": only the bonus and its withholding tax, no basic pay and no
 * statutory contributions (those stay on the regular payslip). A taxable bonus is withheld at the employee's marginal bracket rate, the same
 * rate a regular run applies to a bonus it includes. Port of `computeSeparateBonusPayslip` and `marginalTaxRateFor`. Computed when asked, not stored.
 */
final class BonusPayslip
{
    public static function isSeparate(BonusIncentive $bonus): bool
    {
        return $bonus->status === 'approved' && $bonus->payout_mode === 'separate_payslip';
    }

    /**
     * One row per active employee the bonus covers; none unless the bonus is approved with its own payslip.
     *
     * @return list<array{employeeId: string, grossBonus: float, withholdingTax: float, netPay: float, taxRate: float}>
     */
    public static function rows(BonusIncentive $bonus): array
    {
        if (! self::isSeparate($bonus)) {
            return [];
        }
        $config = StatutoryTables::for($bonus->company_id, now()->toDateString());
        $groups = PayrollGroup::withoutGlobalScopes()->where('company_id', $bonus->company_id)->get()->keyBy('id');
        $engineBonus = PayrollInputs::bonusToEngine($bonus);

        $rows = [];
        foreach (Employee::withoutGlobalScopes()->where('company_id', $bonus->company_id)->where('status', 'active')->orderBy('id')->get() as $e) {
            $employee = ['id' => (string) $e->id, 'employment' => $e->employment ?? [], 'compensation' => ['allowances' => [], ...($e->compensation ?? [])], 'government' => $e->government ?? []];
            if (! BonusMatching::appliesTo($engineBonus, $employee)) {
                continue;
            }
            $gross = BonusMatching::amountFor($engineBonus, $employee);
            $rate = $bonus->taxable ? self::marginalRate($config, $employee, $groups->get($e->payroll_group_id)) : 0.0;
            $tax = Num::round0($gross * $rate);
            $rows[] = ['employeeId' => (string) $e->id, 'grossBonus' => $gross, 'withholdingTax' => $tax, 'netPay' => Num::round0($gross - $tax), 'taxRate' => $rate];
        }

        return $rows;
    }

    /** The employee's marginal rate on the table for their pay frequency (semi-monthly when they have no payroll group). */
    private static function marginalRate(array $config, array $employee, ?PayrollGroup $group): float
    {
        $frequency = $group ? str_replace('bi_weekly', 'biweekly', $group->frequency->value) : 'semi_monthly';
        $ppm = PayFrequency::periodsPerMonthFor($frequency);

        return StatutoryCalculator::monthlyFor($config, RateBasis::monthlyEquivalent($employee), $frequency, $ppm, (float) ($employee['government']['pagibigEmployeeContribution'] ?? 0))['marginal_rate'];
    }
}
