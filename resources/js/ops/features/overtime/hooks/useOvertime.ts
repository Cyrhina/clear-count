import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { getOvertimeRecords, getOvertimeSummary, type OvertimeSummary } from '@ops/lib/services/overtimeService'
import type { OvertimeRecord } from '@ops/types/domain'

export function useOvertimeRecords() {
  const { user } = useSession()
  const [records, setRecords] = useState<OvertimeRecord[] | null>(null)

  const refetch = useCallback(() => {
    getOvertimeRecords(user).then(setRecords)
  }, [user])

  useEffect(() => {
    setRecords(null)
    refetch()
  }, [refetch])

  return { records: records ?? [], isLoading: records === null, refetch }
}

export function useOvertimeSummary(refreshKey: number) {
  const { user } = useSession()
  const [summary, setSummary] = useState<OvertimeSummary | null>(null)

  useEffect(() => {
    getOvertimeSummary(user).then(setSummary)
  }, [user, refreshKey])

  return { summary, isLoading: summary === null }
}
