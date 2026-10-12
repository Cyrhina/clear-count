import type { DeductionSchedule } from '@ops/types/domain'
import type {
  CompensationType,
  ComplianceDeadline,
  DeductionConfig,
  EarningConfig,
  PayrollRules,
  RateRow,
  Schedule,
} from '@ops/features/company-settings/types'
import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'

/**
 * Payroll Settings sub-tabs backed by `/api/payroll-settings/*`: earnings, deductions, overtime & holiday rates, payroll
 * rules, work schedules, compensation types and compliance deadlines. The server scopes everything to the signed-in company.
 * Updates send the whole record (the API validates a full record); the toggles pass `{ ...record, isActive: ... }`.
 */
const BASE = '/api/payroll-settings'

async function list<T>(path: string): Promise<T[]> {
  const res = await api.get<{ data: unknown[] }>(`${BASE}/${path}`)
  return camelizeKeys<T[]>(res.data)
}

async function send<T>(request: Promise<{ data: unknown }>, keep: readonly string[] = []): Promise<T> {
  return camelizeKeys<T>((await request).data, keep)
}

// ---- Earnings ------------------------------------------------------------------------------------------------------

export type EarningConfigInput = Omit<EarningConfig, 'id'>

export const getEarningConfigs = () => list<EarningConfig>('earnings')
export const createEarningConfig = (input: EarningConfigInput) => send<EarningConfig>(api.post(`${BASE}/earnings`, snakeizeKeys(input)))
export const updateEarningConfig = (id: string, input: EarningConfigInput) => send<EarningConfig>(api.put(`${BASE}/earnings/${id}`, snakeizeKeys(input)))

// ---- Deductions ----------------------------------------------------------------------------------------------------

export type DeductionConfigInput = Omit<DeductionConfig, 'id'>

export const getDeductionConfigs = () => list<DeductionConfig>('deductions')
export const createDeductionConfig = (input: DeductionConfigInput) => send<DeductionConfig>(api.post(`${BASE}/deductions`, snakeizeKeys(input)))
export const updateDeductionConfig = (id: string, input: DeductionConfigInput) => send<DeductionConfig>(api.put(`${BASE}/deductions/${id}`, snakeizeKeys(input)))

// ---- Compensation types --------------------------------------------------------------------------------------------

export type CompensationTypeInput = Omit<CompensationType, 'id'>

export const getCompensationTypes = () => list<CompensationType>('compensation-types')
export const createCompensationType = (input: CompensationTypeInput) => send<CompensationType>(api.post(`${BASE}/compensation-types`, snakeizeKeys(input)))
export const updateCompensationType = (id: string, input: CompensationTypeInput) => send<CompensationType>(api.put(`${BASE}/compensation-types/${id}`, snakeizeKeys(input)))

// ---- Overtime & holiday rates --------------------------------------------------------------------------------------

export interface PayrollRates {
  overtime: RateRow[]
  holiday: RateRow[]
}

export async function getPayrollRates(): Promise<PayrollRates> {
  const res = await api.get<{ data: { overtime: unknown[]; holiday: unknown[] } }>(`${BASE}/overtime-rates`)
  return camelizeKeys<PayrollRates>(res.data)
}

export const createOvertimeRate = (input: { label: string; multiplier: number }) => send<RateRow>(api.post(`${BASE}/overtime-rates`, input))
export const updateRate = (id: string, input: { label?: string; multiplier: number }) => send<RateRow>(api.put(`${BASE}/overtime-rates/${id}`, input))
export const deleteOvertimeRate = (id: string) => api.delete<void>(`${BASE}/overtime-rates/${id}`)

// ---- Payroll rules (one record per company; late policy is part of it) --------------------------------------------

/** `defaultDeductionSchedules` is a map keyed by pay frequency, so its keys are not converted. */
const RULE_MAPS = ['defaultDeductionSchedules'] as const

/** The API calls the two-week frequency `bi_weekly`; `types/domain.ts` calls it `biweekly`. */
function renameFrequencyKeys(rules: PayrollRules, from: string, to: string): PayrollRules {
  const defaults = rules.defaultDeductionSchedules as Record<string, DeductionSchedule> | undefined
  if (!defaults || !(from in defaults)) return rules
  const { [from]: value, ...rest } = defaults
  return { ...rules, defaultDeductionSchedules: { ...rest, [to]: value } }
}

export async function getPayrollRules(): Promise<PayrollRules> {
  const res = await api.get<{ data: unknown }>(`${BASE}/rules`)
  return renameFrequencyKeys(camelizeKeys<PayrollRules>(res.data, RULE_MAPS), 'bi_weekly', 'biweekly')
}

/** Sends only the fields given; the rest keep their saved value. */
export async function updatePayrollRules(changes: Partial<PayrollRules>): Promise<PayrollRules> {
  const body = snakeizeKeys(changes.defaultDeductionSchedules ? renameFrequencyKeys(changes as PayrollRules, 'biweekly', 'bi_weekly') : changes, RULE_MAPS)
  const res = await api.put<{ data: unknown }>(`${BASE}/rules`, body)
  return renameFrequencyKeys(camelizeKeys<PayrollRules>(res.data, RULE_MAPS), 'bi_weekly', 'biweekly')
}

// ---- Work schedules ------------------------------------------------------------------------------------------------

export type ScheduleInput = Pick<Schedule, 'name' | 'startTime' | 'endTime' | 'daysOfWeek'> &
  Partial<Pick<Schedule, 'breakMinutes' | 'shiftType' | 'gracePeriodMinutes' | 'restDays' | 'color'>>

/**
 * The API stores times as HH:MM:SS and numbers weekdays 1 = Monday ... 7 = Sunday; the screens use HH:MM and 0 = Sunday ... 6 = Saturday.
 */
const fromApiDay = (d: number) => (d === 7 ? 0 : d)
const toApiDay = (d: number) => (d === 0 ? 7 : d)

const toSchedule = (s: Schedule): Schedule => ({
  ...s,
  startTime: s.startTime.slice(0, 5),
  endTime: s.endTime.slice(0, 5),
  daysOfWeek: s.daysOfWeek.map(fromApiDay),
  restDays: s.restDays?.map(fromApiDay),
})

const scheduleBody = (input: ScheduleInput) =>
  snakeizeKeys({ breakMinutes: 60, shiftType: 'day', gracePeriodMinutes: 0, ...input, daysOfWeek: input.daysOfWeek.map(toApiDay), restDays: input.restDays?.map(toApiDay) })

export async function getSchedules(): Promise<Schedule[]> {
  return (await list<Schedule>('work-schedules')).map(toSchedule)
}

export async function createSchedule(input: ScheduleInput): Promise<Schedule> {
  return toSchedule(await send<Schedule>(api.post(`${BASE}/work-schedules`, scheduleBody(input))))
}

export async function updateSchedule(id: string, input: ScheduleInput): Promise<Schedule> {
  return toSchedule(await send<Schedule>(api.put(`${BASE}/work-schedules/${id}`, scheduleBody(input))))
}

export const deleteSchedule = (id: string) => api.delete<void>(`${BASE}/work-schedules/${id}`)

// ---- Compliance deadlines ------------------------------------------------------------------------------------------

export type ComplianceDeadlineInput = Omit<ComplianceDeadline, 'id' | 'custom' | 'to'>

/** The API calls the in-app page `link` and the custom flag `isCustom`; the Reminders UI says `to` and `custom`. */
const toDeadline = (d: ComplianceDeadline & { link?: string; isCustom?: boolean }): ComplianceDeadline => {
  const { link, isCustom, ...rest } = d
  return { ...rest, to: link, custom: isCustom }
}

export async function getComplianceDeadlines(): Promise<ComplianceDeadline[]> {
  return (await list<ComplianceDeadline & { link?: string; isCustom?: boolean }>('compliance-deadlines')).map(toDeadline)
}

export async function createComplianceDeadline(input: ComplianceDeadlineInput): Promise<ComplianceDeadline> {
  return toDeadline(await send(api.post(`${BASE}/compliance-deadlines`, snakeizeKeys(input))))
}

/** Partial: the Reminders toggle sends only `enabled`. */
export async function updateComplianceDeadline(id: string, changes: Partial<ComplianceDeadlineInput>): Promise<ComplianceDeadline> {
  return toDeadline(await send(api.put(`${BASE}/compliance-deadlines/${id}`, snakeizeKeys(changes))))
}

export const deleteComplianceDeadline = (id: string) => api.delete<void>(`${BASE}/compliance-deadlines/${id}`)
