/** Shapes the Branches page gets from the API (after `camelizeKeys`). The mock `Branch` in `types/domain.ts` stays for the screens not yet migrated. */

export interface BranchRecord {
  id: string
  name: string
  isHeadOffice: boolean
  code?: string
  address?: string
  city?: string
  contactNumber?: string
  email?: string
  /** YYYY-MM-DD */
  openedDate?: string
  headcount: number
  activeCount: number
}

export interface DepartmentRecord {
  id: string
  branchId: string
  name: string
  supervisorEmployeeId?: string
  employeeCount: number
}

export interface BranchSummary {
  branch: BranchRecord
  headcount: number
  activeCount: number
  /** Empty until payroll runs exist (P10). */
  grossPay?: number
  netPay?: number
}
