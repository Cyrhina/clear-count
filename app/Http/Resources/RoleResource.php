<?php

namespace App\Http\Resources;

use App\Enums\CapabilityArea;
use App\Support\CapabilityCatalog;
use App\Support\Roles;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A role for the Permission Map: summary numbers for the card view, and (when `detailed`) the full matrix.
 *
 * @mixin \Spatie\Permission\Models\Role
 */
class RoleResource extends JsonResource
{
    /** How many capability tags the card shows before "+N more". */
    private const PREVIEW_SIZE = 3;

    private bool $detailed = false;

    public function detailed(): static
    {
        $this->detailed = true;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $order = array_flip(array_keys(CapabilityCatalog::CAPABILITIES));
        // Catalog order keeps previews and groups stable no matter how rows come out of the database.
        $names = $this->permissions->pluck('name')->sortBy(fn (string $n) => $order[$n] ?? PHP_INT_MAX)->values();
        $byArea = $names->groupBy(fn (string $n) => CapabilityCatalog::area($n)->value);

        $data = [
            'id' => $this->id,
            'name' => Roles::LABELS[$this->name] ?? $this->name,
            'slug' => $this->name,
            'description' => CapabilityCatalog::ROLE_DESCRIPTIONS[$this->name] ?? null,
            'is_system_defined' => isset(Roles::LABELS[$this->name]),
            'capabilities_count' => $names->count(),
            'areas_count' => $byArea->count(),
            'capabilities_preview' => $names->take(self::PREVIEW_SIZE)->all(),
            'capabilities_by_area' => $byArea->map->values()->all(),
        ];

        if (! $this->detailed) {
            return $data;
        }

        // The matrix: every area, in display order, split into what this role grants and what it does not.
        $granted = $names->flip();
        $data['areas'] = collect(CapabilityArea::cases())->map(function (CapabilityArea $area) use ($granted) {
            $all = collect(CapabilityCatalog::CAPABILITIES)->keys()->filter(fn (string $n) => CapabilityCatalog::area($n) === $area);

            return [
                'key' => $area->value,
                'label' => $area->label(),
                'description' => $area->description(),
                'granted' => $all->filter(fn ($n) => $granted->has($n))->values()->map(fn ($n) => $this->capability($n))->all(),
                'not_granted' => $all->reject(fn ($n) => $granted->has($n))->values()->map(fn ($n) => $this->capability($n))->all(),
            ];
        })->all();

        return $data;
    }

    /** @return array<string, string|null> */
    private function capability(string $name): array
    {
        return ['name' => $name, 'label' => CapabilityCatalog::label($name), 'description' => CapabilityCatalog::description($name)];
    }
}
