// Golden snapshots of the browser payroll engine (P0 of docs/PLAN.md). The PHP engine (P8, P10, P12) is tested against
// these files, so they stay valid after the TypeScript engine and the mock data are deleted.
//
//   Write:  GOLDEN_WRITE=1 npx vp test run        (only to refresh them on purpose; plan rule R6 says do not do this after P0)
//   Check:  npx vp test run                       (fails if the TypeScript engine no longer reproduces the files)
import fs from 'node:fs'
import path from 'node:path'
import { beforeAll, expect, test, vi } from 'vite-plus/test'

process.env.TZ = 'Asia/Manila'
const TODAY = new Date(2026, 9, 12, 12, 0, 0)
const OUT_DIR = path.resolve(import.meta.dirname, '../../Fixtures/golden')
const WRITE = process.env.GOLDEN_WRITE === '1'

/** Round-trip through JSON so the snapshot is exactly what lands in the file (no `undefined`, no Date objects). */
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value))

function settle(name: string, data: unknown) {
  const file = path.join(OUT_DIR, `${name}.json`)
  if (WRITE) {
    fs.mkdirSync(OUT_DIR, { recursive: true })
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
    return
  }
  expect(fs.existsSync(file), `${name}.json is missing; run with GOLDEN_WRITE=1`).toBe(true)
  expect(plain(data)).toEqual(JSON.parse(fs.readFileSync(file, 'utf8')))
}

let db: typeof import('@ops/mock-data').db
let engine: typeof import('@ops/lib/services/payrollService')
let thirteenth: typeof import('@ops/lib/services/thirteenthMonthService')
let tax: typeof import('@ops/lib/payroll/withholdingTax')

beforeAll(async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(TODAY)
  // The engine ids rows with crypto.randomUUID(); a counter makes the snapshot repeatable.
  let uuid = 0
  vi.spyOn(globalThis.crypto, 'randomUUID').mockImplementation(() => `00000000-0000-4000-8000-${String(++uuid).padStart(12, '0')}` as `${string}-${string}-${string}-${string}-${string}`)
  db = (await import('@ops/mock-data')).db
  engine = await import('@ops/lib/services/payrollService')
  thirteenth = await import('@ops/lib/services/thirteenthMonthService')
  tax = await import('@ops/lib/payroll/withholdingTax')
  await (await import('@ops/mock-data/payrollRuns')).seedSamplePayrollRuns(TODAY)
})

const COMPANY = 'co_frontline'
const FREQUENCIES = [
  { frequency: 'monthly', periodsPerMonth: 1 },
  { frequency: 'semi_monthly', periodsPerMonth: 2 },
  { frequency: 'weekly', periodsPerMonth: 52 / 12 },
  { frequency: 'daily', periodsPerMonth: 22 },
] as const
const MONTHLY_SALARIES = [1_000, 1_500, 5_000, 8_000, 10_000, 12_500, 15_000, 20_000, 25_000, 32_000, 45_000, 60_000, 80_000, 100_000, 150_000, 250_000, 500_000]

test('statutory contributions and withholding tax over a salary grid', () => {
  const config = db.statutoryConfigs.find((c) => c.companyId === COMPANY)!
  const template = db.employees.find((e) => e.companyId === COMPANY)!
  const rows = MONTHLY_SALARIES.flatMap((salary) => {
    const employee = { ...template, compensation: { ...template.compensation, payType: 'monthly' as const, basicPay: salary } }
    return FREQUENCIES.map(({ frequency, periodsPerMonth }) => ({
      input: { monthlySalary: salary, frequency, periodsPerMonth },
      output: engine.monthlyStatutoryFor(config, employee, frequency, periodsPerMonth),
    }))
  })
  const taxTables = Object.fromEntries(
    ['annual', 'monthly', 'semi_monthly', 'weekly', 'daily'].map((f) => {
      const brackets = tax.taxBracketsFor(config, f as 'annual')
      const samples = [0, 100, 1_000, 5_000, 10_000, 20_833, 33_333, 66_667, 166_667, 666_667, 1_000_000].map((taxable) => ({
        taxable,
        tax: brackets ? tax.withholdingTaxOn(taxable, brackets) : null,
        marginalRate: brackets ? tax.marginalRateOn(taxable, brackets) : null,
      }))
      return [f, { brackets: brackets ?? null, samples }]
    }),
  )
  settle('statutory', { config, rows, taxTables })
})

test('payroll runs produced by the engine, with the data they were computed from', () => {
  const periods = db.payrollPeriods.filter((p) => p.companyId === COMPANY)
  expect(periods.length).toBeGreaterThan(0)
  const lines = db.payrollLines.filter((l) => periods.some((p) => p.id === l.periodId))
  expect(lines.length).toBeGreaterThan(0)
  const forCompany = <T extends { companyId?: string }>(rows: T[]) => rows.filter((r) => r.companyId === COMPANY)
  const employeeIds = new Set(forCompany(db.employees).map((e) => e.id))
  const ofEmployees = <T extends { employeeId: string }>(rows: T[]) => rows.filter((r) => employeeIds.has(r.employeeId))

  settle('payroll-runs', {
    today: TODAY.toISOString(),
    // Output of the engine.
    periods,
    lines,
    loansAfterRuns: forCompany(db.loans),
    // Input the engine read. The PHP parity test rebuilds these rows in the database, runs the PHP engine and compares.
    inputs: {
      payrollGroups: forCompany(db.payrollGroups),
      payrollRules: db.payrollRules.filter((r) => r.companyId === COMPANY),
      schedules: forCompany(db.schedules),
      holidays: forCompany(db.holidays),
      employees: forCompany(db.employees),
      attendanceRecords: ofEmployees(db.attendanceRecords),
      leaveTypes: forCompany(db.leaveTypes),
      leaveRequests: ofEmployees(db.leaveRequests),
      overtimeRecords: ofEmployees(db.overtimeRecords),
      compensationApprovals: ofEmployees(db.compensationApprovals),
      bonuses: forCompany(db.bonuses),
      employeeBenefits: ofEmployees(db.employeeBenefits),
      employeeDeductions: ofEmployees(db.employeeDeductions),
      deductionConfigs: forCompany(db.deductionConfigs),
      earningConfigs: forCompany(db.earningConfigs),
    },
  })
})

test('13th month lines for every eligible employee', async () => {
  const session = db.users.find((u) => u.id === 'u_fl_admin')!
  const lines = [] as unknown[]
  for (const year of [2025, 2026]) {
    const coverage = thirteenth.coverageFor(year)
    for (const employee of db.employees.filter((e) => e.companyId === COMPANY && thirteenth.isEligibleForThirteenthMonth(e, coverage))) {
      lines.push({ year, employeeId: employee.id, line: thirteenth.computeThirteenthMonthLine(session, employee, coverage, `golden_${year}`) })
    }
  }
  expect(lines.length).toBeGreaterThan(0)
  settle('thirteenth-month', { lines })
})
