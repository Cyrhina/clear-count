import { memoRead } from '@ops/lib/api/memo'
import { getAttendanceRecords } from '@ops/lib/services/attendanceService'
import { getEmployees } from '@ops/lib/services/employeeService'
import { fetchLeaveTypes } from '@ops/lib/services/leaveApiService'
import { getLeaveRequests } from '@ops/lib/services/leaveService'
import { fetchReportPayrollLines } from '@ops/lib/services/payrollApiService'
import { getPayrollLines, getPayrollPeriods } from '@ops/lib/services/payrollService'
import type { AttendanceStatus, Employee, PayrollLine, PayrollPeriod, SessionUser } from '@ops/types/domain'

export interface PayrollRegisterRow {
  employee: Employee
  grossPay: number
  totalDeductions: number
  netPay: number
  sssEmployeeShare: number
  philhealthEmployeeShare: number
  pagibigEmployeeShare: number
  withholdingTax: number
}

export interface PayrollRegisterReport {
  period: PayrollPeriod | undefined
  rows: PayrollRegisterRow[]
  totals: {
    grossPay: number
    totalDeductions: number
    netPay: number
  }
}

export async function getPayrollRegister(session: SessionUser, periodId: string | undefined): Promise<PayrollRegisterReport> {
  const periods = await getPayrollPeriods(session)
  const period = periods.find((p) => p.id === periodId) ?? periods[0]
  if (!period) return { period: undefined, rows: [], totals: { grossPay: 0, totalDeductions: 0, netPay: 0 } }

  const [lines, employees] = await Promise.all([getPayrollLines(session, period.id), getEmployees(session)])
  const employeeById = new Map(employees.map((e) => [e.id, e]))

  const rows = lines
    .map((line): PayrollRegisterRow | null => {
      const employee = employeeById.get(line.employeeId)
      if (!employee) return null
      return {
        employee,
        grossPay: line.grossPay,
        totalDeductions: line.totalDeductions,
        netPay: line.netPay,
        sssEmployeeShare: line.sssEmployeeShare,
        philhealthEmployeeShare: line.philhealthEmployeeShare,
        pagibigEmployeeShare: line.pagibigEmployeeShare,
        withholdingTax: line.withholdingTax,
      }
    })
    .filter((row): row is PayrollRegisterRow => row !== null)
    .sort((a, b) => a.employee.personal.lastName.localeCompare(b.employee.personal.lastName))

  const totals = rows.reduce(
    (acc, row) => ({
      grossPay: acc.grossPay + row.grossPay,
      totalDeductions: acc.totalDeductions + row.totalDeductions,
      netPay: acc.netPay + row.netPay,
    }),
    { grossPay: 0, totalDeductions: 0, netPay: 0 },
  )

  return { period, rows, totals }
}

export interface AttendanceSummaryRow {
  employee: Employee
  present: number
  late: number
  undertime: number
  absent: number
}

export async function getAttendanceSummary(session: SessionUser): Promise<AttendanceSummaryRow[]> {
  const [employees, records] = await Promise.all([getEmployees(session), getAttendanceRecords(session)])
  const employeeIds = new Set(employees.map((e) => e.id))
  const counts = new Map<string, Record<AttendanceStatus, number>>()

  for (const record of records) {
    if (!employeeIds.has(record.employeeId)) continue
    const bucket = counts.get(record.employeeId) ?? { present: 0, late: 0, undertime: 0, absent: 0 }
    bucket[record.status] += 1
    counts.set(record.employeeId, bucket)
  }

  return employees
    .map((employee) => {
      const bucket = counts.get(employee.id) ?? { present: 0, late: 0, undertime: 0, absent: 0 }
      return { employee, ...bucket }
    })
    .sort((a, b) => a.employee.personal.lastName.localeCompare(b.employee.personal.lastName))
}

export interface LeaveSummaryRow {
  employee: Employee
  leaveTypeName: string
  daysTaken: number
}

export async function getLeaveSummary(session: SessionUser): Promise<LeaveSummaryRow[]> {
  const [employees, requests, leaveTypes] = await Promise.all([getEmployees(session), getLeaveRequests(session), fetchLeaveTypes()])
  const employeeById = new Map(employees.map((e) => [e.id, e]))
  const leaveTypeById = new Map(leaveTypes.map((lt) => [lt.id, lt]))

  const totals = new Map<string, number>()
  for (const request of requests) {
    if (request.status !== 'approved' || !employeeById.has(request.employeeId)) continue
    const key = `${request.employeeId}::${request.leaveTypeId}`
    // The server worked out the days when the request was filed (rest days and holidays left out).
    totals.set(key, (totals.get(key) ?? 0) + (request.days ?? 0))
  }

  const rows: LeaveSummaryRow[] = []
  for (const [key, daysTaken] of totals) {
    const [employeeId, leaveTypeId] = key.split('::')
    const employee = employeeById.get(employeeId)
    const leaveType = leaveTypeById.get(leaveTypeId)
    if (!employee || !leaveType) continue
    rows.push({ employee, leaveTypeName: leaveType.name, daysTaken })
  }

  return rows.sort((a, b) => a.employee.personal.lastName.localeCompare(b.employee.personal.lastName))
}

export async function getEmployeeMasterlist(session: SessionUser): Promise<Employee[]> {
  const employees = await getEmployees(session)
  return [...employees].sort((a, b) => a.personal.lastName.localeCompare(b.personal.lastName))
}

export interface PayrollLineWithContext {
  period: PayrollPeriod
  line: PayrollLine
  employee: Employee
}

/**
 * The payroll lines of the last two calendar years and this one, joined with their period and employee — the shared dataset behind
 * every multi-period report (Payroll Summary, statutory/BIR reports, Advanced Analytics) so they all read the same payroll history.
 * shortcut: one request carries up to the last two years; a longer history needs a date range picker on the reports.
 */
export async function getAllPayrollLines(session: SessionUser): Promise<PayrollLineWithContext[]> {
  const [{ periods, lines }, employees] = await Promise.all([memoRead(`report-lines:${session.id}`, () => fetchReportPayrollLines()), getEmployees(session)])
  const employeeById = new Map(employees.map((e) => [e.id, e]))
  const periodById = new Map(periods.map((p) => [p.id, p]))

  const rows: PayrollLineWithContext[] = []
  for (const line of lines) {
    const period = periodById.get(line.periodId)
    const employee = employeeById.get(line.employeeId)
    if (period && employee) rows.push({ period, line, employee })
  }
  return rows.sort((a, b) => a.period.startDate.localeCompare(b.period.startDate))
}

export interface StatutoryContributionData {
  rows: PayrollLineWithContext[]
  /** Always false now: the report reads saved payroll only. Kept for the report's "sample data" notice. */
  isSample: boolean
}

/** The payroll lines of finalized runs the consolidated statutory report is built from. */
export async function getStatutoryContributionData(session: SessionUser): Promise<StatutoryContributionData> {
  return { rows: (await getAllPayrollLines(session)).filter((r) => r.period.status === 'finalized'), isSample: false }
}
