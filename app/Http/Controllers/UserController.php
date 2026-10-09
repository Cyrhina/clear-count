<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Requests\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Notifications\UserInvitation;
use App\Support\ActivityLogger;
use App\Support\Roles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * JSON endpoints behind the Users tab of User & Access Management (session auth + CSRF, like the rest of the app).
 * Authorization lives in UserPolicy; the route group already requires `users.manage`.
 */
class UserController extends Controller
{
    private const SORTABLE = ['first_name', 'last_name', 'email', 'last_login_at', 'created_at'];

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'role' => ['nullable', Rule::in(Roles::names())],
            'sort' => ['nullable', Rule::in(self::SORTABLE)],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $actor = $request->user();
        $users = User::query()
            ->with('roles')
            // Tenant boundary: only a super admin sees users outside their own company.
            ->when(! $actor->hasRole(Roles::SUPER_ADMIN), fn ($q) => $q->where('company_id', $actor->company_id)
                // ...and a non-super admin never sees super admin accounts at all.
                ->whereDoesntHave('roles', fn ($r) => $r->where('name', Roles::SUPER_ADMIN)))
            ->when($filters['search'] ?? null, fn ($q, string $term) => $this->search($q, $term))
            ->when($filters['status'] ?? null, fn ($q, string $s) => $q->where('is_active', $s === 'active'))
            ->when($filters['role'] ?? null, fn ($q, string $role) => $q->role($role))
            ->orderBy($filters['sort'] ?? 'first_name', $filters['direction'] ?? 'asc')
            ->orderBy('id')
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();

        return UserResource::collection($users)->response();
    }

    /** Create the account and email an invite link. The invitee sets their own password; nobody ever sees one. */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $actor = $request->user();
        $data = $request->validated();
        $companyId = $actor->hasRole(Roles::SUPER_ADMIN) ? ($data['company_id'] ?? $actor->company_id) : $actor->company_id;

        $user = DB::transaction(function () use ($data, $companyId) {
            $user = new User([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                // Unusable random password; the hashed cast stores it hashed. The invite link replaces it.
                'password' => Str::random(40),
                'company_id' => $companyId,
                'is_active' => ($data['status'] ?? 'active') === 'active',
            ]);
            // Admin-provisioned, so the address counts as verified (otherwise the `verified` middleware would lock them out after reset).
            $user->forceFill(['email_verified_at' => now(), 'invited_at' => now()])->save();
            $user->assignRole($data['role']);

            return $user;
        });

        $this->sendInvite($user);
        ActivityLogger::log(module: 'User Access', action: 'Invited', title: 'User invitation', description: "{$user->email} as ".Roles::LABELS[$data['role']], subject: $user);

        return (new UserResource($user->load('roles')))->response()->setStatusCode(201);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): JsonResponse
    {
        $role = $request->validated('role');
        $previous = $user->getRoleNames()->first();

        $user->syncRoles([$role]);
        ActivityLogger::log(module: 'User Access', action: 'Updated', title: 'User role', description: "{$user->email}: ".($previous ?? 'none')." → {$role}", subject: $user);

        return (new UserResource($user->load('roles')))->response();
    }

    /** Flips active/inactive, or sets it explicitly when `status` is sent. Own account is refused by the policy. */
    public function toggleStatus(UpdateUserStatusRequest $request, User $user): JsonResponse
    {
        $active = isset($request->validated()['status']) ? $request->validated('status') === 'active' : ! $user->is_active;

        $user->forceFill(['is_active' => $active])->save();
        ActivityLogger::log(module: 'User Access', action: $active ? 'Reactivated' : 'Deactivated', title: 'User account', description: $user->email, subject: $user);

        return (new UserResource($user->load('roles')))->response();
    }

    /** Issues a fresh invite link. Only for people who never signed in; everyone else uses resetAccess. */
    public function resendInvite(Request $request, User $user): JsonResponse
    {
        $this->authorize('resendInvite', $user);

        if ($user->last_login_at !== null) {
            return response()->json(['message' => 'This user has already signed in. Use reset access instead.'], 422);
        }

        $user->forceFill(['invited_at' => now()])->save();
        $this->sendInvite($user);
        ActivityLogger::log(module: 'User Access', action: 'Invited', title: 'Invitation resent', description: $user->email, subject: $user);

        return (new UserResource($user->load('roles')))->response();
    }

    /** Emails the standard password-reset link to a user who already has access. */
    public function resetAccess(Request $request, User $user): JsonResponse
    {
        $this->authorize('resetAccess', $user);

        $status = Password::sendResetLink(['email' => $user->email]);
        if ($status === Password::RESET_THROTTLED) {
            return response()->json(['message' => 'A reset link was sent recently. Try again in a minute.'], 429);
        }
        ActivityLogger::log(module: 'User Access', action: 'Sent', title: 'Password reset link', description: $user->email, subject: $user);

        return response()->json(['message' => 'Password reset link sent.']);
    }

    /** Every word typed must match the first name, last name or email, so "ana cruz" finds Ana Cruz. LIKE wildcards are escaped. */
    private function search($query, string $term): void
    {
        foreach (preg_split('/\s+/', trim($term)) as $word) {
            $like = '%'.addcslashes($word, '%_\\').'%';
            $query->where(fn ($w) => $w->where('first_name', 'like', $like)->orWhere('last_name', 'like', $like)->orWhere('email', 'like', $like));
        }
    }

    private function sendInvite(User $user): void
    {
        $token = Password::broker()->createToken($user);
        $user->notify(new UserInvitation($token, Roles::LABELS[$user->getRoleNames()->first()] ?? 'a team member'));
    }
}
