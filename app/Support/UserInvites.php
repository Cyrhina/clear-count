<?php

namespace App\Support;

use App\Models\User;
use App\Notifications\UserInvitation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

/** Creates an account with an unusable password and emails the invite link; the invitee sets their own password. */
final class UserInvites
{
    /** @param array<string, mixed> $attributes first_name, last_name, email, company_id, is_active, branch_id, employee_id */
    public static function create(array $attributes, string $role): User
    {
        $user = DB::transaction(function () use ($attributes, $role) {
            $user = new User([...$attributes, 'password' => Str::random(40)]);
            // Admin-provisioned, so the address counts as verified (otherwise the `verified` middleware would lock them out after reset).
            $user->forceFill(['email_verified_at' => now(), 'invited_at' => now()])->save();
            $user->assignRole($role);

            return $user;
        });

        self::send($user);

        return $user;
    }

    public static function send(User $user): void
    {
        $token = Password::broker()->createToken($user);
        $user->notify(new UserInvitation($token, Roles::LABELS[$user->getRoleNames()->first()] ?? 'a team member'));
    }
}
