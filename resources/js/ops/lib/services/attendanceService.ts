import { roleHasCapability } from '@ops/lib/rbac/permissions'
import { statusForPunch } from '@ops/lib/attendance/status'
import { getEmployees } from '@ops/lib/services/employeeService'
import { materializeWfhRecords, scheduleOn } from '@ops/lib/services/wfhService'
import { scopeToCompany } from '@ops/lib/tenancy/tenantScope'
import { db } from '@ops/mock-data'
import type { AttendanceAdjustment, AttendanceRecord, ApprovalStatus, LeaveRequest, SessionUser } from '@ops/types/domain'

async function scopedEmployeeIds(session: SessionUser): Promise<Set<string>> {
  const employees = await getEmployees(session)
  return new Set(employees.map((e) => e.id))
}

export async function getSchedules(session: SessionUser) {
  return scopeToCompany(db.schedules, session.companyId)
}

export async function getAttendanceForDate(session: SessionUser, date: string): Promise<AttendanceRecord[]> {
  materializeWfhRecords()
  const employeeIds = await scopedEmployeeIds(session)
  return db.attendanceRecords.filter((r) => r.companyId === session.companyId && r.date === date && employeeIds.has(r.employeeId))
}

/** Every attendance record in scope, unfiltered by date — used to derive Daily/Hourly Basic Pay for a Payroll Run. */
export async function getAttendanceRecords(session: SessionUser): Promise<AttendanceRecord[]> {
  materializeWfhRecords()
  const employeeIds = await scopedEmployeeIds(session)
  return db.attendanceRecords.filter((r) => r.companyId === session.companyId && employeeIds.has(r.employeeId))
}

export async function getAttendanceForEmployee(session: SessionUser, employeeId: string): Promise<AttendanceRecord[]> {
  materializeWfhRecords()
  const employeeIds = await scopedEmployeeIds(session)
  if (!employeeIds.has(employeeId)) return []
  return db.attendanceRecords
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function getAttendanceRecordForEmployeeDate(
  session: SessionUser,
  employeeId: string,
  date: string,
): Promise<AttendanceRecord | undefined> {
  return db.attendanceRecords.find((r) => r.companyId === session.companyId && r.employeeId === employeeId && r.date === date)
}

/** Employee ids with an approved leave request covering the given date — powers the "On Leave" filter option. */
export async function getEmployeeIdsOnLeaveForDate(session: SessionUser, date: string): Promise<Set<string>> {
  const employeeIds = await scopedEmployeeIds(session)
  const onLeave = db.leaveRequests.filter(
    (r) =>
      r.companyId === session.companyId &&
      r.status === 'approved' &&
      employeeIds.has(r.employeeId) &&
      r.dateFrom <= date &&
      r.dateTo >= date,
  )
  return new Set(onLeave.map((r) => r.employeeId))
}

/** Employee ids with a pending adjustment request tied to the given date's attendance record — powers the "Pending Adjustment" filter option. */
export async function getEmployeeIdsWithPendingAdjustmentForDate(session: SessionUser, date: string): Promise<Set<string>> {
  const employeeIds = await scopedEmployeeIds(session)
  const recordIdsForDate = new Set(
    db.attendanceRecords.filter((r) => r.companyId === session.companyId && r.date === date).map((r) => r.id),
  )
  const pending = db.attendanceAdjustments.filter(
    (a) =>
      a.companyId === session.companyId &&
      a.status === 'pending' &&
      employeeIds.has(a.employeeId) &&
      recordIdsForDate.has(a.attendanceRecordId),
  )
  return new Set(pending.map((a) => a.employeeId))
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

export { statusForPunch }

/** Applies punches parsed from an uploaded biometrics CSV — updates the matching day's record or creates one. */
export async function applyBiometricsPunches(session: SessionUser, punches: BiometricsPunch[]): Promise<number> {
  const employeeIds = await scopedEmployeeIds(session)
  const schedules = await getSchedules(session)
  const defaultSchedule = schedules[0]
  if (!defaultSchedule) return 0

  let applied = 0
  for (const punch of punches) {
    if (!employeeIds.has(punch.employeeId)) continue
    const existing = db.attendanceRecords.find(
      (r) => r.companyId === session.companyId && r.employeeId === punch.employeeId && r.date === punch.date,
    )
    const schedule =
      schedules.find((s) => s.id === punch.scheduleId) ??
      schedules.find((s) => s.id === existing?.scheduleId) ??
      schedules.find((s) => s.assignedEmployeeIds?.includes(punch.employeeId)) ??
      defaultSchedule
    const status = punch.status ?? statusForPunch(punch.timeIn, punch.timeOut, schedule.startTime, schedule.endTime, schedule.gracePeriodMinutes ?? 0)

    if (existing) {
      existing.timeIn = punch.timeIn
      existing.timeOut = punch.timeOut
      existing.breakOut = punch.breakOut ?? null
      existing.breakIn = punch.breakIn ?? null
      if (existing.autoRecorded) {
        existing.autoRecorded = false
        existing.workType = undefined
        existing.wfhId = undefined
      }
      existing.status = status
      if (punch.scheduleId) existing.scheduleId = punch.scheduleId
    } else {
      db.attendanceRecords.push({
        id: `${punch.employeeId}_att_${punch.date}_import`,
        companyId: session.companyId,
        employeeId: punch.employeeId,
        scheduleId: schedule.id,
        date: punch.date,
        timeIn: punch.timeIn,
        timeOut: punch.timeOut,
        breakOut: punch.breakOut ?? null,
        breakIn: punch.breakIn ?? null,
        status,
      })
    }
    applied++
  }
  return applied
}

export async function getAttendanceAdjustments(session: SessionUser): Promise<AttendanceAdjustment[]> {
  const employeeIds = await scopedEmployeeIds(session)
  return db.attendanceAdjustments
    .filter((a) => a.companyId === session.companyId && employeeIds.has(a.employeeId))
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
}

export interface CreateAdjustmentInput {
  attendanceRecordId: string
  requestedTimeIn: string | null
  requestedTimeOut: string | null
  reason: string
  reasonCategory?: string
}

export async function createAttendanceAdjustment(
  session: SessionUser,
  input: CreateAdjustmentInput,
): Promise<AttendanceAdjustment> {
  const record = db.attendanceRecords.find((r) => r.id === input.attendanceRecordId)
  if (!record) throw new Error('Attendance record not found')

  const adjustment: AttendanceAdjustment = {
    id: crypto.randomUUID(),
    companyId: session.companyId,
    employeeId: record.employeeId,
    attendanceRecordId: record.id,
    requestedTimeIn: input.requestedTimeIn,
    requestedTimeOut: input.requestedTimeOut,
    reason: input.reason,
    reasonCategory: input.reasonCategory,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  }
  db.attendanceAdjustments.unshift(adjustment)
  return adjustment
}

export interface FileAdjustmentInput {
  employeeId: string
  date: string
  requestedTimeIn: string | null
  requestedTimeOut: string | null
  reasonCategory: string
  remarks: string
}

/**
 * Backs the standalone "+ File Adjustment" flow, which starts from an employee + date
 * rather than an existing attendance-table row. Resolves (or creates, if the employee
 * has no record yet for that date — e.g. an unlogged absence) the underlying
 * AttendanceRecord so every adjustment still ties back to one, matching the existing
 * per-row request flow's data shape.
 */
export async function fileAttendanceAdjustment(session: SessionUser, input: FileAdjustmentInput): Promise<AttendanceAdjustment> {
  let record = db.attendanceRecords.find(
    (r) => r.companyId === session.companyId && r.employeeId === input.employeeId && r.date === input.date,
  )

  if (!record) {
    const schedule = db.schedules.find((s) => s.companyId === session.companyId)
    record = {
      id: crypto.randomUUID(),
      companyId: session.companyId,
      employeeId: input.employeeId,
      scheduleId: schedule?.id ?? '',
      date: input.date,
      timeIn: null,
      timeOut: null,
      status: 'absent',
    }
    db.attendanceRecords.push(record)
  }

  return createAttendanceAdjustment(session, {
    attendanceRecordId: record.id,
    requestedTimeIn: input.requestedTimeIn,
    requestedTimeOut: input.requestedTimeOut,
    reason: input.remarks,
    reasonCategory: input.reasonCategory,
  })
}

export async function decideAttendanceAdjustment(
  session: SessionUser,
  adjustmentId: string,
  decision: Extract<ApprovalStatus, 'approved' | 'rejected'>,
): Promise<void> {
  const adjustment = db.attendanceAdjustments.find((a) => a.id === adjustmentId)
  if (!adjustment) return

  adjustment.status = decision
  adjustment.decidedBy = session.name
  adjustment.decidedAt = new Date().toISOString()

  if (decision === 'approved') {
    const record = db.attendanceRecords.find((r) => r.id === adjustment.attendanceRecordId)
    if (record) {
      record.timeIn = adjustment.requestedTimeIn
      record.timeOut = adjustment.requestedTimeOut
      record.status = 'present'
    }
  }
}

/** Approved leave requests overlapping a date range, with their leave type — for leave-aware attendance status. */
export async function getApprovedLeavesInRange(
  session: SessionUser,
  from: string,
  to: string,
): Promise<{ request: LeaveRequest; typeName: string; isPaid: boolean }[]> {
  const employeeIds = await scopedEmployeeIds(session)
  return db.leaveRequests
    .filter((r) => r.companyId === session.companyId && r.status === 'approved' && employeeIds.has(r.employeeId) && r.dateFrom <= to && r.dateTo >= from)
    .map((request) => {
      const type = db.leaveTypes.find((t) => t.id === request.leaveTypeId)
      return { request, typeName: type?.name ?? 'Leave', isPaid: type?.isPaid !== false }
    })
}

/** Approves or rejects every pending adjustment in `adjustmentIds`; returns how many were decided. */
export async function decideAttendanceAdjustments(session: SessionUser, adjustmentIds: string[], decision: Extract<ApprovalStatus, 'approved' | 'rejected'>): Promise<number> {
  let decided = 0
  for (const id of adjustmentIds) {
    const adjustment = db.attendanceAdjustments.find((a) => a.id === id)
    if (!adjustment || adjustment.status !== 'pending') continue
    await decideAttendanceAdjustment(session, id, decision)
    decided += 1
  }
  return decided
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
export async function logAttendance(session: SessionUser, input: LogAttendanceInput): Promise<LogAttendanceResult> {
  if (!roleHasCapability(session.role, 'attendance.adjust')) throw new Error('You cannot log attendance for others.')
  if (!input.reason.trim()) throw new Error('Add a reason.')
  if (!input.timeIn) throw new Error('Enter the AM in time.')
  if (input.dateTo < input.dateFrom) throw new Error('The end date is before the start date.')
  const allowed = new Map((await getEmployees(session)).map((e) => [e.id, e]))
  const result: LogAttendanceResult = { created: 0, updated: 0, skipped: 0 }
  const next = (date: string) => {
    const d = new Date(`${date}T00:00:00`)
    d.setDate(d.getDate() + 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  for (const employeeId of input.employeeIds) {
    const employee = allowed.get(employeeId)
    if (!employee) continue
    for (let date = input.dateFrom; date <= input.dateTo; date = next(date)) {
      const { schedule, rest } = scheduleOn(employee, date)
      const holiday = db.holidays.some((h) => h.companyId === session.companyId && h.date === date)
      if (!schedule || rest || holiday) {
        result.skipped++
        continue
      }
      const existing = db.attendanceRecords.find((r) => r.companyId === session.companyId && r.employeeId === employeeId && r.date === date)
      if (existing && !existing.autoRecorded && !input.overwrite) {
        result.skipped++
        continue
      }
      const status = statusForPunch(input.timeIn, input.timeOut || null, schedule.startTime, schedule.endTime, schedule.gracePeriodMinutes ?? 0)
      const fields = {
        scheduleId: schedule.id,
        timeIn: input.timeIn,
        timeOut: input.timeOut || null,
        breakOut: input.breakOut || null,
        breakIn: input.breakIn || null,
        status,
        workType: input.workType,
        autoRecorded: false,
        wfhId: undefined,
      }
      if (existing) {
        Object.assign(existing, fields)
        result.updated++
      } else {
        db.attendanceRecords.push({ id: `${employeeId}_att_${date}_manual`, companyId: session.companyId, employeeId, date, ...fields })
        result.created++
      }
    }
  }
  db.activityLog.unshift({
    id: crypto.randomUUID(),
    companyId: session.companyId,
    timestamp: new Date().toISOString(),
    actor: session.name,
    actorRole: session.role,
    action: `Logged ${input.workType.toUpperCase()} attendance for ${input.employeeIds.length} employee${input.employeeIds.length === 1 ? '' : 's'} (${input.dateFrom}${input.dateTo !== input.dateFrom ? ` to ${input.dateTo}` : ''})`,
    details: input.reason.trim(),
    module: 'Attendance',
    kind: 'Added',
    title: 'Logged attendance',
  })
  return result
}
