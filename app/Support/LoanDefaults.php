<?php

namespace App\Support;

use App\Models\LoanType;

/** The loan types payroll collects out of the box. Created the first time the list is opened, so a new company needs no setup step. */
final class LoanDefaults
{
    /** [key, label, provider, description, typical term, typical amount] */
    public const TYPES = [
        ['sss_salary_loan', 'SSS Loan – Salary', 'SSS', 'Salary loan from SSS, repaid through monthly payroll deduction.', '24 months', 'Up to 2 months of average salary credit'],
        ['sss_calamity_loan', 'SSS Loan – Calamity', 'SSS', 'Emergency loan for members in areas declared under a state of calamity.', '24 months', 'Up to 1 month of average salary credit'],
        ['pagibig_multipurpose_loan', 'Pag-IBIG Loan – Multi-Purpose', 'Pag-IBIG', 'Multi-Purpose Loan (MPL) for members with enough contributions.', '24 months', 'Up to 80% of total accumulated value'],
        ['pagibig_calamity_loan', 'Pag-IBIG Loan – Calamity', 'Pag-IBIG', 'Calamity Loan for members affected by a declared calamity.', '24 months', 'Up to 80% of total accumulated value'],
        ['pagibig_mp2', 'Pag-IBIG MP2 Savings', 'Pag-IBIG', 'Voluntary Modified Pag-IBIG 2 (MP2) savings program deducted from pay.', '5-year maturity', 'From ₱500 per month'],
        ['company_loan', 'Company Loan / Emergency Advance', 'Company', 'Company-provided loan or cash advance, repaid through payroll.', '3–12 months', 'Up to 1 month of basic pay'],
        ['other_deduction', 'Other Installment', 'Company', 'Any other amount repaid in installments. One-off or monthly charges (uniforms, equipment, co-pays) belong under Deductions instead.', 'As agreed', 'As agreed'],
    ];

    public static function ensure(int $companyId): void
    {
        if (LoanType::withoutGlobalScopes()->where('company_id', $companyId)->exists()) {
            return;
        }
        foreach (self::TYPES as [$key, $label, $provider, $description, $term, $amount]) {
            LoanType::withoutGlobalScopes()->create([
                'company_id' => $companyId, 'key' => $key, 'label' => $label, 'provider' => $provider, 'description' => $description,
                'typical_term' => $term, 'typical_amount' => $amount, 'amount_type' => 'custom', 'is_active' => true, 'built_in' => true,
            ]);
        }
    }
}
