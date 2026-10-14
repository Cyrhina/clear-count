import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchThirteenthMonthLines, fetchThirteenthMonthRuns } from '@ops/lib/services/thirteenthMonthApiService'

export function useThirteenthMonthRuns() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['thirteenth-month', 'runs'], queryFn: fetchThirteenthMonthRuns })

  return { runs: query.data ?? [], isLoading: query.isPending, refetch: () => void queryClient.invalidateQueries({ queryKey: ['thirteenth-month'] }) }
}

export function useThirteenthMonthLines(runId: string | undefined) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['thirteenth-month', 'lines', runId], queryFn: () => fetchThirteenthMonthLines(runId!), enabled: !!runId })

  return { lines: query.data ?? [], isLoading: query.isPending && !!runId, refetch: () => void queryClient.invalidateQueries({ queryKey: ['thirteenth-month'] }) }
}
