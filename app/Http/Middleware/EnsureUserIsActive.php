<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // An inactive account, or any account of a company the super admin has suspended, is signed out.
        if ($user && (! $user->is_active || $user->company?->status === 'suspended')) {
            // An API key has no session to end: it is simply refused until the account is active again.
            if ($user->currentAccessToken() instanceof PersonalAccessToken) {
                return response()->json(['message' => 'This account is not active.'], 401);
            }

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return $request->expectsJson() ? response()->json(['message' => 'This account is not active.'], 401) : redirect()->route('login');
        }

        return $next($request);
    }
}
