// mock: remove in P2-P14. The Company Settings screens now use companyInfoService, holidayService and payrollConfigService; this file
// stays only for the mock modules that still read the company, schedules and holidays (see docs/PROGRESS.md, mock-removal ledger).
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
