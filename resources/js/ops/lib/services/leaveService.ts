import { getEmployees } from '@ops/lib/services/employeeService'
import { scopeToCompany } from '@ops/lib/tenancy/tenantScope'
import { db } from '@ops/mock-data'
import type { ApprovalStatus, LeaveRequest, LeaveType, LeaveTypeTierCredits, SessionUser } from '@ops/types/domain'

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
    .reduce((total, r) => {
      const days = (new Date(r.dateTo).getTime() - new Date(r.dateFrom).getTime()) / 86_400_000 + 1
      return total + days
    }, 0)

  return { credits, used, remaining: Math.max(0, credits - used) }
}

export interface SubmitLeaveInput {
  employeeId: string
  leaveTypeId: string
  dateFrom: string
  dateTo: string
  reason?: string
}

export async function submitLeaveRequest(session: SessionUser, input: SubmitLeaveInput): Promise<LeaveRequest> {
  const request: LeaveRequest = {
    id: crypto.randomUUID(),
    companyId: session.companyId,
    employeeId: input.employeeId,
    leaveTypeId: input.leaveTypeId,
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    reason: input.reason,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  }
  db.leaveRequests.unshift(request)
  return request
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
