// The Late Policy counting periods: each one cuts an employee's late dates into the right groups.
// Run: npm run test:samples
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { lateCycles, lateOrdinal, type LatePolicy } from '../../resources/js/ops/features/attendance/lateCycle.ts'

const policy = (lateCountingPeriod: LatePolicy['lateCountingPeriod'], month = 1, day = 1): LatePolicy => ({ lateCountingPeriod, lateCustomStartMonth: month, lateCustomStartDay: day })
const counts = (cycles: ReturnType<typeof lateCycles>) => cycles.map((c) => `${c.start}..${c.end}:${c.dates.length}`)

test('calendar year resets every January 1', () => {
  assert.deepEqual(counts(lateCycles(['2026-04-28', '2026-12-31', '2027-01-01'], policy('calendar_year'))), ['2026-01-01..2026-12-31:2', '2027-01-01..2027-12-31:1'])
})

test('rolling starts on the first late and lasts to its anniversary, inclusive', () => {
  const cycles = lateCycles(['2026-04-28', '2027-04-28', '2027-05-01'], policy('rolling'))
  assert.deepEqual(counts(cycles), ['2026-04-28..2027-04-28:2', '2027-05-01..2028-05-01:1'])
})

test('anniversary follows the hire date, and falls back to the calendar year without one', () => {
  const dates = ['2026-06-14', '2026-06-15']
  assert.deepEqual(counts(lateCycles(dates, policy('anniversary'), '2025-06-15')), ['2025-06-15..2026-06-14:1', '2026-06-15..2027-06-14:1'])
  assert.deepEqual(counts(lateCycles(dates, policy('anniversary'))), ['2026-01-01..2026-12-31:2'])
})

test('custom fixed period runs from its start date to the day before the next one', () => {
  assert.deepEqual(counts(lateCycles(['2026-06-30', '2026-07-01'], policy('custom', 7, 1))), ['2025-07-01..2026-06-30:1', '2026-07-01..2027-06-30:1'])
})

test('a Feb 29 anchor falls on Feb 28 in a common year', () => {
  assert.deepEqual(counts(lateCycles(['2027-02-27', '2027-02-28'], policy('custom', 2, 29))), ['2026-02-28..2027-02-27:1', '2027-02-28..2028-02-28:1'])
})

test('monthly counts each month on its own and numbers lates from #1', () => {
  const dates = ['2026-03-10', '2026-03-20', '2026-04-02']
  assert.deepEqual(counts(lateCycles(dates, policy('monthly'))), ['2026-03-01..2026-03-31:2', '2026-04-01..2026-04-30:1'])
  assert.equal(lateOrdinal(dates, '2026-04-02', policy('monthly'))?.n, 1)
  assert.equal(lateOrdinal(dates, '2026-03-20', policy('monthly'))?.n, 2)
})
