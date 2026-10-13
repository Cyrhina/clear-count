import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { ApiError, api } from '@ops/lib/api/http'
import type { BenefitCategory, BenefitPlan, DeductionPlan, EmployeeBenefit, EmployeeDeduction } from '@ops/types/domain'

/*
 * Benefits (plans and what employees are enrolled in) and recurring or one-time deductions on the API. The mock `benefitsService` is gone;
 * the payroll engine and the tax report still read the mock `db.employeeBenefits` and `db.employeeDeductions` until P10.
 */

type Plan<T> = Omit<T, 'companyId'>
type ApiBenefit = Omit<EmployeeBenefit, 'companyId' | 'planId'> & { benefitPlanId?: string }
type ApiDeduction = Omit<EmployeeDeduction, 'companyId' | 'planId' | 'appliedPeriodId'> & { deductionPlanId?: string; settledInPeriodId?: string }

const toBenefit = ({ benefitPlanId, ...b }: ApiBenefit): EmployeeBenefit => ({ ...b, companyId: '', ...(benefitPlanId ? { planId: benefitPlanId } : {}) })
const toDeduction = ({ deductionPlanId, settledInPeriodId, ...d }: ApiDeduction): EmployeeDeduction => ({
  ...d,
  companyId: '',
  ...(deductionPlanId ? { planId: deductionPlanId } : {}),
  ...(settledInPeriodId ? { appliedPeriodId: settledInPeriodId } : {}),
})

/** A refusal the screens show as text (a duplicate name, a plan that still has people) comes back as `{ ok: false }`. */
async function attempt<T>(run: () => Promise<T>): Promise<({ ok: true } & T) | { ok: false; error: string }> {
  try {
    return { ok: true, ...(await run()) }
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) return { ok: false, error: error.message }
    throw error
  }
}

// ---------------------------------------------------------------- benefits

export async function fetchEmployeeBenefits(): Promise<EmployeeBenefit[]> {
  const res = await api.get<{ data: unknown[] }>('/api/benefits')
  return camelizeKeys<ApiBenefit[]>(res.data).map(toBenefit)
}

export type EmployeeBenefitInput = Omit<EmployeeBenefit, 'id' | 'companyId' | 'status'>

const benefitBody = (input: Partial<EmployeeBenefit>) => {
  const { planId: _plan, id: _id, companyId: _company, ...rest } = input
  return snakeizeKeys(rest)
}

export const createEmployeeBenefit = (input: EmployeeBenefitInput) => api.post('/api/benefits', benefitBody(input))
export const updateEmployeeBenefit = (id: string, updates: Partial<Omit<EmployeeBenefit, 'id' | 'companyId'>>) => api.put(`/api/benefits/${id}`, benefitBody(updates))

export async function fetchBenefitPlans(category?: BenefitCategory): Promise<BenefitPlan[]> {
  const res = await api.get<{ data: unknown[] }>('/api/benefits/plans', { category })
  return camelizeKeys<Plan<BenefitPlan>[]>(res.data).map((p) => ({ ...p, companyId: '' }))
}

export type BenefitPlanInput = Omit<BenefitPlan, 'id' | 'companyId' | 'status'>
export type PlanResult = { ok: true; plan: BenefitPlan } | { ok: false; error: string }

const planBody = (input: Partial<BenefitPlanInput>) => snakeizeKeys(input)
const toPlan = (data: unknown): BenefitPlan => ({ ...camelizeKeys<Plan<BenefitPlan>>(data), companyId: '' })

export const createBenefitPlan = (input: BenefitPlanInput): Promise<PlanResult> =>
  attempt(async () => ({ plan: toPlan((await api.post<{ data: unknown }>('/api/benefits/plans', planBody(input))).data) }))

export const updateBenefitPlan = (planId: string, updates: Partial<BenefitPlanInput>): Promise<PlanResult & { updatedEnrollments?: number }> =>
  attempt(async () => {
    const res = await api.put<{ data: unknown; updated_enrollments: number }>(`/api/benefits/plans/${planId}`, planBody(updates))
    return { plan: toPlan(res.data), updatedEnrollments: res.updated_enrollments }
  }) as Promise<PlanResult & { updatedEnrollments?: number }>

export const setBenefitPlanStatus = (planId: string, status: BenefitPlan['status']) => attempt(async () => api.post(`/api/benefits/plans/${planId}/status`, { status }).then(() => ({})))

/** Only HMO is one-plan-per-employee; an employee can receive several allowances, policies or perks (but never the same plan twice). */
export const isExclusiveCategory = (category: BenefitCategory) => category === 'hmo'

export interface EnrollResult {
  added: number
  /** Employees skipped because they already hold a live record in a plan of this category. */
  skipped: number
}

/** Enrolls employees in a plan. Skips anyone already in it — and, for HMO, anyone already in another HMO plan. */
export async function enrollEmployeesInPlan(planId: string, employeeIds: string[], startDate: string, amounts: Record<string, number> = {}): Promise<EnrollResult> {
  const res = await api.post<{ data: EnrollResult }>(`/api/benefits/plans/${planId}/enroll`, { employee_ids: employeeIds.map(Number), start_date: startDate, amounts })
  return res.data
}

export interface TransferResult {
  moved: number
  /** Employees skipped because they are no longer (active/paused) in the source plan. */
  skipped: number
}

/** Moves employees between plans of one category: the old enrolment ends the day before `effectiveDate` and a new one starts on it. */
export async function transferEmployeesToPlan(fromPlanId: string, toPlanId: string, employeeIds: string[], effectiveDate: string): Promise<TransferResult> {
  const res = await api.post<{ data: TransferResult }>('/api/benefits/plans/transfer', { from_plan_id: Number(fromPlanId), to_plan_id: Number(toPlanId), employee_ids: employeeIds.map(Number), effective_date: effectiveDate })
  return res.data
}

// ---------------------------------------------------------------- deductions

export async function fetchEmployeeDeductions(): Promise<EmployeeDeduction[]> {
  const res = await api.get<{ data: unknown[] }>('/api/deductions')
  return camelizeKeys<ApiDeduction[]>(res.data).map(toDeduction)
}

export async function fetchDeductionPlans(): Promise<DeductionPlan[]> {
  const res = await api.get<{ data: unknown[] }>('/api/deductions/plans')
  return camelizeKeys<Plan<DeductionPlan>[]>(res.data).map((p) => ({ ...p, companyId: '' }))
}

export type DeductionPlanInput = Omit<DeductionPlan, 'id' | 'companyId' | 'status'>
export type DeductionPlanResult = { ok: true; plan: DeductionPlan } | { ok: false; error: string }
const toDeductionPlan = (data: unknown): DeductionPlan => ({ ...camelizeKeys<Plan<DeductionPlan>>(data), companyId: '' })

export const createDeductionPlan = (input: DeductionPlanInput): Promise<DeductionPlanResult> =>
  attempt(async () => ({ plan: toDeductionPlan((await api.post<{ data: unknown }>('/api/deductions/plans', snakeizeKeys(input))).data) }))

export const updateDeductionPlan = (planId: string, updates: Partial<DeductionPlanInput>): Promise<DeductionPlanResult & { updatedEnrollments?: number }> =>
  attempt(async () => {
    const res = await api.put<{ data: unknown; updated_enrollments: number }>(`/api/deductions/plans/${planId}`, snakeizeKeys(updates))
    return { plan: toDeductionPlan(res.data), updatedEnrollments: res.updated_enrollments }
  }) as Promise<DeductionPlanResult & { updatedEnrollments?: number }>

export const setDeductionPlanStatus = (planId: string, status: DeductionPlan['status']) => attempt(async () => api.post(`/api/deductions/plans/${planId}/status`, { status }).then(() => ({})))

/** Enrolls employees in a recurring-deduction plan; anyone already live in that plan is skipped. A custom plan takes each employee's amount. */
export async function enrollEmployeesInDeductionPlan(planId: string, employeeIds: string[], startDate: string, amounts: Record<string, number> = {}): Promise<EnrollResult> {
  const res = await api.post<{ data: EnrollResult }>(`/api/deductions/plans/${planId}/enroll`, { employee_ids: employeeIds.map(Number), start_date: startDate, amounts })
  return res.data
}

export async function transferEmployeesBetweenDeductionPlans(fromPlanId: string, toPlanId: string, employeeIds: string[], effectiveDate: string): Promise<TransferResult> {
  const res = await api.post<{ data: TransferResult }>('/api/deductions/plans/transfer', { from_plan_id: Number(fromPlanId), to_plan_id: Number(toPlanId), employee_ids: employeeIds.map(Number), effective_date: effectiveDate })
  return res.data
}

export type EmployeeDeductionInput = Omit<EmployeeDeduction, 'id' | 'companyId' | 'status' | 'appliedPeriodId'>

const deductionBody = (input: Partial<EmployeeDeduction>) => {
  const { planId: _plan, id: _id, companyId: _company, appliedPeriodId: _applied, ...rest } = input
  return snakeizeKeys(rest)
}

export const createEmployeeDeduction = (input: EmployeeDeductionInput) => api.post('/api/deductions', deductionBody(input))
export const updateEmployeeDeduction = (id: string, updates: Partial<Omit<EmployeeDeduction, 'id' | 'companyId'>>) => api.put(`/api/deductions/${id}`, deductionBody(updates))
