import type { Role } from '@ops/types/domain'

export type Capability =
  | 'dashboard.view'
  | 'profile.view'
  | 'employees.view'
  | 'employees.pay.view'
  | 'employees.edit'
  | 'employees.compensation.edit'
  | 'employees.government.edit'
  | 'employees.bank.edit'
  | 'employees.separate'
  | 'attendance.view'
  | 'attendance.adjust'
  | 'attendance.approve'
  | 'attendance.import'
  | 'schedules.view'
  | 'schedules.manage'
  | 'overtime.view'
  | 'overtime.log'
  | 'overtime.approve'
  | 'compensation_approvals.manage'
  | 'leave.view'
  | 'leave.request'
  | 'leave.approve'
  | 'leave.manage_types'
  | 'payroll.view'
  | 'payroll.run'
  | 'payroll.approve'
  | 'payroll.finalize'
  | 'payroll.inputs.view'
  | 'statutory.view'
  | 'statutory.edit'
  | 'payslips.view'
  | 'payslips.generate'
  | 'loans.view'
  | 'loans.manage'
  | 'bonuses.view'
  | 'bonuses.manage'
  | 'thirteenth_month.view'
  | 'thirteenth_month.manage'
  | 'ess.view'
  | 'reports.view'
  | 'reports.workforce.view'
  | 'reports.payroll.view'
  | 'insights.view'
  | 'approvals.view'
  | 'notifications.view'
  | 'notifications.send'
  | 'users.manage'
  | 'settings.company.edit'
  | 'settings.payroll.edit'
  | 'branches.manage'
  | 'integrations.manage'
  | 'subscription.manage'
  | 'onboarding.manage'
  | 'platform.admin'

const ALL_ADMIN_CAPS: Capability[] = [
  'dashboard.view',
  'employees.view',
  'employees.pay.view',
  'employees.edit',
  'employees.compensation.edit',
  'employees.government.edit',
  'employees.bank.edit',
  'employees.separate',
  'attendance.view',
  'attendance.adjust',
  'attendance.approve',
  'attendance.import',
  'schedules.view',
  'schedules.manage',
  'overtime.view',
  'overtime.log',
  'overtime.approve',
  'compensation_approvals.manage',
  'leave.view',
  'leave.request',
  'leave.approve',
  'leave.manage_types',
  'payroll.view',
  'payroll.run',
  'payroll.approve',
  'payroll.finalize',
  'payroll.inputs.view',
  'statutory.view',
  'statutory.edit',
  'payslips.view',
  'payslips.generate',
  'loans.view',
  'loans.manage',
  'bonuses.view',
  'bonuses.manage',
  'thirteenth_month.view',
  'thirteenth_month.manage',
  'reports.view',
  'reports.workforce.view',
  'reports.payroll.view',
  'insights.view',
  'approvals.view',
  'notifications.view',
  'notifications.send',
  'users.manage',
  'settings.company.edit',
  'settings.payroll.edit',
  'branches.manage',
  'integrations.manage',
  'subscription.manage',
  'onboarding.manage',
]

export const ROLE_PERMISSIONS: Record<Role, Capability[]> = {
  super_admin: [...ALL_ADMIN_CAPS, 'platform.admin'],
  company_admin: ALL_ADMIN_CAPS,
  // People and time: records, attendance, schedules, leave, overtime, structure and announcements. No pay rates,
  // payroll, bank details or separations — those stay with payroll and the Company Admin.
  hr_admin: [
    'dashboard.view',
    'profile.view',
    'employees.view',
    'employees.pay.view',
    'employees.edit',
    'employees.government.edit',
    'attendance.view',
    'attendance.adjust',
    'attendance.approve',
    'attendance.import',
    'schedules.view',
    'schedules.manage',
    'overtime.view',
    'overtime.log',
    'overtime.approve',
    'leave.view',
    'leave.request',
    'leave.approve',
    'leave.manage_types',
    'compensation_approvals.manage',
    'payroll.view',
    'payslips.view',
    'loans.view',
    'loans.manage',
    'bonuses.view',
    'bonuses.manage',
    'thirteenth_month.view',
    'reports.view',
    'reports.workforce.view',
    'approvals.view',
    'notifications.view',
    'notifications.send',
    'branches.manage',
  ],
  // Runs payroll from approved records: payroll runs and their inputs, statutory and tax, payslips, loans and
  // deductions, bonuses, 13th month and payroll reports. Time, output and leave are approved by HR and managers —
  // payroll only reads them (Payroll Inputs).
  payroll_admin: [
    'dashboard.view',
    'profile.view',
    'payroll.view',
    'payroll.run',
    'payroll.approve',
    'payroll.finalize',
    'payroll.inputs.view',
    'statutory.view',
    'statutory.edit',
    'payslips.view',
    'payslips.generate',
    'loans.view',
    'loans.manage',
    'bonuses.view',
    'bonuses.manage',
    'thirteenth_month.view',
    'thirteenth_month.manage',
    'reports.view',
    'reports.payroll.view',
    'notifications.view',
    'settings.payroll.edit',
  ],
  // Their team only (branch-scoped): view attendance and request adjustments (for themselves and their team — HR approves),
  // approve work and output, view overtime and leave requests (and file overtime for the team), view leave credits, team reports. View-only team roster without pay details; no payroll.
  manager: [
    'dashboard.view',
    'employees.view',
    'attendance.view',
    'attendance.adjust',
    'schedules.view',
    'schedules.manage',
    'overtime.view',
    'overtime.log',
    'leave.view',
    'compensation_approvals.manage',
    'reports.view',
    'approvals.view',
    'notifications.view',
    'ess.view',
  ],
  employee: ['ess.view', 'notifications.view'],
}

export function roleHasCapability(role: Role, capability: Capability): boolean {
  return ROLE_PERMISSIONS[role]?.includes(capability) ?? false
}
