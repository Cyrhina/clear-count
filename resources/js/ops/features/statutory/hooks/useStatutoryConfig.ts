import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchStatutoryConfig } from '@ops/lib/services/statutoryApiService'

/** Key of the statutory module; a save invalidates the tables and every preview computed from them. */
export const STATUTORY_KEY = 'statutory'

export function useStatutoryConfig() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: [STATUTORY_KEY, 'config'], queryFn: fetchStatutoryConfig })
  return { config: query.data, isLoading: query.isPending, refetch: () => void queryClient.invalidateQueries({ queryKey: [STATUTORY_KEY] }) }
}
