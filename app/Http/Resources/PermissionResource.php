<?php

namespace App\Http\Resources;

use App\Support\CapabilityCatalog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** One capability (a stored permission) with its display metadata. @mixin \Spatie\Permission\Models\Permission */
class PermissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $area = CapabilityCatalog::area($this->name);

        return [
            'name' => $this->name,
            'label' => CapabilityCatalog::label($this->name),
            'description' => CapabilityCatalog::description($this->name),
            'area' => $area->value,
            'area_label' => $area->label(),
        ];
    }
}
