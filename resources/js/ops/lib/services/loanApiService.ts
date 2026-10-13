import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { ApiError, api } from '@ops/lib/api/http'
import type { LoanRecord, LoanStatus, LoanTypeConfig } from '@ops/types/domain'

/*
 * Loan types and loans on the API. A loan's balance is its principal less a ledger of repayments (payroll writes a repayment when a run
 * finalizes, P10). The mock `loanService.getLoans` stays for the payroll engine and payslips until then.
 */

type ApiType = Omit<LoanTypeConfig, 'companyId' | 'description' | 'typicalTerm' | 'typicalAmount'> & { description?: string; typicalTerm?: string; typicalAmount?: string }

const toType = (t: ApiType): LoanTypeConfig => ({ ...t, companyId: '', description: t.description ?? '', typicalTerm: t.typicalTerm ?? '', typicalAmount: t.typicalAmount ?? '' })

export async function fetchLoanTypes(): Promise<LoanTypeConfig[]> {
  const res = await api.get<{ data: unknown[] }>('/api/loans/types')
  return camelizeKeys<ApiType[]>(res.data).map(toType)
}

export type LoanTypeInput = Omit<LoanTypeConfig, 'id' | 'companyId' | 'key' | 'isActive' | 'builtIn'>

export const createLoanType = (input: LoanTypeInput) => api.post('/api/loans/types', snakeizeKeys(input))
export const updateLoanType = (id: string, updates: Partial<LoanTypeInput & Pick<LoanTypeConfig, 'isActive'>>) => api.put(`/api/loans/types/${id}`, snakeizeKeys(updates))

/** Deletes a company-defined type that no loan uses. Returns false when it is built-in or in use (deactivate it instead). */
export async function deleteLoanType(id: string): Promise<boolean> {
  try {
    await api.delete(`/api/loans/types/${id}`)
    return true
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) return false
    throw error
  }
}

type ApiLoan = Omit<LoanRecord, 'companyId'>

export async function fetchLoans(): Promise<LoanRecord[]> {
  const res = await api.get<{ data: unknown[] }>('/api/loans')
  // A repayment's payroll reference can be blank; camelizeKeys keeps empty strings.
  return camelizeKeys<ApiLoan[]>(res.data).map((l) => ({ ...l, companyId: '', repaymentHistory: l.repaymentHistory ?? [] }))
}

export interface CreateLoanInput {
  employeeId: string
  type: string
  label: string
  principal: number
  monthlyDeduction: number
  startDate: string
}

export const createLoan = (input: CreateLoanInput) => api.post('/api/loans', snakeizeKeys(input))

export interface LoanTypeEntry {
  employeeId: string
  principal: number
  monthlyDeduction: number
}

export interface CreateLoansResult {
  added: number
  /** Employees skipped because they already have an active or paused loan of this type, or are not active employees. */
  skipped: number
}

/** Adds loans of one type for several employees. A fixed type uses its own amounts for everyone; a custom one uses each employee's entry. */
export async function createLoansForType(type: LoanTypeConfig, entries: LoanTypeEntry[], startDate: string): Promise<CreateLoansResult> {
  const res = await api.post<{ data: CreateLoansResult }>('/api/loans/bulk', { loan_type_id: Number(type.id), start_date: startDate, entries: snakeizeKeys(entries) })
  return res.data
}

/** Edits the terms of a loan. The principal and balance are not editable once a loan exists. */
export const updateLoan = (id: string, updates: Partial<Pick<LoanRecord, 'type' | 'label' | 'monthlyDeduction' | 'startDate'>>) => api.put(`/api/loans/${id}`, snakeizeKeys(updates))

/** Pause ('suspended'), resume ('active') or cancel a loan. Payroll only deducts active loans. */
export const setLoanStatus = (id: string, status: LoanStatus) => api.post(`/api/loans/${id}/status`, { status })
