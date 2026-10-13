<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

#[Hidden(['company_id'])]
#[Fillable(['company_id', 'name', 'description', 'is_paid', 'default_credits', 'max_carry_over', 'tier_credits'])]
class LeaveType extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['is_paid' => 'boolean', 'default_credits' => 'float', 'max_carry_over' => 'float', 'tier_credits' => 'array'];
    }
}
