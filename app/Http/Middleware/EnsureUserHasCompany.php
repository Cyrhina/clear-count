<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** A user without a company (the super admin) may read company data but cannot change it: there is no company to write into. */
class EnsureUserHasCompany
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->company_id && ! $request->isMethodSafe()) {
            return response()->json(['message' => 'This account does not belong to a company. Sign in with a company account to change company data.'], 422);
        }

        return $next($request);
    }
}
