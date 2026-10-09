<?php

namespace App\Http\Controllers;

use App\Enums\CapabilityArea;
use App\Http\Resources\PermissionResource;
use App\Http\Resources\RoleResource;
use App\Support\CapabilityCatalog;
use App\Support\Roles;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Read-only data behind the Permission Map tab. Roles and their capabilities are seeded (RoleSeeder) and
 * checked by the permission middleware / Gate, so nothing here can change anyone's access.
 * The route group already requires `users.manage`.
 */
class PermissionMapController extends Controller
{
    /** Role cards: summary counts and a few capability tags each, in the order of Roles::LABELS. */
    public function index(): JsonResponse
    {
        $order = array_flip(Roles::names());
        $roles = Role::with('permissions')->whereIn('name', Roles::names())->get()
            ->sortBy(fn (Role $r) => $order[$r->name])->values();

        return RoleResource::collection($roles)->response();
    }

    /** One role with its full capability matrix. */
    public function show(Role $role): JsonResponse
    {
        return (new RoleResource($role->load('permissions')))->detailed()->response();
    }

    /** Every capability in the system grouped by area, for the matrix filter pills. */
    public function capabilities(): JsonResponse
    {
        $stored = Permission::pluck('name')->flip();
        $inCatalog = collect(CapabilityCatalog::CAPABILITIES)->keys()->filter(fn (string $n) => $stored->has($n));
        $permissions = Permission::whereIn('name', $inCatalog)->get()->keyBy('name');

        $areas = collect(CapabilityArea::cases())->map(fn (CapabilityArea $area) => [
            'key' => $area->value,
            'label' => $area->label(),
            'description' => $area->description(),
            'capabilities' => PermissionResource::collection(
                $inCatalog->filter(fn (string $n) => CapabilityCatalog::area($n) === $area)->map(fn (string $n) => $permissions[$n])->values(),
            )->resolve(),
        ])->filter(fn (array $a) => $a['capabilities'] !== [])->values();

        return response()->json(['data' => $areas, 'meta' => ['capabilities_count' => $inCatalog->count(), 'areas_count' => $areas->count()]]);
    }
}
