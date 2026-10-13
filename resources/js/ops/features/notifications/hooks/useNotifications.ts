import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { fetchStoredNotifications, markAllNotificationsRead, markNotificationRead } from '@ops/lib/services/notificationApiService'
import { getNotifications } from '@ops/lib/services/notificationService'
import type { AppNotification } from '@ops/lib/services/notificationService'

const KEY = 'notifications'
/** The bell checks for new notifications this often. */
const POLL_MS = 60_000

/**
 * Stored notifications from the API (requests waiting for you, decisions on yours; polled) followed by the few reminders that are
 * still worked out on the client (team absences, payroll, payslips, loans).
 */
export function useNotifications() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  const stored = useQuery({ queryKey: [KEY], queryFn: fetchStoredNotifications, refetchInterval: POLL_MS })
  const [derived, setDerived] = useState<AppNotification[]>([])

  useEffect(() => {
    let cancelled = false
    getNotifications(user).then((result) => {
      if (!cancelled) setDerived(result)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const notifications = useMemo(() => [...(stored.data?.items ?? []), ...derived].sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [stored.data, derived])
  // The bell dot: anything stored and unread, or a client-side reminder (those have no read state).
  const unreadCount = (stored.data?.unread ?? 0) + derived.length

  const refresh = () => queryClient.invalidateQueries({ queryKey: [KEY] })
  return {
    notifications,
    unreadCount,
    markRead: (id: string) => markNotificationRead(id).then(refresh),
    markAllRead: () => markAllNotificationsRead().then(refresh),
  }
}
