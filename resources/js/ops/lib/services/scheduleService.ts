import { getEmployees } from '@ops/lib/services/employeeService'
import { db } from '@ops/mock-data'
import type { Schedule, SessionUser, ShiftAssignment } from '@ops/types/domain'

async function scopedEmployeeIds(session: SessionUser): Promise<Set<string>> {
  return new Set((await getEmployees(session)).map((e) => e.id))
}

const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function getShiftTemplates(session: SessionUser): Promise<Schedule[]> {
  return db.schedules.filter((s) => s.companyId === session.companyId)
}

/** Roster entries for the employees this session can see, between two dates (inclusive). */
export async function getShiftAssignments(session: SessionUser, from: string, to: string): Promise<ShiftAssignment[]> {
  const employeeIds = await scopedEmployeeIds(session)
  return db.shiftAssignments.filter((a) => a.companyId === session.companyId && a.date >= from && a.date <= to && employeeIds.has(a.employeeId))
}

/** `employeeId|date` → schedule id (null = rest day), for matching imported punches against the roster. */
export async function getRosterMap(session: SessionUser, from: string, to: string): Promise<Map<string, string | null>> {
  return new Map((await getShiftAssignments(session, from, to)).map((a) => [`${a.employeeId}|${a.date}`, a.scheduleId]))
}

export interface AssignShiftInput {
  employeeIds: string[]
  dates: string[]
  /** A shift template id, or null to roster a rest day. */
  scheduleId: string | null
}

/** Sets the shift (or rest day) for every employee on every date, replacing whatever was rostered. Returns the number of days written. */
export async function assignShifts(session: SessionUser, input: AssignShiftInput): Promise<number> {
  const allowed = await scopedEmployeeIds(session)
  if (input.scheduleId && !db.schedules.some((s) => s.id === input.scheduleId && s.companyId === session.companyId)) return 0
  let written = 0
  for (const employeeId of input.employeeIds) {
    if (!allowed.has(employeeId)) continue
    for (const date of input.dates) {
      const existing = db.shiftAssignments.find((a) => a.employeeId === employeeId && a.date === date)
      if (existing) existing.scheduleId = input.scheduleId
      else db.shiftAssignments.push({ id: `${employeeId}_shift_${date}`, companyId: session.companyId, employeeId, date, scheduleId: input.scheduleId })
      written++
    }
  }
  return written
}

/** Removes the roster entry, putting each day back to "not yet scheduled". */
export async function clearShifts(session: SessionUser, input: { employeeIds: string[]; dates: string[] }): Promise<number> {
  const allowed = await scopedEmployeeIds(session)
  const ids = new Set(input.employeeIds.filter((id) => allowed.has(id)))
  const dates = new Set(input.dates)
  const before = db.shiftAssignments.length
  db.shiftAssignments = db.shiftAssignments.filter((a) => !(a.companyId === session.companyId && ids.has(a.employeeId) && dates.has(a.date)))
  return before - db.shiftAssignments.length
}

/** Copies the seven days starting at `fromStart` onto the seven days starting at `toStart` for the given employees. */
export async function copyWeek(session: SessionUser, input: { employeeIds: string[]; fromStart: string; toStart: string }): Promise<number> {
  const allowed = await scopedEmployeeIds(session)
  let copied = 0
  for (const employeeId of input.employeeIds) {
    if (!allowed.has(employeeId)) continue
    for (let i = 0; i < 7; i++) {
      const source = db.shiftAssignments.find((a) => a.employeeId === employeeId && a.date === addDays(input.fromStart, i))
      if (!source) continue
      copied += await assignShifts(session, { employeeIds: [employeeId], dates: [addDays(input.toStart, i)], scheduleId: source.scheduleId })
    }
  }
  return copied
}
