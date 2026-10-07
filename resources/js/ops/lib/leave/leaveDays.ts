import { db } from '@ops/mock-data'
import type { LeaveDayPortion, LeaveRequest } from '@ops/types/domain'

type PortionRequest = Pick<LeaveRequest, 'employeeId' | 'dateFrom' | 'dateTo' | 'dayPortion'>

export const HALF_DAY_LABEL: Record<Exclude<LeaveDayPortion, 'full'>, string> = {
  half_am: 'Half Day (AM)',
  half_pm: 'Half Day (PM)',
}

export const isHalfDay = (r: Pick<LeaveRequest, 'dayPortion'>) => r.dayPortion === 'half_am' || r.dayPortion === 'half_pm'

/** What one leave day counts for on its own date: 0.5 for a half-day leave, otherwise 1. */
export const leaveDayFraction = (r: Pick<LeaveRequest, 'dayPortion'>) => (isHalfDay(r) ? 0.5 : 1)

const nextDay = (key: string) => {
  const d = new Date(`${key}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Whether the employee is due to work on `date`: their rostered shift or rest day when the roster has one,
 * otherwise their work schedule's working days (their assigned schedule, else the company default).
 */
export function isWorkingDay(employeeId: string, date: string): boolean {
  const assignment = db.shiftAssignments.find((a) => a.employeeId === employeeId && a.date === date)
  if (assignment) return assignment.scheduleId !== null
  const employee = db.employees.find((e) => e.id === employeeId)
  const schedule =
    db.schedules.find((s) => s.assignedEmployeeIds?.includes(employeeId)) ?? db.schedules.find((s) => s.companyId === employee?.companyId && s.id.endsWith('_sched_default'))
  const dow = new Date(`${date}T00:00:00`).getDay()
  return !schedule || (schedule.daysOfWeek.includes(dow) && !schedule.restDays?.includes(dow))
}

/** Working days (shifts, not rest days) the employee has between two dates, inclusive. */
export function workingDaysBetween(employeeId: string, from: string, to: string): number {
  let count = 0
  for (let d = from, guard = 0; d <= to && guard < 400; d = nextDay(d), guard++) if (isWorkingDay(employeeId, d)) count++
  return count
}

/** Days a leave request uses from the employee's credits: their working days in the range (rest days and days off don't count), or 0.5 for a half-day leave. */
export function leaveRequestDays(r: PortionRequest): number {
  if (isHalfDay(r)) return 0.5
  return workingDaysBetween(r.employeeId, r.dateFrom, r.dateTo)
}

/** The half-day label to show next to a request, or null for a full-day request. */
export const portionSuffix = (r: Pick<LeaveRequest, 'dayPortion'>) => (r.dayPortion === 'half_am' || r.dayPortion === 'half_pm' ? HALF_DAY_LABEL[r.dayPortion] : null)
