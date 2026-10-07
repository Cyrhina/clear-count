import { getEmployees } from '@ops/lib/services/employeeService'
import { HALF_DAY_LABEL, isWorkingDay, leaveRequestDays } from '@ops/lib/leave/leaveDays'
import { scopeToCompany } from '@ops/lib/tenancy/tenantScope'
import { db } from '@ops/mock-data'
import type { ApprovalStatus, LeaveDayPortion, LeaveRequest, LeaveType, LeaveTypeTierCredits, SessionUser } from '@ops/types/domain'

async function scopedEmployeeIds(session: SessionUser): Promise<Set<string>> {
  const employees = await getEmployees(session)
  return new Set(employees.map((e) => e.id))
}

export async function getLeaveTypes(session: SessionUser) {
  return scopeToCompany(db.leaveTypes, session.companyId)
}

export interface LeaveTypeInput {
  name: string
  defaultCredits: number
  description?: string
  isPaid: boolean
  maxCarryOver: number
  tierCredits: LeaveTypeTierCredits
}

export async function createLeaveType(session: SessionUser, input: LeaveTypeInput): Promise<LeaveType> {
  const leaveType: LeaveType = {
    id: crypto.randomUUID(),
    companyId: session.companyId,
    ...input,
  }
  db.leaveTypes.push(leaveType)
  return leaveType
}

export async function updateLeaveType(session: SessionUser, leaveTypeId: string, input: LeaveTypeInput): Promise<void> {
  const leaveType = db.leaveTypes.find((lt) => lt.id === leaveTypeId && lt.companyId === session.companyId)
  if (!leaveType) return
  Object.assign(leaveType, input)
}

export async function getLeaveRequests(session: SessionUser): Promise<LeaveRequest[]> {
  const employeeIds = await scopedEmployeeIds(session)
  return db.leaveRequests
    .filter((r) => r.companyId === session.companyId && employeeIds.has(r.employeeId))
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
}

export function getLeaveBalance(employeeId: string, leaveTypeId: string): { credits: number; used: number; remaining: number } {
  const employee = db.employees.find((e) => e.id === employeeId)
  const leaveType = db.leaveTypes.find((lt) => lt.id === leaveTypeId)
  const credits = (employee && leaveType && employee.benefits.leaveCreditsByType[leaveType.name]) ?? 0

  const used = db.leaveRequests
    .filter((r) => r.employeeId === employeeId && r.leaveTypeId === leaveTypeId && r.status === 'approved')
    .reduce((total, r) => total + leaveRequestDays(r), 0)

  return { credits, used, remaining: Math.max(0, credits - used) }
}

/** Credits still free for a leave type: what is left after approved leave and what other pending requests already hold. `null` when the type isn't credit-limited (unpaid types, or no credits set up). */
export function getAvailableLeaveCredits(employeeId: string, leaveTypeId: string): number | null {
  const employee = db.employees.find((e) => e.id === employeeId)
  const leaveType = db.leaveTypes.find((lt) => lt.id === leaveTypeId)
  if (!employee || !leaveType || leaveType.isPaid === false || !(leaveType.name in employee.benefits.leaveCreditsByType)) return null
  const pending = db.leaveRequests
    .filter((r) => r.employeeId === employeeId && r.leaveTypeId === leaveTypeId && r.status === 'pending')
    .reduce((total, r) => total + leaveRequestDays(r), 0)
  return Math.max(0, getLeaveBalance(employeeId, leaveTypeId).remaining - pending)
}

const portionOf = (r: Pick<LeaveRequest, 'dayPortion'>): LeaveDayPortion => r.dayPortion ?? 'full'

export interface LeavePlan {
  /** Credits this request would use. */
  days: number
  /** Credits free right now for that leave type (null = not credit-limited). */
  available: number | null
  /** Why it can't be filed, when it can't. */
  error?: string
}

/** Checks a leave request before it is filed: working days used, enough credits, and no clash with the employee's other leave. */
export function planLeaveRequest(input: Pick<SubmitLeaveInput, 'employeeId' | 'leaveTypeId' | 'dateFrom' | 'dateTo' | 'dayPortion'>): LeavePlan {
  const portion = input.dayPortion ?? 'full'
  const dateTo = portion === 'full' ? input.dateTo : input.dateFrom
  const candidate = { employeeId: input.employeeId, dateFrom: input.dateFrom, dateTo, dayPortion: portion }
  const days = input.dateFrom && dateTo ? leaveRequestDays(candidate) : 0
  const available = input.employeeId && input.leaveTypeId ? getAvailableLeaveCredits(input.employeeId, input.leaveTypeId) : null
  if (!input.dateFrom || !dateTo) return { days, available }
  if (dateTo < input.dateFrom) return { days, available, error: 'The end date must be on or after the start date.' }
  if (days === 0) return { days, available, error: 'These dates are all rest days or days off, so there is nothing to file leave for.' }
  if (portion !== 'full' && !isWorkingDay(input.employeeId, input.dateFrom)) return { days, available, error: 'That date is a rest day, so a half day cannot be filed for it.' }

  const clash = db.leaveRequests.find((r) => {
    if (r.employeeId !== input.employeeId || (r.status !== 'pending' && r.status !== 'approved')) return false
    if (r.dateFrom > dateTo || r.dateTo < input.dateFrom) return false
    // The only allowed overlap: a morning half day and an afternoon half day on the same single date.
    const bothHalves = portion !== 'full' && portionOf(r) !== 'full' && r.dateFrom === input.dateFrom && portionOf(r) !== portion
    return !bothHalves
  })
  if (clash) {
    const half = portionOf(clash) === 'full' ? '' : ` (${HALF_DAY_LABEL[portionOf(clash) as 'half_am' | 'half_pm']})`
    return { days, available, error: `This employee already has ${clash.status} leave on ${clash.dateFrom === clash.dateTo ? clash.dateFrom : `${clash.dateFrom} to ${clash.dateTo}`}${half}.` }
  }

  if (available !== null && days > available) {
    const name = db.leaveTypes.find((lt) => lt.id === input.leaveTypeId)?.name ?? 'leave'
    return { days, available, error: `Not enough ${name} credits: ${available} day${available === 1 ? '' : 's'} available, ${days} requested.` }
  }
  return { days, available }
}

export type SubmitLeaveResult = { ok: true; request: LeaveRequest } | { ok: false; error: string }

export interface SubmitLeaveInput {
  employeeId: string
  leaveTypeId: string
  dateFrom: string
  dateTo: string
  /** Full day(s) by default; a half day is a single date. */
  dayPortion?: LeaveDayPortion
  reason?: string
}

export async function submitLeaveRequest(session: SessionUser, input: SubmitLeaveInput): Promise<SubmitLeaveResult> {
  const plan = planLeaveRequest(input)
  if (plan.error) return { ok: false, error: plan.error }
  const request: LeaveRequest = {
    id: crypto.randomUUID(),
    companyId: session.companyId,
    employeeId: input.employeeId,
    leaveTypeId: input.leaveTypeId,
    dateFrom: input.dateFrom,
    // A half day is always one date, whatever end date the caller sent.
    dateTo: input.dayPortion && input.dayPortion !== 'full' ? input.dateFrom : input.dateTo,
    ...(input.dayPortion && input.dayPortion !== 'full' ? { dayPortion: input.dayPortion } : {}),
    reason: input.reason,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  }
  db.leaveRequests.unshift(request)
  return { ok: true, request }
}

export async function decideLeaveRequest(
  session: SessionUser,
  requestId: string,
  decision: Extract<ApprovalStatus, 'approved' | 'rejected'>,
): Promise<void> {
  const request = db.leaveRequests.find((r) => r.id === requestId)
  if (!request) return
  request.status = decision
  request.decidedBy = session.name
  request.decidedAt = new Date().toISOString()
}

/** Approves or rejects every pending request in `requestIds`; returns how many were decided. */
export async function decideLeaveRequests(session: SessionUser, requestIds: string[], decision: Extract<ApprovalStatus, 'approved' | 'rejected'>): Promise<number> {
  let decided = 0
  for (const id of requestIds) {
    const request = db.leaveRequests.find((r) => r.id === id)
    if (!request || request.status !== 'pending') continue
    await decideLeaveRequest(session, id, decision)
    decided += 1
  }
  return decided
}

/**
 * Adds `days` to (mode 'add') or sets (mode 'set') the credits of one leave type for every selected employee.
 * Merges into `leaveCreditsByType` — the rest of `benefits` (HMO plan, other leave types) is left as is. Returns how many were updated.
 */
export async function grantLeaveCredits(session: SessionUser, employeeIds: string[], leaveTypeName: string, days: number, mode: 'add' | 'set'): Promise<number> {
  const allowed = await scopedEmployeeIds(session)
  let updated = 0
  for (const id of employeeIds) {
    const employee = db.employees.find((e) => e.id === id && e.companyId === session.companyId)
    if (!employee || !allowed.has(id)) continue
    const current = employee.benefits.leaveCreditsByType[leaveTypeName] ?? 0
    const next = Math.max(0, mode === 'add' ? current + days : days)
    employee.benefits.leaveCreditsByType[leaveTypeName] = next
    employee.history.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      actor: session.name,
      action: `${leaveTypeName} credits ${mode === 'add' ? `increased by ${days}` : `set to ${days}`} (now ${next} days)`,
    })
    updated += 1
  }
  return updated
}
