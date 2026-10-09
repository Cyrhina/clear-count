<?php

namespace App\Support;

/** Role names (stored as Spatie roles, seeded by RoleSeeder) with their display labels. */
final class Roles
{
    public const SUPER_ADMIN = 'super_admin';

    public const LABELS = [
        'super_admin' => 'Super Admin',
        'company_admin' => 'Company Admin',
        'hr_admin' => 'HR Admin',
        'payroll_admin' => 'Payroll Admin',
        'manager' => 'Manager',
        'employee' => 'Employee',
    ];

    /** @return list<string> */
    public static function names(): array
    {
        return array_keys(self::LABELS);
    }
}
