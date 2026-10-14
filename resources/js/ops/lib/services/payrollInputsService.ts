/** Shapes of `GET /api/payroll-inputs/{period}` (payrollApiService.fetchPayrollInputs): what a payroll run reads for a period, read-only. */

export interface InputsPeriod {
  id: string
  label: string
  startDate: string
  endDate: string
  payrollGroupId?: string
}

export interface TimeInputRow {
  employeeId: string
  employeeNumber: string
  name: string
  department: string
  daysPresent: number
  regularHours: number
  late: number
  undertime: number
  absent: number
  overtimeHours: number
  nightDiffHours: number
}

export interface OutputInputRow {
  id: string
  employeeId: string
  employeeNumber: string
  name: string
  workDate: string
  description: string
  unitLabel: string
  rate: number
  quantity: number
  amount: number
  status: 'approved' | 'pending' | 'rejected'
  /** The run that already pays this record, if any. */
  payrollNumber?: string
}

export interface OtherInputRow {
  id: string
  kind: 'Leave without pay' | 'Allowance' | 'Bonus / incentive' | 'Adjustment'
  employeeId?: string
  employeeNumber?: string
  name: string
  detail: string
  /** Peso value when it has one; leave days are shown in `detail`. */
  amount?: number
  status: string
}

export interface PayrollInputs {
  period: InputsPeriod
  time: TimeInputRow[]
  output: OutputInputRow[]
  other: OtherInputRow[]
  /** Records still waiting on someone else's approval — not paid until they are approved. */
  pending: { output: number; overtime: number; leave: number; adjustments: number }
}
