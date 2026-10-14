import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import type { Employee, ThirteenthMonthLine, ThirteenthMonthRun, ThirteenthMonthSelection } from '@ops/types/domain'

/*
 * 13th month pay on the API. The server computes every line (App\Payroll\ThirteenthMonth) from the year's records and keeps the month by
 * month breakdown with it; a finalized batch is locked (409 on anything else) and nobody is paid twice in a year.
 */

/** 13th Month Pay (plus other benefits) is non-taxable up to this amount per year; only the excess is withheld. Same figure as the server's. */
export const THIRTEENTH_MONTH_TAX_EXEMPT_CEILING = 90_000

export interface Coverage {
  start: string
  end: string
}

/** Resigned or separated: a last day on record, or no longer active. */
export const isSeparated = (employee: Employee) => !!employee.employment.dateSeparated || employee.employment.status !== 'active'

const toRun = (r: Omit<ThirteenthMonthRun, 'companyId'>): ThirteenthMonthRun => ({ ...r, companyId: '' })

export async function fetchThirteenthMonthRuns(): Promise<ThirteenthMonthRun[]> {
  const res = await api.get<{ data: unknown[] }>('/api/thirteenth-month')
  return camelizeKeys<Omit<ThirteenthMonthRun, 'companyId'>[]>(res.data).map(toRun)
}

export async function fetchThirteenthMonthLines(runId: string): Promise<ThirteenthMonthLine[]> {
  const res = await api.get<{ data: unknown[] }>(`/api/thirteenth-month/${runId}/lines`)
  return camelizeKeys<ThirteenthMonthLine[]>(res.data)
}

export interface GenerateThirteenthMonthInput {
  year: number
  generationDate: string
  payoutPeriodLabel: string
  selection: ThirteenthMonthSelection
}

export interface ThirteenthMonthPreview {
  coverage: Coverage
  /** Every employee eligible for the coverage window (the pool the selection pickers draw from). */
  eligible: Employee[]
  /** Eligible employees matched by the selection who will be included. */
  included: Employee[]
  /** Matched by the selection but already paid in a finalized batch this year. */
  skippedAlreadyPaid: Employee[]
}

/** What a batch with these settings would cover; the server answers with ids, which are looked up in `employees`. */
export async function previewThirteenthMonthBatch(input: Pick<GenerateThirteenthMonthInput, 'year' | 'selection'>, employees: Employee[]): Promise<ThirteenthMonthPreview> {
  const res = await api.post<{ data: { coverage: Coverage; eligible_ids: number[]; included_ids: number[]; skipped_ids: number[] } }>('/api/thirteenth-month/preview', snakeizeKeys(input))
  const pick = (ids: number[]) => ids.flatMap((id) => employees.filter((e) => e.id === String(id)))

  return { coverage: res.data.coverage, eligible: pick(res.data.eligible_ids), included: pick(res.data.included_ids), skippedAlreadyPaid: pick(res.data.skipped_ids) }
}

/** Generates a draft batch; the same year and recipients replace the earlier draft. */
export async function generateThirteenthMonthRun(input: GenerateThirteenthMonthInput): Promise<{ run: ThirteenthMonthRun; skippedAlreadyPaid: number }> {
  const res = await api.post<{ data: unknown; meta: { skipped_already_paid: number } }>('/api/thirteenth-month', snakeizeKeys(input))

  return { run: toRun(camelizeKeys<Omit<ThirteenthMonthRun, 'companyId'>>(res.data)), skippedAlreadyPaid: res.meta.skipped_already_paid }
}

/** Issues the batch's payslips and locks it. */
export const finalizeThirteenthMonthRun = (runId: string) => api.post(`/api/thirteenth-month/${runId}/finalize`, {})
