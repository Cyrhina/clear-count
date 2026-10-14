import { buildSampleLoans } from '@ops/features/ess/sampleData'
import { getAttendanceRecords } from '@ops/lib/services/attendanceService'
import { getPayrollPeriods } from '@ops/lib/services/payrollService'
import { roleHasCapability } from '@ops/lib/rbac/permissions'
import { formatCurrency } from '@ops/lib/utils/format'
import { db } from '@ops/mock-data'
import type { SessionUser } from '@ops/types/domain'

// mock: remove in P13 (loan notice), P14 (reports). Payslip notices are stored notifications now (sent when a run is finalized). Requests waiting for approval and their decisions are stored notifications now (notificationApiService); only these derived ones remain.
export interface AppNotification {
  id: string
  /** Stored notifications only: false until opened. */
  read?: boolean
  message: string
  tone: 'default' | 'success' | 'warning' | 'danger'
  timestamp: string
  link?: string
  /** Record id to scroll to and briefly highlight on the destination page, if the notification refers to one specific row. */
  highlightId?: string
  /** Tab to switch to on the destination page before highlighting, for pages where the target lives on a non-default tab. */
  tab?: string
}

export async function getNotifications(session: SessionUser): Promise<AppNotification[]> {
  const notifications: AppNotification[] = []

  if (roleHasCapability(session.role, 'attendance.view')) {
    const records = await getAttendanceRecords(session)
    const latest = [...new Set(records.map((r) => r.date))].sort().pop()
    const absent = latest ? records.filter((r) => r.date === latest && r.status === 'absent').length : 0
    const incomplete = latest ? records.filter((r) => r.date === latest && r.status !== 'absent' && (!r.timeIn || !r.timeOut)).length : 0
    if (absent > 0) {
      notifications.push({ id: 'team-absent', message: `${absent} team member${absent === 1 ? ' was' : 's were'} absent on ${latest}`, tone: 'default', timestamp: new Date().toISOString(), link: '/attendance' })
    }
    if (incomplete > 0) {
      notifications.push({ id: 'team-missing-time', message: `${incomplete} attendance record${incomplete === 1 ? ' is' : 's are'} missing a time in or time out on ${latest}`, tone: 'warning', timestamp: new Date().toISOString(), link: '/attendance' })
    }
  }

  if (roleHasCapability(session.role, 'payroll.run')) {
    const periods = await getPayrollPeriods(session)
    const draftPeriods = periods.filter((p) => p.status === 'draft' || p.status === 'review')
    draftPeriods.forEach((period) => {
      notifications.push({
        id: `payroll-reminder-${period.id}`,
        message: `Payroll for "${period.label}" is ${period.status === 'draft' ? 'waiting to be run' : 'awaiting approval'} — pay date ${period.payDate}`,
        tone: 'default',
        timestamp: new Date().toISOString(),
        link: `/payroll/${period.id}`,
      })
    })
  }

  if (session.employeeId) {
    const employee = db.employees.find((e) => e.id === session.employeeId)
    if (employee) {
      // Loan payment confirmation — from real repayment history if this employee has one,
      // else the same illustrative sample loan shown on `/ess/loans` when there's no real
      // loan yet.
      const loanWithHistory = db.loans.find((l) => l.employeeId === employee.id && l.repaymentHistory && l.repaymentHistory.length > 0)
      if (loanWithHistory) {
        const lastPayment = loanWithHistory.repaymentHistory!.at(-1)!
        notifications.push({
          id: `loan-payment-${loanWithHistory.id}`,
          message: `Loan payment of ${formatCurrency(lastPayment.amount)} processed for "${loanWithHistory.label}"`,
          tone: 'success',
          timestamp: lastPayment.date,
          link: '/ess/loans',
          highlightId: loanWithHistory.id,
        })
      } else {
        const sampleLoan = buildSampleLoans(employee.id, employee.companyId)[0]
        notifications.push({
          id: `loan-payment-${sampleLoan.id}`,
          message: `Loan payment of ${formatCurrency(sampleLoan.monthlyDeduction)} processed for "${sampleLoan.label}"`,
          tone: 'success',
          timestamp: new Date().toISOString(),
          link: '/ess/loans',
          highlightId: sampleLoan.id,
        })
      }
    }
  }

  return notifications.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
