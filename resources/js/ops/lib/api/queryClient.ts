import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@ops/lib/api/http'

/**
 * One cache for the whole ops app. Query keys start with the module name (`['users']`, `['employees', filters]`)
 * so a mutation can invalidate its whole module with `queryClient.invalidateQueries({ queryKey: ['users'] })`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // A 4xx answer (validation, forbidden, not found) will not change on a retry; only network and 5xx errors get one.
      retry: (failures, error) => failures < 1 && !(error instanceof ApiError && error.status < 500),
    },
  },
})
