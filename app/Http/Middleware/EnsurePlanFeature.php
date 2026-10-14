<?php

namespace App\Http\Middleware;

use App\Support\Plans;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * `plan:<feature>` blocks the route when the company's plan does not include the feature; `plan:<feature>,writes` blocks only
 * the requests that change data, so the reports and dashboards of a lower plan can still read the (empty) module.
 * A super admin has no company and is never blocked.
 */
class EnsurePlanFeature
{
    public function handle(Request $request, Closure $next, string $feature, ?string $mode = null): Response
    {
        $company = $request->user()?->company;
        if (! $company || ($mode === 'writes' && $request->isMethodSafe()) || Plans::has($company, $feature)) {
            return $next($request);
        }

        $label = config("plans.feature_labels.{$feature}", $feature);
        $tier = Plans::tier(Plans::minimumTierFor($feature))['label'];

        return response()->json(['message' => "{$label} is available in the {$tier} plan."], 403);
    }
}
