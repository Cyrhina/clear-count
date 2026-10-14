// mock: remove in P10 (payroll period page). The Bonuses page uses bonusApiService; getBonuses still serves the mock payroll period page.
import { db } from '@ops/mock-data'
import type { BonusIncentive, SessionUser } from '@ops/types/domain'

export async function getBonuses(session: SessionUser): Promise<BonusIncentive[]> {
  return db.bonuses.filter((b) => b.companyId === session.companyId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
