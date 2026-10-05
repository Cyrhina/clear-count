import { useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import {
  getAdminDashboardOverview,
  getDashboardStats,
  getHeadcountTrend,
  getPendingRequestsSummary,
} from '@ops/lib/services/dashboardService'
import { getTaxAlerts, type TaxAlerts } from '@ops/lib/services/taxComplianceService'
import type { AdminDashboardOverview, DashboardStats, PendingRequestsSummary } from '@ops/lib/services/dashboardService'

export function useDashboardData() {
  const { user } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    let cancelled = false
    getDashboardStats(user).then((result) => {
      if (!cancelled) setStats(result)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const trend = getHeadcountTrend(user)

  return { stats, trend, isLoading: stats === null }
}

export function useAdminDashboardOverview() {
  const { user } = useSession()
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null)

  useEffect(() => {
    let cancelled = false
    setOverview(null)
    getAdminDashboardOverview(user).then((result) => {
      if (!cancelled) setOverview(result)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  return { overview, isLoading: overview === null }
}

export function usePendingRequestsSummary() {
  const { user } = useSession()
  const [summary, setSummary] = useState<PendingRequestsSummary | null>(null)

  useEffect(() => {
    let cancelled = false
    setSummary(null)
    getPendingRequestsSummary(user).then((result) => {
      if (!cancelled) setSummary(result)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  return { summary, isLoading: summary === null }
}

export function useTaxAlerts() {
  const { user } = useSession()
  const [alerts, setAlerts] = useState<TaxAlerts | null>(null)

  useEffect(() => {
    let cancelled = false
    setAlerts(null)
    getTaxAlerts(user).then((result) => {
      if (!cancelled) setAlerts(result)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  return { alerts, isLoading: alerts === null }
}
