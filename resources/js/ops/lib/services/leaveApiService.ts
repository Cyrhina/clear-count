import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import type { ApprovalStatus, LeaveDayPortion, LeaveRequest, LeaveType, LeaveTypeTierCredits } from '@ops/types/domain'

/*
 * Leave on the API: types, requests, balances. Credits live in a ledger on the server (balance = sum of entries; available =
 * balance minus pending requests). The mock `leaveService` stays for the ESS pages, dashboards and payroll until their modules move.
 */

type ApiType = Omit<LeaveType, 'companyId'>
type ApiRequest = {
  id: string
  employeeId: string
  leaveTypeId: string
  dateFrom: string
  dateTo: string
  dayPortion: LeaveDayPortion
  days: number
  reason?: string
  status: ApprovalStatus | 'cancelled'
  createdAt: string
  decidedAt?: string
  decider?: { name: string }
  leaveType?: { name: string; isPaid: boolean }
}

// `tierCredits` keys are data (executive, managerial, rank_and_file), not field names.
const toType = (t: ApiType): LeaveType => ({ ...t, companyId: '' })

export async function fetchLeaveTypes(): Promise<LeaveType[]> {
  const res = await api.get<{ data: unknown[] }>('/api/leave/types')
  return camelizeKeys<ApiType[]>(res.data, ['tierCredits']).map(toType)
}

export interface LeaveTypeInput {
  name: string
  defaultCredits: number
  description?: string
  isPaid: boolean
  maxCarryOver: number
  tierCredits: LeaveTypeTierCredits
}

const typeBody = (i: LeaveTypeInput) => ({
  name: i.name,
  description: i.description || null,
  is_paid: i.isPaid,
  default_credits: i.defaultCredits,
  max_carry_over: i.maxCarryOver,
  tier_credits: i.tierCredits,
})

export const createLeaveType = (input: LeaveTypeInput) => api.post('/api/leave/types', typeBody(input))
export const updateLeaveType = (id: string, input: LeaveTypeInput) => api.put(`/api/leave/types/${id}`, typeBody(input))

function toRequest(a: ApiRequest): LeaveRequest {
  return {
    id: a.id,
    companyId: '',
    employeeId: a.employeeId,
    leaveTypeId: a.leaveTypeId,
    dateFrom: a.dateFrom.slice(0, 10),
    dateTo: a.dateTo.slice(0, 10),
    ...(a.dayPortion !== 'full' ? { dayPortion: a.dayPortion } : {}),
    days: a.days,
    reason: a.reason,
    status: a.status,
    requestedAt: a.createdAt,
    decidedBy: a.decider?.name,
    decidedAt: a.decidedAt,
  }
}

export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  const res = await api.get<{ data: unknown[] }>('/api/leave/requests')
  return camelizeKeys<ApiRequest[]>(res.data).map(toRequest)
}

/** Approved leave overlapping a date range, with its type: for the attendance and roster screens. */
export async function fetchApprovedLeaves(from: string, to: string): Promise<{ request: LeaveRequest; typeName: string; isPaid: boolean }[]> {
  const res = await api.get<{ data: unknown[] }>('/api/leave/requests', { status: 'approved', from, to })
  return camelizeKeys<ApiRequest[]>(res.data).map((a) => ({ request: toRequest(a), typeName: a.leaveType?.name ?? 'Leave', isPaid: a.leaveType?.isPaid !== false }))
}

export interface LeaveFilingInput {
  employeeId: string
  leaveTypeId: string
  dateFrom: string
  dateTo: string
  /** Full day(s) by default; a half day is a single date. */
  dayPortion?: LeaveDayPortion
  reason?: string
}

export interface LeavePlan {
  /** Credits this request would use. */
  days: number
  /** Credits free right now for that leave type (null = not credit-limited). */
  available: number | null
  /** Why it can't be filed, when it can't. */
  error?: string
}

const filingBody = (i: LeaveFilingInput) => ({
  employee_id: Number(i.employeeId),
  leave_type_id: Number(i.leaveTypeId),
  date_from: i.dateFrom,
  date_to: i.dateTo,
  day_portion: i.dayPortion ?? 'full',
  reason: i.reason || null,
})

/** What a request would use and whether it can be filed, worked out by the server (working days, holidays, overlaps, credits). */
export async function previewLeave(input: LeaveFilingInput): Promise<LeavePlan> {
  const res = await api.post<{ data: { days: number; available: number | null; error?: string } }>('/api/leave/requests/preview', filingBody(input))
  return res.data
}

export const fileLeave = (input: LeaveFilingInput) => api.post('/api/leave/requests', filingBody(input))

/** Approves or rejects the pending requests; returns how many were decided. An approval takes the days from the balance. */
export async function decideLeave(ids: string[], decision: 'approved' | 'rejected'): Promise<number> {
  return (await api.post<{ data: { decided: number } }>('/api/leave/requests/decide', { ids: ids.map(Number), decision })).data.decided
}

/** Cancels a pending or approved request; an approved one gives its days back. */
export const cancelLeave = (id: string) => api.post(`/api/leave/requests/${id}/cancel`, {})

export interface LeaveBalance {
  employeeId: string
  leaveTypeId: string
  /** Credits the year started with: what is left plus what was used. */
  credits: number
  /** Used this year. */
  used: number
  /** What is left (the ledger balance). */
  remaining: number
  pending: number
  /** Free to file: remaining minus pending. Null for unpaid types. */
  available: number | null
}

export async function fetchLeaveBalances(): Promise<LeaveBalance[]> {
  const res = await api.get<{ data: { employee_id: number; leave_type_id: number; balance: number; used: number; pending: number; credits: number; available: number | null }[] }>('/api/leave/balances')
  return res.data.map((b) => ({ employeeId: String(b.employee_id), leaveTypeId: String(b.leave_type_id), credits: b.credits, used: b.used, remaining: b.balance, pending: b.pending, available: b.available }))
}

/** Adds to (`add`) or sets (`set`) the credits of one leave type for the employees. Returns how many were updated. */
export async function grantCredits(employeeIds: string[], leaveTypeId: string, days: number, mode: 'add' | 'set'): Promise<number> {
  return (await api.post<{ data: { updated: number } }>('/api/leave/credits', { employee_ids: employeeIds.map(Number), leave_type_id: Number(leaveTypeId), days, mode })).data.updated
}
