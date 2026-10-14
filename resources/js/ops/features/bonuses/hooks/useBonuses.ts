import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBonuses } from '@ops/lib/services/bonusApiService'

export function useBonuses() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['bonuses'], queryFn: fetchBonuses })
  return { bonuses: query.data ?? [], isLoading: query.isPending, refetch: () => void queryClient.invalidateQueries({ queryKey: ['bonuses'] }) }
}
