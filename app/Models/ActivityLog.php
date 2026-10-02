<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['company_id', 'user_id', 'actor', 'action', 'details'])]
class ActivityLog extends Model
{
    use BelongsToCompany;
}
