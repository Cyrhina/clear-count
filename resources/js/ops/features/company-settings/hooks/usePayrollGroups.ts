import { useQuery } from '@tanstack/react-query'
import { getCompensationTypes } from '@ops/lib/services/payrollConfigService'
import { getPayrollGroups } from '@ops/lib/services/payrollGroupService'
import { fetchPayrollEmployees } from '@ops/lib/services/payrollApiService'
import type { PayrollGroup } from '@ops/types/domain'

/**
 * The company's Payroll Groups and Compensation Types, in the shape the run, payslip and report screens look them up with. A group's members
 * come from the employees' own `payrollGroupId`. The payroll role cannot open the employee records, so the members are read from the
 * payroll employee directory.
 */
export function usePayrollGroups() {
  const groups = useQuery({
    queryKey: ['payroll-settings', 'groups', 'as-domain'],
    queryFn: async (): Promise<PayrollGroup[]> => {
      const [list, employees] = await Promise.all([getPayrollGroups(), fetchPayrollEmployees()])

      return list.map((g) => ({
        id: g.id,
        companyId: '',
        name: g.name,
        description: g.description,
        status: g.status,
        frequency: g.frequencyKey === 'bi_weekly' ? 'biweekly' : g.frequencyKey,
        cutoffSchedule: g.cutoffDisplay,
        payDates: g.payDatesDisplay,
        compensationTypeId: g.compensationTypeId,
        workScheduleId: g.workScheduleId,
        effectiveDate: g.effectiveDate,
        employeeIds: employees.filter((e) => e.payrollGroupId === g.id).map((e) => e.id),
        deductionSchedule: g.deductionSchedule,
      }))
    },
  })
  const compensationTypes = useQuery({
    queryKey: ['payroll-settings', 'compensation-types', 'as-domain'],
    queryFn: async () => (await getCompensationTypes()).map((c) => ({ companyId: '', ...c })),
  })

  return { groups: groups.data ?? [], compensationTypes: compensationTypes.data ?? [], refetch: () => void groups.refetch() }
}
