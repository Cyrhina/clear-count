import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import {
  getAdminDashboardOverview,
  getDashboardStats,
  getHeadcountTrend,
  getPendingRequestsSummary,
  getPayrollDashboard,
  getWorkforceCharts,
} from '@ops/lib/services/dashboardService'
import { fetchManagerDashboard } from '@ops/lib/services/managerApiService'
import { getTaxAlerts, type TaxAlerts } from '@ops/lib/services/taxComplianceService'
import type { AdminDashboardOverview, DashboardStats, PayrollDashboard, PendingRequestsSummary, WorkforceCharts } from '@ops/lib/services/dashboardService'

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

export function useWorkforceCharts() {
  const { user } = useSession()
  const [charts, setCharts] = useState<WorkforceCharts | null>(null)

  useEffect(() => {
    let cancelled = false
    setCharts(null)
    getWorkforceCharts(user).then((result) => {
      if (!cancelled) setCharts(result)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  return { charts, isLoading: charts === null }
}

export function usePayrollDashboard() {
  const { user } = useSession()
  const [data, setData] = useState<PayrollDashboard | null>(null)

  useEffect(() => {
    let cancelled = false
    setData(null)
    getPayrollDashboard(user).then((result) => {
      if (!cancelled) setData(result)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  return { data, isLoading: data === null }
}

export function useManagerDashboard() {
  const { user } = useSession()
  const query = useQuery({ queryKey: ['manager', 'dashboard', user.id], queryFn: fetchManagerDashboard })
  return { data: query.data ?? null, isLoading: query.isPending }
}
