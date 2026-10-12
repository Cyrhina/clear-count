// The snake_case <-> camelCase converters at the API boundary.
// Run: npm run test:samples
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { camelizeKeys, snakeizeKeys } from '../../resources/js/ops/lib/api/case.ts'

test('camelizeKeys converts keys deeply, drops nulls and stringifies ids', () => {
  const out = camelizeKeys({ id: 7, name: 'A', work_schedule_id: 3, branch_ids: [1, 2], description: null, cutoff_config: { periods: [{ start_day: 1, end_day: 'end' }] } })
  assert.deepEqual(out, { id: '7', name: 'A', workScheduleId: '3', branchIds: ['1', '2'], cutoffConfig: { periods: [{ startDay: 1, endDay: 'end' }] } })
})

test('camelizeKeys leaves the subtree of a kept key untouched', () => {
  const out = camelizeKeys({ default_deduction_schedules: { semi_monthly: 'DIVIDED' } }, ['defaultDeductionSchedules'])
  assert.deepEqual(out, { defaultDeductionSchedules: { semi_monthly: 'DIVIDED' } })
})

test('snakeizeKeys converts keys deeply and keeps the subtree of a kept key', () => {
  const out = snakeizeKeys({ firstName: 'A', cutoffConfig: { startWeekday: 1 }, defaultDeductionSchedules: { semi_monthly: 'DIVIDED' } }, ['defaultDeductionSchedules'])
  assert.deepEqual(out, { first_name: 'A', cutoff_config: { start_weekday: 1 }, default_deduction_schedules: { semi_monthly: 'DIVIDED' } })
})

test('a value that is not an object or array comes back unchanged', () => {
  assert.equal(camelizeKeys('x'), 'x')
  assert.equal(snakeizeKeys(5), 5)
})
