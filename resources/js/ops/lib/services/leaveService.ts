// mock: remove in P14 (dashboards). Only getLeaveRequests is left: the dashboards still read it. The Leave page and the ESS leave pages use leaveApiService.
import { getEmployees } from '@ops/lib/services/employeeService'
import { db } from '@ops/mock-data'
import type { LeaveRequest, SessionUser } from '@ops/types/domain'

export async function getLeaveRequests(session: SessionUser): Promise<LeaveRequest[]> {
  const employeeIds = new Set((await getEmployees(session)).map((e) => e.id))
  return db.leaveRequests
    .filter((r) => r.companyId === session.companyId && employeeIds.has(r.employeeId))
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
}
