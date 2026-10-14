import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import type { ApprovalStatus, CompensationApproval, CompensationApprovalType } from '@ops/types/domain'

/*
 * Work logs (hours of hourly employees, output of output-based ones) on the API. The server sets the rate and amount when a log is
 * filed. The mock `compensationApprovalService` stays for dashboards, reports and notifications.
 */

export type ApiWorkLog = {
  id: string
  employeeId: string
  type: CompensationApprovalType
  workDate: string
  quantity: number
  unitLabel: string
  rate: number
  amount: number
  description?: string
  status: ApprovalStatus
  createdAt: string
  decidedAt?: string
  decider?: { name: string }
  payrollPeriodId?: string
}

export const toWorkLog = (a: ApiWorkLog): CompensationApproval => ({
  id: a.id,
  companyId: '',
  employeeId: a.employeeId,
  type: a.type,
  workDate: a.workDate.slice(0, 10),
  quantity: a.quantity,
  unitLabel: a.unitLabel,
  rate: a.rate,
  amount: a.amount,
  description: a.description ?? '',
  status: a.status,
  submittedAt: a.createdAt,
  decidedBy: a.decider?.name,
  decidedAt: a.decidedAt,
  payrollPeriodId: a.payrollPeriodId,
})

export async function fetchWorkLogs(): Promise<CompensationApproval[]> {
  const res = await api.get<{ data: unknown[] }>('/api/work-logs')
  return camelizeKeys<ApiWorkLog[]>(res.data).map(toWorkLog)
}

export interface WorkLogInput {
  employeeId: string
  workDate: string
  quantity: number
  description: string
}

/** Files hours (hourly) or units completed (output-based) for approval; the server sets the unit, rate and amount. */
export const fileWorkLog = (input: WorkLogInput) =>
  api.post('/api/work-logs', { employee_id: Number(input.employeeId), work_date: input.workDate, quantity: input.quantity, description: input.description })

/** Withdraws a log that is still pending. */
export const withdrawWorkLog = (id: string) => api.delete(`/api/work-logs/${id}`)

/** Approves or rejects the pending logs; returns how many were decided. */
export async function decideWorkLogs(ids: string[], decision: 'approved' | 'rejected'): Promise<number> {
  return (await api.post<{ data: { decided: number } }>('/api/work-logs/decide', { ids: ids.map(Number), decision })).data.decided
}
