<?php

namespace App\Models;

use App\Enums\HolidayScope;
use App\Enums\HolidayType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Not company-scoped by a global scope on purpose: system default rows have no company, and the seeder and the
 * import endpoint create them while someone is signed in. Controllers always go through activeForCompany().
 *
 * @property int $id
 * @property int|null $company_id
 * @property string $name
 * @property \Illuminate\Support\Carbon $date
 * @property int $year
 * @property HolidayType $type
 * @property HolidayScope $scope
 * @property list<int>|null $branch_ids
 * @property float $pay_rate_multiplier
 * @property string|null $description
 * @property bool $is_default
 */
#[Fillable(['company_id', 'name', 'date', 'type', 'scope', 'branch_ids', 'pay_rate_multiplier', 'description', 'is_default'])]
class Holiday extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'type' => HolidayType::class,
            'scope' => HolidayScope::class,
            'branch_ids' => 'array',
            'pay_rate_multiplier' => 'float',
            'is_default' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // `year` is only a fast filter column; it always follows `date`.
        static::saving(fn (Holiday $holiday) => $holiday->year = $holiday->date->year);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeForYear(Builder $query, int $year): void
    {
        $query->where('year', $year);
    }

    /** The company's own calendar (not the shared system rows, not deleted ones). */
    public function scopeActiveForCompany(Builder $query, int $companyId): void
    {
        $query->where('company_id', $companyId);
    }

    /** The shared Philippine default calendar. */
    public function scopeSystemDefaults(Builder $query): void
    {
        $query->whereNull('company_id');
    }

    public function scopeUpcoming(Builder $query): void
    {
        $query->where('date', '>=', now()->toDateString())->orderBy('date');
    }

    /** True when the holiday applies to the given branch (national and regional ones apply to every branch unless narrowed). */
    public function appliesToBranch(int $branchId): bool
    {
        return empty($this->branch_ids) || in_array($branchId, $this->branch_ids, true);
    }
}
