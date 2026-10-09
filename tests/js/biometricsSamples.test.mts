// Every sample / template the Import Biometrics dialog offers must be read back by the importer with no issues.
// Run: npm run test:samples
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  buildSampleAttlog,
  buildSampleZkCsv,
  buildStandardTemplateCsv,
  decodeBiometricsFile,
  parseBiometricsFile,
} from '../../resources/js/ops/features/attendance/biometricsImport.ts'

const employees = Array.from({ length: 8 }, (_, i) => ({
  id: `e${i + 1}`,
  companyId: 'c1',
  employeeNumber: `FR-${String(i + 1).padStart(4, '0')}`,
  personal: { firstName: `First${i + 1}`, lastName: `Last${i + 1}` },
  employment: { status: 'active' },
})) as never[]

const DATE = '2026-10-08'
// Same quoting as toCsv in features/reports/components/shared.tsx — that is what the download button writes.
const toCsv = (rows: string[][]) => rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\r\n')
// The file goes through the same decoding the upload does (BOM / encoding detection).
const read = (text: string, options = {}) => parseBiometricsFile(decodeBiometricsFile(new TextEncoder().encode(text).buffer as ArrayBuffer), employees, [], options)

function assertClean(result: ReturnType<typeof read>, expectedRecords: number) {
  assert.equal(result.headerError, undefined)
  assert.deepEqual(result.issues, [], 'sample must not produce any error or warning')
  assert.equal(result.records.length, expectedRecords)
  assert.ok(result.records.every((r) => r.action === 'create' && r.timeIn && r.timeOut), 'every record needs AM in and PM out')
}

test('ZKTeco attlog .dat sample', () => {
  const result = read(buildSampleAttlog(employees, DATE))
  assert.equal(result.format, 'zk_attlog')
  assertClean(result, 12)
  assert.ok(result.records.every((r) => r.breakOut && r.breakIn), 'AM out / PM in come from the break punches')
})

test('ZKTeco .csv sample', () => {
  const result = read(toCsv(buildSampleZkCsv(employees, DATE)))
  assert.equal(result.format, 'zk_csv')
  assertClean(result, 12)
  assert.ok(result.records.every((r) => r.breakOut && r.breakIn))
})

test('standard CSV template (other devices and ZKTeco upload)', () => {
  const csv = toCsv(buildStandardTemplateCsv(employees, DATE))
  for (const options of [{ template: true }, {}]) {
    const result = read(csv, options)
    assert.equal(result.format, 'fbs_daily')
    assert.equal(result.headerError, undefined)
    assert.deepEqual(result.issues, [])
    assert.equal(result.records.length, 4)
    assert.equal(result.records.filter((r) => r.breakOut && r.breakIn).length, 3)
  }
})
