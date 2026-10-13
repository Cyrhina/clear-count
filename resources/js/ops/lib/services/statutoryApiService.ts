import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import type { MonthlyStatutory } from '@ops/lib/services/payrollService'
import type { Employee, PayrollFrequency, SssBracket, StatutoryConfig, TaxBracket } from '@ops/types/domain'

/*
 * The SSS, PhilHealth, Pag-IBIG and withholding tax tables on the API, each dated: an edit holds from the day it is saved and earlier
 * dates keep their tables. The mock `payrollService` keeps its own copy for the browser payroll engine until P10.
 */

type ApiConfig = {
  sssBrackets: (Omit<SssBracket, 'maxSalary'> & { maxSalary?: number })[]
  philhealth: { rate: number; employeeSharePercent: number; employerSharePercent: number; salaryFloor: number; salaryCeiling: number }
  pagibig: { rate: number; maxFundSalary: number; employeeAmount: number; employerAmount: number }
  taxTables: Record<string, (Omit<TaxBracket, 'max'> & { max?: number })[]>
}

// The API sends an open-ended bracket as null, which camelizeKeys drops; the UI types want null back.
const toTax = (rows: ApiConfig['taxTables'][string] = []): TaxBracket[] => rows.map((b) => ({ ...b, max: b.max ?? null }))

export async function fetchStatutoryConfig(): Promise<StatutoryConfig> {
  const res = await api.get<{ data: unknown }>('/api/statutory')
  // `taxTables` keys are pay frequencies (data), not field names.
  const c = camelizeKeys<ApiConfig>(res.data, ['taxTables'])
  const { monthly, ...others } = c.taxTables
  return {
    companyId: '',
    sssBrackets: c.sssBrackets.map((b) => ({ ...b, maxSalary: b.maxSalary ?? null })),
    philhealthRate: c.philhealth.rate,
    philhealthEmployeeSharePercent: c.philhealth.employeeSharePercent,
    philhealthEmployerSharePercent: c.philhealth.employerSharePercent,
    philhealthSalaryFloor: c.philhealth.salaryFloor,
    philhealthSalaryCeiling: c.philhealth.salaryCeiling,
    pagibigRate: c.pagibig.rate,
    pagibigMaxFundSalary: c.pagibig.maxFundSalary,
    pagibigEmployeeAmount: c.pagibig.employeeAmount,
    pagibigEmployerAmount: c.pagibig.employerAmount,
    taxBrackets: toTax(monthly),
    taxBracketTables: Object.fromEntries(Object.entries(others).map(([k, rows]) => [k, toTax(rows)])),
  }
}

const PHILHEALTH_KEYS = ['philhealthRate', 'philhealthEmployeeSharePercent', 'philhealthEmployerSharePercent', 'philhealthSalaryFloor', 'philhealthSalaryCeiling'] as const
const PAGIBIG_KEYS = ['pagibigRate', 'pagibigMaxFundSalary', 'pagibigEmployeeAmount', 'pagibigEmployerAmount'] as const
const touches = (updates: Partial<StatutoryConfig>, keys: readonly (keyof StatutoryConfig)[]) => keys.some((k) => k in updates)

/** Saves the tables `updates` touches, from today on; `current` fills in the rest of a table when only some of its fields change. */
export async function saveStatutoryConfig(current: StatutoryConfig, updates: Partial<StatutoryConfig>): Promise<void> {
  const c = { ...current, ...updates }
  const body: Record<string, unknown> = {}
  if (updates.sssBrackets) body.sss_brackets = snakeizeKeys(c.sssBrackets)
  if (touches(updates, PHILHEALTH_KEYS)) {
    body.philhealth = { rate: c.philhealthRate, employee_share_percent: c.philhealthEmployeeSharePercent, employer_share_percent: c.philhealthEmployerSharePercent, salary_floor: c.philhealthSalaryFloor, salary_ceiling: c.philhealthSalaryCeiling }
  }
  if (touches(updates, PAGIBIG_KEYS)) {
    body.pagibig = { rate: c.pagibigRate, max_fund_salary: c.pagibigMaxFundSalary, employee_amount: c.pagibigEmployeeAmount, employer_amount: c.pagibigEmployerAmount }
  }
  const tax: Record<string, unknown> = {}
  if (updates.taxBrackets) tax.monthly = snakeizeKeys(c.taxBrackets)
  for (const [frequency, rows] of Object.entries(updates.taxBracketTables ?? {})) if (rows) tax[frequency] = snakeizeKeys(rows)
  if (Object.keys(tax).length > 0) body.tax_tables = tax
  await api.put('/api/statutory', body)
}

export interface StatutoryPreviewRow {
  monthlySalary: number
  frequency?: PayrollFrequency
  periodsPerMonth?: number
  pagibigVoluntary?: number
}

/** What the tables in force give for each row, worked out by the server (the same calculation payroll runs use). */
export async function previewStatutory(rows: StatutoryPreviewRow[]): Promise<MonthlyStatutory[]> {
  const res = await api.post<{ data: unknown[] }>('/api/statutory/preview', { rows: snakeizeKeys(rows) })
  return camelizeKeys<MonthlyStatutory[]>(res.data)
}

/** Active employees with only what the contributions screen reads (name, department, pay rate, voluntary Pag-IBIG). A payroll role cannot open the employee records. */
export async function fetchStatutoryEmployees(): Promise<Employee[]> {
  const res = await api.get<{ data: unknown[] }>('/api/statutory/employees')
  return camelizeKeys<Employee[]>(res.data)
}
