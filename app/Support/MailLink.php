<?php

namespace App\Support;

/** Shared bits of the invite and reset-password emails. */
final class MailLink
{
    public static function passwordReset(string $token, string $email): string
    {
        return url(route('password.reset', ['token' => $token, 'email' => $email], false));
    }

    /** How long the link lives, from the password broker config, e.g. "24 hours". */
    public static function expiryText(): string
    {
        $minutes = (int) config('auth.passwords.'.config('auth.defaults.passwords').'.expire');

        return $minutes % 60 === 0
            ? ($minutes / 60).' hour'.($minutes === 60 ? '' : 's')
            : "{$minutes} minutes";
    }
}
