import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { usePayrollRatesStore } from '@ops/features/company-settings/payrollRatesStore'
import { getCompanyInfo } from '@ops/lib/services/companyInfoService'
import { getCompensationTypes, getComplianceDeadlines, getDeductionConfigs, getEarningConfigs, getPayrollRates, getPayrollRules, getSchedules } from '@ops/lib/services/payrollConfigService'
import { getPayrollGroups } from '@ops/lib/services/payrollGroupService'
import { apiErrorMessage } from '@ops/lib/api/http'

/** Query keys of Company & Payroll Settings; a save invalidates the whole module so every tab sees the change. */
export const COMPANY_SETTINGS_KEY = 'company-settings'

/** Everything the Company & Payroll Settings page shows, from the API. `refetch` reloads all of it. */
export function useCompanySettings() {
  const queryClient = useQueryClient()
  const key = (name: string) => [COMPANY_SETTINGS_KEY, name]

  const company = useQuery({ queryKey: key('company'), queryFn: getCompanyInfo })
  const schedules = useQuery({ queryKey: key('schedules'), queryFn: getSchedules })
  const payrollGroups = useQuery({ queryKey: key('groups'), queryFn: getPayrollGroups })
  const compensationTypes = useQuery({ queryKey: key('compensation-types'), queryFn: getCompensationTypes })
  const earningConfigs = useQuery({ queryKey: key('earnings'), queryFn: getEarningConfigs })
  const deductionConfigs = useQuery({ queryKey: key('deductions'), queryFn: getDeductionConfigs })
  const payrollRules = useQuery({ queryKey: key('rules'), queryFn: getPayrollRules })
  const rates = useQuery({ queryKey: key('rates'), queryFn: getPayrollRates })
  const complianceDeadlines = useQuery({ queryKey: key('deadlines'), queryFn: getComplianceDeadlines })

  // The mock Overtime and ESS overtime screens still read their multipliers from this store, so keep it in step with the saved rates.
  useEffect(() => {
    if (rates.data) usePayrollRatesStore.getState().hydrate(rates.data.overtime, rates.data.holiday)
  }, [rates.data])

  const all = [company, schedules, payrollGroups, compensationTypes, earningConfigs, deductionConfigs, payrollRules, rates, complianceDeadlines]
  const failed = all.find((q) => q.error)

  return {
    company: company.data,
    schedules: schedules.data ?? [],
    payrollGroups: payrollGroups.data ?? [],
    compensationTypes: compensationTypes.data ?? [],
    earningConfigs: earningConfigs.data ?? [],
    deductionConfigs: deductionConfigs.data ?? [],
    payrollRules: payrollRules.data,
    rates: rates.data,
    complianceDeadlines: complianceDeadlines.data ?? [],
    isLoading: all.some((q) => q.isPending),
    error: failed ? apiErrorMessage(failed.error) : null,
    refetch: () => void queryClient.invalidateQueries({ queryKey: [COMPANY_SETTINGS_KEY] }),
  }
}
