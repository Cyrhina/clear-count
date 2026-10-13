import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchWfh } from '@ops/lib/services/wfhArrangementService'

export const WFH_KEY = 'wfh'

/** The WFH arrangements the user can see and the company's monthly limit. */
export function useWfh() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: [WFH_KEY], queryFn: fetchWfh })
  return {
    arrangements: query.data?.arrangements ?? null,
    monthlyLimit: query.data?.monthlyLimit ?? 0,
    refetch: () => void queryClient.invalidateQueries({ queryKey: [WFH_KEY] }),
  }
}
