<?php

namespace App\Models;

use App\Concerns\BelongsToCompany;
use Database\Factories\ActivityLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Carbon\CarbonInterface;

/**
 * One audit-trail entry. Append-only by convention: nothing in the app updates or deletes rows.
 *
 * @property int $id
 * @property int $company_id
 * @property int|null $user_id
 * @property string $actor Name of the user at the time (kept if the user is later deleted).
 * @property string|null $module
 * @property string $action
 * @property string|null $title
 * @property string|null $description
 * @property array<string, mixed>|null $properties
 */
#[Fillable(['company_id', 'user_id', 'actor', 'module', 'action', 'title', 'description', 'subject_type', 'subject_id', 'properties'])]
class ActivityLog extends Model
{
    /** @use HasFactory<ActivityLogFactory> */
    use BelongsToCompany, HasFactory;

    protected function casts(): array
    {
        return ['properties' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** The record the action was about (an Employee, a payroll run...), when one was given. */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /** Inclusive date window; either end may be null. */
    public function scopeBetween(Builder $query, ?CarbonInterface $from, ?CarbonInterface $to): void
    {
        $query->when($from, fn ($q) => $q->where('created_at', '>=', $from->copy()->startOfDay()))
            ->when($to, fn ($q) => $q->where('created_at', '<=', $to->copy()->endOfDay()));
    }

    /** Free-text search over title, description, action and the actor's name. LIKE wildcards in the term are escaped. */
    public function scopeSearch(Builder $query, ?string $term): void
    {
        $term = trim((string) $term);
        if ($term === '') {
            return;
        }
        $like = '%'.addcslashes($term, '%_\\').'%';
        $query->where(fn ($q) => $q->where('title', 'like', $like)
            ->orWhere('description', 'like', $like)
            ->orWhere('action', 'like', $like)
            ->orWhere('actor', 'like', $like));
    }
}
