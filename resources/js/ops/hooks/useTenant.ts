import { usePage } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useBranches } from '@ops/features/branches/hooks/useBranches'
import { useSession } from '@ops/hooks/useSession'
import { getOwnCompany } from '@ops/lib/services/companyInfoService'
import { db } from '@ops/mock-data'

/**
 * The signed-in company (from the API) and its branches. The branches are the real ones, because the employees, reports and
 * filters carry real branch ids; `activeBranch` is the session's own branch from the mock until P17. The super admin has no company.
 */
export function useTenant() {
  const { user } = useSession()
  const hasCompany = !!usePage<{ auth: { company?: unknown } }>().props.auth.company
  const { branches: records } = useBranches()
  const branches = useMemo(() => records.map((b) => ({ ...b, companyId: user.companyId })), [records, user.companyId])

  const { data: company } = useQuery({ queryKey: ['company'], queryFn: getOwnCompany, enabled: hasCompany, staleTime: 5 * 60_000 })
  const activeBranch = useMemo(() => db.branches.find((b) => b.companyId === user.companyId && b.id === user.branchId), [user.companyId, user.branchId])

  return { company, branches, activeBranch }
}
