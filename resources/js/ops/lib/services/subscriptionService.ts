import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import type { PlanTier } from '@ops/types/domain'

/** The company's subscription (`/api/subscription`) and the super admin's platform screens (`/api/platform/*`). */

export type PaymentStatus = 'pending' | 'approved' | 'rejected'

export interface SubscriptionPayment {
  id: string
  companyId: string
  fromTier: PlanTier
  toTier: PlanTier
  amount: number
  /** Code the company puts in the payment note, so the billing team can match the payment. */
  paymentReference: string
  /** The transaction number from the company's own receipt. */
  receiptReference: string
  status: PaymentStatus
  submittedAt: string
  decidedAt?: string
  decisionRemarks?: string
  /** The receipt photo (private: only the paying company and the super admin can open it). */
  proofUrl: string
  /** Only on the super admin's list. */
  companyName?: string
}

export interface SubscriptionUsage {
  planTier: PlanTier
  employeeCount: number
  userCount: number
  billingInterval: 'monthly'
  nextRenewalDate?: string
  monthlyPrice?: number
  pendingPayment?: SubscriptionPayment
}

export async function getSubscriptionUsage(): Promise<SubscriptionUsage> {
  const res = await api.get<{ data: unknown }>('/api/subscription')
  return camelizeKeys<SubscriptionUsage>(res.data)
}

/** Downgrades apply right away (the server refuses when the company has more admin accounts than the smaller plan allows). */
export async function downgradePlan(planTier: PlanTier): Promise<void> {
  await api.post('/api/subscription/downgrade', { plan_tier: planTier })
}

/** What the company pays each month on `targetTier`: the plan's base price plus any employees above its limit (null = quoted by hand). */
export async function getUpgradeAmount(targetTier: PlanTier): Promise<number | null> {
  const res = await api.get<{ data: { amount: number | null } }>(`/api/subscription/quote/${targetTier}`)
  return res.data.amount
}

/** A code for the payment note, e.g. `FBS-PRO-48213`. The server checks the format and that it was not used before. */
export function newPaymentReference(targetTier: PlanTier): string {
  const code = targetTier === 'professional_plus' ? 'PROPLUS' : targetTier.slice(0, 3).toUpperCase()
  return `FBS-${code}-${Math.floor(10000 + Math.random() * 90000)}`
}

/** The company paid: records it as pending. The plan does NOT change until the super admin confirms. The amount is worked out by the server. */
export async function submitUpgradePayment(input: { targetTier: PlanTier; paymentReference: string; receiptReference: string; proof: File }): Promise<SubscriptionPayment> {
  const form = new FormData()
  form.append('to_tier', input.targetTier)
  form.append('payment_reference', input.paymentReference)
  form.append('receipt_reference', input.receiptReference)
  form.append('proof', input.proof)
  form.append('terms_accepted', '1')
  const res = await api.upload<{ data: unknown }>('/api/subscription/payments', form)
  return camelizeKeys<SubscriptionPayment>(res.data)
}

// ---- FBS Pay billing team (Super Admin) ------------------------------------------------------------------------

export interface PlatformCompany {
  id: string
  name: string
  planTier: PlanTier
  status: 'active' | 'suspended'
  payrollFrequency: string
  planRenewsOn?: string
  createdAt: string
  employees: number
  /** Only on the full list. */
  users?: number
  hasPendingPayment?: boolean
  admin?: { name: string; email: string; invitePending: boolean }
}

export async function getPlatformCompanies(): Promise<PlatformCompany[]> {
  const res = await api.get<{ data: unknown }>('/api/platform/companies')
  return camelizeKeys<PlatformCompany[]>(res.data)
}

export interface NewCompanyInput {
  name: string
  planTier: PlanTier
  adminFirstName: string
  adminLastName: string
  adminEmail: string
}

export async function createCompany(input: NewCompanyInput): Promise<void> {
  await api.post('/api/platform/companies', {
    name: input.name,
    plan_tier: input.planTier,
    admin_first_name: input.adminFirstName,
    admin_last_name: input.adminLastName,
    admin_email: input.adminEmail,
  })
}

export async function setCompanyStatus(companyId: string, status: 'active' | 'suspended'): Promise<void> {
  await api.patch(`/api/platform/companies/${companyId}/status`, { status })
}

export async function setCompanyPlan(companyId: string, planTier: PlanTier): Promise<void> {
  await api.patch(`/api/platform/companies/${companyId}/plan`, { plan_tier: planTier })
}

export async function getPlatformPayments(): Promise<SubscriptionPayment[]> {
  const res = await api.get<{ data: unknown }>('/api/platform/payments')
  return camelizeKeys<SubscriptionPayment[]>(res.data)
}

export async function decidePayment(paymentId: string, decision: 'approved' | 'rejected', remarks?: string): Promise<void> {
  await api.post(`/api/platform/payments/${paymentId}/decision`, { decision, remarks })
}

export interface PlatformDashboard {
  totals: { users: number; activeUsers: number; companies: number; employees: number; activeEmployees: number; pendingPayments: number }
  usersByRole: { role: string; label: string; count: number }[]
  employeesByCompany: { id: string; name: string; count: number }[]
  recentCompanies: PlatformCompany[]
  activity: { id: string; title: string; actor: string; company?: string; createdAt: string }[]
}

export async function getPlatformDashboard(): Promise<PlatformDashboard> {
  const res = await api.get<{ data: unknown }>('/api/platform/dashboard')
  return camelizeKeys<PlatformDashboard>(res.data)
}
