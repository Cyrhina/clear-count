import type { AttendanceRecord } from '@ops/types/domain'

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Late / undertime / present for one day's punches against a shift. */
export function statusForPunch(timeIn: string, timeOut: string | null, startTime: string, endTime: string, graceMinutes: number): AttendanceRecord['status'] {
  if (toMinutes(timeIn) > toMinutes(startTime) + graceMinutes) return 'late'
  if (timeOut && toMinutes(timeOut) < toMinutes(endTime)) return 'undertime'
  return 'present'
}
