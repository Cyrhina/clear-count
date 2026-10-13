import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import type { AppNotification } from '@ops/lib/services/notificationService'

/* Stored notifications (a request waiting for you, or the decision on yours) and the approvals inbox. */

type ApiNotification = { id: string; message: string; tone: AppNotification['tone']; link: string; tab?: string; highlightId?: string | number; read: boolean; createdAt: string }

export async function fetchStoredNotifications(): Promise<{ items: AppNotification[]; unread: number }> {
  const res = await api.get<{ data: unknown[]; unread: number }>('/api/notifications')
  const items = camelizeKeys<ApiNotification[]>(res.data).map((n) => ({
    id: n.id,
    read: n.read,
    message: n.message,
    tone: n.tone,
    timestamp: n.createdAt,
    link: n.link,
    tab: n.tab,
    highlightId: n.highlightId === undefined ? undefined : String(n.highlightId),
  }))
  return { items, unread: res.unread }
}

export const markNotificationRead = (id: string) => api.post(`/api/notifications/${id}/read`, {})
export const markAllNotificationsRead = () => api.post('/api/notifications/read-all', {})

export interface PendingApprovals {
  type: string
  label: string
  link: string
  pending: number
}

/** What waits for the signed-in user, per type of request they may approve. */
export async function fetchApprovalSummary(): Promise<{ rows: PendingApprovals[]; total: number }> {
  const res = await api.get<{ data: PendingApprovals[]; total: number }>('/api/approvals/summary')
  return { rows: res.data, total: res.total }
}
