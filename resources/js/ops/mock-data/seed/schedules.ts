import type { Schedule } from '@ops/types/domain'
import { companies } from '@ops/mock-data/seed/companies'

export const schedules: Schedule[] = companies.map((company) => ({
  id: `${company.id}_sched_default`,
  companyId: company.id,
  name: 'Standard Day Shift',
  startTime: '09:00',
  endTime: '18:00',
  daysOfWeek: [1, 2, 3, 4, 5],
}))
