import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { getLoans } from '@ops/lib/services/loanService'
import type { LoanRecord } from '@ops/types/domain'

export function useLoans() {
  const { user } = useSession()
  const [loans, setLoans] = useState<LoanRecord[] | null>(null)

  const refetch = useCallback(() => {
    getLoans(user).then(setLoans)
  }, [user])

  useEffect(() => {
    setLoans(null)
    refetch()
  }, [refetch])

  return { loans: loans ?? [], isLoading: loans === null, refetch }
}
