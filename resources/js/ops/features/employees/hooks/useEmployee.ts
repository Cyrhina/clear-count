import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { getEmployee } from '@ops/lib/services/employeeService'
import type { Employee } from '@ops/types/domain'

export function useEmployee(employeeId: string | undefined) {
  const { user } = useSession()
  const [employee, setEmployee] = useState<Employee | null | undefined>(undefined)

  const refetch = useCallback(() => {
    if (!employeeId) return
    getEmployee(user, employeeId).then((result) => setEmployee(result ?? null))
  }, [user, employeeId])

  useEffect(() => {
    setEmployee(undefined)
    refetch()
  }, [refetch])

  return { employee, isLoading: employee === undefined, refetch }
}
