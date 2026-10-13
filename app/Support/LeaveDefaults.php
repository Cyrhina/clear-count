<?php

namespace App\Support;

use App\Models\LeaveType;

/** The leave types every company starts with. */
final class LeaveDefaults
{
    /** name, description, paid, yearly credits, max carry-over */
    private const TYPES = [
        ['Vacation Leave', 'Planned time off.', true, 15, 5],
        ['Sick Leave', 'Illness or medical appointments.', true, 10, 0],
        ['Emergency Leave', 'Unplanned urgent matters.', true, 5, 0],
        ['Maternity/Paternity Leave', 'Leave around the birth of a child.', true, 7, 0],
    ];

    /**
     * Makes sure the company has its leave types (none yet: the defaults above). Returns true when it created them.
     * shortcut: runs on first use; company creation moves here when Platform & Subscriptions (P15) builds it.
     */
    public static function ensure(int $companyId): bool
    {
        if (LeaveType::withoutGlobalScopes()->where('company_id', $companyId)->exists()) {
            return false;
        }
        foreach (self::TYPES as [$name, $description, $paid, $credits, $carry]) {
            LeaveType::withoutGlobalScopes()->create(['company_id' => $companyId, 'name' => $name, 'description' => $description, 'is_paid' => $paid, 'default_credits' => $credits, 'max_carry_over' => $carry]);
        }

        return true;
    }
}
