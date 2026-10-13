// mock: remove in P3. getBranches, reassignEmployeeBranch and assignEmployeesToBranch still serve the mock Employees, Integrations
// and bulk-action screens. The Branches page uses the API functions below.
import type { BranchRecord, BranchSummary } from '@ops/features/branches/types'
import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { ensureBranchDepartment, releaseSupervisorIfMoved } from '@ops/lib/services/branchDepartmentService'
import { scopeToCompany } from '@ops/lib/tenancy/tenantScope'
import { db } from '@ops/mock-data'
import type { Branch, SessionUser } from '@ops/types/domain'

export async function getBranches(session: SessionUser): Promise<Branch[]> {
  return scopeToCompany(db.branches, session.companyId)
}

/** Moves an employee to another branch. Returns the department name if it had to be created in the new branch, else null. */
export async function reassignEmployeeBranch(session: SessionUser, employeeId: string, branchId: string): Promise<string | null> {
  const employee = db.employees.find((e) => e.id === employeeId && e.companyId === session.companyId)
  const branch = db.branches.find((b) => b.id === branchId && b.companyId === session.companyId)
  if (!employee || !branch) return null

  if (employee.branchId === branchId) return null
  // An employee who leaves the branch they manage stops being its manager.
  const previous = db.branches.find((b) => b.id === employee.branchId && b.companyId === session.companyId)
  if (previous?.managerEmployeeId === employeeId) previous.managerEmployeeId = undefined

  employee.branchId = branchId
  employee.history.push({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor: session.name,
    action: `Reassigned to branch: ${branch.name}`,
  })

  // Their department must exist in the new branch, and they stop supervising a department they've left.
  const created = await ensureBranchDepartment(session, branchId, employee.employment.department)
  releaseSupervisorIfMoved(session, employeeId)
  return created ? employee.employment.department : null
}

/** Bulk assign / transfer employees to a branch; returns how many actually moved. */
export async function assignEmployeesToBranch(session: SessionUser, employeeIds: string[], branchId: string): Promise<number> {
  let moved = 0
  for (const employeeId of employeeIds) {
    const employee = db.employees.find((e) => e.id === employeeId && e.companyId === session.companyId)
    if (!employee || employee.branchId === branchId) continue
    await reassignEmployeeBranch(session, employeeId, branchId)
    moved += 1
  }
  return moved
}


/** The Branches page, backed by `/api/branches`. */

export async function fetchBranches(): Promise<BranchRecord[]> {
  const res = await api.get<{ data: unknown[] }>('/api/branches')
  return camelizeKeys<BranchRecord[]>(res.data)
}

export interface BranchInput {
  name: string
  isHeadOffice?: boolean
  code?: string
  address?: string
  city?: string
  contactNumber?: string
  email?: string
  /** YYYY-MM-DD */
  openedDate?: string
}

export async function createBranch(input: BranchInput): Promise<BranchRecord> {
  const res = await api.post<{ data: unknown }>('/api/branches', snakeizeKeys(input))
  return camelizeKeys<BranchRecord>(res.data)
}

export async function updateBranch(id: string, input: BranchInput): Promise<BranchRecord> {
  const res = await api.put<{ data: unknown }>(`/api/branches/${id}`, snakeizeKeys(input))
  return camelizeKeys<BranchRecord>(res.data)
}

/** Headcount per branch. Gross and net pay stay empty until payroll runs exist (P10). */
export async function getBranchSummaries(): Promise<BranchSummary[]> {
  const res = await api.get<{ data: unknown[] }>('/api/branches/summaries')
  return camelizeKeys<BranchSummary[]>(res.data)
}
