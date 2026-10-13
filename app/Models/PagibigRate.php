<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;

/** The Pag-IBIG contribution rule. Dated rows: company_id null is the system default (see StatutoryTables). */
#[Guarded([])]
class PagibigRate extends Model
{
    public $timestamps = false;

    protected $table = 'pagibig_rates';

    protected function casts(): array
    {
        return ['effective_from' => 'date:Y-m-d', 'rate' => 'float', 'max_fund_salary' => 'float', 'employee_amount' => 'float', 'employer_amount' => 'float'];
    }
}
