import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import type { ApprovalStatus, Employee, OvertimeRecord, OvertimeType } from '@ops/types/domain'

/*
 * Overtime and night differential on the API. The server works out the hours (also across midnight) and copies the multiplier
 * from the rate table when the request is filed. The mock `overtimeService` stays for payroll, dashboards, reports and notifications.
 */

export type ApiOvertime = {
  id: string
  employeeId: string
  workDate: string
  startTime: string
  endTime: string
  hours: number
  type: OvertimeType
  multiplier: number
  status: ApprovalStatus
  reason?: string
  createdAt: string
  decidedAt?: string
  decider?: { name: string }
}

export const toOvertimeRecord = (o: ApiOvertime): OvertimeRecord => ({
  id: o.id,
  companyId: '',
  employeeId: o.employeeId,
  date: o.workDate.slice(0, 10),
  startTime: o.startTime.slice(0, 5),
  endTime: o.endTime.slice(0, 5),
  hours: o.hours,
  type: o.type,
  multiplier: o.multiplier,
  status: o.status,
  reason: o.reason,
  requestedAt: o.createdAt,
  decidedBy: o.decider?.name,
  decidedAt: o.decidedAt,
})

export async function fetchOvertime(): Promise<OvertimeRecord[]> {
  const res = await api.get<{ data: unknown[] }>('/api/overtime')
  return camelizeKeys<ApiOvertime[]>(res.data).map(toOvertimeRecord)
}

export interface OvertimeFilingInput {
  employeeId: string
  date: string
  startTime: string
  endTime: string
  type: string
  reason?: string
  /** 'ess' when an employee files their own request. */
  source?: 'admin' | 'ess'
}

export const fileOvertime = (input: OvertimeFilingInput) =>
  api.post('/api/overtime', { employee_id: Number(input.employeeId), work_date: input.date, start_time: input.startTime, end_time: input.endTime, type: input.type, reason: input.reason || null, source: input.source })

/** Withdraws a request that is still pending. */
export const withdrawOvertime = (id: string) => api.delete(`/api/overtime/${id}`)

export interface OvertimeRate {
  key: string
  label: string
  multiplier: number
}

/** The overtime and night differential rates a request can be filed under. */
export async function fetchOvertimeRates(): Promise<OvertimeRate[]> {
  const res = await api.get<{ data: OvertimeRate[] }>('/api/overtime/rates')
  return res.data.map((r) => ({ ...r, multiplier: Number(r.multiplier) }))
}

/** Approves or rejects the pending requests; returns how many were decided. */
export async function decideOvertime(ids: string[], decision: 'approved' | 'rejected'): Promise<number> {
  return (await api.post<{ data: { decided: number } }>('/api/overtime/decide', { ids: ids.map(Number), decision })).data.decided
}

export interface OvertimeSummary {
  pendingCount: number
  pendingOvertimeCount: number
  pendingNightDiffCount: number
  totalOvertimeHours: number
  overtimeHoursChangePct: number | null
  nightDiffHours: number
  activeNightShiftWorkers: number
  estimatedCost: number
}

const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
const isWithin = (key: string, from: Date, to: Date) => {
  const d = new Date(key)
  return d >= from && d <= to
}
const isOvertimeType = (t: OvertimeType) => t === 'regular' || t === 'rest_day_holiday'

/** Metric cards on the Overtime page. "Current period" is the trailing 15 days; the cost estimate uses basic pay over 22 days of 8 hours. */
export function summarizeOvertime(records: OvertimeRecord[], employees: Employee[]): OvertimeSummary {
  const employeeById = new Map(employees.map((e) => [e.id, e]))
  const now = new Date()
  const current = records.filter((r) => isWithin(r.date, daysAgo(15), now))
  const previous = records.filter((r) => isWithin(r.date, daysAgo(30), daysAgo(16)))
  const sum = (rows: OvertimeRecord[]) => rows.reduce((total, r) => total + r.hours, 0)

  const pending = current.filter((r) => r.status === 'pending')
  const currentOt = sum(current.filter((r) => isOvertimeType(r.type)))
  const previousOt = sum(previous.filter((r) => isOvertimeType(r.type)))
  const nightDiff = current.filter((r) => r.type === 'night_diff')
  const estimatedCost = current
    .filter((r) => r.status !== 'rejected')
    .reduce((total, r) => {
      const employee = employeeById.get(r.employeeId)
      return employee ? total + r.hours * (employee.compensation.basicPay / (22 * 8)) * r.multiplier : total
    }, 0)

  return {
    pendingCount: pending.length,
    pendingOvertimeCount: pending.filter((r) => isOvertimeType(r.type)).length,
    pendingNightDiffCount: pending.filter((r) => r.type === 'night_diff').length,
    totalOvertimeHours: Math.round(currentOt * 10) / 10,
    overtimeHoursChangePct: previousOt > 0 ? Math.round(((currentOt - previousOt) / previousOt) * 1000) / 10 : null,
    nightDiffHours: Math.round(sum(nightDiff) * 10) / 10,
    activeNightShiftWorkers: new Set(nightDiff.map((r) => r.employeeId)).size,
    estimatedCost: Math.round(estimatedCost),
  }
}

export function overtimeCsv(records: OvertimeRecord[], employees: Employee[]): string {
  const employeeById = new Map(employees.map((e) => [e.id, e]))
  const header = ['Employee', 'Employee ID', 'Department', 'Date', 'Start', 'End', 'Hours', 'Type', 'Multiplier', 'Status']
  const rows = records.map((r) => {
    const e = employeeById.get(r.employeeId)
    return [e ? `${e.personal.firstName} ${e.personal.lastName}` : r.employeeId, e?.employeeNumber ?? '', e?.employment.department ?? '', r.date, r.startTime, r.endTime, String(r.hours), r.type, `${Math.round(r.multiplier * 100)}%`, r.status]
  })
  return [header, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\r\n')
}
