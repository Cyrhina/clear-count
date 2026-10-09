<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Roles;

/**
 * Who may manage whom. Every ability needs `users.manage`; on top of that:
 *  - a user can only manage users of their own company (super admins: any company);
 *  - nobody but a super admin may touch a super admin account or hand out the super_admin role;
 *  - nobody may deactivate or change the role of their own account ("Is You" guard, prevents lock-out).
 */
class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('users.manage');
    }

    public function create(User $actor): bool
    {
        return $actor->can('users.manage');
    }

    /** Whether $actor may assign $role to someone (used by create and role change). */
    public function assignRole(User $actor, string $role): bool
    {
        return $role !== Roles::SUPER_ADMIN || $actor->hasRole(Roles::SUPER_ADMIN);
    }

    public function updateRole(User $actor, User $target): bool
    {
        return $this->manages($actor, $target) && ! $actor->is($target);
    }

    public function toggleStatus(User $actor, User $target): bool
    {
        return $this->manages($actor, $target) && ! $actor->is($target);
    }

    public function resendInvite(User $actor, User $target): bool
    {
        return $this->manages($actor, $target);
    }

    public function resetAccess(User $actor, User $target): bool
    {
        return $this->manages($actor, $target);
    }

    private function manages(User $actor, User $target): bool
    {
        if (! $actor->can('users.manage')) {
            return false;
        }
        if ($target->hasRole(Roles::SUPER_ADMIN) && ! $actor->hasRole(Roles::SUPER_ADMIN)) {
            return false;
        }

        return $actor->hasRole(Roles::SUPER_ADMIN) || $actor->company_id === $target->company_id;
    }
}
