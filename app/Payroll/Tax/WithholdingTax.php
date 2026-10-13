<?php

namespace App\Payroll\Tax;

/**
 * BIR withholding tax on compensation. A table is a list of brackets `[min, max|null, rate, base_tax]`; the tax of a taxable amount is the
 * base tax of its bracket plus the bracket's rate on the excess over the bracket's minimum. Port of lib/payroll/withholdingTax.ts.
 */
final class WithholdingTax
{
    /** The pay periods BIR publishes a table for. */
    public const FREQUENCIES = ['annual', 'monthly', 'semi_monthly', 'weekly', 'daily'];

    /**
     * Which table a pay date falls under: the table of its pay frequency. BIR publishes no bi-weekly or custom table, so a bi-weekly
     * period uses the semi-monthly one and a custom period the table closest to its length (from how many periods it runs per month).
     */
    public static function frequencyFor(string $payFrequency, float $periodsPerMonth = 2): string
    {
        if (in_array($payFrequency, ['daily', 'weekly', 'semi_monthly', 'monthly'], true)) {
            return $payFrequency;
        }
        if ($payFrequency === 'biweekly') {
            return 'semi_monthly';
        }

        return match (true) {
            $periodsPerMonth >= 15 => 'daily',
            $periodsPerMonth >= 3.5 => 'weekly',
            $periodsPerMonth >= 1.5 => 'semi_monthly',
            $periodsPerMonth >= 0.5 => 'monthly',
            default => 'annual',
        };
    }

    /** @param  list<array{min: float, max: float|null, rate: float, base_tax: float}>  $brackets */
    public static function on(float $taxable, array $brackets): float
    {
        $bracket = self::bracketAt($taxable, $brackets);

        return $bracket ? $bracket['base_tax'] + ($taxable - $bracket['min']) * $bracket['rate'] : 0.0;
    }

    /** The rate charged on the next peso at this taxable income. */
    public static function marginalRate(float $taxable, array $brackets): float
    {
        return self::bracketAt($taxable, $brackets)['rate'] ?? 0.0;
    }

    private static function bracketAt(float $taxable, array $brackets): ?array
    {
        foreach ($brackets as $b) {
            if ($taxable >= $b['min'] && ($b['max'] === null || $taxable < $b['max'])) {
                return $b;
            }
        }

        return null;
    }
}
