import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { getEmployee } from '@ops/lib/services/employeeService'
import type { Employee } from '@ops/types/domain'

/** Resolves the Employee record linked to the current session (any role that has an employeeId). */
export function useSelfEmployee() {
  const { user } = useSession()
  const [employee, setEmployee] = useState<Employee | null | undefined>(undefined)

  const refetch = useCallback(() => {
    if (!user.employeeId) {
      setEmployee(null)
      return
    }
    getEmployee(user, user.employeeId).then((result) => setEmployee(result ?? null))
  }, [user])

  useEffect(() => {
    setEmployee(undefined)
    refetch()
  }, [refetch])

  return { employee, isLoading: employee === undefined, refetch }
}
