import { useMemo } from 'react'
import { useBranches } from '@ops/features/branches/hooks/useBranches'
import { useSession } from '@ops/hooks/useSession'
import { db } from '@ops/mock-data'

/**
 * The company (still the mock: the plan and platform screens move in P15) and its branches. The branches are the real ones from the
 * API, because the employees, reports and filters carry real branch ids; `activeBranch` is the session's own branch from the mock.
 */
export function useTenant() {
  const { user } = useSession()
  const { branches: records } = useBranches()
  const branches = useMemo(() => records.map((b) => ({ ...b, companyId: user.companyId })), [records, user.companyId])

  const company = useMemo(() => db.companies.find((c) => c.id === user.companyId), [user.companyId])
  const activeBranch = useMemo(() => db.branches.find((b) => b.companyId === user.companyId && b.id === user.branchId), [user.companyId, user.branchId])

  return { company, branches, activeBranch }
}
