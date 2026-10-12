<?php

namespace App\Support;

/**
 * Capability strings mirror frontend-ops `lib/rbac/permissions.ts`.
 * Stored as Spatie permissions; roles map to them via ROLE_PERMISSIONS.
 */
final class Capabilities
{
    public const ADMIN = [
        'dashboard.view', 'profile.view', 'employees.view', 'employees.pay.view', 'employees.edit', 'employees.compensation.edit',
        'employees.government.edit', 'employees.bank.edit', 'employees.separate',
        'attendance.view', 'attendance.adjust', 'attendance.approve', 'attendance.import',
        'schedules.view', 'schedules.manage',
        'overtime.view', 'overtime.log', 'overtime.approve', 'compensation_approvals.manage',
        'leave.view', 'leave.request', 'leave.approve', 'leave.manage_types',
        'payroll.view', 'payroll.run', 'payroll.approve', 'payroll.finalize', 'payroll.inputs.view',
        'statutory.view', 'statutory.edit', 'payslips.view', 'payslips.generate',
        'loans.view', 'loans.manage', 'bonuses.view', 'bonuses.manage',
        'thirteenth_month.view', 'thirteenth_month.manage',
        'reports.view', 'reports.workforce.view', 'reports.payroll.view', 'insights.view', 'approvals.view',
        'notifications.view', 'notifications.send',
        'users.manage', 'settings.company.edit', 'settings.payroll.edit', 'branches.manage',
        'integrations.manage', 'subscription.manage', 'onboarding.manage',
    ];

    public const ROLE_PERMISSIONS = [
        'super_admin' => [...self::ADMIN, 'platform.admin'],
        'company_admin' => self::ADMIN,
        // People, time, benefits and loans; no Payroll Runs access. No payroll processing, bank details or separations.
        'hr_admin' => [
            'dashboard.view', 'profile.view', 'employees.view', 'employees.pay.view', 'employees.edit', 'employees.government.edit',
            'attendance.view', 'attendance.adjust', 'attendance.approve', 'attendance.import', 'schedules.view', 'schedules.manage',
            'overtime.view', 'overtime.log', 'overtime.approve',
            'leave.view', 'leave.request', 'leave.approve', 'leave.manage_types', 'compensation_approvals.manage',
            'payslips.view', 'loans.view', 'loans.manage', 'bonuses.view', 'bonuses.manage', 'thirteenth_month.view',
            'reports.view', 'reports.workforce.view', 'approvals.view',
            'notifications.view', 'notifications.send', 'branches.manage',
        ],
        // Payroll from approved records; time, output and leave are read through Payroll Inputs.
        'payroll_admin' => [
            'dashboard.view', 'profile.view', 'payroll.view', 'payroll.run', 'payroll.approve', 'payroll.finalize', 'payroll.inputs.view',
            'statutory.view', 'statutory.edit', 'payslips.view', 'payslips.generate',
            'loans.view', 'loans.manage', 'bonuses.view', 'bonuses.manage',
            'thirteenth_month.view', 'thirteenth_month.manage',
            'reports.view', 'reports.payroll.view', 'notifications.view', 'settings.payroll.edit',
        ],
        // Their team only (branch-scoped): attendance, work and output, leave and overtime approvals, team reports.
        'manager' => [
            'dashboard.view', 'profile.view', 'employees.view', 'attendance.view', 'attendance.adjust', 'schedules.view', 'schedules.manage',
            'overtime.view', 'overtime.log', 'leave.view', 'compensation_approvals.manage',
            'reports.view', 'approvals.view', 'notifications.view', 'ess.view',
        ],
        'employee' => ['ess.view', 'notifications.view'],
    ];

    /** @return list<string> */
    public static function all(): array
    {
        return array_values(array_unique([...self::ADMIN, 'ess.view', 'platform.admin', 'profile.view']));
    }
}
