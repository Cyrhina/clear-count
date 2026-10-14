// Read helpers for the dashboards, reports and the payroll run screen: work logs on the API (the Approvals and ESS pages use workLogApiService directly).
import { memoRead } from '@ops/lib/api/memo'
import { workLogsForPeriod } from '@ops/lib/payroll/rateBasis'
import { getEmployees } from '@ops/lib/services/employeeService'
import { fetchPeriodRecords } from '@ops/lib/services/payrollApiService'
import { fetchWorkLogs } from '@ops/lib/services/workLogApiService'
import type { CompensationApproval, PayrollPeriod, SessionUser } from '@ops/types/domain'

export interface WorkLogTotals {
  records: number
  quantity: number
  amount: number
}

export interface WorkLogSummary {
  hourly: WorkLogTotals
  output: WorkLogTotals
  pendingCount: number
  rejectedCount: number
  /** Approved entries in range this period does not pay: already paid by another run, or (after a run) approved too late for it. */
  excludedApprovedCount: number
}

type PeriodScope = Pick<PayrollPeriod, 'id' | 'status' | 'startDate' | 'endDate' | 'payrollGroupId'>

/**
 * Approved hourly/output work logs a payroll period pays (or, for a draft, would pay if run now) — uses the engine's own
 * selection rule over the logs of the period's dates (the server sends the ones of its Payroll Group).
 */
export async function getWorkLogSummaryForPeriod(session: SessionUser, period: PeriodScope): Promise<WorkLogSummary> {
  const [{ workLogs }, employees] = await Promise.all([fetchPeriodRecords(period.id), getEmployees(session)])

  const summary: WorkLogSummary = {
    hourly: { records: 0, quantity: 0, amount: 0 },
    output: { records: 0, quantity: 0, amount: 0 },
    pendingCount: 0,
    rejectedCount: 0,
    excludedApprovedCount: 0,
  }
  for (const employee of employees.filter((e) => e.employment.status === 'active' && (e.compensation.payType === 'hourly' || e.compensation.payType === 'output_based'))) {
    const logs = workLogsForPeriod(employee.id, period, workLogs)
    const bucket = employee.compensation.payType === 'hourly' ? summary.hourly : summary.output
    const quantity = logs.payable.reduce((sum, a) => sum + a.quantity, 0)
    bucket.records += logs.payable.length
    bucket.quantity += quantity
    bucket.amount += Math.round(quantity * employee.compensation.basicPay * 100) / 100
    summary.pendingCount += logs.pendingCount
    summary.rejectedCount += logs.rejectedCount
    summary.excludedApprovedCount += logs.inRange.filter((a) => a.status === 'approved' && !logs.payable.includes(a)).length
  }
  return summary
}

export async function getCompensationApprovals(session: SessionUser): Promise<CompensationApproval[]> {
  return (await memoRead(`work-logs:${session.id}`, fetchWorkLogs)).slice().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}
