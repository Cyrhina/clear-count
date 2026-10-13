<?php

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The paging, sorting and search words every list endpoint shares. `from()` validates `search`, `sort`, `direction` and
 * `per_page`; the endpoint adds its own filters and calls `paginate()`.
 */
final class ListQuery
{
    private function __construct(
        public readonly string $search,
        public readonly string $sort,
        public readonly string $direction,
        public readonly int $perPage,
    ) {}

    /** @param list<string> $sortable */
    public static function from(Request $request, array $sortable, string $defaultSort): self
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::in($sortable)],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        return new self(trim($data['search'] ?? ''), $data['sort'] ?? $defaultSort, $data['direction'] ?? 'asc', (int) ($data['per_page'] ?? 25));
    }

    /**
     * LIKE patterns, one per typed word (wildcards escaped), so "ana cruz" must match both words.
     *
     * @return list<string>
     */
    public function likeWords(): array
    {
        return array_map(fn (string $w) => '%'.addcslashes($w, '%_\\').'%', array_filter(preg_split('/\s+/', $this->search) ?: []));
    }

    /** @param Builder<*> $query */
    public function paginate(Builder $query): LengthAwarePaginator
    {
        return $query->orderBy($this->sort, $this->direction)->orderBy('id')->paginate($this->perPage)->withQueryString();
    }
}
