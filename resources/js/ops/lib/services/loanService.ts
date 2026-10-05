import { getEmployees } from '@ops/lib/services/employeeService'
import { db } from '@ops/mock-data'
import type { LoanRecord, LoanStatus, LoanType, LoanTypeConfig, SessionUser } from '@ops/types/domain'

export async function getLoans(session: SessionUser): Promise<LoanRecord[]> {
  const employees = await getEmployees(session)
  const employeeIds = new Set(employees.map((e) => e.id))
  return db.loans.filter((l) => l.companyId === session.companyId && employeeIds.has(l.employeeId))
}

export interface CreateLoanInput {
  employeeId: string
  type: LoanType
  label: string
  principal: number
  monthlyDeduction: number
  startDate: string
}

export async function createLoan(session: SessionUser, input: CreateLoanInput): Promise<LoanRecord> {
  const loan: LoanRecord = {
    id: crypto.randomUUID(),
    companyId: session.companyId,
    balance: input.principal,
    status: 'active',
    repaymentHistory: [],
    ...input,
  }
  db.loans.unshift(loan)
  return loan
}

export interface LoanTypeEntry {
  employeeId: string
  principal: number
  monthlyDeduction: number
}

export interface CreateLoansResult {
  added: number
  /** Employees skipped because they already have an active or paused loan of this type, or aren't active employees. */
  skipped: number
}

/**
 * Adds loans of one type for several employees. A fixed-terms type uses its own principal and monthly deduction for everyone;
 * a customizable one uses each employee's entry. Anyone who still has an active/paused loan of the type is skipped.
 */
export async function createLoansForType(session: SessionUser, type: LoanTypeConfig, entries: LoanTypeEntry[], startDate: string): Promise<CreateLoansResult> {
  const allowed = new Set((await getEmployees(session)).filter((e) => e.employment.status === 'active').map((e) => e.id))
  const result: CreateLoansResult = { added: 0, skipped: 0 }
  for (const entry of entries) {
    const hasLive = db.loans.some((l) => l.companyId === session.companyId && l.employeeId === entry.employeeId && l.type === type.key && (l.status === 'active' || l.status === 'suspended'))
    const principal = type.amountType === 'fixed' ? (type.fixedPrincipal ?? 0) : entry.principal
    const monthlyDeduction = type.amountType === 'fixed' ? (type.fixedMonthlyDeduction ?? 0) : entry.monthlyDeduction
    if (!allowed.has(entry.employeeId) || hasLive || !(principal > 0) || !(monthlyDeduction > 0)) {
      result.skipped += 1
      continue
    }
    await createLoan(session, { employeeId: entry.employeeId, type: type.key, label: type.label, principal, monthlyDeduction, startDate })
    result.added += 1
  }
  return result
}

/** Edits the terms of a loan. The principal and balance are not editable once a loan exists. */
export async function updateLoan(session: SessionUser, id: string, updates: Partial<Pick<LoanRecord, 'type' | 'label' | 'monthlyDeduction' | 'startDate'>>): Promise<void> {
  const loan = db.loans.find((l) => l.id === id && l.companyId === session.companyId)
  if (loan) Object.assign(loan, updates)
}

/** Pause ('suspended'), resume ('active') or cancel a loan. Payroll only deducts active loans. */
export async function setLoanStatus(session: SessionUser, id: string, status: LoanStatus): Promise<void> {
  const loan = db.loans.find((l) => l.id === id && l.companyId === session.companyId)
  if (loan) loan.status = status
}
