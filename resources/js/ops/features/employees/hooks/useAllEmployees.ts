import { useQuery, useQueryClient } from '@tanstack/react-query'
import { EMPLOYEES_KEY } from '@ops/features/employees/hooks/useEmployeeRecords'
import { fetchAllEmployees } from '@ops/lib/services/employeeService'

/** Every employee the user can see, for pickers and screens that filter on the client. The key sits under EMPLOYEES_KEY, so an employee save refreshes it. */
export function useAllEmployees() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: [EMPLOYEES_KEY, 'all'], queryFn: () => fetchAllEmployees() })
  return { employees: query.data ?? [], isLoading: query.isPending, refetch: () => void queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY, 'all'] }) }
}
