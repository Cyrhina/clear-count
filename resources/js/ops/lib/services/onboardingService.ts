import { api } from '@ops/lib/api/http'

export type OnboardingStepId = 'company_info' | 'branches' | 'payroll_groups' | 'work_schedule' | 'holidays' | 'statutory' | 'employees' | 'users'

export interface Onboarding {
  steps: Record<OnboardingStepId, boolean>
  readyForPayroll: boolean
}

/** The setup checklist, computed by the server from the company's data (`/api/onboarding`). */
export async function getOnboarding(): Promise<Onboarding> {
  const res = await api.get<{ data: { steps: Onboarding['steps']; ready_for_payroll: boolean } }>('/api/onboarding')
  return { steps: res.data.steps, readyForPayroll: res.data.ready_for_payroll }
}
