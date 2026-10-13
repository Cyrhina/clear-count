<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;

/** The PhilHealth premium rule. Dated rows: company_id null is the system default (see StatutoryTables). */
#[Guarded([])]
class PhilhealthRate extends Model
{
    public $timestamps = false;

    protected $table = 'philhealth_rates';

    protected function casts(): array
    {
        return ['effective_from' => 'date:Y-m-d', 'rate' => 'float', 'employee_share_percent' => 'float', 'employer_share_percent' => 'float', 'salary_floor' => 'float', 'salary_ceiling' => 'float'];
    }
}
