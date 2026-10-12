<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use App\Enums\CompensationKind;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property CompensationKind $kind
 * @property array<string, mixed>|null $config
 * @property bool $is_active
 */
#[Fillable(['company_id', 'name', 'kind', 'config', 'is_active'])]
class CompensationType extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return ['kind' => CompensationKind::class, 'config' => 'array', 'is_active' => 'boolean'];
    }

    public function payrollGroups(): HasMany
    {
        return $this->hasMany(PayrollGroup::class);
    }
}
