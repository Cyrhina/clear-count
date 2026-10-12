<?php

namespace App\Support;

use App\Models\CompensationType;
use App\Models\ComplianceDeadline;
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
        'late_deduction_enabled' => true,
        'late_deduction_method' => 'per_minute',
        'late_per_minute_deduction' => 0,
        'late_counting_period' => 'calendar_year',
        'late_custom_start_month' => 1,
        'late_custom_start_day' => 1,
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

    /** [name, kind, config]. Rates are starting points the company edits. */
    public const COMPENSATION_TYPES = [
        ['Monthly Rate', 'monthly_rate', ['basic_rate' => 28000]],
        ['Daily Rate', 'daily_rate', ['basic_rate' => 610]],
        ['Hourly Rate', 'hourly_rate', ['basic_rate' => 90]],
        ['Output-Based / Piece-Rate', 'output_based', ['output_rates' => [['label' => 'Product A', 'unit' => 'unit', 'rate_per_unit' => 10]], 'output_min' => null, 'output_max' => null]],
        ['Commission-Based', 'commission_based', ['commission_type' => 'percentage', 'commission_value' => 5, 'commission_basis' => 'Net Sales']],
        ['Mixed Compensation', 'mixed', ['basic_rate' => 18000, 'mixed_components' => ['Base Salary', 'Output Incentive']]],
    ];

    /**
     * Government filing deadlines. Due days are illustrative starting points (real SSS dates vary by employer number).
     * [name, category, description, frequency, due_day, due_month, remind_days_before, link]
     */
    public const COMPLIANCE_DEADLINES = [
        ['SSS Contribution Due', 'SSS', 'Remit the {period} SSS premiums (R-3 / R-5).', 'monthly', 10, null, 7, '/reports/sss-contribution'],
        ['File BIR Form 1601-C', 'BIR', 'Monthly withholding tax on compensation for {period}.', 'monthly', 10, null, 7, '/reports/bir-1601c'],
        ['Pag-IBIG Contribution Due', 'Pag-IBIG', 'Remit the {period} Pag-IBIG contributions and loan amortizations.', 'monthly', 10, null, 7, '/reports/pagibig-contribution'],
        ['PhilHealth Contribution Due', 'PhilHealth', 'Remit the {period} PhilHealth premiums.', 'monthly', 15, null, 7, '/reports/philhealth-contribution'],
        ['13th Month Pay Deadline', 'Payroll', 'Release 13th month pay to all rank-and-file employees (due on or before December 24).', 'yearly', 24, 11, 30, '/thirteenth-month-pay'],
        ['Issue BIR Form 2316', 'BIR', 'Give employees their annual certificate of compensation payment and tax withheld.', 'yearly', 31, 0, 30, '/reports/bir-2316'],
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

    public static function ensureCompensationTypes(int $companyId): void
    {
        if (CompensationType::withoutGlobalScopes()->where('company_id', $companyId)->exists()) {
            return;
        }
        foreach (self::COMPENSATION_TYPES as [$name, $kind, $config]) {
            CompensationType::withoutGlobalScopes()->create(['company_id' => $companyId, 'name' => $name, 'kind' => $kind, 'config' => $config]);
        }
    }

    public static function ensureComplianceDeadlines(int $companyId): void
    {
        if (ComplianceDeadline::withoutGlobalScopes()->where('company_id', $companyId)->exists()) {
            return;
        }
        foreach (self::COMPLIANCE_DEADLINES as [$name, $category, $description, $frequency, $dueDay, $dueMonth, $remind, $link]) {
            ComplianceDeadline::withoutGlobalScopes()->create([
                'company_id' => $companyId, 'name' => $name, 'category' => $category, 'description' => $description, 'frequency' => $frequency,
                'due_day' => $dueDay, 'due_month' => $dueMonth, 'remind_days_before' => $remind, 'link' => $link, 'is_custom' => false,
            ]);
        }
    }
}
