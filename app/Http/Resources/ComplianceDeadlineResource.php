<?php

namespace App\Http\Resources;

use App\Models\ComplianceDeadline;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ComplianceDeadline */
class ComplianceDeadlineResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'description' => $this->description,
            'frequency' => $this->frequency,
            'due_day' => $this->due_day,
            'due_month' => $this->due_month,
            'due_date' => $this->due_date?->toDateString(),
            'remind_days_before' => $this->remind_days_before,
            'enabled' => $this->enabled,
            'link' => $this->link,
            'is_custom' => $this->is_custom,
        ];
    }
}
