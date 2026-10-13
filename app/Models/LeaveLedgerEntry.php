<?php

namespace App\Models;

use App\Concerns\BelongsToEmployee;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

/** One line of an employee's leave credits for one leave type. See LeaveLedger. */
#[Hidden(['company_id'])]
#[Fillable(['company_id', 'employee_id', 'leave_type_id', 'entry_type', 'days', 'leave_year', 'effective_date', 'leave_request_id', 'reason', 'created_by'])]
class LeaveLedgerEntry extends Model
{
    use BelongsToEmployee;

    protected $table = 'leave_ledger';

    protected function casts(): array
    {
        return ['days' => 'float', 'effective_date' => 'date:Y-m-d'];
    }
}
