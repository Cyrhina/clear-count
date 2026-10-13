// mock: remove in P16. addBranchDepartment and ensureBranchDepartment still serve the mock createEmployee of the Integrations CSV import.
// The Branches, Employees and Schedules screens use the API functions at the bottom.
import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { db } from '@ops/mock-data'
import type { DepartmentRecord } from '@ops/features/branches/types'
import type { BranchDepartment, SessionUser } from '@ops/types/domain'

export type DepartmentResult = { ok: true; department: BranchDepartment } | { ok: false; error: string }

const normalize = (name: string) => name.trim().replace(/\s+/g, ' ')
const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

function branchOf(session: SessionUser, branchId: string) {
  return db.branches.find((b) => b.id === branchId && b.companyId === session.companyId)
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

/** The direct supervisor of a department; `null` clears it. Only an employee of that department can be chosen. */
export const setBranchDepartmentSupervisor = (id: string, employeeId: string | null) => api.put(`/api/branch-departments/${id}/supervisor`, { employee_id: employeeId === null ? null : Number(employeeId) })
