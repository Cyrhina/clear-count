import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { statusForPunch } from '@ops/lib/attendance/status'
import { memoRead } from '@ops/lib/api/memo'
import { fetchAllEmployees } from '@ops/lib/services/employeeService'
import { fetchApprovedLeaves } from '@ops/lib/services/leaveApiService'
import { fetchShiftTemplates } from '@ops/lib/services/scheduleService'
import type { AttendanceAdjustment, AttendanceRecord, ApprovalStatus, Schedule, SessionUser } from '@ops/types/domain'

// ---- On the API: daily attendance, adjustments, biometrics import -------------------------------------------------------

const hhmm = (time?: string | null) => (time ? time.slice(0, 5) : null)

export type ApiRecord = { id: string; employeeId: string; workScheduleId?: string; date: string; timeIn?: string; timeOut?: string; breakOut?: string; breakIn?: string; status: AttendanceRecord['status']; workType?: AttendanceRecord['workType']; autoRecorded?: boolean; wfhId?: string }

/** The API sends HH:MM:SS and no company; the screens use HH:MM and the domain shape. */
export function toAttendanceRecord(r: ApiRecord): AttendanceRecord {
  return {
    id: r.id,
    companyId: '',
    employeeId: r.employeeId,
    scheduleId: r.workScheduleId ?? '',
    date: r.date.slice(0, 10),
    timeIn: hhmm(r.timeIn),
    timeOut: hhmm(r.timeOut),
    breakOut: hhmm(r.breakOut),
    breakIn: hhmm(r.breakIn),
    status: r.status,
    workType: r.workType,
    autoRecorded: r.autoRecorded || undefined,
    wfhId: r.wfhId,
  }
}

async function fetchRecords(params: Record<string, string>): Promise<AttendanceRecord[]> {
  const res = await api.get<{ data: unknown[] }>('/api/attendance', params)
  return camelizeKeys<ApiRecord[]>(res.data).map(toAttendanceRecord)
}

export const fetchAttendanceForDate = (date: string) => fetchRecords({ date })

const dayKey = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10)

/** The last year of records: what an import compares against, and what the weekly and monthly views read. */
export const fetchAttendanceHistory = () => fetchRecords({ from: dayKey(-365), to: dayKey(0) })

export const fetchAttendanceRange = (from: string, to: string, employeeId?: string) => fetchRecords(employeeId ? { from, to, employee_id: employeeId } : { from, to })

/** Late days of the last two years, in the shape `lateDatesByEmployee` reads. */
export async function fetchLateRecords(): Promise<{ employeeId: string; date: string; status: 'late' }[]> {
  const res = await api.get<{ data: { employee_id: number; date: string }[] }>('/api/attendance/late-dates')
  return res.data.map((r) => ({ employeeId: String(r.employee_id), date: r.date.slice(0, 10), status: 'late' as const }))
}

/**
 * Work schedules with `assignedEmployeeIds` filled from each employee's default schedule, so the review and leave helpers
 * keep reading the schedule an employee follows the way they always did.
 */
export async function fetchSchedulesWithMembers(): Promise<Schedule[]> {
  const [templates, employees] = await Promise.all([fetchShiftTemplates(), fetchAllEmployees()])
  return templates.map((s) => ({ ...s, companyId: '', assignedEmployeeIds: employees.filter((e) => e.workScheduleId === s.id).map((e) => e.id) }))
}

type ApiAdjustment = { id: string; employeeId: string; attendanceRecordId: string; requestedTimeIn?: string; requestedTimeOut?: string; reason: string; reasonCategory?: string; status: ApprovalStatus; createdAt: string; decidedAt?: string; decider?: { name: string }; record?: { date: string } }

export async function fetchAdjustments(): Promise<AttendanceAdjustment[]> {
  const res = await api.get<{ data: unknown[] }>('/api/attendance/adjustments')
  return camelizeKeys<ApiAdjustment[]>(res.data).map((a) => ({
    id: a.id,
    companyId: '',
    employeeId: a.employeeId,
    attendanceRecordId: a.attendanceRecordId,
    date: a.record?.date.slice(0, 10),
    requestedTimeIn: hhmm(a.requestedTimeIn),
    requestedTimeOut: hhmm(a.requestedTimeOut),
    reason: a.reason,
    reasonCategory: a.reasonCategory,
    status: a.status,
    requestedAt: a.createdAt,
    decidedBy: a.decider?.name,
    decidedAt: a.decidedAt,
  }))
}

export interface AdjustmentRequestInput {
  employeeId: string
  date: string
  requestedTimeIn: string | null
  requestedTimeOut: string | null
  reason: string
  reasonCategory?: string
}

/** Files a correction for an employee's day; a day with no record yet becomes an absent one the request hangs on. */
export async function requestAdjustment(input: AdjustmentRequestInput): Promise<void> {
  await api.post('/api/attendance/adjustments', {
    employee_id: Number(input.employeeId),
    date: input.date,
    requested_time_in: input.requestedTimeIn || null,
    requested_time_out: input.requestedTimeOut || null,
    reason: input.reason,
    reason_category: input.reasonCategory,
  })
}

/** Approves or rejects the pending requests in `ids`; returns how many were decided. */
export async function decideAdjustments(ids: string[], decision: Extract<ApprovalStatus, 'approved' | 'rejected'>): Promise<number> {
  const res = await api.post<{ data: { decided: number } }>('/api/attendance/adjustments/decide', { ids: ids.map(Number), decision })
  return res.data.decided
}

export interface BiometricsPunch {
  employeeId: string
  date: string
  timeIn: string
  timeOut: string | null
  breakOut?: string | null
  breakIn?: string | null
  /** Schedule-based import: the schedule the punch was reviewed against and the status that review settled on. */
  scheduleId?: string
  status?: AttendanceRecord['status']
}

/** Saves punches parsed from a biometrics file: the day's record is created or replaced. Returns how many were saved and which rows the server refused. */
export async function importPunches(punches: BiometricsPunch[]): Promise<{ saved: number; refused: { line: number; errors: string[] }[] }> {
  const rows = punches.map((p, i) => ({
    line: i + 1,
    employee_id: Number(p.employeeId),
    date: p.date,
    time_in: p.timeIn,
    time_out: p.timeOut,
    break_out: p.breakOut ?? null,
    break_in: p.breakIn ?? null,
    work_schedule_id: p.scheduleId ? Number(p.scheduleId) : null,
    status: p.status ?? null,
  }))
  let saved = 0
  const refused: { line: number; errors: string[] }[] = []
  // The server takes 500 rows a request.
  for (let i = 0; i < rows.length; i += 500) {
    const res = await api.post<{ data: { created: number; rows: { line: number; ok: boolean; errors: string[] }[] } }>('/api/attendance/biometrics', { rows: rows.slice(i, i + 500) })
    saved += res.data.created
    refused.push(...res.data.rows.filter((r) => !r.ok).map((r) => ({ line: r.line, errors: r.errors })))
  }
  return { saved, refused }
}

export interface LogAttendanceInput {
  employeeIds: string[]
  dateFrom: string
  dateTo: string
  workType: NonNullable<AttendanceRecord['workType']>
  timeIn: string
  /** AM out and PM in (lunch) — optional. */
  breakOut?: string
  breakIn?: string
  timeOut: string
  reason: string
  /** Replace a day that already has a record. Auto-recorded WFH days are always replaced. */
  overwrite?: boolean
}

export interface LogAttendanceResult {
  created: number
  updated: number
  /** Days left alone: rest days, holidays, or an existing record when not overwriting. */
  skipped: number
}

/** Logs attendance by hand — for WFH, field work, or a day the biometrics missed. One record per employee per working day in the range. */
export async function logAttendance(input: LogAttendanceInput): Promise<LogAttendanceResult> {
  const res = await api.post<{ data: LogAttendanceResult }>('/api/attendance/log', {
    employee_ids: input.employeeIds.map(Number),
    date_from: input.dateFrom,
    date_to: input.dateTo,
    work_type: input.workType,
    time_in: input.timeIn,
    time_out: input.timeOut || null,
    break_out: input.breakOut || null,
    break_in: input.breakIn || null,
    reason: input.reason,
    overwrite: input.overwrite ?? false,
  })
  return res.data
}

// ---- Read helpers for the reports, dashboards and notifications (the same data, on the API) ---------------------------------------

/** Every attendance record of the last year the user may see. */
export const getAttendanceRecords = (session: SessionUser): Promise<AttendanceRecord[]> => memoRead(`attendance:${session.id}`, fetchAttendanceHistory)

export async function getAttendanceAdjustments(_session: SessionUser): Promise<AttendanceAdjustment[]> {
  return (await memoRead(`adjustments:${_session.id}`, fetchAdjustments)).slice().sort((x, y) => y.requestedAt.localeCompare(x.requestedAt))
}

export { statusForPunch }

/** Approved leave requests overlapping a date range, with their leave type — for leave-aware attendance status. */
export const getApprovedLeavesInRange = (_session: SessionUser, from: string, to: string) => fetchApprovedLeaves(from, to)
