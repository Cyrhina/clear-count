import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { getSubscriptionUsage, type SubscriptionUsage } from '@ops/lib/services/subscriptionService'

export function useSubscriptionUsage() {
  const { user } = useSession()
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null)

  const refetch = useCallback(() => {
    getSubscriptionUsage(user).then(setUsage)
  }, [user])

  useEffect(() => {
    setUsage(null)
    refetch()
  }, [refetch])

  return { usage, isLoading: usage === null, refetch }
}
