// Departments of the Branches, Employees and Schedules screens, backed by `/api/branch-departments`.
import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import type { DepartmentRecord } from '@ops/features/branches/types'

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
