import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { getEmployees } from '@ops/lib/services/employeeService'
import type { Employee } from '@ops/types/domain'

export function useEmployees() {
  const { user } = useSession()
  const [employees, setEmployees] = useState<Employee[] | null>(null)

  const refetch = useCallback(() => {
    getEmployees(user).then(setEmployees)
  }, [user])

  useEffect(() => {
    setEmployees(null)
    refetch()
  }, [refetch])

  return { employees: employees ?? [], isLoading: employees === null, refetch }
}
