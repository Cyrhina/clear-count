<?php

namespace App\Http\Resources;

use App\Support\Roles;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $role = $this->getRoleNames()->first();
        $actor = $request->user();

        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $role,
            'role_label' => Roles::LABELS[$role] ?? $role,
            'status' => $this->is_active ? 'active' : 'inactive',
            // Invited but never signed in: the UI shows "Resend invite".
            'invite_pending' => $this->invited_at !== null && $this->last_login_at === null,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            // Lets the UI hide Deactivate / the role dropdown on your own row without comparing ids.
            'is_current_user' => $actor?->is($this->resource) ?? false,
            // Per-row abilities so the UI never offers an action the API would refuse.
            'can' => [
                'update_role' => $actor?->can('updateRole', $this->resource) ?? false,
                'toggle_status' => $actor?->can('toggleStatus', $this->resource) ?? false,
                'resend_invite' => $actor?->can('resendInvite', $this->resource) ?? false,
            ],
        ];
    }
}
