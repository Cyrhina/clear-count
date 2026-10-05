import type { DailyImportRecord } from '@ops/features/attendance/biometricsImport'
import type { ImportLeaveContext } from '@ops/features/attendance/leaveStatus'
import type { AttendanceStatus, Employee, Schedule } from '@ops/types/domain'

/*
 * Schedule-based import — matches each imported day against the employee's work schedule (working days,
 * rest days, shift hours, grace period, overnight shifts) and surfaces discrepancies for review before
 * anything is applied. Standard import skips all of this and writes the punches as they are.
 */

export type DiscrepancyCode =
  | 'no_schedule'
  | 'default_schedule'
  | 'rest_day_work'
  | 'late'
  | 'undertime'
  | 'overtime'
  | 'missing_out'
  | 'missing_in'
  | 'early_in'
  | 'long_overtime'
  | 'long_shift'
  | 'overnight'
  | 'leave_conflict'

/** info: expected and applied as-is (late, undertime, overtime). review: a person should confirm it first. */
export type DiscrepancySeverity = 'info' | 'review'

export interface Discrepancy {
  code: DiscrepancyCode
  severity: DiscrepancySeverity
  message: string
}

export type ScheduleSource = 'override' | 'roster' | 'assigned' | 'default' | 'none'

export interface ScheduleReviewRow {
  key: string
  record: DailyImportRecord
  schedule?: Schedule
  scheduleSource: ScheduleSource
  isRestDay: boolean
  overnight: boolean
  /** Effective punches — an overnight shift's time-out can come from the next day's early punch. */
  timeIn: string | null
  timeOut: string | null
  status: AttendanceStatus
  lateMinutes: number
  undertimeMinutes: number
  overtimeMinutes: number
  discrepancies: Discrepancy[]
  needsReview: boolean
  /** False when there is nothing usable to write (e.g. only check-out punches). */
  applicable: boolean
}

export interface MissingPunchRow {
  key: string
  employee: Employee
  date: string
  schedule: Schedule
  scheduleSource: ScheduleSource
}

/** Narrows a schedule-based import to a date range, a department and/or one schedule. */
export interface ImportScope {
  from: string
  to: string
  department?: string
  scheduleId?: string
}

export interface ScheduleReview {
  rows: ScheduleReviewRow[]
  /** Imported days left out because they fall outside the scope (date range, department or schedule). */
  excluded: number
  /** Scheduled working days inside the file's date range with no punches and no approved leave. */
  missing: MissingPunchRow[]
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
/** Punches this far past the shift end (or before its start) look like a wrong schedule or a forgotten tap-out. */
const EARLY_IN_MINUTES = 180
const LONG_OVERTIME_MINUTES = 240
const MIN_OVERTIME_MINUTES = 30
const MAX_SHIFT_MINUTES = 16 * 60
/** An overnight shift's morning out-punch is accepted up to this long after the shift end. */
const OVERNIGHT_WINDOW_MINUTES = 180

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const dayOfWeek = (date: string) => new Date(`${date}T00:00:00`).getDay()

function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const isOvernight = (s: Pick<Schedule, 'startTime' | 'endTime'>) => toMinutes(s.endTime) <= toMinutes(s.startTime)

const isRestDayFor = (schedule: Schedule, date: string) => {
  const dow = dayOfWeek(date)
  return !schedule.daysOfWeek.includes(dow) || !!schedule.restDays?.includes(dow)
}

/**
 * Which schedule applies to an employee on a day: a reviewer's override, else the Schedules roster
 * (`rosterEntry` is a template id, or null for a rostered rest day), else their assigned schedule, else the default.
 * `rest` is set only when the roster or override decides it — otherwise the schedule's own working days do.
 */
export function resolveSchedule(
  employeeId: string,
  schedules: Schedule[],
  overrideId?: string,
  rosterEntry?: string | null,
): { schedule?: Schedule; source: ScheduleSource; rest?: boolean } {
  const fallback = schedules.find((s) => s.assignedEmployeeIds?.includes(employeeId)) ?? schedules[0]
  const override = overrideId ? schedules.find((s) => s.id === overrideId) : undefined
  if (override) return { schedule: override, source: 'override', rest: false }
  if (rosterEntry === null) return { schedule: fallback, source: fallback ? 'roster' : 'none', rest: true }
  const rostered = rosterEntry ? schedules.find((s) => s.id === rosterEntry) : undefined
  if (rostered) return { schedule: rostered, source: 'roster', rest: false }
  const assigned = schedules.find((s) => s.assignedEmployeeIds?.includes(employeeId))
  if (assigned) return { schedule: assigned, source: 'assigned' }
  return schedules[0] ? { schedule: schedules[0], source: 'default' } : { source: 'none' }
}

export function buildScheduleReview(input: {
  records: DailyImportRecord[]
  employees: Employee[]
  schedules: Schedule[]
  leave: ImportLeaveContext
  /** Manager-chosen schedule per record key, overriding the assigned one. */
  overrides?: Map<string, string>
  /** The Schedules roster: `employeeId|date` → template id, or null for a rest day. Takes priority over assigned schedules. */
  roster?: Map<string, string | null>
  scope?: ImportScope
  /** True when the employee has approved leave on that date — lets the no-punch check cover days the file doesn't mention. */
  onLeave?: (employeeId: string, date: string) => boolean
}): ScheduleReview {
  const { records: allRecords, employees, schedules, leave, overrides, roster, scope, onLeave } = input
  const resolve = (employeeId: string, key: string) => resolveSchedule(employeeId, schedules, overrides?.get(key), roster?.get(key))

  const departmentOf = new Map(employees.map((e) => [e.id, e.employment.department]))
  // Scope is judged on the roster/assigned schedule — never on a reviewer's override, or a row would vanish the moment it is changed.
  const inScope = (employeeId: string, date: string) => {
    if (!scope) return true
    if (date < scope.from || date > scope.to) return false
    if (scope.department && departmentOf.get(employeeId) !== scope.department) return false
    if (scope.scheduleId && resolveSchedule(employeeId, schedules, undefined, roster?.get(`${employeeId}|${date}`)).schedule?.id !== scope.scheduleId) return false
    return true
  }
  const records = allRecords.filter((r) => inScope(r.employeeId, r.date))

  // Overnight merging can reach one day past the range, so look the next day up among every imported record.
  const byKey = new Map(allRecords.map((r) => [r.key, r]))
  // Overnight shifts: the time-out is the next calendar day's first punch, which the daily grouping turned into that day's time-in.
  const mergedOut = new Map<string, string>()
  const consumed = new Set<string>()
  for (const r of records) {
    if (r.action === 'skip' || !r.timeIn || r.timeOut) continue
    const { schedule, rest } = resolve(r.employeeId, r.key)
    if (!schedule || !isOvernight(schedule) || (rest ?? isRestDayFor(schedule, r.date))) continue
    const next = byKey.get(`${r.employeeId}|${nextDay(r.date)}`)
    if (!next?.timeIn || consumed.has(next.key)) continue
    const nextEndsInWindow = !next.timeOut || toMinutes(next.timeOut) <= toMinutes(schedule.endTime) + OVERNIGHT_WINDOW_MINUTES
    if (toMinutes(next.timeIn) <= toMinutes(schedule.endTime) + OVERNIGHT_WINDOW_MINUTES && nextEndsInWindow) {
      mergedOut.set(r.key, next.timeIn)
      consumed.add(next.key)
    }
  }

  const rows: ScheduleReviewRow[] = []
  for (const record of records) {
    if (consumed.has(record.key)) continue
    const { schedule, source, rest } = resolve(record.employeeId, record.key)
    const discrepancies: Discrepancy[] = []
    const add = (code: DiscrepancyCode, severity: DiscrepancySeverity, message: string) => discrepancies.push({ code, severity, message })

    const timeIn = record.timeIn
    const timeOut = record.timeOut ?? mergedOut.get(record.key) ?? null
    const overnight = !!schedule && isOvernight(schedule)
    const isRestDay = !!schedule && (rest ?? isRestDayFor(schedule, record.date))
    let status: AttendanceStatus = 'present'
    let lateMinutes = 0
    let undertimeMinutes = 0
    let overtimeMinutes = 0

    if (!schedule) add('no_schedule', 'review', 'No work schedule is set up — punches can only be applied as-is. Add one under Company Settings, or pick a schedule for this row.')
    else if (source === 'default') add('default_schedule', 'review', `No schedule assigned to this employee — checked against "${schedule.name}"`)

    if (mergedOut.has(record.key)) add('overnight', 'info', `Overnight shift — time-out ${timeOut} taken from the next day's first punch`)

    if (!timeIn) add('missing_in', 'review', 'Only check-out punches — no time-in to record')
    else if (schedule) {
      const start = toMinutes(schedule.startTime)
      const end = toMinutes(schedule.endTime) + (overnight ? 1440 : 0)
      const grace = schedule.gracePeriodMinutes ?? 0
      const inM = toMinutes(timeIn)
      let outM = timeOut ? toMinutes(timeOut) : null
      if (outM !== null && outM <= inM && overnight) outM += 1440

      if (isRestDay) {
        add('rest_day_work', 'review', source === 'roster' ? `Worked on a rostered rest day (${DAY_NAMES[dayOfWeek(record.date)]}) — the Schedules roster has a rest day here` : `Worked on a rest day (${DAY_NAMES[dayOfWeek(record.date)]}) — ${schedule.name} is not scheduled today`)
      } else {
        if (inM > start + grace) {
          lateMinutes = inM - start
          status = 'late'
          add('late', 'info', `Late by ${lateMinutes} min (shift starts ${schedule.startTime}${grace ? `, ${grace} min grace` : ''})`)
        }
        if (inM < start - EARLY_IN_MINUTES) add('early_in', 'review', `Clocked in ${start - inM} min before the ${schedule.startTime} shift — check the shift assignment`)
        if (outM === null) {
          add('missing_out', 'review', 'No time-out recorded — confirm the departure time or file an adjustment')
        } else {
          if (outM < end) {
            undertimeMinutes = end - outM
            if (status === 'present') status = 'undertime'
            add('undertime', 'info', `Left ${undertimeMinutes} min early (shift ends ${schedule.endTime})`)
          } else if (outM - end >= MIN_OVERTIME_MINUTES) {
            overtimeMinutes = outM - end
            add(overtimeMinutes >= LONG_OVERTIME_MINUTES ? 'long_overtime' : 'overtime', overtimeMinutes >= LONG_OVERTIME_MINUTES ? 'review' : 'info', `${overtimeMinutes >= LONG_OVERTIME_MINUTES ? 'Time-out is ' : 'Stayed '}${overtimeMinutes} min past ${schedule.endTime}${overtimeMinutes >= LONG_OVERTIME_MINUTES ? ' — possible forgotten tap-out or unapproved overtime' : ''}`)
          }
        }
      }
      if (outM !== null && outM - inM > MAX_SHIFT_MINUTES) add('long_shift', 'review', `${Math.round((outM - inM) / 60)}-hour shift — check for a missed tap`)
    } else if (!timeOut) add('missing_out', 'review', 'No time-out recorded')

    const leaveResolution = leave.byKey.get(record.key)
    if (leaveResolution?.review) add('leave_conflict', 'review', leaveResolution.review)

    rows.push({
      key: record.key,
      record,
      schedule,
      scheduleSource: source,
      isRestDay,
      overnight,
      timeIn,
      timeOut,
      status,
      lateMinutes,
      undertimeMinutes,
      overtimeMinutes,
      discrepancies,
      needsReview: discrepancies.some((d) => d.severity === 'review'),
      applicable: (record.action === 'create' || record.action === 'update') && !!timeIn,
    })
  }

  // Scheduled workdays with no punches at all (and no approved leave) inside the file's date range.
  const missing: MissingPunchRow[] = []
  const dates = scope ? [scope.from, scope.to] : [...new Set(records.map((r) => r.date))].sort()
  if (dates.length && (!scope || scope.from <= scope.to)) {
    const inFile = new Set(records.map((r) => r.employeeId))
    const leaveKeys = new Set(leave.leaveOnly.map((l) => l.key))
    const present = new Set(records.map((r) => r.key))
    const span: string[] = []
    for (let d = dates[0]; d <= dates[dates.length - 1]; d = nextDay(d)) span.push(d)
    for (const employee of employees) {
      if (employee.employment.status !== 'active') continue
      for (const date of span) {
        const key = `${employee.id}|${date}`
        const { schedule, source, rest } = resolveSchedule(employee.id, schedules, undefined, roster?.get(key))
        if (!schedule || (source === 'default' && !inFile.has(employee.id))) continue
        if (!inScope(employee.id, date)) continue
        if (present.has(key) || leaveKeys.has(key) || onLeave?.(employee.id, date) || (rest ?? isRestDayFor(schedule, date))) continue
        missing.push({ key, employee, date, schedule, scheduleSource: source })
      }
    }
    missing.sort((a, b) => a.date.localeCompare(b.date) || a.employee.employeeNumber.localeCompare(b.employee.employeeNumber))
  }

  rows.sort((a, b) => a.record.date.localeCompare(b.record.date) || a.record.employeeNumber.localeCompare(b.record.employeeNumber))
  return { rows, excluded: allRecords.length - records.length, missing }
}
