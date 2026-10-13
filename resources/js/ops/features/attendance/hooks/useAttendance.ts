import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import {
  fetchAdjustments,
  fetchAttendanceForDate,
  fetchLateRecords,
  fetchSchedulesWithMembers,
  getApprovedLeavesInRange,
  getEmployeeIdsOnLeaveForDate,
} from '@ops/lib/services/attendanceService'
import { lateDatesByEmployee } from '@ops/features/attendance/lateCycle'
import type { ApprovedLeave } from '@ops/features/attendance/leaveStatus'
import type { Schedule } from '@ops/features/company-settings/types'
import type { AttendanceAdjustment, AttendanceRecord } from '@ops/types/domain'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function useDailyAttendance(date: string = todayKey()) {
  const [records, setRecords] = useState<AttendanceRecord[] | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])

  const refetch = useCallback(() => {
    fetchAttendanceForDate(date).then(setRecords)
    fetchSchedulesWithMembers().then(setSchedules)
  }, [date])

  useEffect(() => {
    setRecords(null)
    refetch()
  }, [refetch])

  return { records: records ?? [], schedules, isLoading: records === null, refetch }
}

/** Powers the "On Leave" status filter option on the Daily Attendance tab (leave is still the mock until the Leave module). */
export function useDateStatusSets(date: string) {
  const { user } = useSession()
  const [onLeaveIds, setOnLeaveIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    getEmployeeIdsOnLeaveForDate(user, date).then(setOnLeaveIds)
  }, [user, date])

  return { onLeaveIds }
}

export function useAttendanceAdjustments() {
  const [adjustments, setAdjustments] = useState<AttendanceAdjustment[] | null>(null)

  const refetch = useCallback(() => {
    fetchAdjustments().then(setAdjustments)
  }, [])

  useEffect(() => {
    setAdjustments(null)
    refetch()
  }, [refetch])

  return { adjustments: adjustments ?? [], isLoading: adjustments === null, refetch }
}

/** Approved leaves covering `date` (with leave type) — drives the "On Leave" status override on the daily table. */
export function useApprovedLeavesForDate(date: string) {
  const { user } = useSession()
  const [leaves, setLeaves] = useState<ApprovedLeave[]>([])

  const refetch = useCallback(() => {
    getApprovedLeavesInRange(user, date, date).then(setLeaves)
  }, [user, date])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { leaves, refetch }
}

/** Late dates per employee over the last two years — feeds the "Late #n" count. Refreshes when `refreshKey` changes (e.g. after an import). */
export function useLateDates(refreshKey: unknown) {
  const [lateDates, setLateDates] = useState<Map<string, string[]>>(new Map())
  useEffect(() => {
    fetchLateRecords().then((records) => setLateDates(lateDatesByEmployee(records)))
  }, [refreshKey])
  return lateDates
}
