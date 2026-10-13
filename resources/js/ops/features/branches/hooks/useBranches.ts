import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBranchDepartments } from '@ops/lib/services/branchDepartmentService'
import { fetchBranches, getBranchSummaries } from '@ops/lib/services/branchService'

/** Query key of the Branches page; a save invalidates the whole module (branches, departments, summaries). */
export const BRANCHES_KEY = 'branches'

export function useBranches() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: [BRANCHES_KEY, 'list'], queryFn: fetchBranches })
  return { branches: query.data ?? [], isLoading: query.isPending, refetch: () => void queryClient.invalidateQueries({ queryKey: [BRANCHES_KEY] }) }
}

export function useDepartments() {
  const query = useQuery({ queryKey: [BRANCHES_KEY, 'departments'], queryFn: fetchBranchDepartments })
  return { departments: query.data ?? [], isLoading: query.isPending }
}

export function useBranchSummaries() {
  const query = useQuery({ queryKey: [BRANCHES_KEY, 'summaries'], queryFn: getBranchSummaries })
  return { summaries: query.data ?? [], isLoading: query.isPending }
}
