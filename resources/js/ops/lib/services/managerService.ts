import { getAttendanceAdjustments, getAttendanceRecords } from '@ops/lib/services/attendanceService'
import { getCompensationApprovals } from '@ops/lib/services/compensationApprovalService'
import { getEmployees } from '@ops/lib/services/employeeService'
import { getLeaveRequests, getLeaveTypes } from '@ops/lib/services/leaveService'
import { getOvertimeRecords } from '@ops/lib/services/overtimeService'
import { scopeToCompany } from '@ops/lib/tenancy/tenantScope'
import { db } from '@ops/mock-data'
import type { Employee, Schedule, SessionUser } from '@ops/types/domain'

const todayKey = () => new Date().toISOString().slice(0, 10)
const addDaysKey = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const fullName = (e: Employee) => `${e.personal.firstName} ${e.personal.lastName}`
const daysInclusive = (from: string, to: string) => Math.max(1, Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000) + 1)

// ---------- Dashboard ----------

export interface ManagerDashboard {
  teamName: string
  headcount: number
  departments: number
  /** The most recent day with attendance records (today, or the last working day), with its head counts. */
  attendanceDate: string
  present: number
  late: number
  undertime: number
  absent: number
  missingRecords: number
  onLeaveToday: number
  pending: { leave: number; overtime: number; nightDiff: number; hours: number; output: number; corrections: number }
  upcomingLeave: { id: string; employee: string; leaveType: string; dateFrom: string; dateTo: string; days: number }[]
  /** Team members absent or late on `attendanceDate`. */
  attention: { id: string; employee: string; status: 'absent' | 'late' | 'undertime' }[]
}

/** What the manager's team looks like today and what is waiting on them — all derived from the (branch-scoped) team data. */
export async function getManagerDashboard(session: SessionUser): Promise<ManagerDashboard> {
  const [employees, records, leaves, leaveTypes, overtime, workLogs, adjustments] = await Promise.all([
    getEmployees(session),
    getAttendanceRecords(session),
    getLeaveRequests(session),
    getLeaveTypes(session),
    getOvertimeRecords(session),
    getCompensationApprovals(session),
    getAttendanceAdjustments(session),
  ])
  const active = employees.filter((e) => e.employment.status === 'active')
  const byId = new Map(employees.map((e) => [e.id, e]))
  const today = todayKey()
  const attendanceDate = [...new Set(records.map((r) => r.date))].filter((d) => d <= today).sort().pop() ?? today
  const day = records.filter((r) => r.date === attendanceDate)
  const approvedLeaves = leaves.filter((l) => l.status === 'approved')
  const typeName = new Map(leaveTypes.map((t) => [t.id, t.name]))
  const horizon = addDaysKey(today, 14)

  return {
    teamName: session.branchId ? (db.branches.find((b) => b.id === session.branchId)?.name ?? 'My Team') : 'My Team',
    headcount: active.length,
    departments: new Set(active.map((e) => e.employment.department)).size,
    attendanceDate,
    present: day.filter((r) => r.status !== 'absent').length,
    late: day.filter((r) => r.status === 'late').length,
    undertime: day.filter((r) => r.status === 'undertime').length,
    absent: day.filter((r) => r.status === 'absent').length,
    missingRecords: day.filter((r) => r.status !== 'absent' && (!r.timeIn || !r.timeOut)).length,
    onLeaveToday: approvedLeaves.filter((l) => l.dateFrom <= today && l.dateTo >= today).length,
    pending: {
      leave: leaves.filter((l) => l.status === 'pending').length,
      overtime: overtime.filter((o) => o.status === 'pending' && o.type !== 'night_diff').length,
      nightDiff: overtime.filter((o) => o.status === 'pending' && o.type === 'night_diff').length,
      hours: workLogs.filter((w) => w.status === 'pending' && w.type === 'hourly').length,
      output: workLogs.filter((w) => w.status === 'pending' && w.type === 'output').length,
      corrections: adjustments.filter((a) => a.status === 'pending').length,
    },
    upcomingLeave: approvedLeaves
      .filter((l) => l.dateTo >= today && l.dateFrom <= horizon)
      .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom))
      .slice(0, 6)
      .flatMap((l) => {
        const e = byId.get(l.employeeId)
        return e ? [{ id: l.id, employee: fullName(e), leaveType: typeName.get(l.leaveTypeId) ?? 'Leave', dateFrom: l.dateFrom, dateTo: l.dateTo, days: daysInclusive(l.dateFrom, l.dateTo) }] : []
      }),
    attention: day
      .filter((r) => r.status === 'absent' || r.status === 'late' || r.status === 'undertime')
      .flatMap((r) => {
        const e = byId.get(r.employeeId)
        return e ? [{ id: r.id, employee: fullName(e), status: r.status as 'absent' | 'late' | 'undertime' }] : []
      })
      .sort((a, b) => a.status.localeCompare(b.status) || a.employee.localeCompare(b.employee))
      .slice(0, 8),
  }
}

// ---------- Team member profile extras ----------

export interface EmployeeAttendanceSummary {
  days: number
  present: number
  late: number
  undertime: number
  absent: number
  recent: { id: string; date: string; timeIn: string | null; timeOut: string | null; status: string }[]
  schedule?: Pick<Schedule, 'id' | 'name' | 'startTime' | 'endTime' | 'daysOfWeek'>
}

/** Work schedule plus the last ~30 days of attendance for one team member. */
export async function getEmployeeAttendanceSummary(session: SessionUser, employeeId: string): Promise<EmployeeAttendanceSummary | undefined> {
  const employees = await getEmployees(session)
  if (!employees.some((e) => e.id === employeeId)) return undefined
  const since = addDaysKey(todayKey(), -30)
  const mine = (await getAttendanceRecords(session)).filter((r) => r.employeeId === employeeId && r.date >= since).sort((a, b) => b.date.localeCompare(a.date))
  const schedules = scopeToCompany(db.schedules, session.companyId)
  const schedule = schedules.find((s) => s.assignedEmployeeIds?.includes(employeeId)) ?? schedules.find((s) => s.id.endsWith('_sched_default'))
  return {
    days: mine.length,
    present: mine.filter((r) => r.status === 'present').length,
    late: mine.filter((r) => r.status === 'late').length,
    undertime: mine.filter((r) => r.status === 'undertime').length,
    absent: mine.filter((r) => r.status === 'absent').length,
    recent: mine.slice(0, 10).map((r) => ({ id: r.id, date: r.date, timeIn: r.timeIn, timeOut: r.timeOut, status: r.status })),
    schedule: schedule ? { id: schedule.id, name: schedule.name, startTime: schedule.startTime, endTime: schedule.endTime, daysOfWeek: schedule.daysOfWeek } : undefined,
  }
}
