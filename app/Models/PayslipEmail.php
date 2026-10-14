<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/** The delivery record of one employee's payslip email for one run: queued, then sent or failed with the reason. */
#[Fillable(['company_id', 'kind', 'source_id', 'employee_id', 'subject', 'recipient', 'status', 'attempts', 'error', 'last_attempt_at', 'sent_at', 'sent_by'])]
class PayslipEmail extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['last_attempt_at' => 'datetime', 'sent_at' => 'datetime'];
    }
}
