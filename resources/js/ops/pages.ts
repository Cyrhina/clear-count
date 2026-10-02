import { ForgotPasswordPage } from '@ops/features/auth/ForgotPasswordPage'
import { LoginPage } from '@ops/features/auth/LoginPage'
import { ResetPasswordPage } from '@ops/features/auth/ResetPasswordPage'
import { lazy, type ComponentType } from 'react'

const page = (load: () => Promise<object>, name: string) =>
  lazy(async () => ({ default: (await load() as Record<string, ComponentType>)[name] }))

/** Page key (sent by OpsController) => frontend-ops page component. */
export const OPS_PAGES: Record<string, ComponentType> = {
  dashboard: page(() => import('@ops/features/dashboard/routes'), 'DashboardPage'),
  'employees.index': page(() => import('@ops/features/employees/routes'), 'EmployeeListPage'),
  'employees.show': page(() => import('@ops/features/employees/routes'), 'EmployeeProfilePage'),
  attendance: page(() => import('@ops/features/attendance/routes'), 'AttendancePage'),
  overtime: page(() => import('@ops/features/overtime/routes'), 'OvertimePage'),
  approvals: page(() => import('@ops/features/approvals/routes'), 'CompensationApprovalsPage'),
  leave: page(() => import('@ops/features/leave/routes'), 'LeavePage'),
  'payroll.index': page(() => import('@ops/features/payroll/routes'), 'PayrollListPage'),
  'payroll.show': page(() => import('@ops/features/payroll/routes'), 'PayrollPeriodDetailPage'),
  'bonuses.index': page(() => import('@ops/features/bonuses/routes'), 'BonusesPage'),
  'bonuses.payslip': page(() => import('@ops/features/bonuses/BonusPayslipPage'), 'BonusPayslipPage'),
  'thirteenth.index': page(() => import('@ops/features/thirteenth-month/routes'), 'ThirteenthMonthPage'),
  'thirteenth.payslip': page(() => import('@ops/features/thirteenth-month/ThirteenthMonthPayslipPage'), 'ThirteenthMonthPayslipPage'),
  'payslips.index': page(() => import('@ops/features/payslips/routes'), 'PayslipsListPage'),
  'payslips.show': page(() => import('@ops/features/payslips/routes'), 'PayslipDetailPage'),
  statutory: page(() => import('@ops/features/statutory/routes'), 'StatutoryPage'),
  loans: page(() => import('@ops/features/loans-deductions/routes'), 'LoansDeductionsPage'),
  'ess.home': page(() => import('@ops/features/ess/routes'), 'EssHomePage'),
  'ess.profile': page(() => import('@ops/features/ess/routes'), 'EssProfilePage'),
  'ess.payslips': page(() => import('@ops/features/ess/routes'), 'EssPayslipsPage'),
  'ess.payslips.show': page(() => import('@ops/features/ess/routes'), 'EssPayslipDetailPage'),
  'ess.attendance': page(() => import('@ops/features/ess/routes'), 'EssAttendancePage'),
  'ess.overtime': page(() => import('@ops/features/ess/routes'), 'EssOvertimePage'),
  'ess.leave': page(() => import('@ops/features/ess/routes'), 'EssLeavePage'),
  'ess.loans': page(() => import('@ops/features/ess/routes'), 'EssLoansPage'),
  notifications: page(() => import('@ops/features/notifications/routes'), 'NotificationsPage'),
  'reports.index': page(() => import('@ops/features/reports/routes'), 'ReportsPage'),
  'reports.show': page(() => import('@ops/features/reports/routes'), 'ReportDetailPage'),
  insights: page(() => import('@ops/features/insights/routes'), 'InsightsPage'),
  'user-access': page(() => import('@ops/features/user-access/routes'), 'UserAccessPage'),
  'company-settings': page(() => import('@ops/features/company-settings/routes'), 'CompanySettingsPage'),
  onboarding: page(() => import('@ops/features/onboarding/routes'), 'OnboardingPage'),
  branches: page(() => import('@ops/features/branches/routes'), 'BranchesPage'),
  subscription: page(() => import('@ops/features/subscription/routes'), 'SubscriptionPage'),
  integrations: page(() => import('@ops/features/integrations/routes'), 'IntegrationsPage'),
  'platform.companies': page(() => import('@ops/features/platform/CompaniesPage'), 'CompaniesPage'),
  // Eager (not lazy) so the server-rendered guest pages hydrate without a Suspense mismatch.
  'auth.login': LoginPage,
  'auth.forgot': ForgotPasswordPage,
  'auth.reset': ResetPasswordPage,
  forbidden: page(() => import('@ops/features/misc/ForbiddenPage'), 'ForbiddenPage'),
}
