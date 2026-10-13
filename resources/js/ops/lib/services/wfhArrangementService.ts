import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import type { Employee, WfhArrangement, WfhKind, WfhTimes } from '@ops/types/domain'

/*
 * Work-from-home arrangements on the API. One record per employee; a bulk apply shares a batch id. Approved ones fill the
 * day's attendance on the server (when approved, and every night). The ESS request page still uses the mock `wfhService`.
 */

export interface WfhInput {
  employeeIds: string[]
  kind: WfhKind
  dateFrom: string
  /** Required for temporary; null/omitted = open-ended standing. */
  dateTo: string | null
  /** 0 = Sunday … 6 = Saturday. Empty = every working day in the range. */
  daysOfWeek: number[]
  times: WfhTimes
  custom?: WfhArrangement['custom']
  reason: string
  /** Cancel an employee's overlapping arrangements of the same kind instead of skipping them. */
  replaceOverlaps?: boolean
}

export interface WfhPreviewRow {
  employee: Employee
  /** Working days the arrangement will apply to (inside the previewed span). */
  workDays: number
  /** Days in the range that the arrangement will not change, and why. */
  skipped: { leave: number; holiday: number; rest: number; punches: number }
  /** Existing pending/approved arrangements of the same kind that overlap. */
  overlapIds: string[]
  /** Months (YYYY-MM) where the employee would pass the monthly limit. */
  overLimit: string[]
}

export function validateWfhInput(input: WfhInput): string | undefined {
  if (!input.reason.trim()) return 'Add a reason.'
  if (!input.dateFrom) return 'Choose a start date.'
  if (input.kind === 'temporary' && !input.dateTo) return 'Choose an end date.'
  if (input.dateTo && input.dateTo < input.dateFrom) return 'The end date is before the start date.'
  if (input.times === 'custom') {
    const c = input.custom
    if (!c || !c.timeIn || !c.timeOut) return 'Enter the AM in and PM out times.'
    if (c.breakOut && c.breakIn && c.breakIn <= c.breakOut) return 'PM in must be after AM out.'
  }
  if (input.employeeIds.length === 0) return 'Choose at least one employee.'
  return undefined
}

type ApiArrangement = Omit<WfhArrangement, 'requestedBy' | 'decidedBy' | 'dateTo' | 'custom'> & { dateTo?: string; custom?: WfhArrangement['custom']; requester?: { name: string }; decider?: { name: string }; createdAt: string }

const body = (input: WfhInput) => ({
  employee_ids: input.employeeIds.map(Number),
  kind: input.kind,
  date_from: input.dateFrom,
  date_to: input.dateTo || null,
  days_of_week: input.daysOfWeek,
  times: input.times,
  // Blank break times are left out so the server does not read them as a bad time.
  custom: input.times === 'custom' && input.custom ? Object.fromEntries(Object.entries(input.custom).filter(([, v]) => v)) : null,
  reason: input.reason,
  replace_overlaps: input.replaceOverlaps ?? false,
})

export async function fetchWfh(): Promise<{ arrangements: WfhArrangement[]; monthlyLimit: number }> {
  const res = await api.get<{ data: unknown[]; meta: { monthly_limit: number } }>('/api/wfh')
  const arrangements = camelizeKeys<ApiArrangement[]>(res.data).map((a) => ({
    id: a.id,
    companyId: '',
    employeeId: a.employeeId,
    kind: a.kind,
    dateFrom: a.dateFrom.slice(0, 10),
    dateTo: a.dateTo ? a.dateTo.slice(0, 10) : null,
    daysOfWeek: a.daysOfWeek,
    times: a.times,
    custom: a.custom,
    reason: a.reason,
    status: a.status,
    requestedBy: a.requester?.name ?? '—',
    decidedBy: a.decider?.name,
    createdAt: a.createdAt,
    batchId: a.batchId,
  }))
  return { arrangements, monthlyLimit: res.meta.monthly_limit }
}

/** Who the input would change, and how many working days, before anything is saved. */
export async function previewWfh(input: WfhInput, employees: Employee[]): Promise<WfhPreviewRow[]> {
  const res = await api.post<{ data: { employee_id: number; work_days: number; skipped: WfhPreviewRow['skipped']; overlap_ids: number[]; over_limit: string[] }[] }>('/api/wfh/preview', body(input))
  const byId = new Map(employees.map((e) => [e.id, e]))
  return res.data.flatMap((r) => {
    const employee = byId.get(String(r.employee_id))
    return employee ? [{ employee, workDays: r.work_days, skipped: r.skipped, overlapIds: r.overlap_ids.map(String), overLimit: r.over_limit }] : []
  })
}

export async function createWfh(input: WfhInput): Promise<{ created: number; skipped: { employee_id: number; reason: string }[] }> {
  return (await api.post<{ data: { created: number; skipped: { employee_id: number; reason: string }[] } }>('/api/wfh', body(input))).data
}

const ids = (list: string[]) => list.map(Number)

export async function cancelWfh(list: string[]): Promise<number> {
  return (await api.post<{ data: { changed: number } }>('/api/wfh/cancel', { ids: ids(list) })).data.changed
}

/** Stops arrangements after `lastDay`; days they filled in after it are removed. */
export async function endWfh(list: string[], lastDay: string): Promise<number> {
  return (await api.post<{ data: { changed: number } }>('/api/wfh/end', { ids: ids(list), last_day: lastDay })).data.changed
}

export async function decideWfh(list: string[], decision: 'approved' | 'rejected'): Promise<number> {
  return (await api.post<{ data: { decided: number } }>('/api/wfh/decide', { ids: ids(list), decision })).data.decided
}

/** The company-wide cap on WFH days per employee per month; 0 = none. It only warns. */
export async function setWfhMonthlyLimit(limit: number): Promise<number> {
  return (await api.put<{ data: { monthly_limit: number } }>('/api/wfh/limit', { monthly_limit: limit })).data.monthly_limit
}

/** `employeeId|date` of every approved WFH day between two dates (any times option): lets the biometrics import tell "WFH" from "no punch". */
export async function fetchWfhDayLookup(from: string, to: string): Promise<Set<string>> {
  const { arrangements } = await fetchWfh()
  const out = new Set<string>()
  const last = new Date(`${to}T00:00:00Z`)
  for (const a of arrangements.filter((x) => x.status === 'approved')) {
    for (let d = new Date(`${from}T00:00:00Z`); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
      const date = d.toISOString().slice(0, 10)
      const inRange = date >= a.dateFrom && (!a.dateTo || date <= a.dateTo)
      if (inRange && (a.daysOfWeek.length === 0 || a.daysOfWeek.includes(d.getUTCDay()))) out.add(`${a.employeeId}|${date}`)
    }
  }
  return out
}
