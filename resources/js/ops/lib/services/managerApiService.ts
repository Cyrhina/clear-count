import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { fetchAttendanceRange } from '@ops/lib/services/attendanceService'
import { fetchShiftTemplates } from '@ops/lib/services/scheduleService'
import type { Schedule } from '@ops/types/domain'

/** The manager portal on the API. Every figure is the manager's own team: the server cuts everything down to their branch. */

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
  upcomingLeave: { id: string; employee: string; leaveType: string; dateFrom: string; dateTo: string; days: number; halfDay?: 'AM' | 'PM' }[]
  /** Team members absent or late on `attendanceDate`. */
  attention: { id: string; employee: string; status: 'absent' | 'late' | 'undertime' }[]
}

export async function fetchManagerDashboard(): Promise<ManagerDashboard> {
  const res = await api.get<{ data: unknown }>('/api/manager/dashboard')
  return camelizeKeys<ManagerDashboard>(res.data)
}

export interface EmployeeAttendanceSummary {
  days: number
  present: number
  late: number
  undertime: number
  absent: number
  recent: { id: string; date: string; timeIn: string | null; timeOut: string | null; status: string }[]
  schedule?: Pick<Schedule, 'id' | 'name' | 'startTime' | 'endTime' | 'daysOfWeek'>
}

const dayKey = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10)

/** Work schedule plus the last 30 days of attendance for one team member, put together from the attendance and schedule endpoints. */
export async function fetchEmployeeAttendanceSummary(employeeId: string, workScheduleId?: string): Promise<EmployeeAttendanceSummary> {
  const [records, templates] = await Promise.all([fetchAttendanceRange(dayKey(-30), dayKey(0), employeeId), workScheduleId ? fetchShiftTemplates() : Promise.resolve([])])
  const mine = [...records].sort((a, b) => b.date.localeCompare(a.date))
  const schedule = templates.find((s) => s.id === workScheduleId)
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
