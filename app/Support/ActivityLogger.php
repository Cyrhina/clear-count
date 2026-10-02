<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogger
{
    public static function log(string $action, ?string $details = null, ?User $user = null): void
    {
        $user ??= auth()->user();
        if (! $user?->company_id) {
            return;
        }

        ActivityLog::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'actor' => $user->name,
            'action' => $action,
            'details' => $details,
        ]);
    }
}
