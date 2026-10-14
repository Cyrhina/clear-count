import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { daysUntil, describeDeadline, nextDueDate, toIsoDate } from '@ops/lib/payroll/complianceDeadlines'
import { getAttendanceAdjustments } from '@ops/lib/services/attendanceService'
import { getCompensationApprovals } from '@ops/lib/services/compensationApprovalService'
import { getLeaveRequests } from '@ops/lib/services/leaveService'
import { getOvertimeRecords } from '@ops/lib/services/overtimeService'
import { getComplianceDeadlines } from '@ops/lib/services/payrollConfigService'
import type { SessionUser } from '@ops/types/domain'

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

const parseDay = (iso: string) => new Date(`${iso}T00:00:00`)
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const fmtShort = (d: Date) => `${MONTHS[d.getMonth()].toUpperCase()} ${d.getDate()}`
const fmtLong = (d: Date) => d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })

interface OverviewResponse {
  metrics: Omit<AdminDashboardOverview['metrics'], 'payrollStatusLabel' | 'payrollCutoffLabel' | 'payrollPeriodLabel' | 'nextCutoffLabel'>
  /** The pay period in progress, from the payroll groups: its cut-off, the day it is processed and its pay date. */
  cycle: { periodStart: string; cutoff: string; processing: string; release: string; nextCutoff: string }
  payrollChart: AdminDashboardOverview['payrollChart']
  recentEmployees: { id: string; name: string; department: string; position: string; dateHired?: string }[]
}

/**
 * Company Admin's, HR's and Payroll's home overview: the head counts, today's attendance, leave and overtime, the pay cycle in progress
 * and the last months of finalized payroll come from the server; the reminders are the Compliance Deadlines configured under Company &
 * Payroll Settings plus the cut-off of that cycle.
 */
export async function getAdminDashboardOverview(session: SessionUser): Promise<AdminDashboardOverview> {
  const [res, deadlines] = await Promise.all([api.get<{ data: unknown }>('/api/dashboard/overview'), getComplianceDeadlines().catch(() => [])])
  const { metrics, cycle, payrollChart, recentEmployees } = camelizeKeys<OverviewResponse>(res.data)
  const today = startOfDay(new Date())
  const start = parseDay(cycle.periodStart)
  const cutoff = parseDay(cycle.cutoff)
  const processing = parseDay(cycle.processing)
  const release = parseDay(cycle.release)
  const nextCutoff = parseDay(cycle.nextCutoff)

  const stateOf = (d: Date): 'done' | 'current' | 'upcoming' => (d < today ? 'done' : d.getTime() === today.getTime() ? 'current' : 'upcoming')
  const status = today < cutoff ? 'Open for Cut-off' : today < processing ? 'Ready for Processing' : today < release ? 'Processing' : 'Releasing Today'
  const periodLabel = `${MONTHS[start.getMonth()]} ${start.getDate()} – ${cutoff.getDate()}, ${cutoff.getFullYear()}`

  // Reminders: the configured deadlines, plus the payroll cut-off of the cycle in progress (or the next one once it has passed).
  const cutoffDue = today <= cutoff ? cutoff : nextCutoff
  const configuredReminders: AdminDashboardOverview['reminders'] = deadlines
    .filter((d) => d.enabled)
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
    .sort((x, y) => x.dueDate.localeCompare(y.dueDate))
    .slice(0, 5)

  return {
    greetingName: session.name.split(' ')[0],
    metrics: {
      ...metrics,
      payrollStatusLabel: status,
      payrollCutoffLabel: `Cut-off: ${fmtLong(cutoff)}`,
      payrollPeriodLabel: periodLabel,
      nextCutoffLabel: fmtLong(cutoffDue),
    },
    payrollChart,
    payrollCalendar: [
      { id: 'cutoff', dateLabel: fmtShort(cutoff), fullDate: fmtLong(cutoff), title: 'Cut-off Date', description: `Time and attendance, leaves, OT, and loans finalization for ${periodLabel}.`, state: stateOf(cutoff) },
      { id: 'processing', dateLabel: fmtShort(processing), fullDate: fmtLong(processing), title: 'Payroll Processing', description: 'Generate, review, and approve the payroll run.', state: stateOf(processing) },
      { id: 'release', dateLabel: fmtShort(release), fullDate: fmtLong(release), title: 'Payroll Release', description: 'Salaries credited to employee bank accounts; payslips emailed.', state: stateOf(release) },
      { id: 'next-cutoff', dateLabel: fmtShort(nextCutoff), fullDate: fmtLong(nextCutoff), title: 'Next Cut-off', description: 'Following pay period closes.', state: stateOf(nextCutoff) },
    ],
    recentEmployees: recentEmployees.map((e) => ({
      id: e.id,
      name: e.name,
      department: e.department,
      position: e.position,
      hiredLabel: e.dateHired ? fmtLong(parseDay(e.dateHired)) : '—',
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

/** The attendance and headcount charts of the HR dashboard, worked out by the server from the roster, attendance records and leave. */
export async function getWorkforceCharts(_session: SessionUser): Promise<WorkforceCharts> {
  const res = await api.get<{ data: unknown }>('/api/dashboard/workforce')
  return camelizeKeys<WorkforceCharts>(res.data)
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

/** Payroll Admin's home: the run in progress, what it costs, what is waiting on approval and what looks wrong (the server works it out). */
export async function getPayrollDashboard(_session: SessionUser): Promise<PayrollDashboard> {
  const res = await api.get<{ data: unknown }>('/api/dashboard/payroll')
  return camelizeKeys<PayrollDashboard>(res.data)
}
