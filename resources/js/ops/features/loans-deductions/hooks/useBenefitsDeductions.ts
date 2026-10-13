import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { fetchBenefitPlans, fetchDeductionPlans, fetchEmployeeBenefits, fetchEmployeeDeductions } from '@ops/lib/services/benefitsApiService'
import { getLoanTypes } from '@ops/lib/services/loanTypeService'
import { getDeductionConfigs } from '@ops/lib/services/payrollSettingsService'
import type { BenefitCategory, DeductionConfig, LoanTypeConfig } from '@ops/types/domain'

/** Key of benefits and deductions; a save invalidates plans and enrolments together. */
export const BENEFITS_KEY = 'benefits-deductions'

function useInvalidate() {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: [BENEFITS_KEY] })
}

export function useEmployeeBenefits() {
  const refetch = useInvalidate()
  const query = useQuery({ queryKey: [BENEFITS_KEY, 'benefits'], queryFn: fetchEmployeeBenefits })
  return { benefits: query.data ?? [], isLoading: query.isPending, refetch }
}

export function useBenefitPlans(category: BenefitCategory) {
  const refetch = useInvalidate()
  const query = useQuery({ queryKey: [BENEFITS_KEY, 'benefit-plans', category], queryFn: () => fetchBenefitPlans(category) })
  return { plans: query.data ?? [], isLoading: query.isPending, refetch }
}

export function useDeductionPlans() {
  const refetch = useInvalidate()
  const query = useQuery({ queryKey: [BENEFITS_KEY, 'deduction-plans'], queryFn: fetchDeductionPlans })
  return { plans: query.data ?? [], isLoading: query.isPending, refetch }
}

export function useEmployeeDeductions() {
  const refetch = useInvalidate()
  const query = useQuery({ queryKey: [BENEFITS_KEY, 'deductions'], queryFn: fetchEmployeeDeductions })
  return { deductions: query.data ?? [], isLoading: query.isPending, refetch }
}

/** The company's Payroll Settings deduction entries (how each loan type / deduction is split across pay runs). */
export function useDeductionConfigs() {
  const { user } = useSession()
  const [configs, setConfigs] = useState<DeductionConfig[]>([])
  useEffect(() => {
    getDeductionConfigs(user).then(setConfigs)
  }, [user])
  return configs
}

/** The company's loan types — the single list behind the Loan Types tab, the Add Loan modal, loan cards and schedules. */
export function useLoanTypes() {
  const { user } = useSession()
  const [types, setTypes] = useState<LoanTypeConfig[]>([])

  const refetch = useCallback(() => {
    getLoanTypes(user).then(setTypes)
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  /** A loan type's label by key, falling back to the loan's own label for types that no longer exist. */
  const labelFor = useCallback((key: string, fallback?: string) => types.find((t) => t.key === key)?.label ?? fallback ?? key, [types])

  return { types, labelFor, refetch }
}
