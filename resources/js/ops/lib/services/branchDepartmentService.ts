import { scopeToCompany } from '@ops/lib/tenancy/tenantScope'
import { db } from '@ops/mock-data'
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

/** Adds every department of `fromBranchId` that `toBranchId` doesn't have yet (supervisors are not copied). Returns how many were added. */
export async function copyBranchDepartments(session: SessionUser, fromBranchId: string, toBranchId: string): Promise<number> {
  let added = 0
  for (const department of await getBranchDepartments(session, fromBranchId)) {
    if (await ensureBranchDepartment(session, toBranchId, department.name)) added += 1
  }
  return added
}

/** Renames a department and the department of every employee in it, so the two never drift apart. */
export async function renameBranchDepartment(session: SessionUser, departmentId: string, name: string): Promise<DepartmentResult> {
  const department = db.branchDepartments.find((d) => d.id === departmentId && d.companyId === session.companyId)
  const clean = normalize(name)
  if (!department) return { ok: false, error: 'Department not found.' }
  if (!clean) return { ok: false, error: 'Enter a department name.' }
  if (db.branchDepartments.some((d) => d.id !== department.id && d.branchId === department.branchId && sameName(d.name, clean))) return { ok: false, error: `${clean} already exists in this branch.` }
  for (const employee of db.employees) {
    if (employee.companyId === session.companyId && employee.branchId === department.branchId && employee.employment.department === department.name) employee.employment.department = clean
  }
  department.name = clean
  return { ok: true, department }
}

/** Number of employees (any status) currently in the department. */
export function countDepartmentEmployees(session: SessionUser, department: BranchDepartment): number {
  return db.employees.filter((e) => e.companyId === session.companyId && e.branchId === department.branchId && e.employment.department === department.name).length
}

/** Removes a department — refused while employees are still in it. */
export async function removeBranchDepartment(session: SessionUser, departmentId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const department = db.branchDepartments.find((d) => d.id === departmentId && d.companyId === session.companyId)
  if (!department) return { ok: false, error: 'Department not found.' }
  const count = countDepartmentEmployees(session, department)
  if (count > 0) return { ok: false, error: `${department.name} still has ${count} employee${count === 1 ? '' : 's'}. Move them to another department or branch first.` }
  db.branchDepartments = db.branchDepartments.filter((d) => d.id !== department.id)
  return { ok: true }
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
