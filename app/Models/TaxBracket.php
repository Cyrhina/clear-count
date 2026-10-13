<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;

/** One BIR withholding bracket of a pay period table. Dated rows: company_id null is the system default (see StatutoryTables). */
#[Guarded([])]
class TaxBracket extends Model
{
    public $timestamps = false;

    protected $table = 'tax_brackets';

    protected function casts(): array
    {
        return ['effective_from' => 'date:Y-m-d', 'min' => 'float', 'max' => 'float', 'rate' => 'float', 'base_tax' => 'float'];
    }
}
