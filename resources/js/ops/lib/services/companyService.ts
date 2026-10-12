// mock: remove in P2-P14. The Company Settings screens now use companyInfoService, holidayService and payrollConfigService; this file
// stays only for the mock modules that still read the company, schedules and holidays (see docs/PROGRESS.md, mock-removal ledger).
import { getEmployees } from '@ops/lib/services/employeeService'
import { db } from '@ops/mock-data'
import type { Company, Holiday, Schedule, SessionUser } from '@ops/types/domain'

export async function getCompany(session: SessionUser): Promise<Company | undefined> {
  return db.companies.find((c) => c.id === session.companyId)
}

export async function getSchedules(session: SessionUser): Promise<Schedule[]> {
  return db.schedules.filter((s) => s.companyId === session.companyId)
}

export async function getHolidays(session: SessionUser): Promise<Holiday[]> {
  return db.holidays.filter((h) => h.companyId === session.companyId).sort((a, b) => a.date.localeCompare(b.date))
}

/** Adds employees to a work schedule without touching its other members; an employee has one work schedule, so they leave any other. Returns how many were added. */
export async function addEmployeesToSchedule(session: SessionUser, scheduleId: string, employeeIds: string[]): Promise<number> {
  const schedule = db.schedules.find((s) => s.id === scheduleId && s.companyId === session.companyId)
  if (!schedule) return 0
  const allowed = new Set((await getEmployees(session)).map((e) => e.id))
  const ids = employeeIds.filter((id) => allowed.has(id) && !(schedule.assignedEmployeeIds ?? []).includes(id))
  for (const other of db.schedules) {
    if (other.companyId === session.companyId && other.id !== scheduleId) other.assignedEmployeeIds = (other.assignedEmployeeIds ?? []).filter((id) => !ids.includes(id))
  }
  schedule.assignedEmployeeIds = [...(schedule.assignedEmployeeIds ?? []), ...ids]
  return ids.length
}
