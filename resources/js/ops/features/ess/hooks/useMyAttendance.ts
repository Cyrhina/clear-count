import { useQuery } from '@tanstack/react-query'
import { useSession } from '@ops/hooks/useSession'
import { fetchAttendanceRange } from '@ops/lib/services/attendanceService'
import type { AttendanceRecord } from '@ops/types/domain'

const dayKey = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10)

/** The signed-in employee's attendance of the last `days` days, newest first (the server only returns their own). */
export function useMyAttendance(enabled: boolean, days = 120) {
  const { user } = useSession()
  const query = useQuery<AttendanceRecord[]>({
    queryKey: ['ess', 'attendance', user.id, days],
    queryFn: async () => (await fetchAttendanceRange(dayKey(-days), dayKey(0))).sort((a, b) => b.date.localeCompare(a.date)),
    enabled,
  })
  return { records: query.data ?? null }
}
