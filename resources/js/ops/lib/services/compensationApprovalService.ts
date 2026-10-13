// mock: remove in P13 (ESS work output), P10 (payroll), P14 (dashboards, reports). The Approvals page uses workLogApiService.
import { workLogsForPeriod } from '@ops/lib/payroll/rateBasis'
import { getEmployees } from '@ops/lib/services/employeeService'
import { db } from '@ops/mock-data'
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

/** Active hourly/output employees a payroll run over `period` covers (its Payroll Group, when it has one). */
function workLogEmployeesFor(session: SessionUser, period: PeriodScope) {
  const group = period.payrollGroupId ? db.payrollGroups.find((g) => g.id === period.payrollGroupId) : undefined
  return db.employees.filter(
    (e) =>
      e.companyId === session.companyId &&
      e.employment.status === 'active' &&
      (e.compensation.payType === 'hourly' || e.compensation.payType === 'output_based') &&
      (!group || group.employeeIds.includes(e.id)),
  )
}

/**
 * Approved hourly/output work logs a payroll period pays (or, for a draft, would pay if run now) —
 * uses the engine's own selection rule, scoped to the period's Payroll Group when it has one.
 */
export async function getWorkLogSummaryForPeriod(session: SessionUser, period: PeriodScope): Promise<WorkLogSummary> {
  const employees = workLogEmployeesFor(session, period)

  const summary: WorkLogSummary = {
    hourly: { records: 0, quantity: 0, amount: 0 },
    output: { records: 0, quantity: 0, amount: 0 },
    pendingCount: 0,
    rejectedCount: 0,
    excludedApprovedCount: 0,
  }
  for (const employee of employees) {
    const logs = workLogsForPeriod(employee.id, period, db.compensationApprovals)
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
  const employees = await getEmployees(session)
  const employeeIds = new Set(employees.map((e) => e.id))
  return db.compensationApprovals
    .filter((a) => a.companyId === session.companyId && employeeIds.has(a.employeeId))
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

export interface WorkLogInput {
  employeeId: string
  workDate: string
  quantity: number
  description: string
}

/** An employee files their own hours (hourly) or units completed (output-based); it waits as pending for the manager. */
export async function submitWorkLog(session: SessionUser, input: WorkLogInput): Promise<CompensationApproval | undefined> {
  if (session.employeeId !== input.employeeId || !(input.quantity > 0)) return undefined
  const employee = db.employees.find((e) => e.id === input.employeeId && e.companyId === session.companyId)
  if (!employee) return undefined
  const isOutput = employee.compensation.payType === 'output_based'
  const rate = employee.compensation.basicPay
  const entry: CompensationApproval = {
    id: `${employee.id}_compappr_${crypto.randomUUID().slice(0, 8)}`,
    companyId: session.companyId,
    employeeId: employee.id,
    type: isOutput ? 'output' : 'hourly',
    workDate: input.workDate,
    quantity: input.quantity,
    unitLabel: isOutput ? (employee.compensation.outputUnit ?? 'Per Unit') : 'hrs',
    rate,
    amount: Math.round(input.quantity * rate * 100) / 100,
    description: input.description,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  }
  db.compensationApprovals.push(entry)
  return entry
}

/** Withdraws the employee's own entry while it is still pending. */
export async function withdrawWorkLog(session: SessionUser, id: string): Promise<boolean> {
  const index = db.compensationApprovals.findIndex((a) => a.id === id && a.employeeId === session.employeeId && a.status === 'pending')
  if (index < 0) return false
  db.compensationApprovals.splice(index, 1)
  return true
}
