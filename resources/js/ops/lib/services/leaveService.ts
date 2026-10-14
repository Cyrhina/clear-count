// Read helper for the dashboards: the leave requests the user may see, on the API (the screens use leaveApiService directly).
import { memoRead } from '@ops/lib/api/memo'
import { fetchLeaveRequests } from '@ops/lib/services/leaveApiService'
import type { LeaveRequest, SessionUser } from '@ops/types/domain'

export async function getLeaveRequests(session: SessionUser): Promise<LeaveRequest[]> {
  return (await memoRead(`leave:${session.id}`, fetchLeaveRequests)).slice().sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
}
