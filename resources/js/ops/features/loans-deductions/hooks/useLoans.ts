import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchLoans } from '@ops/lib/services/loanApiService'

export function useLoans() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['benefits-deductions', 'loans'], queryFn: fetchLoans })
  return { loans: query.data ?? [], isLoading: query.isPending, refetch: () => void queryClient.invalidateQueries({ queryKey: ['benefits-deductions'] }) }
}
