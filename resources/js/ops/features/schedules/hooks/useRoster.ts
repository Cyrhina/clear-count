import { useCallback, useEffect, useMemo, useState } from 'react'
import { approvedLeaveOn } from '@ops/features/attendance/leaveStatus'
import { useSession } from '@ops/hooks/useSession'
import { getApprovedLeavesInRange } from '@ops/lib/services/attendanceService'
import { fetchApprovedLeaves } from '@ops/lib/services/leaveApiService'
import type { DepartmentRecord } from '@ops/features/branches/types'
import { fetchBranchDepartments } from '@ops/lib/services/branchDepartmentService'
import { fetchAllEmployees } from '@ops/lib/services/employeeService'
import { fetchRoster, fetchShiftTemplates, type RosterEntry } from '@ops/lib/services/scheduleService'
import type { Schedule } from '@ops/features/company-settings/types'
import type { Employee } from '@ops/types/domain'

type Leaves = Awaited<ReturnType<typeof fetchApprovedLeaves>>

export type DayState =
  | { kind: 'shift'; schedule: Schedule }
  | { kind: 'rest' }
  | { kind: 'leave'; label: string }
  | { kind: 'unscheduled' }

export interface RosterData {
  employees: Employee[]
  templates: Schedule[]
  /** Departments configured per branch, each with its direct supervisor. */
  departments: DepartmentRecord[]
  isLoading: boolean
  refetch: () => void
  /** What an employee is doing on a date: approved leave wins, then the rostered shift or rest day. */
  stateFor: (employeeId: string, date: string) => DayState
}

/** Loads everything the roster needs for a date range (employees, shift templates, assignments, approved leave, supervisors). */
export function useRoster(from: string, to: string): RosterData {
  const { user } = useSession()
  const [data, setData] = useState<{ employees: Employee[]; templates: Schedule[]; assignments: RosterEntry[]; leaves: Leaves; departments: DepartmentRecord[] } | null>(null)

  const refetch = useCallback(() => {
    // Leave is still the mock until the Leave module (P6), so it does not match real employees yet.
    Promise.all([fetchAllEmployees(), fetchShiftTemplates(), fetchRoster(from, to), fetchApprovedLeaves(from, to), fetchBranchDepartments()]).then(
      ([employees, templates, assignments, leaves, departments]) => setData({ employees, templates, assignments, leaves, departments }),
    )
  }, [user, from, to])

  useEffect(() => {
    refetch()
  }, [refetch])

  const lookup = useMemo(() => {
    const byKey = new Map((data?.assignments ?? []).map((a) => [`${a.employeeId}|${a.date}`, a]))
    const templateById = new Map((data?.templates ?? []).map((t) => [t.id, t]))
    return (employeeId: string, date: string): DayState => {
      const leave = approvedLeaveOn(data?.leaves ?? [], employeeId, date)
      if (leave) return { kind: 'leave', label: leave.typeName }
      const assignment = byKey.get(`${employeeId}|${date}`)
      if (!assignment) return { kind: 'unscheduled' }
      const schedule = assignment.scheduleId ? templateById.get(assignment.scheduleId) : undefined
      return schedule ? { kind: 'shift', schedule } : { kind: 'rest' }
    }
  }, [data])

  return {
    employees: data?.employees ?? [],
    templates: data?.templates ?? [],
    departments: data?.departments ?? [],
    isLoading: data === null,
    refetch,
    stateFor: lookup,
  }
}
