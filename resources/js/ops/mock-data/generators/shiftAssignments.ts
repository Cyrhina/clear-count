import type { Employee, Schedule, ShiftAssignment } from '@ops/types/domain'

const pad2 = (n: number) => String(n).padStart(2, '0')
const toKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

/** Shift template (by id suffix) and rest-day patterns each department works — a few employees are left unscheduled on purpose. */
const DEPARTMENT_PATTERN: Record<string, { shift: string; rest: number[][] }> = {
  'Customer Support': { shift: 'mid', rest: [[2, 3], [0, 6], [1, 2]] },
  Finance: { shift: 'default', rest: [[0, 6]] },
  HR: { shift: 'default', rest: [[0, 6]] },
  Operations: { shift: 'default', rest: [[0, 6], [0, 6], [0, 1]] },
  Sales: { shift: 'default', rest: [[0], [0, 6]] },
  IT: { shift: 'flex', rest: [[0, 6]] },
  Warehouse: { shift: 'mid', rest: [[0, 6], [3, 4]] },
}

/**
 * Builds a roster for the whole current year from each department's pattern.
 * Every 9th active employee has no roster at all, so "Not yet scheduled" shows up out of the box.
 */
export function generateShiftAssignments(employees: Employee[], schedules: Schedule[]): ShiftAssignment[] {
  const assignments: ShiftAssignment[] = []
  const today = new Date()
  const start = new Date(today.getFullYear(), 0, 1)
  const dayCount = Math.round((new Date(today.getFullYear() + 1, 0, 1).getTime() - start.getTime()) / 86400000)
  const days = Array.from({ length: dayCount }, (_, i) => new Date(start.getFullYear(), 0, 1 + i))

  const byCompany = new Map<string, Employee[]>()
  for (const e of employees) if (e.employment.status === 'active') byCompany.set(e.companyId, [...(byCompany.get(e.companyId) ?? []), e])

  for (const [companyId, staff] of byCompany) {
    const companySchedules = schedules.filter((s) => s.companyId === companyId)
    const idFor = (suffix: string) => companySchedules.find((s) => s.id.endsWith(`_sched_${suffix}`))?.id ?? companySchedules[0]?.id ?? null
    const seenInDepartment = new Map<string, number>()
    staff.forEach((employee, index) => {
      if (index % 9 === 4) return
      const department = employee.employment.department
      const deptIndex = seenInDepartment.get(department) ?? 0
      seenInDepartment.set(department, deptIndex + 1)
      const pattern = DEPARTMENT_PATTERN[department] ?? { shift: 'default', rest: [[0, 6]] }
      // The first Operations employee (and every third after) works nights — gives the roster a shifting team.
      const shift = department === 'Operations' && deptIndex % 3 === 0 ? 'night' : pattern.shift
      const rest = pattern.rest[deptIndex % pattern.rest.length]
      for (const day of days) {
        assignments.push({
          id: `${employee.id}_shift_${toKey(day)}`,
          companyId,
          employeeId: employee.id,
          date: toKey(day),
          scheduleId: rest.includes(day.getDay()) ? null : idFor(shift),
        })
      }
    })
  }
  return assignments
}
