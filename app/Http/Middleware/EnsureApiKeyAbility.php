<?php

namespace App\Http\Middleware;

use App\Support\Plans;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

/**
 * `api.key:<ability>` for the public read API: the request must carry an API key (never a browser session) that holds the
 * ability, and the company must still have the API in its plan.
 */
class EnsureApiKeyAbility
{
    public function handle(Request $request, Closure $next, string $ability): Response
    {
        $token = $request->user()?->currentAccessToken();
        if (! $token instanceof PersonalAccessToken) {
            return response()->json(['message' => 'Use an API key.'], 401);
        }
        if (! $token->can($ability)) {
            return response()->json(['message' => "This API key does not have the {$ability} ability."], 403);
        }
        if (! $request->user()->company || ! Plans::has($request->user()->company, 'api_integrations')) {
            return response()->json(['message' => 'API access is not included in the plan of this company.'], 403);
        }

        return $next($request);
    }
}
