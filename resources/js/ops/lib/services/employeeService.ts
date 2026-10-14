// mock: remove in P17. The Employees screens use the API functions at the bottom of this file. Every other module still reads the
// mock employees through getEmployees until its own phase; the signed-in employee's own record is on the API (fetchMe, updateMe);
import type { EmployeePage, EmployeeListParams, EmployeeRecord } from '@ops/features/employees/types'
import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { memoRead } from '@ops/lib/api/memo'
import { roleHasCapability } from '@ops/lib/rbac/permissions'
import { db } from '@ops/mock-data'
import type {
  Employee,
  EmployeeBank,
  EmployeeGovernment,
  EmployeePersonal,
  EmploymentStatus,
  PayRateType,
  SessionUser,
} from '@ops/types/domain'

/**
 * The employees the signed-in user may see, for the reports, dashboards and the other screens that read a plain list. The roles that
 * open the employee records get them; the payroll role, which may not, gets the payroll directory (names, jobs, pay). A manager gets
 * their branch and an employee only themselves: the server cuts the list down.
 */
export async function getEmployees(session: SessionUser): Promise<Employee[]> {
  return memoRead(`employees:${session.id}`, () => (roleHasCapability(session.role, 'employees.view') ? fetchAllEmployees() : fetchPayrollDirectory()))
}

async function fetchPayrollDirectory(): Promise<Employee[]> {
  const res = await api.get<{ data: unknown[] }>('/api/payroll/employees')
  return camelizeKeys<Employee[]>(res.data).map((e) => ({ ...e, companyId: '', compensation: e.compensation ?? { basicPay: 0, payType: 'monthly', allowances: [] }, bank: {}, government: e.government ?? {} }))
}

export interface CreateEmployeeInput {
  firstName: string
  lastName: string
  department: string
  position: string
  branchId: string
  employmentType: Employee['employment']['employmentType']
  dateHired: string
  payType: PayRateType
  basicPay: number
  outputUnit?: string | null
  /** Optional profile details (used by the bulk import). */
  extras?: CreateEmployeeExtras
}

export interface CreateEmployeeExtras {
  birthDate?: string
  civilStatus?: EmployeePersonal['civilStatus']
  address?: string
  contactNumber?: string
  personalEmail?: string
  sssNo?: string
  philhealthNo?: string
  pagibigNo?: string
  tinNo?: string
  bankName?: string
  accountNumber?: string
}

export interface SelfServiceProfileUpdate {
  contactNumber: string
  personalEmail?: string
  address: string
}

export const SEPARATION_LABEL = {
  resigned: 'Resigned',
  terminated: 'Terminated',
  end_of_contract: 'End of Contract',
  retired: 'Retired',
} as const

export interface UpdateEmploymentInfoInput {
  position: string
  department: string
  employmentType: Employee['employment']['employmentType']
  dateHired: string
  category: Employee['employment']['category']
}

export interface UpdateCompensationInput {
  basicPay: number
  payType: PayRateType
  outputUnit?: string | null
  reason: string
}

export interface UpdateBenefitsInput {
  hmoPlan?: string
  leaveCreditsByType: Record<string, number>
}

/** The employee record, backed by `/api/employees`. Sections keep the camelCase the server stores. */

const SECTIONS = ['personal', 'employment', 'benefits', 'government', 'compensation', 'bank']

/** Pay and bank fields are missing for people who may not see pay; give the screens an empty shape so they render. */
export function toEmployee(raw: unknown): EmployeeRecord {
  const e = camelizeKeys<EmployeeRecord>(raw, SECTIONS)
  return {
    ...e,
    compensation: e.compensation ?? { basicPay: 0, payType: 'monthly', allowances: [] },
    bank: e.bank ?? {},
    government: e.government ?? {},
    documents: e.documents ?? [],
    history: e.history ?? [],
    compensationHistory: e.compensationHistory ?? [],
  }
}

export async function fetchEmployees(params: EmployeeListParams = {}): Promise<EmployeePage> {
  const { perPage, ...rest } = params
  const res = await api.get<{ data: unknown[]; meta: { total: number; current_page: number; last_page: number } }>('/api/employees', snakeizeKeys({ ...rest, perPage }) as Record<string, string | number>)
  return { employees: res.data.map(toEmployee), total: res.meta.total, page: res.meta.current_page, lastPage: res.meta.last_page }
}

/** Every employee the user can see, page by page (the API caps a page at 100). */
export async function fetchAllEmployees(params: Omit<EmployeeListParams, 'page' | 'perPage'> = {}): Promise<Employee[]> {
  const first = await fetchEmployees({ ...params, perPage: 100, page: 1 })
  const rest = await Promise.all(Array.from({ length: Math.max(0, first.lastPage - 1) }, (_, i) => fetchEmployees({ ...params, perPage: 100, page: i + 2 })))
  return [...first.employees, ...rest.flatMap((p) => p.employees)]
}

/** The signed-in person's own record, with their pay and history; null when the account has no employee. */
export async function fetchMe(): Promise<EmployeeRecord | null> {
  const res = await api.get<{ data: unknown }>('/api/me')
  return res.data ? toEmployee(res.data) : null
}

/** Employees may only edit their own contact fields; the server refuses anything else. */
export async function updateMe(updates: SelfServiceProfileUpdate): Promise<EmployeeRecord> {
  const res = await api.patch<{ data: unknown }>('/api/me', snakeizeKeys(updates))
  return toEmployee(res.data)
}

export async function fetchEmployee(id: string): Promise<EmployeeRecord> {
  const res = await api.get<{ data: unknown }>(`/api/employees/${id}`)
  return toEmployee(res.data)
}

export interface HireInput {
  branchId: string
  payrollGroupId?: string | null
  personal: EmployeePersonal
  employment: Omit<Employee['employment'], 'status'>
  compensation: Employee['compensation']
  benefits?: Employee['benefits']
  government?: EmployeeGovernment
  bank?: EmployeeBank
}

export async function hireEmployee(input: HireInput): Promise<EmployeeRecord> {
  const { branchId, payrollGroupId, ...sections } = input
  const res = await api.post<{ data: unknown }>('/api/employees', { branch_id: branchId, payroll_group_id: payrollGroupId, ...sections })
  return toEmployee(res.data)
}

async function saveSection(id: string, section: string, body: unknown): Promise<EmployeeRecord> {
  const res = await api.put<{ data: unknown }>(`/api/employees/${id}/${section}`, body)
  return toEmployee(res.data)
}

export const saveEmployeePersonal = (id: string, personal: EmployeePersonal) => saveSection(id, 'personal', { personal })
export const saveEmployeeBenefits = (id: string, benefits: UpdateBenefitsInput) => saveSection(id, 'benefits', { benefits })
export const saveEmployeeGovernment = (id: string, government: EmployeeGovernment) => saveSection(id, 'government', { government })
export const saveEmployeeBank = (id: string, bank: EmployeeBank) => saveSection(id, 'bank', { bank })

/** Job details; the branch and payroll group are sent only when given. `payrollGroupId: null` removes the employee from their group. */
export const saveEmployeeEmployment = (id: string, employment: UpdateEmploymentInfoInput, extras: { branchId?: string; payrollGroupId?: string | null } = {}) =>
  saveSection(id, 'employment', { employment, ...(snakeizeKeys(extras) as object) })

/** A pay change: the server records a new compensation-history row. */
export const saveEmployeeCompensation = (id: string, { reason, ...compensation }: UpdateCompensationInput) => saveSection(id, 'compensation', { compensation, reason })

/** Moves an employee to a payroll group (or out of any with `null`), keeping their job details as they are. */
export function assignEmployeePayrollGroup(employee: Employee, payrollGroupId: string | null) {
  const { status: _status, dateSeparated: _date, separationReason: _reason, managerId: _manager, ...employment } = employee.employment
  return saveEmployeeEmployment(employee.id, employment, { payrollGroupId })
}

/** Status change. A separation (reason, last day) goes with a non-active status; `active` clears it. */
export const saveEmployeeStatus = (id: string, status: EmploymentStatus, separation?: { reason: NonNullable<Employee['employment']['separationReason']>; date: string; notes?: string }) =>
  saveSection(id, 'status', { status, separation })

export const createEmployeeAccount = (id: string, email: string, role = 'employee') => api.post(`/api/employees/${id}/account`, { email, role })

/** One row of an import, as the server takes it (see `toImportRow` in lib/payroll/employeeImport.ts). */
export interface ImportRowPayload {
  line: number
  branch_id: string
  personal: EmployeePersonal
  employment: Omit<Employee['employment'], 'status'>
  compensation: Employee['compensation']
  government?: EmployeeGovernment
  bank?: EmployeeBank
}

export interface ImportReport {
  rows: { line: number; ok: boolean; errors: string[]; warnings: string[] }[]
  created: number
  skipped: number
}

/** `dryRun` validates every row and saves nothing; the real run adds the rows that passed. */
export async function importEmployees(rows: ImportRowPayload[], dryRun: boolean): Promise<ImportReport> {
  const res = await api.post<{ data: ImportReport }>('/api/employees/import', { rows, dry_run: dryRun })
  return res.data
}

/** Each returns how many employees actually changed. */
async function bulk(action: string, body: object): Promise<number> {
  const res = await api.post<{ data: { changed: number } }>(`/api/employees/bulk/${action}`, body)
  return res.data.changed
}
export const bulkSetDepartment = (ids: string[], department: string) => bulk('department', { ids: ids.map(Number), department })
export const bulkSetBranch = (ids: string[], branchId: string) => bulk('branch', { ids: ids.map(Number), branch_id: Number(branchId) })
export const bulkSetStatus = (ids: string[], status: EmploymentStatus) => bulk('status', { ids: ids.map(Number), status })

/** Documents of the record. The file is only reached through a link that works for five minutes. */
export async function uploadEmployeeDocument(id: string, file: File, name?: string): Promise<void> {
  const form = new FormData()
  form.append('file', file)
  if (name) form.append('name', name)
  await api.upload(`/api/employees/${id}/documents`, form)
}
export const deleteEmployeeDocument = (id: string, documentId: string) => api.delete<void>(`/api/employees/${id}/documents/${documentId}`)
export async function employeeDocumentLink(id: string, documentId: string): Promise<string> {
  const res = await api.get<{ data: { url: string } }>(`/api/employees/${id}/documents/${documentId}/link`)
  return res.data.url
}
