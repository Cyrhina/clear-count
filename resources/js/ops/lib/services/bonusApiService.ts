import { camelizeKeys, snakeizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import type { BonusApprovalStatus, BonusFrequency, BonusIncentive, BonusPayoutMode, BonusTargetType, BonusType } from '@ops/types/domain'

/*
 * Bonuses and incentives on the API: draft, submit for approval, decide. Payroll pays the approved ones by period label (P10).
 * The mock `bonusService.getBonuses` stays for the payroll period page until then.
 */

type ApiBonus = Omit<BonusIncentive, 'companyId' | 'decidedBy'> & { decider?: { name: string } }

const toBonus = ({ decider, ...b }: ApiBonus): BonusIncentive => ({ ...b, companyId: '', ...(decider ? { decidedBy: decider.name } : {}) })

export async function fetchBonuses(): Promise<BonusIncentive[]> {
  const res = await api.get<{ data: unknown[] }>('/api/bonuses')
  return camelizeKeys<ApiBonus[]>(res.data).map(toBonus)
}

export interface CreateBonusInput {
  name: string
  bonusType: BonusType
  targetType: BonusTargetType
  targetEmployeeId?: string
  targetEmployeeIds?: string[]
  targetDepartment?: string
  amount: number
  periodLabel: string
  taxable: boolean
  frequency: BonusFrequency
  payoutMode: BonusPayoutMode
  notes?: string
  /** A new bonus starts as a draft or goes straight to approval. */
  status: Extract<BonusApprovalStatus, 'draft' | 'pending'>
}

const body = (input: CreateBonusInput) => ({ ...snakeizeKeys<Record<string, unknown>>(input), notes: input.notes || null })

export const createBonus = (input: CreateBonusInput) => api.post('/api/bonuses', body(input))
/** Edits a bonus that has not been decided (draft or pending); a decided one is locked. */
export const updateBonus = (id: string, input: CreateBonusInput) => api.put(`/api/bonuses/${id}`, body(input))
export const submitBonusForApproval = (id: string) => api.post(`/api/bonuses/${id}/submit`, {})
export const decideBonus = (id: string, decision: Extract<BonusApprovalStatus, 'approved' | 'rejected'>) => api.post(`/api/bonuses/${id}/decision`, { decision })
