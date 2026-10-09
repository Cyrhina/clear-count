<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Hidden(['company_id'])]
#[Fillable(['company_id', 'name', 'shift_type', 'start_time', 'end_time', 'break_minutes', 'grace_period_minutes', 'days_of_week', 'rest_days', 'color'])]
class WorkSchedule extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['days_of_week' => 'array', 'rest_days' => 'array', 'break_minutes' => 'integer', 'grace_period_minutes' => 'integer'];
    }

    public function payrollGroups(): HasMany
    {
        return $this->hasMany(PayrollGroup::class);
    }
}
