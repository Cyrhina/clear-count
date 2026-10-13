// mock: remove in P17. The Employees screens use the API functions at the bottom of this file. Every other module still reads the
// mock employees through getEmployees, getEmployee, getEmployeeIdsOnLeaveToday and updateEmployeeSelf until its own phase.
// The mock createEmployee, importEmployees, updateEmployeeStatus and bulk functions stay until P3b.
import type { EmployeePage, EmployeeListParams, EmployeeRecord } from '@ops/features/employees/types'
import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { ensureBranchDepartment, releaseSupervisorIfMoved } from '@ops/lib/services/branchDepartmentService'
import { scopeForSession } from '@ops/lib/tenancy/tenantScope'
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
 * Mock-backed today, swappable for real HTTP calls later without changing
 * callers: keep the same async signatures and return shapes.
 */
export async function getEmployees(session: SessionUser): Promise<Employee[]> {
  return scopeForSession(db.employees, session, { employeeIdField: 'id' })
}

export async function getEmployee(session: SessionUser, employeeId: string): Promise<Employee | undefined> {
  const scoped = scopeForSession(db.employees, session, { employeeIdField: 'id' })
  return scoped.find((e) => e.id === employeeId)
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

export async function createEmployee(session: SessionUser, input: CreateEmployeeInput): Promise<Employee> {
  const sequence = db.employees.filter((e) => e.companyId === session.companyId).length + 1
  const employee: Employee = {
    id: `${session.companyId}_emp_${crypto.randomUUID().slice(0, 8)}`,
    companyId: session.companyId,
    branchId: input.branchId,
    employeeNumber: `${session.companyId.slice(3, 5).toUpperCase()}-${String(sequence).padStart(4, '0')}`,
    personal: {
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: input.extras?.birthDate ?? '1995-01-01',
      civilStatus: input.extras?.civilStatus ?? 'single',
      address: input.extras?.address ?? '',
      contactNumber: input.extras?.contactNumber ?? '',
      ...(input.extras?.personalEmail ? { personalEmail: input.extras.personalEmail } : {}),
    },
    employment: {
      position: input.position,
      department: input.department,
      employmentType: input.employmentType,
      dateHired: input.dateHired,
      status: 'active',
      category: 'regular',
    },
    compensation: { basicPay: input.basicPay, payType: input.payType, outputUnit: input.outputUnit ?? null, allowances: [] },
    benefits: {
      leaveCreditsByType: { 'Vacation Leave': 15, 'Sick Leave': 10, 'Emergency Leave': 5, 'Maternity/Paternity Leave': 7 },
    },
    government: {
      ...(input.extras?.sssNo ? { sssNo: input.extras.sssNo } : {}),
      ...(input.extras?.philhealthNo ? { philhealthNo: input.extras.philhealthNo } : {}),
      ...(input.extras?.pagibigNo ? { pagibigNo: input.extras.pagibigNo } : {}),
      ...(input.extras?.tinNo ? { tinNo: input.extras.tinNo } : {}),
    },
    bank: {
      ...(input.extras?.bankName ? { bankName: input.extras.bankName } : {}),
      ...(input.extras?.accountNumber ? { accountNumber: input.extras.accountNumber } : {}),
    },
    documents: [],
    history: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        actor: session.name,
        action: input.extras ? 'Employee record created (imported)' : 'Employee record created',
      },
    ],
    compensationHistory: [
      {
        id: crypto.randomUUID(),
        effectiveDate: input.dateHired,
        type: 'Initial Hire',
        previousSalary: null,
        newSalary: input.basicPay,
        approvedBy: session.name,
      },
    ],
  }

  db.employees.push(employee)
  // Every employee's department exists in their branch's configuration.
  await ensureBranchDepartment(session, employee.branchId, employee.employment.department)
  return employee
}

/** Creates every row in order and returns how many were added. Rows are validated beforehand by the import dialog. */
export async function importEmployees(session: SessionUser, rows: CreateEmployeeInput[]): Promise<number> {
  for (const row of rows) await createEmployee(session, row)
  return rows.length
}

export interface SelfServiceProfileUpdate {
  contactNumber: string
  personalEmail?: string
  address: string
}

/** Employees may only edit their own allowed profile fields — never payroll, government, or employment data. */
export async function updateEmployeeSelf(session: SessionUser, updates: SelfServiceProfileUpdate): Promise<void> {
  if (!session.employeeId) return
  const employee = db.employees.find((e) => e.id === session.employeeId && e.companyId === session.companyId)
  if (!employee) return

  employee.personal.contactNumber = updates.contactNumber
  employee.personal.personalEmail = updates.personalEmail
  employee.personal.address = updates.address
}

export const SEPARATION_LABEL = {
  resigned: 'Resigned',
  terminated: 'Terminated',
  end_of_contract: 'End of Contract',
  retired: 'Retired',
} as const

export async function updateEmployeeStatus(
  session: SessionUser,
  employeeId: string,
  status: EmploymentStatus,
  separation?: { reason: NonNullable<Employee['employment']['separationReason']>; date: string; notes?: string },
): Promise<void> {
  const employee = db.employees.find((e) => e.id === employeeId && e.companyId === session.companyId)
  if (!employee) return

  employee.employment.status = status
  if (separation) {
    employee.employment.dateSeparated = separation.date
    employee.employment.separationReason = separation.reason
  } else if (status === 'active') {
    // Reactivating (e.g. rehire or a mistaken separation) clears the separation record.
    delete employee.employment.dateSeparated
    delete employee.employment.separationReason
  }
  if (separation) {
    // Nothing recurring continues past the last working day; one-time deductions due afterwards are dropped.
    for (const b of db.employeeBenefits) {
      if (b.employeeId === employeeId && b.status === 'active' && (!b.endDate || b.endDate > separation.date)) b.endDate = separation.date
    }
    for (const d of db.employeeDeductions) {
      if (d.employeeId !== employeeId || d.status !== 'active') continue
      if (d.kind === 'recurring' && (!d.endDate || d.endDate > separation.date)) d.endDate = separation.date
      if (d.kind === 'one_time' && d.dueDate && d.dueDate > separation.date) d.status = 'cancelled'
    }
  }
  employee.history.push({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor: session.name,
    action: separation
      ? `Separated: ${SEPARATION_LABEL[separation.reason]} — last day ${separation.date}${separation.notes ? ` (${separation.notes})` : ''}`
      : `Status changed to ${status}`,
  })
}

function findCompanyEmployee(session: SessionUser, employeeId: string): Employee | undefined {
  return db.employees.find((e) => e.id === employeeId && e.companyId === session.companyId)
}

function logHistory(employee: Employee, actor: string, action: string) {
  employee.history.push({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), actor, action })
}

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

/** Employee ids with an approved leave request covering today — used to derive the "On Leave" filter without touching the core employment.status enum. */
export async function getEmployeeIdsOnLeaveToday(session: SessionUser): Promise<Set<string>> {
  const employees = scopeForSession(db.employees, session, { employeeIdField: 'id' })
  const employeeIds = new Set(employees.map((e) => e.id))
  const today = new Date().toISOString().slice(0, 10)

  const onLeave = db.leaveRequests.filter(
    (r) =>
      r.companyId === session.companyId &&
      r.status === 'approved' &&
      employeeIds.has(r.employeeId) &&
      r.dateFrom <= today &&
      r.dateTo >= today,
  )
  return new Set(onLeave.map((r) => r.employeeId))
}

/** Only employees the session may see (company and branch scope) — every bulk action narrows its ids through this first. */
async function scopedEmployees(session: SessionUser, employeeIds: string[]): Promise<Employee[]> {
  const ids = new Set(employeeIds)
  return (await getEmployees(session)).filter((e) => ids.has(e.id))
}

/** Moves every selected employee to `department` (their own branch's department list is extended if needed). Returns how many changed. */
export async function bulkUpdateEmployeeDepartment(session: SessionUser, employeeIds: string[], department: string): Promise<number> {
  let changed = 0
  for (const scoped of await scopedEmployees(session, employeeIds)) {
    const employee = findCompanyEmployee(session, scoped.id)
    if (!employee || employee.employment.department === department) continue
    employee.employment.department = department
    logHistory(employee, session.name, `Department changed to ${department}`)
    await ensureBranchDepartment(session, employee.branchId, department)
    releaseSupervisorIfMoved(session, employee.id)
    changed += 1
  }
  return changed
}

/** Sets the status of every selected employee that isn't already in it (not for separations — those need a reason and last day). */
export async function bulkUpdateEmployeeStatus(session: SessionUser, employeeIds: string[], status: EmploymentStatus): Promise<number> {
  let changed = 0
  for (const employee of await scopedEmployees(session, employeeIds)) {
    if (employee.employment.status === status) continue
    await updateEmployeeStatus(session, employee.id, status)
    changed += 1
  }
  return changed
}

/** The employee record, backed by `/api/employees`. Sections keep the camelCase the server stores. */

const SECTIONS = ['personal', 'employment', 'benefits', 'government', 'compensation', 'bank']

/** Pay and bank fields are missing for people who may not see pay; give the screens an empty shape so they render. */
function toEmployee(raw: unknown): EmployeeRecord {
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
