import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import type { EmployeeListParams } from '@ops/features/employees/types'
import { fetchEmployee, fetchEmployees } from '@ops/lib/services/employeeService'

/** Query key of the Employees module; a save invalidates the list and every open profile. */
export const EMPLOYEES_KEY = 'employees'

/** One page of the employee list from the API, filtered and sorted by the server. */
export function useEmployeeList(params: EmployeeListParams) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: [EMPLOYEES_KEY, 'list', params], queryFn: () => fetchEmployees(params), placeholderData: keepPreviousData })

  return {
    employees: query.data?.employees ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? 1,
    lastPage: query.data?.lastPage ?? 1,
    isLoading: query.isPending,
    error: query.error,
    refetch: () => void queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  }
}

/** One employee with the full profile. A missing or foreign id comes back as `employee: null`. */
export function useEmployeeRecord(id: string | undefined) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: [EMPLOYEES_KEY, 'record', id], queryFn: () => fetchEmployee(id!), enabled: Boolean(id), retry: false })

  return {
    employee: query.data ?? (query.isError ? null : undefined),
    isLoading: query.isPending && Boolean(id),
    refetch: () => void queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  }
}
