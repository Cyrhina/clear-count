<?php

namespace App\Http\Resources;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Branch */
class BranchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'is_head_office' => $this->is_head_office,
            'address' => $this->address,
            'city' => $this->city,
            'contact_number' => $this->contact_number,
            'email' => $this->email,
            'opened_date' => $this->opened_date?->toDateString(),
            // Present when the controller loaded the counts.
            'headcount' => $this->whenCounted('employees'),
            'active_count' => $this->whenHas('active_count'),
        ];
    }
}
