<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

/** A kind of loan payroll collects (SSS, Pag-IBIG, company loan ...). Built-in types come with the company (LoanDefaults); a company can add its own. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'key', 'label', 'provider', 'description', 'typical_term', 'typical_amount', 'amount_type', 'fixed_principal', 'fixed_monthly_deduction', 'is_active', 'built_in'])]
class LoanType extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['fixed_principal' => 'float', 'fixed_monthly_deduction' => 'float', 'is_active' => 'boolean', 'built_in' => 'boolean'];
    }
}
