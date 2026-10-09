<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Holiday */
class HolidayResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'date' => $this->date->toDateString(),
            'formatted_date' => $this->date->format('M j, Y'),
            'year' => $this->year,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'multiplier' => $this->pay_rate_multiplier,
            'scope' => $this->scope->value,
            'scope_label' => $this->scope->label(),
            'branch_ids' => $this->branch_ids ?? [],
            'description' => $this->description,
            // Holidays the company added itself (not copied from the Philippine default calendar).
            'is_custom' => ! $this->is_default,
        ];
    }
}
