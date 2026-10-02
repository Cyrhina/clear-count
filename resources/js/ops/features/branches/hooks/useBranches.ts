import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { getBranches, getBranchSummaries, type BranchSummary } from '@ops/lib/services/branchService'
import type { Branch } from '@ops/types/domain'

export function useBranches() {
  const { user } = useSession()
  const [branches, setBranches] = useState<Branch[] | null>(null)

  const refetch = useCallback(() => {
    getBranches(user).then(setBranches)
  }, [user])

  useEffect(() => {
    setBranches(null)
    refetch()
  }, [refetch])

  return { branches: branches ?? [], isLoading: branches === null, refetch }
}

export function useBranchSummaries() {
  const { user } = useSession()
  const [summaries, setSummaries] = useState<BranchSummary[] | null>(null)

  const refetch = useCallback(() => {
    getBranchSummaries(user).then(setSummaries)
  }, [user])

  useEffect(() => {
    setSummaries(null)
    refetch()
  }, [refetch])

  return { summaries: summaries ?? [], isLoading: summaries === null, refetch }
}
