import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchOvertime, fetchOvertimeRates, summarizeOvertime } from '@ops/lib/services/overtimeApiService'
import type { Employee, OvertimeRecord } from '@ops/types/domain'

export const OVERTIME_KEY = 'overtime'

export function useOvertimeRecords() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: [OVERTIME_KEY], queryFn: fetchOvertime })
  return { records: query.data ?? [], isLoading: query.isPending, refetch: () => void queryClient.invalidateQueries({ queryKey: [OVERTIME_KEY] }) }
}

/** The rates a request can be filed under (what the Type dropdown lists). */
export function useOvertimeRates() {
  const query = useQuery({ queryKey: [OVERTIME_KEY, 'rates'], queryFn: fetchOvertimeRates })
  return { rates: query.data ?? [] }
}

/** The metric cards, worked out from the records already loaded. */
export function useOvertimeSummary(records: OvertimeRecord[], employees: Employee[], isLoading: boolean) {
  const summary = useMemo(() => (isLoading ? null : summarizeOvertime(records, employees)), [records, employees, isLoading])
  return { summary, isLoading: summary === null }
}
