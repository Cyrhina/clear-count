import type { Holiday, HolidayScope, HolidayType } from '@ops/features/company-settings/types'
import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'

/** Holidays tab, backed by `/api/holidays`. The server keeps one calendar per company and per year. */

export async function getHolidays(year: number): Promise<Holiday[]> {
  const res = await api.get<{ data: unknown[] }>('/api/holidays', { year })
  return camelizeKeys<Holiday[]>(res.data)
}

export interface HolidayInput {
  name: string
  /** YYYY-MM-DD */
  date: string
  type: HolidayType
  scope?: HolidayScope
  description?: string
  /** Add the holiday even though another one is already on that date. */
  allowOverlap?: boolean
}

export async function createHoliday(input: HolidayInput): Promise<Holiday> {
  const res = await api.post<{ data: unknown }>('/api/holidays', snakeizeKeys(input))
  return camelizeKeys<Holiday>(res.data)
}

export async function updateHoliday(id: string, input: HolidayInput): Promise<Holiday> {
  const res = await api.put<{ data: unknown }>(`/api/holidays/${id}`, snakeizeKeys(input))
  return camelizeKeys<Holiday>(res.data)
}

export const deleteHoliday = (id: string) => api.delete<void>(`/api/holidays/${id}`)

export interface ImportResult {
  added: number
  skipped: number
  removed: number
}

/**
 * Copies the Philippine default calendar for a year into the company. `missing` adds only dates that are still free;
 * `reset` first removes the company's untouched default holidays for that year. Holidays the company added or edited are always kept.
 */
export async function importDefaultHolidays(year: number, mode: 'missing' | 'reset' = 'missing'): Promise<ImportResult> {
  const res = await api.post<{ meta: ImportResult }>('/api/holidays/import-defaults', { year, mode })
  return res.meta
}
