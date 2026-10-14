import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPayrollEmployees, fetchPayrollInputs, fetchPayrollLines, fetchPayrollPeriods } from '@ops/lib/services/payrollApiService'

export function usePayrollPeriods() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['payroll', 'periods'], queryFn: fetchPayrollPeriods })
  return { periods: query.data ?? [], isLoading: query.isPending, refetch: () => void queryClient.invalidateQueries({ queryKey: ['payroll'] }) }
}

export function usePayrollLines(periodId: string | undefined) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['payroll', 'lines', periodId], queryFn: () => fetchPayrollLines(periodId!), enabled: !!periodId })
  return { lines: query.data ?? [], isLoading: query.isPending && !!periodId, refetch: () => void queryClient.invalidateQueries({ queryKey: ['payroll'] }) }
}

/** The records a run reads for a period: `undefined` while loading, `null` when they cannot be read. */
export function usePayrollInputs(periodId: string | undefined) {
  const query = useQuery({ queryKey: ['payroll', 'inputs', periodId], queryFn: () => fetchPayrollInputs(periodId!), enabled: !!periodId })
  return query.isError ? null : query.data
}

/** The employees the runs are about, for names and filters on the run screens. */
export function usePayrollEmployees() {
  const query = useQuery({ queryKey: ['payroll', 'employees'], queryFn: fetchPayrollEmployees })
  return { employees: query.data ?? [], isLoading: query.isPending }
}
