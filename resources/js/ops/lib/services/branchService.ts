// mock: remove in P16. getBranches still serves the mock Integrations screen. The Branches page uses the API functions below.
import type { BranchRecord, BranchSummary } from '@ops/features/branches/types'
import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { scopeToCompany } from '@ops/lib/tenancy/tenantScope'
import { db } from '@ops/mock-data'
import type { Branch, SessionUser } from '@ops/types/domain'

export async function getBranches(session: SessionUser): Promise<Branch[]> {
  return scopeToCompany(db.branches, session.companyId)
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
