import type { Employee } from '@ops/types/domain'

/** The employee as the profile page gets it: the record plus the sign-in account linked to it (only for people who manage accounts). */
export interface EmployeeRecord extends Employee {
  account?: { id: string; email: string; isActive: boolean }
}

export interface EmployeeListParams {
  search?: string
  branchId?: string
  department?: string
  status?: string
  payrollGroupId?: string
  sort?: 'name' | 'employee_number' | 'department' | 'status' | 'created_at'
  direction?: 'asc' | 'desc'
  page?: number
  perPage?: number
}

export interface EmployeePage {
  employees: Employee[]
  total: number
  page: number
  lastPage: number
}
