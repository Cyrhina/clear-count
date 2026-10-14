import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { toAttendanceRecord, type ApiRecord } from '@ops/lib/services/attendanceService'
import { toOvertimeRecord, type ApiOvertime } from '@ops/lib/services/overtimeApiService'
import { toWorkLog, type ApiWorkLog } from '@ops/lib/services/workLogApiService'
import { getDeductionConfigs } from '@ops/lib/services/payrollConfigService'
import type { AttendanceRecord, CompensationApproval, DeductionConfig, Employee, OvertimeRecord, PayrollLine, PayrollPeriod } from '@ops/types/domain'
import type { PayrollInputs } from '@ops/lib/services/payrollInputsService'

/*
 * Payroll runs on the API. The server computes every line (App\Payroll\ComputeLine) from approved records and locks the run when it is
 * finalized; a step taken out of order, or on a finalized run, answers 409. A line arrives with its whole breakdown, so the screens
 * only show it. Dates are YYYY-MM-DD.
 */

type ApiPeriod = Omit<PayrollPeriod, 'companyId'>

const toPeriod = (p: ApiPeriod): PayrollPeriod => ({ ...p, companyId: '' })

export async function fetchPayrollPeriods(): Promise<PayrollPeriod[]> {
  const res = await api.get<{ data: unknown[] }>('/api/payroll')
  return camelizeKeys<ApiPeriod[]>(res.data).map(toPeriod)
}

export async function fetchPayrollLines(periodId: string): Promise<PayrollLine[]> {
  const res = await api.get<{ data: unknown[] }>(`/api/payroll/${periodId}/lines`)
  return camelizeKeys<PayrollLine[]>(res.data)
}

export async function fetchPayrollLine(lineId: string): Promise<PayrollLine> {
  const res = await api.get<{ data: unknown }>(`/api/payroll/lines/${lineId}`)
  return camelizeKeys<PayrollLine>(res.data)
}

/** The payroll number the next run with this pay date will get (PR001 again at the start of each year). */
export async function fetchNextPayrollNumber(payDate: string): Promise<string> {
  const res = await api.get<{ data: { payroll_number: string } }>('/api/payroll/next-number', { pay_date: payDate })
  return res.data.payroll_number
}

export interface CreatePeriodInput {
  label: string
  startDate: string
  endDate: string
  payDate: string
  /** When set, the run only includes employees currently assigned to this Payroll Group. */
  payrollGroupId?: string
}

export async function createPayrollPeriod(input: CreatePeriodInput): Promise<PayrollPeriod> {
  const res = await api.post<{ data: unknown }>('/api/payroll', snakeizeKeys(input))
  return toPeriod(camelizeKeys<ApiPeriod>(res.data))
}

/** Computes every line and moves the run to review; a re-run replaces the lines. */
export const runPayroll = (periodId: string) => api.post(`/api/payroll/${periodId}/run`, {})

async function heldCount(path: string, employeeIds: string[]): Promise<number> {
  const res = await api.post<{ data: { count: number } }>(path, { employee_ids: employeeIds.map(Number) })
  return res.data.count
}

/** Takes employees out of a run that is not yet approved: their lines are removed and the work logs they locked are freed. */
export const holdEmployeesInPeriod = (periodId: string, employeeIds: string[]) => heldCount(`/api/payroll/${periodId}/hold`, employeeIds)

/** Puts held employees back; if the run was already calculated their lines are computed now. */
export const releaseEmployeesInPeriod = (periodId: string, employeeIds: string[]) => heldCount(`/api/payroll/${periodId}/release`, employeeIds)

export const approvePayroll = (periodId: string) => api.post(`/api/payroll/${periodId}/approve`, {})

/** Locks the run, posts the loan installments it collected and settles its one-time deductions. */
export const finalizePayroll = (periodId: string) => api.post(`/api/payroll/${periodId}/finalize`, {})

export async function fetchPayrollInputs(periodId: string): Promise<PayrollInputs> {
  const res = await api.get<{ data: unknown }>(`/api/payroll-inputs/${periodId}`)
  return camelizeKeys<PayrollInputs>(res.data)
}

/** The company's deduction schedules named as the payslip and computation views look them up (the server names the statutory ones without "Contribution"). */
export async function fetchDeductionConfigsForPayslips(): Promise<DeductionConfig[]> {
  const alias: Record<string, string> = { SSS: 'SSS Contribution', PhilHealth: 'PhilHealth Contribution', 'Pag-IBIG': 'Pag-IBIG Contribution' }
  return (await getDeductionConfigs()).map((c) => ({ companyId: '', ...c, name: alias[c.name] ?? c.name }))
}

/** The people the runs are about (separated ones included, for final pay). The payroll role cannot open the employee records, so this carries name, job and pay rate only. */
export async function fetchPayrollEmployees(): Promise<Employee[]> {
  const res = await api.get<{ data: unknown[] }>('/api/payroll/employees')
  return camelizeKeys<Employee[]>(res.data).map((e) => ({ ...e, companyId: '', compensation: e.compensation ?? { basicPay: 0, payType: 'monthly', allowances: [] }, bank: {}, government: e.government ?? {} }))
}

export interface PeriodRecords {
  attendance: AttendanceRecord[]
  overtime: OvertimeRecord[]
  workLogs: CompensationApproval[]
}

/** The attendance, overtime and work-log records of a run's period, for its computation view; the payroll role may not open those screens. */
export async function fetchPeriodRecords(periodId: string): Promise<PeriodRecords> {
  const res = await api.get<{ data: unknown }>(`/api/payroll/${periodId}/records`)
  const raw = camelizeKeys<{ attendance: ApiRecord[]; overtime: ApiOvertime[]; workLogs: ApiWorkLog[] }>(res.data)
  return { attendance: raw.attendance.map(toAttendanceRecord), overtime: raw.overtime.map(toOvertimeRecord), workLogs: raw.workLogs.map(toWorkLog) }
}

export interface MyPayslip {
  line: PayrollLine
  period: PayrollPeriod
}

/** The signed-in employee's own payslips: their lines in finalized runs, newest pay date first. */
export async function fetchMyPayslips(): Promise<MyPayslip[]> {
  const res = await api.get<{ data: { line: unknown; period: unknown }[] }>('/api/payslips')
  return res.data.map((r) => ({ line: camelizeKeys<PayrollLine>(r.line), period: toPeriod(camelizeKeys<ApiPeriod>(r.period)) }))
}

/** One payslip the signed-in user may open: payroll and HR any, an employee only their own. */
export const fetchPayslip = async (lineId: string): Promise<PayrollLine> => camelizeKeys<PayrollLine>((await api.get<{ data: unknown }>(`/api/payslips/${lineId}`)).data)
