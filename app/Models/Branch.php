<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Database\Factories\BranchFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['company_id', 'name', 'code', 'is_head_office', 'address', 'city', 'contact_number', 'email', 'opened_date'])]
class Branch extends Model
{
    /** @use HasFactory<BranchFactory> */
    use BelongsToCompany, HasFactory;

    protected function casts(): array
    {
        return ['is_head_office' => 'boolean', 'opened_date' => 'date'];
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
