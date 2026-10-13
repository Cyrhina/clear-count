import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { getEmployees } from '@ops/lib/services/employeeService'
import { toSchedule } from '@ops/lib/services/payrollConfigService'
import { db } from '@ops/mock-data'
import type { Schedule } from '@ops/features/company-settings/types'
import type { SessionUser } from '@ops/types/domain'

/** One rostered day. `scheduleId: null` is a rostered rest day; no entry at all means "not yet scheduled". */
export interface RosterEntry {
  id: string
  employeeId: string
  /** YYYY-MM-DD */
  date: string
  scheduleId: string | null
}

/** Shift templates are the company's work schedules. */
export async function fetchShiftTemplates(): Promise<Schedule[]> {
  const res = await api.get<{ data: unknown[] }>('/api/schedules/templates')
  return camelizeKeys<Schedule[]>(res.data).map(toSchedule)
}

/** Roster entries for the employees this user can see, between two dates (inclusive). */
export async function fetchRoster(from: string, to: string): Promise<RosterEntry[]> {
  const res = await api.get<{ data: { id: number; employee_id: number; date: string; work_schedule_id: number | null }[] }>('/api/schedules/roster', { from, to })
  return res.data.map((r) => ({ id: String(r.id), employeeId: String(r.employee_id), date: r.date.slice(0, 10), scheduleId: r.work_schedule_id === null ? null : String(r.work_schedule_id) }))
}

/** `employeeId|date` → schedule id (null = rest day), for matching imported punches against the roster. Still the mock roster until Attendance (P5). */
export async function getRosterMap(session: SessionUser, from: string, to: string): Promise<Map<string, string | null>> {
  const allowed = new Set((await getEmployees(session)).map((e) => e.id))
  return new Map(db.shiftAssignments.filter((a) => a.companyId === session.companyId && a.date >= from && a.date <= to && allowed.has(a.employeeId)).map((a) => [`${a.employeeId}|${a.date}`, a.scheduleId]))
}

export interface AssignShiftInput {
  employeeIds: string[]
  dates: string[]
  /** A shift template id, or null to roster a rest day. */
  scheduleId: string | null
}

const ids = (employeeIds: string[]) => employeeIds.map(Number)

async function changed(request: Promise<{ data: { changed: number } }>): Promise<number> {
  return (await request).data.changed
}

/** Sets the shift (or rest day) for every employee on every date, replacing whatever was rostered. Returns the number of days written. */
export const assignShifts = (input: AssignShiftInput) =>
  changed(api.post('/api/schedules/roster', { employee_ids: ids(input.employeeIds), dates: input.dates, work_schedule_id: input.scheduleId === null ? null : Number(input.scheduleId) }))

/** Removes the roster entry, putting each day back to "not yet scheduled". Returns the number of days cleared. */
export const clearShifts = (input: { employeeIds: string[]; dates: string[] }) => changed(api.post('/api/schedules/roster/clear', { employee_ids: ids(input.employeeIds), dates: input.dates }))

/** Copies the seven days starting at `fromStart` onto the seven days starting at `toStart` for the given employees. */
export const copyWeek = (input: { employeeIds: string[]; fromStart: string; toStart: string }) =>
  changed(api.post('/api/schedules/roster/copy-week', { employee_ids: ids(input.employeeIds), from_start: input.fromStart, to_start: input.toStart }))
