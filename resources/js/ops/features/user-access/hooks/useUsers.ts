import { useQuery } from '@tanstack/react-query'
import { apiErrorMessage } from '@ops/lib/api/http'
import { listAccessUsers, listPermissionRoles } from '@ops/lib/services/userAccessService'

/** Reference hook for API-backed modules: a `useQuery` per list, keyed by module name, mapped to `{ data, isLoading, error, refetch }`. */

/** The company's users from the API. `error` is set (and `users` empty) if the request failed. */
export function useAccessUsers() {
  const query = useQuery({ queryKey: ['users'], queryFn: listAccessUsers })
  return {
    users: query.data ?? [],
    isLoading: query.isPending,
    error: query.error ? apiErrorMessage(query.error) : null,
    refetch: () => void query.refetch(),
  }
}

export function usePermissionRoles() {
  const query = useQuery({ queryKey: ['permission-map'], queryFn: listPermissionRoles })
  return { roles: query.data ?? [], isLoading: query.isPending, error: query.error ? apiErrorMessage(query.error) : null }
}
