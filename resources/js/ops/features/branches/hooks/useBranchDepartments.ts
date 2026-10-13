// mock: remove in P3. Still read by the mock employee import; the Branches page uses useDepartments in useBranches.ts.
import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { getBranchDepartments } from '@ops/lib/services/branchDepartmentService'
import type { BranchDepartment } from '@ops/types/domain'

/** Every department configured across the company's branches. */
export function useBranchDepartments() {
  const { user } = useSession()
  const [departments, setDepartments] = useState<BranchDepartment[] | null>(null)

  const refetch = useCallback(() => {
    getBranchDepartments(user).then(setDepartments)
  }, [user])

  useEffect(() => {
    setDepartments(null)
    refetch()
  }, [refetch])

  return { departments: departments ?? [], isLoading: departments === null, refetch }
}
