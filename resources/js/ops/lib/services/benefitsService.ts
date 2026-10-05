import { getEmployees } from '@ops/lib/services/employeeService'
import { db } from '@ops/mock-data'
import type { BenefitCategory, BenefitPlan, DeductionPlan, EmployeeBenefit, EmployeeDeduction, SessionUser } from '@ops/types/domain'

/** Benefits for the employees the session can see. */
export async function getEmployeeBenefits(session: SessionUser): Promise<EmployeeBenefit[]> {
  const employeeIds = new Set((await getEmployees(session)).map((e) => e.id))
  return db.employeeBenefits.filter((b) => b.companyId === session.companyId && employeeIds.has(b.employeeId))
}

export type EmployeeBenefitInput = Omit<EmployeeBenefit, 'id' | 'companyId' | 'status'>

export async function createEmployeeBenefit(session: SessionUser, input: EmployeeBenefitInput): Promise<EmployeeBenefit> {
  const record: EmployeeBenefit = { id: crypto.randomUUID(), companyId: session.companyId, status: 'active', ...input }
  db.employeeBenefits.unshift(record)
  return record
}

export async function updateEmployeeBenefit(session: SessionUser, id: string, updates: Partial<Omit<EmployeeBenefit, 'id' | 'companyId'>>): Promise<void> {
  const record = db.employeeBenefits.find((b) => b.id === id && b.companyId === session.companyId)
  if (record) Object.assign(record, updates)
}

// ---------------------------------------------------------------- plans (HMO)

export async function getBenefitPlans(session: SessionUser, category?: BenefitCategory): Promise<BenefitPlan[]> {
  return db.benefitPlans.filter((p) => p.companyId === session.companyId && (!category || p.category === category)).sort((a, b) => a.name.localeCompare(b.name))
}

export type BenefitPlanInput = Omit<BenefitPlan, 'id' | 'companyId' | 'status'>
export type PlanResult = { ok: true; plan: BenefitPlan } | { ok: false; error: string }

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

export async function createBenefitPlan(session: SessionUser, input: BenefitPlanInput): Promise<PlanResult> {
  const name = input.name.trim()
  if (!name) return { ok: false, error: 'Enter a plan name.' }
  if (db.benefitPlans.some((p) => p.companyId === session.companyId && p.category === input.category && sameName(p.name, name))) return { ok: false, error: `${name} already exists.` }
  const plan: BenefitPlan = { id: crypto.randomUUID(), companyId: session.companyId, status: 'active', ...input, name }
  db.benefitPlans.push(plan)
  return { ok: true, plan }
}

/** Only HMO is one-plan-per-employee; an employee can receive several allowances, policies or perks (but never the same plan twice). */
export const isExclusiveCategory = (category: BenefitCategory) => category === 'hmo'

/** Enrollments that still count (active or paused) for a plan. */
const liveEnrollments = (session: SessionUser, planId: string) => db.employeeBenefits.filter((b) => b.companyId === session.companyId && b.planId === planId && b.status !== 'cancelled')

/**
 * Updates the plan, and carries the change to everyone still enrolled (active or paused) — name, provider, coverage and amounts —
 * from the next payroll run. Per-employee adjustments to the amounts are replaced; cancelled records keep their history.
 */
export async function updateBenefitPlan(session: SessionUser, planId: string, updates: Partial<BenefitPlanInput>): Promise<PlanResult & { updatedEnrollments?: number }> {
  const plan = db.benefitPlans.find((p) => p.id === planId && p.companyId === session.companyId)
  if (!plan) return { ok: false, error: 'Plan not found.' }
  const name = updates.name?.trim()
  if (updates.name !== undefined && !name) return { ok: false, error: 'Enter a plan name.' }
  if (name && db.benefitPlans.some((p) => p.id !== plan.id && p.companyId === session.companyId && p.category === plan.category && sameName(p.name, name))) return { ok: false, error: `${name} already exists.` }
  Object.assign(plan, updates, name ? { name } : {})
  const enrollments = liveEnrollments(session, plan.id)
  const customAmounts = plan.amountType === 'custom'
  for (const b of enrollments) {
    b.name = plan.name
    b.provider = plan.provider
    b.coverage = plan.coverage
    // A customisable plan's amount is the default for new employees — each employee keeps their own.
    if (!customAmounts) b.monthlyValue = plan.monthlyValue
    b.employeeShare = plan.employeeShare
  }
  return { ok: true, plan, updatedEnrollments: enrollments.length }
}

export async function setBenefitPlanStatus(session: SessionUser, planId: string, status: BenefitPlan['status']): Promise<{ ok: true } | { ok: false; error: string }> {
  const plan = db.benefitPlans.find((p) => p.id === planId && p.companyId === session.companyId)
  if (!plan) return { ok: false, error: 'Plan not found.' }
  const live = liveEnrollments(session, planId).length
  if (status === 'archived' && live > 0) return { ok: false, error: `${plan.name} still has ${live} enrolled employee${live === 1 ? '' : 's'}. Cancel or move them first.` }
  plan.status = status
  return { ok: true }
}

export interface EnrollResult {
  added: number
  /** Employees skipped because they already hold a live record in a plan of this category. */
  skipped: number
}

/** Enrolls employees in a plan. Skips anyone already in it — and, for HMO, anyone already in another HMO plan. */
export async function enrollEmployeesInPlan(
  session: SessionUser,
  planId: string,
  employeeIds: string[],
  startDate: string,
  /** Per-employee amounts — used only by a customisable plan; anyone missing gets the plan's default amount. */
  amounts: Record<string, number> = {},
): Promise<EnrollResult> {
  const plan = db.benefitPlans.find((p) => p.id === planId && p.companyId === session.companyId)
  const allowed = new Set((await getEmployees(session)).filter((e) => e.employment.status === 'active').map((e) => e.id))
  const result: EnrollResult = { added: 0, skipped: 0 }
  if (!plan || plan.status !== 'active') return { added: 0, skipped: employeeIds.length }
  for (const employeeId of employeeIds) {
    const alreadyIn = db.employeeBenefits.some(
      (b) => b.companyId === session.companyId && b.employeeId === employeeId && b.category === plan.category && b.status !== 'cancelled' && b.planId && (isExclusiveCategory(plan.category) || b.planId === plan.id),
    )
    if (!allowed.has(employeeId) || alreadyIn) {
      result.skipped += 1
      continue
    }
    await createEmployeeBenefit(session, {
      employeeId,
      planId: plan.id,
      category: plan.category,
      name: plan.name,
      provider: plan.provider,
      coverage: plan.coverage,
      monthlyValue: plan.amountType === 'custom' ? (amounts[employeeId] ?? plan.monthlyValue) : plan.monthlyValue,
      employeeShare: plan.employeeShare,
      startDate,
    })
    result.added += 1
  }
  return result
}

const dayBefore = (date: string) => {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface TransferResult {
  moved: number
  /** Employees skipped because they are no longer (active/paused) in the source plan. */
  skipped: number
}

/**
 * Moves employees from one plan to another. Each old enrolment is cancelled the day before `effectiveDate` (kept as history, with a note),
 * and a new one starts on `effectiveDate` at the target plan's cost and employee share — so payroll never pays two plans for one day.
 */
export async function transferEmployeesToPlan(session: SessionUser, fromPlanId: string, toPlanId: string, employeeIds: string[], effectiveDate: string): Promise<TransferResult> {
  const from = db.benefitPlans.find((p) => p.id === fromPlanId && p.companyId === session.companyId)
  const to = db.benefitPlans.find((p) => p.id === toPlanId && p.companyId === session.companyId)
  if (!from || !to || from.id === to.id || to.status !== 'active' || from.category !== to.category) return { moved: 0, skipped: employeeIds.length }
  const result: TransferResult = { moved: 0, skipped: 0 }
  for (const employeeId of employeeIds) {
    const current = db.employeeBenefits.find((b) => b.companyId === session.companyId && b.employeeId === employeeId && b.planId === from.id && b.status !== 'cancelled')
    const alreadyInTarget = db.employeeBenefits.some((b) => b.companyId === session.companyId && b.employeeId === employeeId && b.planId === to.id && b.status !== 'cancelled')
    if (!current || alreadyInTarget) {
      result.skipped += 1
      continue
    }
    current.status = 'cancelled'
    current.endDate = effectiveDate > current.startDate ? dayBefore(effectiveDate) : current.startDate
    current.notes = [current.notes, `Transferred to ${to.name} on ${effectiveDate}.`].filter(Boolean).join(' ')
    await createEmployeeBenefit(session, {
      employeeId,
      planId: to.id,
      category: to.category,
      name: to.name,
      provider: to.provider,
      coverage: to.coverage,
      // Moving to a customisable plan keeps the employee's own amount.
      monthlyValue: to.amountType === 'custom' ? current.monthlyValue : to.monthlyValue,
      employeeShare: to.employeeShare,
      startDate: effectiveDate,
      notes: `Transferred from ${from.name}.`,
    })
    result.moved += 1
  }
  return result
}

/** Deductions (non-loan, non-statutory) for the employees the session can see. */
export async function getEmployeeDeductions(session: SessionUser): Promise<EmployeeDeduction[]> {
  const employeeIds = new Set((await getEmployees(session)).map((e) => e.id))
  return db.employeeDeductions.filter((d) => d.companyId === session.companyId && employeeIds.has(d.employeeId))
}

// ---------------------------------------------------------------- recurring-deduction plans

export async function getDeductionPlans(session: SessionUser): Promise<DeductionPlan[]> {
  return db.deductionPlans.filter((p) => p.companyId === session.companyId).sort((a, b) => a.name.localeCompare(b.name))
}

export type DeductionPlanInput = Omit<DeductionPlan, 'id' | 'companyId' | 'status'>
export type DeductionPlanResult = { ok: true; plan: DeductionPlan } | { ok: false; error: string }

const liveDeductions = (session: SessionUser, planId: string) => db.employeeDeductions.filter((d) => d.companyId === session.companyId && d.planId === planId && (d.status === 'active' || d.status === 'paused'))
const nameTaken = (session: SessionUser, name: string, exceptId?: string) => db.deductionPlans.some((p) => p.companyId === session.companyId && p.id !== exceptId && p.name.trim().toLowerCase() === name.trim().toLowerCase())

export async function createDeductionPlan(session: SessionUser, input: DeductionPlanInput): Promise<DeductionPlanResult> {
  const name = input.name.trim()
  if (!name) return { ok: false, error: 'Enter a name.' }
  if (nameTaken(session, name)) return { ok: false, error: `${name} already exists.` }
  const plan: DeductionPlan = { id: crypto.randomUUID(), companyId: session.companyId, status: 'active', ...input, name }
  db.deductionPlans.push(plan)
  return { ok: true, plan }
}

/** Updates the plan and carries the change to everyone still enrolled; a customizable plan keeps each employee's own amount. */
export async function updateDeductionPlan(session: SessionUser, planId: string, updates: Partial<DeductionPlanInput>): Promise<DeductionPlanResult & { updatedEnrollments?: number }> {
  const plan = db.deductionPlans.find((p) => p.id === planId && p.companyId === session.companyId)
  if (!plan) return { ok: false, error: 'Plan not found.' }
  const name = updates.name?.trim()
  if (updates.name !== undefined && !name) return { ok: false, error: 'Enter a name.' }
  if (name && nameTaken(session, name, plan.id)) return { ok: false, error: `${name} already exists.` }
  Object.assign(plan, updates, name ? { name } : {})
  const enrollments = liveDeductions(session, plan.id)
  for (const d of enrollments) {
    d.name = plan.name
    d.reason = plan.reason
    if (plan.amountType !== 'custom') d.amount = plan.amount
  }
  return { ok: true, plan, updatedEnrollments: enrollments.length }
}

export async function setDeductionPlanStatus(session: SessionUser, planId: string, status: DeductionPlan['status']): Promise<{ ok: true } | { ok: false; error: string }> {
  const plan = db.deductionPlans.find((p) => p.id === planId && p.companyId === session.companyId)
  if (!plan) return { ok: false, error: 'Plan not found.' }
  const live = liveDeductions(session, planId).length
  if (status === 'archived' && live > 0) return { ok: false, error: `${plan.name} still has ${live} enrolled employee${live === 1 ? '' : 's'}. Cancel or move them first.` }
  plan.status = status
  return { ok: true }
}

/** Enrolls employees in a recurring-deduction plan; anyone already live in that plan is skipped. A customizable plan takes each employee's amount. */
export async function enrollEmployeesInDeductionPlan(
  session: SessionUser,
  planId: string,
  employeeIds: string[],
  startDate: string,
  amounts: Record<string, number> = {},
): Promise<EnrollResult> {
  const plan = db.deductionPlans.find((p) => p.id === planId && p.companyId === session.companyId)
  const allowed = new Set((await getEmployees(session)).filter((e) => e.employment.status === 'active').map((e) => e.id))
  if (!plan || plan.status !== 'active') return { added: 0, skipped: employeeIds.length }
  const result: EnrollResult = { added: 0, skipped: 0 }
  for (const employeeId of employeeIds) {
    const already = liveDeductions(session, plan.id).some((d) => d.employeeId === employeeId)
    const amount = plan.amountType === 'custom' ? (amounts[employeeId] ?? plan.amount) : plan.amount
    if (!allowed.has(employeeId) || already || !(amount > 0)) {
      result.skipped += 1
      continue
    }
    await createEmployeeDeduction(session, { employeeId, planId: plan.id, name: plan.name, kind: 'recurring', amount, startDate, reason: plan.reason })
    result.added += 1
  }
  return result
}

/** Moves employees to another plan: the old deduction ends the day before `effectiveDate`, a new one starts on it. */
export async function transferEmployeesBetweenDeductionPlans(session: SessionUser, fromPlanId: string, toPlanId: string, employeeIds: string[], effectiveDate: string): Promise<TransferResult> {
  const from = db.deductionPlans.find((p) => p.id === fromPlanId && p.companyId === session.companyId)
  const to = db.deductionPlans.find((p) => p.id === toPlanId && p.companyId === session.companyId)
  if (!from || !to || from.id === to.id || to.status !== 'active') return { moved: 0, skipped: employeeIds.length }
  const result: TransferResult = { moved: 0, skipped: 0 }
  for (const employeeId of employeeIds) {
    const current = liveDeductions(session, from.id).find((d) => d.employeeId === employeeId)
    const inTarget = liveDeductions(session, to.id).some((d) => d.employeeId === employeeId)
    if (!current || inTarget) {
      result.skipped += 1
      continue
    }
    current.status = 'cancelled'
    current.endDate = effectiveDate > current.startDate ? dayBefore(effectiveDate) : current.startDate
    current.reason = [current.reason, `Transferred to ${to.name} on ${effectiveDate}.`].filter(Boolean).join(' ')
    await createEmployeeDeduction(session, {
      employeeId,
      planId: to.id,
      name: to.name,
      kind: 'recurring',
      amount: to.amountType === 'custom' ? current.amount : to.amount,
      startDate: effectiveDate,
      reason: `Transferred from ${from.name}.`,
    })
    result.moved += 1
  }
  return result
}

export type EmployeeDeductionInput = Omit<EmployeeDeduction, 'id' | 'companyId' | 'status' | 'appliedPeriodId'>

export async function createEmployeeDeduction(session: SessionUser, input: EmployeeDeductionInput): Promise<EmployeeDeduction> {
  const record: EmployeeDeduction = { id: crypto.randomUUID(), companyId: session.companyId, status: 'active', ...input }
  db.employeeDeductions.unshift(record)
  return record
}

export async function updateEmployeeDeduction(session: SessionUser, id: string, updates: Partial<Omit<EmployeeDeduction, 'id' | 'companyId'>>): Promise<void> {
  const record = db.employeeDeductions.find((d) => d.id === id && d.companyId === session.companyId)
  if (record) Object.assign(record, updates)
}
