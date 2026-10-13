<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;

/** One SSS contribution bracket. Dated rows: company_id null is the system default (see StatutoryTables). */
#[Guarded([])]
class SssBracket extends Model
{
    public $timestamps = false;

    protected $table = 'sss_brackets';

    protected function casts(): array
    {
        return ['effective_from' => 'date:Y-m-d', 'min_salary' => 'float', 'max_salary' => 'float', 'msc' => 'float', 'employee_share' => 'float', 'employer_share' => 'float', 'ec' => 'float'];
    }
}
