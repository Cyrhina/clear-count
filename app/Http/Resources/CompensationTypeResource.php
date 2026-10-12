<?php

namespace App\Http\Resources;

use App\Models\CompensationType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CompensationType */
class CompensationTypeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'kind' => $this->kind->value,
            'config' => $this->config ?? [],
            'is_active' => $this->is_active,
        ];
    }
}
