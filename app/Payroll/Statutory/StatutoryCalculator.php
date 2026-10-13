<?php

namespace App\Payroll\Statutory;

use App\Payroll\Tax\WithholdingTax;

/**
 * Monthly SSS, PhilHealth and Pag-IBIG contributions and the BIR withholding tax of one employee, from a configuration as
 * `StatutoryTables::for()` gives it. Port of `monthlyStatutoryFor` (payrollService.ts); the golden fixture tests.
 */
final class StatutoryCalculator
{
    /**
     * @param  array<string, mixed>  $config  sss_brackets, philhealth, pagibig, tax_tables
     * @return array<string, float|int> snake_case: monthly_basis, sss_msc, sss_employee, sss_employer, sss_ec, philhealth_base, ...
     */
    public static function monthlyFor(array $config, float $monthlyBasis, ?string $payFrequency = null, float $periodsPerMonth = 1, float $pagibigVoluntary = 0): array
    {
        $sss = self::sssBracket($monthlyBasis, $config['sss_brackets']);
        $sssEc = $sss['ec'] ?? 0;
        $sssEmployee = self::round2($sss['employee_share'] ?? 0);
        $sssEmployer = self::round2(($sss['employer_share'] ?? 0) + $sssEc);

        $ph = $config['philhealth'];
        $philhealthBase = min(max($monthlyBasis, $ph['salary_floor']), $ph['salary_ceiling']);
        $premium = $philhealthBase * $ph['rate'];
        $philhealthEmployee = self::round2($premium * $ph['employee_share_percent']);
        $philhealthEmployer = self::round2($premium * $ph['employer_share_percent']);

        $pi = $config['pagibig'];
        $fundSalary = min($monthlyBasis, $pi['max_fund_salary']);
        $employeeRate = $monthlyBasis <= 1500 ? $pi['rate'] / 2 : $pi['rate'];
        $pagibigEmployee = max(min(self::round2($fundSalary * $employeeRate), $pi['employee_amount']), $pagibigVoluntary);
        $pagibigEmployer = min(self::round2($fundSalary * $pi['rate']), $pi['employer_amount']);

        $monthlyTaxable = max(0, $monthlyBasis - $sssEmployee - $philhealthEmployee - $pagibigEmployee);
        // Tax is figured on one pay period's taxable pay against the table for that pay frequency (monthly when none is given).
        $taxFrequency = $payFrequency ? WithholdingTax::frequencyFor($payFrequency, $periodsPerMonth) : 'monthly';
        $monthly = $config['tax_tables']['monthly'];
        $table = $config['tax_tables'][$taxFrequency] ?? null;
        $table = $table ?: null;
        $ppm = $taxFrequency === 'monthly' || ! $table ? 1 : max($periodsPerMonth, 0.0001);
        $periodTaxable = $monthlyTaxable / $ppm;
        $withholdingTax = $table ? self::round2(WithholdingTax::on($periodTaxable, $table) * $ppm) : self::round2(WithholdingTax::on($monthlyTaxable, $monthly));
        $marginalRate = $table ? WithholdingTax::marginalRate($periodTaxable, $table) : WithholdingTax::marginalRate($monthlyTaxable, $monthly);
        $annual = $config['tax_tables']['annual'] ?? null;
        $annualMarginalRate = $annual ? WithholdingTax::marginalRate($monthlyTaxable * 12, $annual) : WithholdingTax::marginalRate($monthlyTaxable, $monthly);

        return [
            'monthly_basis' => $monthlyBasis, 'sss_msc' => $sss['msc'] ?? 0, 'sss_employee' => $sssEmployee, 'sss_employer' => $sssEmployer, 'sss_ec' => $sssEc,
            'philhealth_base' => $philhealthBase, 'philhealth_employee' => $philhealthEmployee, 'philhealth_employer' => $philhealthEmployer,
            'pagibig_employee' => $pagibigEmployee, 'pagibig_employer' => $pagibigEmployer,
            'monthly_taxable' => $monthlyTaxable, 'withholding_tax' => $withholdingTax, 'marginal_rate' => $marginalRate, 'annual_marginal_rate' => $annualMarginalRate,
        ];
    }

    /** The bracket a monthly basis falls in; a basis above every bracket gets the last one. */
    private static function sssBracket(float $basis, array $brackets): ?array
    {
        foreach ($brackets as $b) {
            if ($basis >= $b['min_salary'] && ($b['max_salary'] === null || $basis < $b['max_salary'])) {
                return $b;
            }
        }

        return $brackets ? end($brackets) : null;
    }

    /** Same rounding as the browser engine (half up), so the two agree on every centavo. */
    private static function round2(float $n): float
    {
        return floor($n * 100 + 0.5) / 100;
    }
}
