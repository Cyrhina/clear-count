<?php

namespace App\Http\Resources;

use App\Support\Roles;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/** @mixin \App\Models\ActivityLog */
class ActivityLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // `actor` is the name saved with the entry, so rows survive a deleted user.
        $name = $this->user?->name ?? $this->actor;
        $role = $this->user?->roles->first()?->name;

        return [
            'id' => $this->id,
            'formatted_date' => $this->created_at->format('M j, Y'),
            'formatted_time' => $this->created_at->format('g:i A'),
            'created_at' => $this->created_at->toIso8601String(),
            'user' => [
                'id' => $this->user_id,
                'name' => $name,
                'initials' => $this->initials($name),
                'role' => $role ? (Roles::LABELS[$role] ?? $role) : null,
            ],
            'module' => $this->module,
            'action' => $this->action,
            'title' => $this->title,
            'description' => $this->description,
            // Drill-down extras only on the single-entry endpoint.
            $this->mergeWhen($request->route('activityLog') !== null, fn () => [
                'subject_type' => $this->subject_type ? class_basename($this->subject_type) : null,
                'subject_id' => $this->subject_id,
                'properties' => $this->properties,
            ]),
        ];
    }

    private function initials(string $name): string
    {
        return Str::of($name)->explode(' ')->filter()->take(2)->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->implode('');
    }
}
