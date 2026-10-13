import type { CalendarPeriod, PayrollGroup, PayrollGroupInput } from '@ops/features/company-settings/types'
import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'

/** Payroll Groups tab and Payroll Calendar, backed by `/api/payroll-settings/payroll-groups`. */
const BASE = '/api/payroll-settings/payroll-groups'

export async function getPayrollGroups(): Promise<PayrollGroup[]> {
  const res = await api.get<{ data: unknown[] }>(BASE)
  return camelizeKeys<PayrollGroup[]>(res.data)
}

/** One group with its members. */
export async function getPayrollGroup(id: string): Promise<PayrollGroup> {
  const res = await api.get<{ data: unknown }>(`${BASE}/${id}`)
  return camelizeKeys<PayrollGroup>(res.data)
}

/** The API names the frequency field `frequency`, and sends its display label as `frequency` too: the raw value is `frequencyKey` on read only. */
const body = (input: PayrollGroupInput) => {
  const { frequencyKey, ...rest } = input
  return snakeizeKeys({ ...rest, frequency: frequencyKey })
}

export async function createPayrollGroup(input: PayrollGroupInput): Promise<PayrollGroup> {
  const res = await api.post<{ data: unknown }>(BASE, body(input))
  return camelizeKeys<PayrollGroup>(res.data)
}

export async function updatePayrollGroup(id: string, input: PayrollGroupInput): Promise<PayrollGroup> {
  const res = await api.put<{ data: unknown }>(`${BASE}/${id}`, body(input))
  return camelizeKeys<PayrollGroup>(res.data)
}

/** The input a group's own values make, to change one field and send the rest back unchanged. */
export function groupToInput(group: PayrollGroup): PayrollGroupInput {
  return {
    name: group.name,
    description: group.description,
    status: group.status,
    frequencyKey: group.frequencyKey,
    compensationTypeId: group.compensationTypeId,
    cutoffConfig: group.cutoffConfig,
    payDateConfig: group.payDateConfig,
    deductionSchedule: group.deductionSchedule,
    workScheduleId: group.workScheduleId,
    effectiveDate: group.effectiveDate,
  }
}

export const deletePayrollGroup = (id: string) => api.delete<void>(`${BASE}/${id}`)

/** Cutoff and pay dates for one year, worked out by the server from the group's rules. */
export async function getPayrollGroupCalendar(id: string, year: number): Promise<CalendarPeriod[]> {
  const res = await api.get<{ data: unknown[] }>(`${BASE}/${id}/calendar`, { year })
  return camelizeKeys<CalendarPeriod[]>(res.data)
}

/** Moves employees into the group (out of any other), or out of it with `unassign`. Returns how many changed. */
export async function assignPayrollGroupEmployees(id: string, employeeIds: string[], action: 'assign' | 'unassign' = 'assign'): Promise<number> {
  const res = await api.post<{ data: { changed: number } }>(`${BASE}/${id}/employees`, { employee_ids: employeeIds.map(Number), action })
  return res.data.changed
}
