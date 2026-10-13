<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Builder;

/**
 * For rows that hold a value "from a date on" (pay rates, rule versions). `effectiveOn($date)->first()` is the row in force that day:
 * the latest one starting on or before it.
 */
trait EffectiveDated
{
    /** @param Builder<static> $query */
    public function scopeEffectiveOn(Builder $query, string $date, string $column = 'effective_from'): void
    {
        $query->whereDate($column, '<=', $date)->orderByDesc($column)->orderByDesc('id');
    }
}
