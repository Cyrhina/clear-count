<?php

namespace App\Support;

use App\Models\DeductionType;
use App\Models\EarningType;
use App\Models\OvertimeRate;

/**
 * The starting Payroll Settings every company gets: earnings, deductions, overtime/holiday multipliers (per DOLE rules)
 * and calculation rules. Created the first time a list is opened (see PayrollSettingsController), so a new company needs no setup step.
 */
final class PayrollDefaults
{
    /** Multipliers as decimals: 1.25 = 125%. [key, group, label, multiplier] */
    public const OVERTIME_RATES = [
        ['regular', 'overtime', 'Regular Workday Overtime', 1.25],
        ['rest_day_holiday', 'overtime', 'Rest Day Overtime', 1.69],
        ['night_diff', 'overtime', 'Night Differential Rate', 1.10],
        ['ot_night_diff', 'overtime', 'Overtime during Night Differential', 1.375],
        ['regular_holiday_worked', 'holiday', 'Regular Holiday Worked', 2.0],
        ['regular_holiday_unworked', 'holiday', 'Regular Holiday Unworked', 1.0],
        ['regular_holiday_rest_day_worked', 'holiday', 'Regular Holiday + Rest Day Worked', 2.6],
        ['special_holiday_worked', 'holiday', 'Special Non-Working Holiday Worked', 1.3],
        ['special_holiday_rest_day_worked', 'holiday', 'Special Non-Working Holiday + Rest Day Worked', 1.5],
        ['double_holiday_worked', 'holiday', 'Double Holiday Worked', 3.0],
    ];

    /** [name, category, calc_type, taxable] */
    public const EARNINGS = [
        ['Basic Pay', 'Basic', 'fixed', true],
        ['Overtime Pay', 'Overtime', 'variable', true],
        ['Holiday Pay', 'Holiday', 'variable', true],
        ['Night Differential', 'Overtime', 'variable', true],
        ['Allowance', 'Allowance', 'fixed', true],
        ['De Minimis Benefits', 'De Minimis', 'fixed', false],
        ['Bonus', 'Bonus', 'variable', true],
        ['13th Month Pay', 'Bonus', 'variable', false],
    ];

    /** [name, category, recurrence] */
    public const DEDUCTIONS = [
        ['SSS', 'government', 'recurring'],
        ['PhilHealth', 'government', 'recurring'],
        ['Pag-IBIG', 'government', 'recurring'],
        ['Withholding Tax', 'tax', 'recurring'],
        ['Cash Advance', 'other', 'one_time'],
        ['Voluntary Loan', 'loan', 'recurring'],
    ];

    public const RULES = [
        'rounding_decimal_precision' => 2,
        'rounding_method' => 'nearest',
        'late_grace_period_minutes' => 0,
        'late_deduction_method' => 'per_minute',
        'late_per_minute_deduction' => 0,
        'overtime_pre_approval_required' => true,
        'overtime_rest_day_multiplier' => 1.3,
        'overtime_holiday_multiplier' => 2.0,
        'absence_daily_rate_basis' => 'basic_pay_divided_by_working_days',
        'absence_unpaid_handling' => 'deduct_daily_rate',
        'proration_new_employee' => true,
        'proration_resigned_employee' => true,
        'proration_mid_period_changes' => true,
        'adjustments_retroactive_allowed' => false,
        'adjustments_manual_allowed' => true,
        'adjustments_approval_required' => true,
        'default_deduction_schedules' => [],
    ];

    /** Each list is created only while the company has none, so a row a company deleted or renamed never comes back. */
    public static function ensureOvertimeRates(int $companyId): void
    {
        if (OvertimeRate::withoutGlobalScopes()->where('company_id', $companyId)->exists()) {
            return;
        }
        foreach (self::OVERTIME_RATES as [$key, $group, $label, $multiplier]) {
            OvertimeRate::withoutGlobalScopes()->create(['company_id' => $companyId, 'key' => $key, 'group' => $group, 'label' => $label, 'multiplier' => $multiplier, 'is_custom' => false]);
        }
    }

    public static function ensureEarnings(int $companyId): void
    {
        if (EarningType::withoutGlobalScopes()->where('company_id', $companyId)->exists()) {
            return;
        }
        foreach (self::EARNINGS as [$name, $category, $calc, $taxable]) {
            EarningType::withoutGlobalScopes()->create(['company_id' => $companyId, 'name' => $name, 'category' => $category, 'calc_type' => $calc, 'taxable' => $taxable]);
        }
    }

    public static function ensureDeductions(int $companyId): void
    {
        if (DeductionType::withoutGlobalScopes()->where('company_id', $companyId)->exists()) {
            return;
        }
        foreach (self::DEDUCTIONS as [$name, $category, $recurrence]) {
            DeductionType::withoutGlobalScopes()->create(['company_id' => $companyId, 'name' => $name, 'category' => $category, 'recurrence' => $recurrence, 'allocation_method' => 'equal_split']);
        }
    }
}
