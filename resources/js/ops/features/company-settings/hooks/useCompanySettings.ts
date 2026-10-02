import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { getCompany, getHolidays, getSchedules } from '@ops/lib/services/companyService'
import { getComplianceDeadlines } from '@ops/lib/services/complianceService'
import { getEmployees } from '@ops/lib/services/employeeService'
import {
  getCompensationTypes,
  getDeductionConfigs,
  getEarningConfigs,
  getPayrollGroups,
  getPayrollRules,
} from '@ops/lib/services/payrollSettingsService'
import type {
  Company,
  ComplianceDeadline,
  CompensationType,
  DeductionConfig,
  EarningConfig,
  Employee,
  Holiday,
  PayrollGroup,
  PayrollRules,
  Schedule,
} from '@ops/types/domain'

export function useCompanySettings() {
  const { user } = useSession()
  const [company, setCompany] = useState<Company | null | undefined>(undefined)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [payrollGroups, setPayrollGroups] = useState<PayrollGroup[]>([])
  const [compensationTypes, setCompensationTypes] = useState<CompensationType[]>([])
  const [earningConfigs, setEarningConfigs] = useState<EarningConfig[]>([])
  const [deductionConfigs, setDeductionConfigs] = useState<DeductionConfig[]>([])
  const [payrollRules, setPayrollRules] = useState<PayrollRules | undefined>(undefined)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [complianceDeadlines, setComplianceDeadlines] = useState<ComplianceDeadline[]>([])

  const refetch = useCallback(() => {
    getCompany(user).then((result) => setCompany(result ?? null))
    getSchedules(user).then(setSchedules)
    getHolidays(user).then(setHolidays)
    getPayrollGroups(user).then(setPayrollGroups)
    getCompensationTypes(user).then(setCompensationTypes)
    getEarningConfigs(user).then(setEarningConfigs)
    getDeductionConfigs(user).then(setDeductionConfigs)
    getPayrollRules(user).then(setPayrollRules)
    getEmployees(user).then(setEmployees)
    getComplianceDeadlines(user).then(setComplianceDeadlines)
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    company,
    schedules,
    holidays,
    payrollGroups,
    compensationTypes,
    earningConfigs,
    deductionConfigs,
    payrollRules,
    employees,
    complianceDeadlines,
    isLoading: company === undefined,
    refetch,
  }
}
