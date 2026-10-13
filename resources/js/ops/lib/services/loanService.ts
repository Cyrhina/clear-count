// mock: remove in P10 (payroll, payslips). The Loans tab uses loanApiService; getLoans still serves the payroll engine screens and payslips, and the ESS loans page reads the mock store (P13).
import { getEmployees } from '@ops/lib/services/employeeService'
import { db } from '@ops/mock-data'
import type { LoanRecord, SessionUser } from '@ops/types/domain'

export async function getLoans(session: SessionUser): Promise<LoanRecord[]> {
  const employees = await getEmployees(session)
  const employeeIds = new Set(employees.map((e) => e.id))
  return db.loans.filter((l) => l.companyId === session.companyId && employeeIds.has(l.employeeId))
}
