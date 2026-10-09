import { useCallback, useEffect, useState } from 'react'
import { apiErrorMessage } from '@ops/lib/api/http'
import { listAccessUsers, listPermissionRoles, type AccessUser, type PermissionRole } from '@ops/lib/services/userAccessService'

/** The company's users from the API. `error` is set (and `users` empty) if the request failed. */
export function useAccessUsers() {
  const [users, setUsers] = useState<AccessUser[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => {
    listAccessUsers()
      .then((list) => {
        setUsers(list)
        setError(null)
      })
      .catch((e) => {
        setUsers([])
        setError(apiErrorMessage(e))
      })
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { users: users ?? [], isLoading: users === null, error, refetch }
}

export function usePermissionRoles() {
  const [roles, setRoles] = useState<PermissionRole[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listPermissionRoles()
      .then(setRoles)
      .catch((e) => {
        setRoles([])
        setError(apiErrorMessage(e))
      })
  }, [])

  return { roles: roles ?? [], isLoading: roles === null, error }
}
