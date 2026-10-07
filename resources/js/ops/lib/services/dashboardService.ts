import { daysUntil, describeDeadline, nextDueDate, toIsoDate } from '@ops/lib/payroll/complianceDeadlines'
import { getEmployees } from '@ops/lib/services/employeeService'
import { getAttendanceAdjustments, getAttendanceRecords } from '@ops/lib/services/attendanceService'
import { getCompensationApprovals } from '@ops/lib/services/compensationApprovalService'
import { getLeaveRequests } from '@ops/lib/services/leaveService'
import { getOvertimeRecords } from '@ops/lib/services/overtimeService'
import { scopeForSession } from '@ops/lib/tenancy/tenantScope'
import { db } from '@ops/mock-data'
import type { SessionUser } from '@ops/types/domain'

export interface DashboardStats {
  headcount: number
  activeHeadcount: number
  nextPayrollDate: string
  payrollPeriodLabel: string
  payrollStatus: 'open' | 'review' | 'approved' | 'finalized'
  pendingApprovals: number
  attendanceRate: number
  onLeaveToday: number
  alerts: { id: string; message: string; tone: 'warning' | 'danger' }[]
}

export async function getDashboardStats(session: SessionUser): Promise<DashboardStats> {
  const employees = scopeForSession(db.employees, session)
  const active = employees.filter((e) => e.employment.status === 'active')

  return {
    headcount: employees.length,
    activeHeadcount: active.length,
    nextPayrollDate: '2026-09-30',
    payrollPeriodLabel: 'Sep 16 – Sep 30, 2026',
    payrollStatus: 'open',
    pendingApprovals: Math.max(2, Math.round(active.length * 0.12)),
    attendanceRate: 96.4,
    onLeaveToday: Math.max(0, Math.round(active.length * 0.05)),
    alerts: [
      { id: 'a1', message: 'Statutory contribution rate table for 2026 needs review before the next payroll run.', tone: 'warning' },
      { id: 'a2', message: `${Math.max(1, Math.round(active.length * 0.08))} employees have incomplete government ID numbers.`, tone: 'danger' },
    ],
  }
}

export function getHeadcountTrend(session: SessionUser) {
  const employees = scopeForSession(db.employees, session)
  const base = Math.max(4, employees.length - 10)
  return Array.from({ length: 6 }).map((_, i) => ({
    month: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][i],
    headcount: base + i * 2,
  }))
}

export interface AdminDashboardOverview {
  greetingName: string
  metrics: {
    totalEmployees: number
    activeEmployees: number
    inactiveEmployees: number
    presentToday: number
    attendanceRate: number
    onLeaveToday: number
    leaveApproved: number
    leavePending: number
    overtimeToday: number
    overtimeEmployees: number
    /** Approved overtime hours logged today. */
    overtimeHours: number
    payrollStatusLabel: string
    payrollCutoffLabel: string
    /** The pay period currently in the payroll cycle, e.g. "Sep 16 – 30, 2026". */
    payrollPeriodLabel: string
    nextCutoffLabel: string
  }
  payrollChart: { month: string; grossPay: number; netPay: number }[]
  payrollCalendar: { id: string; dateLabel: string; fullDate: string; title: string; description: string; state: 'done' | 'current' | 'upcoming' }[]
  recentEmployees: { id: string; name: string; department: string; position: string; hiredLabel: string; status: 'active' | 'on_leave' | 'inactive' }[]
  /** Upcoming payroll and statutory deadlines, soonest first. */
  reminders: {
    id: string
    title: string
    summary: string
    category: 'Payroll' | 'SSS' | 'PhilHealth' | 'Pag-IBIG' | 'BIR' | 'Other'
    /** ISO date (YYYY-MM-DD). */
    dueDate: string
    dueLabel: string
    /** Whole days from today; 0 = due today, negative = overdue. */
    daysLeft: number
    /** Days before the due date from which the reminder is highlighted. */
    remindDaysBefore: number
    /** Page where the admin acts on this reminder. */
    to: string
  }[]
}

export interface PendingRequestsSummary {
  leavePending: number
  overtimePending: number
  nightDiffPending: number
  attendanceAdjustmentsPending: number
  compensationApprovalsPending: number
}

/** Real, live counts of everything awaiting admin review — powers the Dashboard's "Pending Requests" widget. */
export async function getPendingRequestsSummary(session: SessionUser): Promise<PendingRequestsSummary> {
  const [leaveRequests, overtimeRecords, adjustments, compensationApprovals] = await Promise.all([
    getLeaveRequests(session),
    getOvertimeRecords(session),
    getAttendanceAdjustments(session),
    getCompensationApprovals(session),
  ])

  return {
    leavePending: leaveRequests.filter((r) => r.status === 'pending').length,
    overtimePending: overtimeRecords.filter((r) => r.status === 'pending' && r.type !== 'night_diff').length,
    nightDiffPending: overtimeRecords.filter((r) => r.status === 'pending' && r.type === 'night_diff').length,
    attendanceAdjustmentsPending: adjustments.filter((a) => a.status === 'pending').length,
    compensationApprovalsPending: compensationApprovals.filter((a) => a.status === 'pending').length,
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const fmtShort = (d: Date) => `${MONTHS[d.getMonth()].toUpperCase()} ${d.getDate()}`
const fmtLong = (d: Date) => d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })

/** Semi-monthly cut-offs (15th and month-end) around `today`, each with its processing (+3 days) and release (+5 days) dates. */
function payrollCycles(today: Date) {
  const cycles: { periodStart: Date; cutoff: Date; processing: Date; release: Date }[] = []
  for (let m = -1; m <= 1; m++) {
    const year = today.getFullYear()
    const month = today.getMonth() + m
    const mid = new Date(year, month, 15)
    const end = new Date(year, month + 1, 0)
    cycles.push({ periodStart: new Date(year, month, 1), cutoff: mid, processing: addDays(mid, 3), release: addDays(mid, 5) })
    cycles.push({ periodStart: new Date(year, month, 16), cutoff: end, processing: addDays(end, 3), release: addDays(end, 5) })
  }
  return cycles
}

/**
 * Company Admin's home dashboard. Numbers are illustrative mock data (not
 * derived from the live employee roster) so the widget set — payroll trend,
 * upcoming payroll calendar, recent hires, announcements — renders fully
 * out of the box regardless of how much seed data a demo company has.
 * Dates are relative to today so the payroll calendar is always "upcoming".
 */
export async function getAdminDashboardOverview(session: SessionUser): Promise<AdminDashboardOverview> {
  const today = startOfDay(new Date())

  // The cycle in progress: the first one whose release date hasn't passed yet.
  const cycles = payrollCycles(today)
  const current = cycles.find((c) => c.release >= today) ?? cycles[cycles.length - 1]
  const next = cycles[cycles.indexOf(current) + 1] ?? current
  const stateOf = (d: Date): 'done' | 'current' | 'upcoming' => (d < today ? 'done' : d.getTime() === today.getTime() ? 'current' : 'upcoming')
  const status =
    today < current.cutoff
      ? 'Open for Cut-off'
      : today < current.processing
        ? 'Ready for Processing'
        : today < current.release
          ? 'Processing'
          : 'Releasing Today'
  const periodLabel = `${MONTHS[current.periodStart.getMonth()]} ${current.periodStart.getDate()} – ${current.cutoff.getDate()}, ${current.cutoff.getFullYear()}`

  // Last six completed months for the payroll trend (e.g. Apr–Sep when viewed in October).
  const PAYROLL_TREND = [
    { grossPay: 4850000, netPay: 4120000 },
    { grossPay: 4920000, netPay: 4180000 },
    { grossPay: 5100000, netPay: 4340000 },
    { grossPay: 5260000, netPay: 4460000 },
    { grossPay: 5480000, netPay: 4650000 },
    { grossPay: 5720000, netPay: 4860000 },
  ]
  const payrollChart = PAYROLL_TREND.map((values, i) => ({ month: MONTHS[(today.getMonth() - 6 + i + 12) % 12], ...values }))

  // Reminders come from the Compliance Deadlines configured under Company & Payroll Settings → Payroll
  // Calendar, plus the payroll cut-off of the cycle in progress (derived from the payroll cycle above).
  const cutoffDue = today <= current.cutoff ? current.cutoff : next.cutoff
  const configuredReminders: AdminDashboardOverview['reminders'] = db.complianceDeadlines
    .filter((d) => d.companyId === session.companyId && d.enabled)
    .flatMap((d) => {
      const due = nextDueDate(d, today)
      return due
        ? [
            {
              id: d.id,
              title: d.name,
              summary: describeDeadline(d, due),
              category: d.category,
              dueDate: toIsoDate(due),
              dueLabel: fmtLong(due),
              daysLeft: daysUntil(due, today),
              remindDaysBefore: d.remindDaysBefore,
              to: d.to ?? '/company-settings',
            },
          ]
        : []
    })
  const reminders = [
    ...configuredReminders,
    {
      id: 'rem-cutoff',
      title: 'Payroll Cut-off',
      summary: 'Finalize attendance adjustments, overtime, leave and loan deductions before the cut-off.',
      category: 'Payroll' as const,
      dueDate: toIsoDate(cutoffDue),
      dueLabel: fmtLong(cutoffDue),
      daysLeft: daysUntil(cutoffDue, today),
      remindDaysBefore: 7,
      to: '/payroll',
    },
  ]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5)

  return {
    greetingName: session.name.split(' ')[0],
    metrics: {
      totalEmployees: 128,
      activeEmployees: 120,
      inactiveEmployees: 8,
      presentToday: 112,
      attendanceRate: 87.5,
      onLeaveToday: 8,
      leaveApproved: 6,
      leavePending: 2,
      overtimeToday: 11,
      overtimeEmployees: 11,
      overtimeHours: 26.5,
      payrollStatusLabel: status,
      payrollCutoffLabel: `Cut-off: ${fmtLong(current.cutoff)}`,
      payrollPeriodLabel: periodLabel,
      nextCutoffLabel: fmtLong(today <= current.cutoff ? current.cutoff : next.cutoff),
    },
    payrollChart,
    payrollCalendar: [
      {
        id: 'cutoff',
        dateLabel: fmtShort(current.cutoff),
        fullDate: fmtLong(current.cutoff),
        title: 'Cut-off Date',
        description: `Time and attendance, leaves, OT, and loans finalization for ${periodLabel}.`,
        state: stateOf(current.cutoff),
      },
      {
        id: 'processing',
        dateLabel: fmtShort(current.processing),
        fullDate: fmtLong(current.processing),
        title: 'Payroll Processing',
        description: 'Generate, review, and approve the payroll run.',
        state: stateOf(current.processing),
      },
      {
        id: 'release',
        dateLabel: fmtShort(current.release),
        fullDate: fmtLong(current.release),
        title: 'Payroll Release',
        description: 'Salaries credited to employee bank accounts; payslips emailed.',
        state: stateOf(current.release),
      },
      {
        id: 'next-cutoff',
        dateLabel: fmtShort(next.cutoff),
        fullDate: fmtLong(next.cutoff),
        title: 'Next Cut-off',
        description: 'Following pay period closes.',
        state: stateOf(next.cutoff),
      },
    ],
    // The five most recently hired active employees — the same people the Employees page lists when sorted by newest hire.
    recentEmployees: (await getEmployees(session))
      .filter((e) => e.employment.status === 'active')
      .sort((a, b) => b.employment.dateHired.localeCompare(a.employment.dateHired))
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        name: `${e.personal.firstName} ${e.personal.lastName}`,
        department: e.employment.department,
        position: e.employment.position,
        hiredLabel: fmtLong(new Date(`${e.employment.dateHired}T00:00:00`)),
        status: 'active' as const,
      })),
    reminders,
  }
}

export interface WorkforceCharts {
  /** Last working days, oldest first: head counts by attendance outcome (leave comes from approved leave requests). */
  attendance: { day: string; present: number; late: number; undertime: number; absent: number; onLeave: number }[]
  /** Headcount per department, largest first. */
  headcount: { department: string; active: number; inactive: number }[]
}

const ATTENDANCE_DAYS = 7

/** Live attendance and headcount charts for the HR dashboard, derived from the employee roster, attendance records and leave requests. */
export async function getWorkforceCharts(session: SessionUser): Promise<WorkforceCharts> {
  const [employees, records, leaves] = await Promise.all([getEmployees(session), getAttendanceRecords(session), getLeaveRequests(session)])

  const dates = [...new Set(records.map((r) => r.date))].sort().slice(-ATTENDANCE_DAYS)
  const approvedLeaves = leaves.filter((l) => l.status === 'approved')
  const attendance = dates.map((date) => {
    const day = records.filter((r) => r.date === date)
    const count = (status: string) => day.filter((r) => r.status === status).length
    const [, m, d] = date.split('-').map(Number)
    return {
      day: `${MONTHS[m - 1]} ${d}`,
      present: count('present'),
      late: count('late'),
      undertime: count('undertime'),
      absent: count('absent'),
      onLeave: approvedLeaves.filter((l) => l.dateFrom <= date && l.dateTo >= date).length,
    }
  })

  const byDepartment = new Map<string, { active: number; inactive: number }>()
  for (const e of employees) {
    const key = e.employment.department || 'Unassigned'
    const entry = byDepartment.get(key) ?? { active: 0, inactive: 0 }
    if (e.employment.status === 'active') entry.active += 1
    else entry.inactive += 1
    byDepartment.set(key, entry)
  }
  const headcount = [...byDepartment.entries()]
    .map(([department, counts]) => ({ department, ...counts }))
    .sort((a, b) => b.active + b.inactive - (a.active + a.inactive))

  return { attendance, headcount }
}

export interface PayrollDashboard {
  /** The run in progress (latest one not yet finalized), or the latest run when everything is finalized. */
  current?: { id: string; payrollNumber: string; label: string; status: 'draft' | 'review' | 'approved' | 'finalized'; payDate: string; employees: number }
  totals: { grossPay: number; totalDeductions: number; netPay: number; employerContributions: number; payrollCost: number }
  counts: { periods: number; pendingRuns: number; awaitingApproval: number; approvedNotFinalized: number }
  pendingRecords: { workLogs: number; overtime: number; leave: number; adjustments: number }
  exceptions: { id: string; message: string; tone: 'danger' | 'warning'; to: string }[]
  /** Gross, deductions and net per run, oldest first (last 6 runs). */
  trend: { run: string; grossPay: number; deductions: number; netPay: number }[]
  /** Where the deductions of the current run go. */
  deductionBreakdown: { name: string; value: number }[]
  /** Runs by stage of the Create → Review → Approve → Finalize flow. */
  pipeline: { stage: string; runs: number }[]
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

/** Payroll Admin's home: the run in progress, what it costs, what is waiting on approval and what looks wrong. */
export async function getPayrollDashboard(session: SessionUser): Promise<PayrollDashboard> {
  const periods = db.payrollPeriods.filter((p) => p.companyId === session.companyId).sort((a, b) => b.startDate.localeCompare(a.startDate))
  const focus = periods.find((p) => p.status !== 'finalized') ?? periods[0]
  const lines = focus ? db.payrollLines.filter((l) => l.periodId === focus.id) : []
  const employeesById = new Map(scopeForSession(db.employees, session).map((e) => [e.id, e]))
  const name = (id: string) => {
    const e = employeesById.get(id)
    return e ? `${e.personal.firstName} ${e.personal.lastName}` : 'An employee'
  }

  const employer = sum(lines.map((l) => l.sssEmployerShare + l.philhealthEmployerShare + l.pagibigEmployerShare))
  const grossPay = sum(lines.map((l) => l.grossPay))
  const totals = { grossPay, totalDeductions: sum(lines.map((l) => l.totalDeductions)), netPay: sum(lines.map((l) => l.netPay)), employerContributions: employer, payrollCost: grossPay + employer }

  const workLogs = db.compensationApprovals.filter((a) => a.companyId === session.companyId && a.status === 'pending').length
  const overtime = db.overtimeRecords.filter((r) => r.companyId === session.companyId && r.status === 'pending').length
  const leave = db.leaveRequests.filter((r) => r.companyId === session.companyId && r.status === 'pending').length
  const adjustments = db.attendanceAdjustments.filter((a) => a.companyId === session.companyId && a.status === 'pending').length

  const exceptions: PayrollDashboard['exceptions'] = []
  const runTo = focus ? `/payroll/${focus.id}` : '/payroll'
  const lowNet = lines.filter((l) => l.netPay <= 0)
  if (lowNet.length) exceptions.push({ id: 'zero-net', message: `${lowNet.length} employee${lowNet.length === 1 ? '' : 's'} with zero or negative net pay${lowNet.length <= 2 ? ` (${lowNet.map((l) => name(l.employeeId)).join(', ')})` : ''}.`, tone: 'danger', to: runTo })
  const held = focus?.excludedEmployeeIds?.length ?? 0
  if (held) exceptions.push({ id: 'held', message: `${held} employee${held === 1 ? ' is' : 's are'} held out of the current run.`, tone: 'warning', to: runTo })
  const active = [...employeesById.values()].filter((e) => e.employment.status === 'active')
  const noBank = active.filter((e) => !e.bank?.accountNumber).length
  if (noBank) exceptions.push({ id: 'no-bank', message: `${noBank} active employee${noBank === 1 ? ' has' : 's have'} no bank account on file.`, tone: 'warning', to: runTo })
  const noGov = active.filter((e) => !e.government?.sssNo || !e.government?.philhealthNo || !e.government?.pagibigNo || !e.government?.tinNo).length
  if (noGov) exceptions.push({ id: 'no-gov', message: `${noGov} active employee${noGov === 1 ? ' has' : 's have'} incomplete government ID numbers.`, tone: 'warning', to: '/statutory' })
  if (workLogs) exceptions.push({ id: 'pending-logs', message: `${workLogs} hourly/output record${workLogs === 1 ? ' is' : 's are'} not approved yet and won't be paid until approved.`, tone: 'warning', to: '/payroll-inputs' })

  const pending = periods.filter((p) => p.status === 'draft' || p.status === 'review')
  const totalOf = (select: (l: (typeof lines)[number]) => number) => sum(lines.map(select))
  const sumDeductionLines = (items: { amount: number }[]) => sum(items.map((i) => i.amount))
  const trend = periods
    .slice(0, 6)
    .reverse()
    .map((p) => {
      const ls = db.payrollLines.filter((l) => l.periodId === p.id)
      return { run: p.payrollNumber, grossPay: sum(ls.map((l) => l.grossPay)), deductions: sum(ls.map((l) => l.totalDeductions)), netPay: sum(ls.map((l) => l.netPay)) }
    })
  const deductionBreakdown = [
    { name: 'SSS', value: totalOf((l) => l.sssEmployeeShare) },
    { name: 'PhilHealth', value: totalOf((l) => l.philhealthEmployeeShare) },
    { name: 'Pag-IBIG', value: totalOf((l) => l.pagibigEmployeeShare) },
    { name: 'Withholding tax', value: totalOf((l) => l.withholdingTax) },
    { name: 'Loans', value: totalOf((l) => sumDeductionLines(l.loanDeductions)) },
    { name: 'Other deductions', value: totalOf((l) => sumDeductionLines(l.otherDeductions)) },
  ].filter((d) => d.value > 0)
  const pipeline = [
    { stage: 'Draft', runs: periods.filter((p) => p.status === 'draft').length },
    { stage: 'In review', runs: periods.filter((p) => p.status === 'review').length },
    { stage: 'Approved', runs: periods.filter((p) => p.status === 'approved').length },
    { stage: 'Finalized', runs: periods.filter((p) => p.status === 'finalized').length },
  ]
  return {
    current: focus ? { id: focus.id, payrollNumber: focus.payrollNumber, label: focus.label, status: focus.status, payDate: focus.payDate, employees: lines.length } : undefined,
    totals,
    counts: {
      periods: periods.length,
      pendingRuns: pending.length,
      awaitingApproval: periods.filter((p) => p.status === 'review').length,
      approvedNotFinalized: periods.filter((p) => p.status === 'approved').length,
    },
    pendingRecords: { workLogs, overtime, leave, adjustments },
    exceptions,
    trend,
    deductionBreakdown,
    pipeline,
  }
}
