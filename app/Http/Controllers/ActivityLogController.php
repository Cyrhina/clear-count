<?php

namespace App\Http\Controllers;

use App\Http\Requests\ActivityLogFilterRequest;
use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only audit trail for the Activity Log tab. Rows are limited to the signed-in user's company by the
 * model's global scope (super admins see all). The route group requires `users.manage`.
 */
class ActivityLogController extends Controller
{
    public function index(ActivityLogFilterRequest $request): JsonResponse
    {
        [$from, $to] = $request->window();

        $logs = ActivityLog::query()
            // One query for users and one for their roles, however many rows are on the page.
            ->with('user.roles')
            ->between($from, $to)
            ->when($request->input('module'), fn ($q, string $module) => $q->where('module', $module))
            ->when($request->input('action'), fn ($q, string $action) => $q->where('action', $action))
            ->when($request->input('user_id'), fn ($q, $id) => $q->where('user_id', $id))
            ->search($request->input('search'))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($request->perPage())
            ->withQueryString();

        return ActivityLogResource::collection($logs)->response();
    }

    public function show(ActivityLog $activityLog): JsonResponse
    {
        return (new ActivityLogResource($activityLog->load('user.roles')))->response();
    }

    /** Options for the Module and User dropdowns. */
    public function filters(Request $request): JsonResponse
    {
        $actor = $request->user();

        $modules = ActivityLog::query()->whereNotNull('module')->distinct()->orderBy('module')->pluck('module');
        $users = User::query()
            ->when(! $actor->hasRole(Roles::SUPER_ADMIN), fn ($q) => $q->where('company_id', $actor->company_id))
            ->whereIn('id', ActivityLog::query()->whereNotNull('user_id')->select('user_id'))
            ->orderBy('first_name')->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name]);

        $actions = ActivityLog::query()->distinct()->orderBy('action')->pluck('action');

        return response()->json(['data' => ['modules' => $modules, 'actions' => $actions, 'users' => $users]]);
    }
}
