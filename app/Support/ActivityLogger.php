<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Records one audit-trail entry. Call it from controllers/services after the action succeeded:
 *
 *   ActivityLogger::log(module: 'Attendance', action: 'Approved', title: 'Attendance Adjustment',
 *       description: 'Time in / time out correction', subject: $adjustment);
 *
 * The actor defaults to the signed-in user; IP address and user agent are captured from the current request.
 * Entries belong to the actor's company, so a call with no user (e.g. from a console command) is skipped
 * unless a user is passed explicitly.
 */
class ActivityLogger
{
    /**
     * @param  array<string, mixed>  $properties  Extra context stored as JSON (merged with ip/user_agent).
     */
    public static function log(
        string $module,
        string $action,
        string $title,
        ?string $description = null,
        ?Model $subject = null,
        ?User $user = null,
        array $properties = [],
    ): ?ActivityLog {
        $user ??= auth()->user();
        if (! $user?->company_id) {
            return null;
        }

        $request = request();

        return ActivityLog::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'actor' => $user->name,
            'module' => $module,
            'action' => $action,
            'title' => $title,
            'description' => $description,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'properties' => array_filter([
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                ...$properties,
            ], fn ($v) => $v !== null) ?: null,
        ]);
    }
}
