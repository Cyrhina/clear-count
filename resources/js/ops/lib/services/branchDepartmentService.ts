// mock: remove in P3. getBranchDepartments, addBranchDepartment, ensureBranchDepartment, setDepartmentSupervisor and releaseSupervisorIfMoved
// still serve the mock Employees, Schedules and import screens. The Branches page uses the API functions at the bottom.
import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { scopeToCompany } from '@ops/lib/tenancy/tenantScope'
import { db } from '@ops/mock-data'
import type { DepartmentRecord } from '@ops/features/branches/types'
import type { BranchDepartment, SessionUser } from '@ops/types/domain'

export type DepartmentResult = { ok: true; department: BranchDepartment } | { ok: false; error: string }

const normalize = (name: string) => name.trim().replace(/\s+/g, ' ')
const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

function branchOf(session: SessionUser, branchId: string) {
  return db.branches.find((b) => b.id === branchId && b.companyId === session.companyId)
}

/** Departments configured for the company's branches (optionally one branch), by name. */
export async function getBranchDepartments(session: SessionUser, branchId?: string): Promise<BranchDepartment[]> {
  return scopeToCompany(db.branchDepartments, session.companyId)
    .filter((d) => !branchId || d.branchId === branchId)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function addBranchDepartment(session: SessionUser, branchId: string, name: string): Promise<DepartmentResult> {
  const clean = normalize(name)
  if (!branchOf(session, branchId)) return { ok: false, error: 'Branch not found.' }
  if (!clean) return { ok: false, error: 'Enter a department name.' }
  if (db.branchDepartments.some((d) => d.branchId === branchId && sameName(d.name, clean))) return { ok: false, error: `${clean} already exists in this branch.` }
  const department: BranchDepartment = { id: crypto.randomUUID(), companyId: session.companyId, branchId, name: clean, supervisorEmployeeId: null }
  db.branchDepartments.push(department)
  return { ok: true, department }
}

/** Idempotent create — used when an employee moves to (or is imported into) a branch that doesn't have their department yet. Returns true if it was created. */
export async function ensureBranchDepartment(session: SessionUser, branchId: string, name: string): Promise<boolean> {
  const clean = normalize(name)
  if (!clean || !branchOf(session, branchId)) return false
  if (db.branchDepartments.some((d) => d.branchId === branchId && sameName(d.name, clean))) return false
  return (await addBranchDepartment(session, branchId, clean)).ok
}

/** Sets the direct supervisor; only an active employee of that department in that branch can be chosen. */
export async function setDepartmentSupervisor(session: SessionUser, departmentId: string, employeeId: string | null): Promise<{ ok: true } | { ok: false; error: string }> {
  const department = db.branchDepartments.find((d) => d.id === departmentId && d.companyId === session.companyId)
  if (!department) return { ok: false, error: 'Department not found.' }
  if (employeeId) {
    const employee = db.employees.find((e) => e.id === employeeId && e.companyId === session.companyId)
    if (!employee || employee.branchId !== department.branchId || employee.employment.department !== department.name) return { ok: false, error: 'The supervisor must be an employee of this department in this branch.' }
  }
  department.supervisorEmployeeId = employeeId
  return { ok: true }
}

/** Clears the supervisor of any department the employee no longer belongs to (after a transfer or department change). */
export function releaseSupervisorIfMoved(session: SessionUser, employeeId: string) {
  const employee = db.employees.find((e) => e.id === employeeId && e.companyId === session.companyId)
  if (!employee) return
  for (const d of db.branchDepartments) {
    if (d.supervisorEmployeeId === employeeId && (d.branchId !== employee.branchId || d.name !== employee.employment.department)) d.supervisorEmployeeId = null
  }
}

/** Departments on the Branches page, backed by `/api/branch-departments`. */

export async function fetchBranchDepartments(): Promise<DepartmentRecord[]> {
  const res = await api.get<{ data: unknown[] }>('/api/branch-departments')
  return camelizeKeys<DepartmentRecord[]>(res.data)
}

export const createBranchDepartment = (branchId: string, name: string) => api.post('/api/branch-departments', snakeizeKeys({ branchId, name }))

/** Returns how many departments were added. */
export async function copyBranchDepartments(fromBranchId: string, toBranchId: string): Promise<number> {
  const res = await api.post<{ meta: { added: number } }>('/api/branch-departments/copy', snakeizeKeys({ fromBranchId, toBranchId }))
  return res.meta.added
}

/** Also renames the department on the employees in it. */
export const renameBranchDepartment = (id: string, name: string) => api.put(`/api/branch-departments/${id}`, { name })

export const removeBranchDepartment = (id: string) => api.delete<void>(`/api/branch-departments/${id}`)
