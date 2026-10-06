<?php

namespace App\Support;

/**
 * Capability strings mirror frontend-ops `lib/rbac/permissions.ts`.
 * Stored as Spatie permissions; roles map to them via ROLE_PERMISSIONS.
 */
final class Capabilities
{
    public const ADMIN = [
        'dashboard.view', 'employees.view', 'employees.edit', 'employees.compensation.edit',
        'employees.government.edit', 'employees.bank.edit', 'employees.separate',
        'attendance.view', 'attendance.adjust', 'attendance.approve',
        'schedules.view', 'schedules.manage',
        'overtime.view', 'overtime.log', 'overtime.approve', 'compensation_approvals.manage',
        'leave.view', 'leave.request', 'leave.approve', 'leave.manage_types',
        'payroll.view', 'payroll.run', 'payroll.approve', 'payroll.finalize',
        'statutory.view', 'statutory.edit', 'payslips.view', 'payslips.generate',
        'loans.view', 'loans.manage', 'bonuses.view', 'bonuses.manage',
        'thirteenth_month.view', 'thirteenth_month.manage',
        'reports.view', 'reports.payroll.view', 'insights.view', 'approvals.view',
        'notifications.view', 'notifications.send',
        'users.manage', 'settings.company.edit', 'settings.payroll.edit', 'branches.manage',
        'integrations.manage', 'subscription.manage', 'onboarding.manage',
    ];

    public const ROLE_PERMISSIONS = [
        'super_admin' => [...self::ADMIN, 'platform.admin'],
        'company_admin' => self::ADMIN,
        // People, time, benefits and loans; views payroll results. No payroll processing, bank details or separations.
        'hr_admin' => [
            'dashboard.view', 'employees.view', 'employees.edit', 'employees.government.edit',
            'attendance.view', 'attendance.adjust', 'attendance.approve', 'schedules.view', 'schedules.manage',
            'overtime.view', 'overtime.log', 'overtime.approve',
            'leave.view', 'leave.request', 'leave.approve', 'leave.manage_types', 'compensation_approvals.manage',
            'payroll.view', 'payslips.view', 'loans.view', 'loans.manage', 'bonuses.view', 'bonuses.manage', 'thirteenth_month.view',
            'reports.view', 'approvals.view',
            'notifications.view', 'notifications.send', 'branches.manage',
        ],
        'payroll_admin' => [
            'dashboard.view', 'employees.view', 'employees.bank.edit', 'attendance.view', 'schedules.view',
            'overtime.view', 'overtime.log', 'overtime.approve', 'leave.view',
            'payroll.view', 'payroll.run', 'payroll.approve', 'payroll.finalize',
            'statutory.view', 'statutory.edit', 'payslips.view', 'payslips.generate',
            'loans.view', 'loans.manage', 'bonuses.view', 'bonuses.manage',
            'thirteenth_month.view', 'thirteenth_month.manage',
            'reports.view', 'reports.payroll.view', 'approvals.view', 'notifications.view', 'settings.payroll.edit',
        ],
        'manager' => [
            'dashboard.view', 'attendance.view', 'attendance.approve', 'schedules.view',
            'overtime.view', 'overtime.approve', 'leave.view', 'leave.approve',
            'reports.view', 'reports.payroll.view', 'approvals.view', 'notifications.view', 'ess.view',
        ],
        'employee' => ['ess.view', 'notifications.view'],
    ];

    /** @return list<string> */
    public static function all(): array
    {
        return array_values(array_unique([...self::ADMIN, 'ess.view', 'platform.admin']));
    }
}
