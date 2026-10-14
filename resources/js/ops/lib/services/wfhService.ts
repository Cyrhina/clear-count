import { statusForPunch } from '@ops/lib/attendance/status'
import { db } from '@ops/mock-data'
import type { Employee, Schedule, WfhArrangement } from '@ops/types/domain'

/*
 * Work-from-home arrangements. One record per employee, made one at a time or in bulk (a batch id ties a bulk apply together).
 * Which one decides a day:  approved leave / rest day / holiday  >  temporary  >  standing  >  onsite.
 * Approved arrangements fill in the day's attendance by themselves ("WFH · auto") — see materializeWfhRecords.
 */

const pad = (n: number) => String(n).padStart(2, '0')
const key = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parse = (date: string) => new Date(`${date}T00:00:00`)
const addDays = (date: string, days: number) => {
  const d = parse(date)
  d.setDate(d.getDate() + days)
  return key(d)
}
export const todayKey = () => key(new Date())
const dow = (date: string) => parse(date).getDay()

let lastMaterialized = ''

/** Does this arrangement cover the date (range + chosen weekdays)? Leave, rest days and holidays are judged separately. */
export function arrangementCovers(a: WfhArrangement, date: string): boolean {
  if (date < a.dateFrom || (a.dateTo && date > a.dateTo)) return false
  return a.daysOfWeek.length === 0 || a.daysOfWeek.includes(dow(date))
}

/** The approved arrangement that decides an employee's day: a temporary one beats a standing one; the newest wins a tie. */
export function wfhOwnerFor(employeeId: string, date: string, list: WfhArrangement[] = db.wfhArrangements): WfhArrangement | undefined {
  const matches = list.filter((a) => a.employeeId === employeeId && a.status === 'approved' && arrangementCovers(a, date))
  return matches.sort((a, b) => Number(b.kind === 'temporary') - Number(a.kind === 'temporary') || b.createdAt.localeCompare(a.createdAt))[0]
}

function defaultSchedule(companyId: string): Schedule | undefined {
  const list = db.schedules.filter((s) => s.companyId === companyId)
  return list.find((s) => s.id.endsWith('_sched_default')) ?? list[0]
}

/** A schedule's own four times: AM in, AM out (lunch starts three hours into the shift — 12:00 for a 09:00 start), PM in (after the schedule's break), PM out. */
export function defaultTimesFor(schedule: Pick<Schedule, 'startTime' | 'endTime' | 'breakMinutes'>): { timeIn: string; breakOut: string; breakIn: string; timeOut: string } {
  const [h, m] = schedule.startTime.split(':').map(Number)
  const outAt = (h * 60 + m + 180) % 1440
  const backAt = (outAt + (schedule.breakMinutes ?? 60)) % 1440
  const hhmm = (n: number) => `${pad(Math.floor(n / 60))}:${pad(n % 60)}`
  return { timeIn: schedule.startTime, breakOut: hhmm(outAt), breakIn: hhmm(backAt), timeOut: schedule.endTime }
}

/** The schedule an employee follows on a date and whether the date is a rest day for them (roster first, then their own schedule). */
export function scheduleOn(employee: Pick<Employee, 'id' | 'companyId'>, date: string): { schedule?: Schedule; rest: boolean } {
  const list = db.schedules.filter((s) => s.companyId === employee.companyId)
  const base = list.find((s) => s.assignedEmployeeIds?.includes(employee.id)) ?? defaultSchedule(employee.companyId)
  const rostered = db.shiftAssignments.find((a) => a.employeeId === employee.id && a.date === date)
  if (rostered) return rostered.scheduleId === null ? { schedule: base, rest: true } : { schedule: list.find((s) => s.id === rostered.scheduleId) ?? base, rest: false }
  if (!base) return { rest: false }
  return { schedule: base, rest: !base.daysOfWeek.includes(dow(date)) || !!base.restDays?.includes(dow(date)) }
}

const isHoliday = (companyId: string, date: string) => db.holidays.some((h) => h.companyId === companyId && h.date === date)
const hasLeave = (employeeId: string, date: string) => db.leaveRequests.some((r) => r.employeeId === employeeId && r.status === 'approved' && r.dateFrom <= date && r.dateTo >= date)

// ---------------------------------------------------------------------------------------------------- auto-recording (mock attendance)

/** How far back approved arrangements are filled in. */
const MATERIALIZE_DAYS = 92

/**
 * Fills in attendance for approved WFH days that have already come (or are today) and have no record yet: the schedule's own
 * AM in / AM out / PM in / PM out (or the arrangement's fixed times), flagged "WFH · auto". Idempotent — runs again only when
 * the arrangements change or the date does. Never touches a day that already has a record (real punches win).
 */
export function materializeWfhRecords(): void {
  const today = todayKey()
  const stamp = `${today}|${db.wfhArrangements.length}`
  if (stamp === lastMaterialized) return
  lastMaterialized = stamp
  const horizon = addDays(today, -MATERIALIZE_DAYS)
  const have = new Set(db.attendanceRecords.map((r) => `${r.employeeId}|${r.date}`))
  const approved = db.wfhArrangements.filter((a) => a.status === 'approved' && a.times !== 'self_log')
  for (const a of approved) {
    const employee = db.employees.find((e) => e.id === a.employeeId)
    if (!employee || employee.employment.status !== 'active') continue
    const to = [a.dateTo ?? today, today].sort()[0]
    for (let d = [a.dateFrom, horizon].sort().reverse()[0]; d <= to; d = addDays(d, 1)) {
      const k = `${a.employeeId}|${d}`
      if (have.has(k) || wfhOwnerFor(a.employeeId, d)?.id !== a.id) continue
      if (isHoliday(a.companyId, d) || hasLeave(a.employeeId, d)) continue
      const { schedule, rest } = scheduleOn(employee, d)
      if (!schedule || rest) continue
      const times =
        a.times === 'custom' && a.custom
          ? a.custom
          : defaultTimesFor(schedule)
      db.attendanceRecords.push({
        id: `${a.employeeId}_att_${d}_wfh`,
        companyId: a.companyId,
        employeeId: a.employeeId,
        scheduleId: schedule.id,
        date: d,
        timeIn: times.timeIn,
        breakOut: times.breakOut || null,
        breakIn: times.breakIn || null,
        timeOut: times.timeOut,
        // Default times are the schedule's own, so they are never late; fixed times are checked like any punch.
        status: a.times === 'custom' ? statusForPunch(times.timeIn, times.timeOut, schedule.startTime, schedule.endTime, schedule.gracePeriodMinutes ?? 0) : 'present',
        workType: 'wfh',
        autoRecorded: true,
        wfhId: a.id,
      })
      have.add(k)
    }
  }
}
