import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@ops/hooks/useSession'
import { fetchMe } from '@ops/lib/services/employeeService'

export const ME_KEY = 'me'

/** The employee record linked to the signed-in account (any role that has an employee), from `GET api/me`. `employee` is null when there is none. */
export function useSelfEmployee() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  const linked = !!user.employeeId
  const query = useQuery({ queryKey: [ME_KEY, user.id], queryFn: fetchMe, enabled: linked })

  return {
    employee: linked ? (query.data ?? null) : null,
    isLoading: linked && query.isPending,
    refetch: () => void queryClient.invalidateQueries({ queryKey: [ME_KEY] }),
  }
}
