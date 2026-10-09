<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

/** Master list of earnings payroll can pay (Basic, De Minimis, Allowance, Overtime, Bonus ...). */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'name', 'category', 'calc_type', 'taxable', 'included_in_payroll', 'is_active'])]
class EarningType extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['taxable' => 'boolean', 'included_in_payroll' => 'boolean', 'is_active' => 'boolean'];
    }
}
