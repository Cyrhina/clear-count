import { useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from '@inertiajs/react'
import { usePermission } from '@ops/hooks/usePermission'
import { getSubscriptionUsage } from '@ops/lib/services/subscriptionService'

/** The company's plan, usage and pending upgrade payment. Only a user who can manage the subscription may read it. */
export function useSubscriptionUsage() {
  const canManage = usePermission('subscription.manage')
  const query = useQuery({ queryKey: ['subscription'], queryFn: getSubscriptionUsage, enabled: canManage })
  return { usage: query.data ?? null, isLoading: canManage && query.isPending, refetch: () => void query.refetch() }
}

/** After a plan change: reload the subscription and the shared page props, so the sidebar and the module gates follow the new plan. */
export function useRefreshPlan() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['subscription'] })
    router.reload({ only: ['auth'] })
  }
}
