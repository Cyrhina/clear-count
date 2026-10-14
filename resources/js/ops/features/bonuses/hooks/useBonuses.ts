import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBonusPayslips, fetchBonuses } from '@ops/lib/services/bonusApiService'

export function useBonuses() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['bonuses'], queryFn: fetchBonuses })
  return { bonuses: query.data ?? [], isLoading: query.isPending, refetch: () => void queryClient.invalidateQueries({ queryKey: ['bonuses'] }) }
}

/** The separate payslips of an approved bonus that has its own payslip; nothing is fetched for any other bonus. */
export function useBonusPayslips(bonusId: string | undefined, enabled: boolean) {
  const query = useQuery({ queryKey: ['bonuses', 'payslips', bonusId], queryFn: () => fetchBonusPayslips(bonusId!), enabled: enabled && !!bonusId })
  return { rows: query.data ?? [], isLoading: query.isPending && enabled && !!bonusId }
}
