import { create } from 'zustand'
import { PLAN_DETAILS, estimateMonthlyBill } from '@ops/lib/plans'
import { db } from '@ops/mock-data'
import type { PendingPlanChange, PlanTier, SessionUser } from '@ops/types/domain'

/** Bumped whenever a company's plan or pending upgrade changes, so mounted UI (sidebar, plan widget) re-reads it without a reload. */
export const useSubscriptionVersion = create<{ version: number }>(() => ({ version: 0 }))
const bump = () => useSubscriptionVersion.setState((s) => ({ version: s.version + 1 }))

export interface SubscriptionUsage {
  planTier: PlanTier
  employeeCount: number
  userCount: number
  employeeLimit: number | null
  userLimit: number | null
  billingInterval: 'monthly'
  nextRenewalDate: string | undefined
  monthlyPricePhp: number | null
  pendingChange: PendingPlanChange | undefined
}

export async function getSubscriptionUsage(session: SessionUser): Promise<SubscriptionUsage> {
  const company = db.companies.find((c) => c.id === session.companyId)
  const planTier = company?.planTier ?? 'basic'
  const details = PLAN_DETAILS[planTier]

  return {
    planTier,
    employeeCount: db.employees.filter((e) => e.companyId === session.companyId && e.employment.status !== 'archived').length,
    userCount: db.users.filter((u) => u.companyId === session.companyId).length,
    employeeLimit: details.employeeLimit,
    userLimit: details.userLimit,
    billingInterval: company?.billingInterval ?? 'monthly',
    nextRenewalDate: company?.nextRenewalDate,
    monthlyPricePhp: details.monthlyPricePhp,
    pendingChange: company?.pendingPlanChange,
  }
}

/** Downgrades apply right away; upgrades go through `submitUpgradePayment` and wait for verification. */
export async function downgradePlan(session: SessionUser, planTier: PlanTier): Promise<void> {
  const company = db.companies.find((c) => c.id === session.companyId)
  if (company) company.planTier = planTier
  bump()
}

/** What the company pays to move to `targetTier`: the plan's base price plus any employees above its limit (null = custom priced). */
export async function getUpgradeAmount(session: SessionUser, targetTier: PlanTier): Promise<number | null> {
  const employeeCount = db.employees.filter((e) => e.companyId === session.companyId && e.employment.status !== 'archived').length
  return estimateMonthlyBill(targetTier, employeeCount)?.total ?? null
}

/** A code for the payment note, e.g. `FBS-PRO-48213`, so the billing team can match the payment to the company. */
export function newPaymentReference(targetTier: PlanTier): string {
  const code = targetTier === 'professional_plus' ? 'PROPLUS' : targetTier.slice(0, 3).toUpperCase()
  return `FBS-${code}-${Math.floor(10000 + Math.random() * 90000)}`
}

/** The company scanned the QR and paid: record it as pending. The plan does NOT change until the billing team confirms. */
export async function submitUpgradePayment(
  session: SessionUser,
  input: { targetTier: PlanTier; paymentReference: string; receiptReference: string; amountPhp: number; proofImage: string },
): Promise<void> {
  const company = db.companies.find((c) => c.id === session.companyId)
  if (!company) return
  const now = new Date().toISOString()
  company.pendingPlanChange = { ...input, termsAcceptedAt: now, submittedAt: now }
  bump()
}

// ---- FBS Pay billing team (Super Admin) ------------------------------------------------------------------------

export async function getPendingPlanChanges() {
  return db.companies.filter((c) => c.pendingPlanChange).map((c) => ({ company: c, change: c.pendingPlanChange! }))
}

export async function confirmPlanChange(companyId: string): Promise<void> {
  const company = db.companies.find((c) => c.id === companyId)
  if (!company?.pendingPlanChange) return
  company.planTier = company.pendingPlanChange.targetTier
  company.pendingPlanChange = undefined
  bump()
}

export async function rejectPlanChange(companyId: string): Promise<void> {
  const company = db.companies.find((c) => c.id === companyId)
  if (company) company.pendingPlanChange = undefined
  bump()
}
