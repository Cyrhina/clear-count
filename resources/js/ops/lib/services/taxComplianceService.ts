import {
  DE_MINIMIS_CATEGORIES,
  THIRTEENTH_MONTH_CEILING,
  deMinimisCategoryFor,
  nonTaxableBonusTotal,
  projectedDeMinimis,
  projectedThirteenthMonth,
  statusFor,
  worstStatus,
  type TaxStatus,
} from '@ops/lib/payroll/taxCompliance'
import { fetchBonuses } from '@ops/lib/services/bonusApiService'
import { fetchEmployeeBenefits } from '@ops/lib/services/benefitsApiService'
import { getEmployees } from '@ops/lib/services/employeeService'
import { getAllPayrollLines } from '@ops/lib/services/reportService'
import { fetchThirteenthMonthLines, fetchThirteenthMonthRuns } from '@ops/lib/services/thirteenthMonthApiService'
import type { Employee, SessionUser, ThirteenthMonthLine } from '@ops/types/domain'

const round2 = (n: number) => Math.round(n * 100) / 100

export interface DeMinimisItem {
  key: string
  label: string
  ceiling: number
  ceilingNote: string
  /** Actually paid through payroll runs dated in the year so far. */
  paidYtd: number
  /** Full-year amount at the current rate (never below what is already paid). */
  projected: number
  /** Projected amount above the ceiling — taxable treatment applies to it. */
  excess: number
  remaining: number
  status: TaxStatus
}

export interface ThirteenthMonthBucket {
  thirteenthMonth: number
  /** True when no 13th Month batch exists for the year, so the amount is one-twelfth of basic pay earned (projected). */
  isProjected: boolean
  /** Approved non-taxable bonuses (separate from de minimis). */
  otherBenefits: number
  /** De minimis amounts above their ceilings — BIR treats these as part of "other benefits". */
  deMinimisExcess: number
  total: number
  ceiling: number
  remaining: number
  /** Above the ceiling: the taxable portion. */
  taxableExcess: number
  status: TaxStatus
}

export interface TaxEmployeeRow {
  employee: Employee
  /** Payroll runs dated in the year, so far. */
  grossYtd: number
  /** Employee SSS + PhilHealth + Pag-IBIG withheld. */
  statutoryYtd: number
  withholdingYtd: number
  /** De minimis benefits paid through payroll so far, within and above their ceilings. */
  deMinimisPaidYtd: number
  deMinimisItems: DeMinimisItem[]
  bucket: ThirteenthMonthBucket
  /** Gross less employee contributions and de minimis, plus the part of 13th month & other benefits over ₱90,000. */
  taxableCompensationYtd: number
  /** Worst of the 13th month bucket and every de minimis category. */
  status: TaxStatus
}

export interface TaxComplianceData {
  year: number
  rows: TaxEmployeeRow[]
  /** Years that have payroll lines, plus the current year, newest first. */
  years: number[]
}

/** One employee's tax picture for a calendar year, from the real payroll lines plus a full-year projection of benefits and 13th month. */
export async function getTaxComplianceData(session: SessionUser, year: number): Promise<TaxComplianceData> {
  // A role that may not read one of these gets none of it, rather than no report.
  const [lines, employees, bonuses, benefits, runs] = await Promise.all([
    getAllPayrollLines(session).then((all) => all.filter((l) => l.period.status === 'finalized')),
    getEmployees(session),
    fetchBonuses().catch(() => []),
    fetchEmployeeBenefits().catch(() => []),
    fetchThirteenthMonthRuns().catch(() => []),
  ])
  const thirteenthLines: ThirteenthMonthLine[] = (await Promise.all(runs.filter((r) => r.year === year && r.status === 'finalized').map((r) => fetchThirteenthMonthLines(r.id).catch(() => [])))).flat()

  const years = [...new Set([new Date().getFullYear(), ...lines.map((l) => Number(l.period.payDate.slice(0, 4)))])].sort((a, b) => b - a)

  const rows = employees
    .filter((e) => e.employment.status === 'active' || lines.some((l) => l.employee.id === e.id))
    .map((employee): TaxEmployeeRow => {
      const mine = lines.filter((l) => l.employee.id === employee.id && l.period.payDate.startsWith(String(year)))
      const grossYtd = mine.reduce((s, l) => s + l.line.grossPay, 0)
      const statutoryYtd = mine.reduce((s, l) => s + l.line.sssEmployeeShare + l.line.philhealthEmployeeShare + l.line.pagibigEmployeeShare, 0)
      const withholdingYtd = mine.reduce((s, l) => s + l.line.withholdingTax, 0)

      const paidByCategory = new Map<string, number>()
      for (const { line } of mine) {
        for (const e of line.earnings) {
          const category = deMinimisCategoryFor(e.label)
          if (category) paidByCategory.set(category.key, (paidByCategory.get(category.key) ?? 0) + e.amount)
        }
      }
      const projected = projectedDeMinimis(employee, year, benefits, bonuses)
      const deMinimisItems = DE_MINIMIS_CATEGORIES.flatMap((category): DeMinimisItem[] => {
        const paidYtd = round2(paidByCategory.get(category.key) ?? 0)
        const annual = round2(Math.max(projected.get(category.key)?.amount ?? 0, paidYtd))
        if (annual <= 0) return []
        return [
          {
            key: category.key,
            label: category.label,
            ceiling: category.ceilingPerYear,
            ceilingNote: category.ceilingNote,
            paidYtd,
            projected: annual,
            excess: round2(Math.max(0, annual - category.ceilingPerYear)),
            remaining: round2(Math.max(0, category.ceilingPerYear - annual)),
            status: statusFor(annual, category.ceilingPerYear),
          },
        ]
      })

      const actual13 = thirteenthLines.filter((l) => l.employeeId === employee.id).reduce((s, l) => s + l.thirteenthMonthPay, 0)
      const isProjected = actual13 === 0
      const thirteenthMonth = round2(isProjected ? projectedThirteenthMonth(employee, year) : actual13)
      const otherBenefits = round2(nonTaxableBonusTotal(employee, year, bonuses))
      const deMinimisExcess = round2(deMinimisItems.reduce((s, i) => s + i.excess, 0))
      const total = round2(thirteenthMonth + otherBenefits + deMinimisExcess)
      const bucket: ThirteenthMonthBucket = {
        thirteenthMonth,
        isProjected,
        otherBenefits,
        deMinimisExcess,
        total,
        ceiling: THIRTEENTH_MONTH_CEILING,
        remaining: round2(Math.max(0, THIRTEENTH_MONTH_CEILING - total)),
        taxableExcess: round2(Math.max(0, total - THIRTEENTH_MONTH_CEILING)),
        status: statusFor(total, THIRTEENTH_MONTH_CEILING),
      }

      // Taxable compensation to date counts only what has actually been paid: a projected 13th month isn't income yet.
      const deMinimisPaidYtd = round2([...paidByCategory.values()].reduce((s, v) => s + v, 0))
      const paidBucket = actual13 + otherBenefits + deMinimisItems.reduce((s, i) => s + Math.max(0, i.paidYtd - i.ceiling), 0)
      const taxableExcessPaid = Math.max(0, paidBucket - THIRTEENTH_MONTH_CEILING)

      return {
        employee,
        grossYtd: round2(grossYtd),
        statutoryYtd: round2(statutoryYtd),
        withholdingYtd: round2(withholdingYtd),
        deMinimisPaidYtd,
        deMinimisItems,
        bucket,
        taxableCompensationYtd: round2(Math.max(0, grossYtd - statutoryYtd - deMinimisPaidYtd + taxableExcessPaid)),
        status: worstStatus([bucket.status, ...deMinimisItems.map((i) => i.status)]),
      }
    })
    .sort((a, b) => a.employee.personal.lastName.localeCompare(b.employee.personal.lastName))

  return { year, rows, years }
}

export type TaxAlertLevel = 'approaching' | 'review' | 'within'

export interface TaxAlert {
  id: string
  level: TaxAlertLevel
  title: string
  message: string
  employeeId?: string
}

export interface TaxAlerts {
  year: number
  alerts: TaxAlert[]
  counts: { review: number; approaching: number; within: number }
}

const peso = (n: number) => `₱${Math.round(n).toLocaleString('en-PH')}`
const nameOf = (e: Employee) => `${e.personal.firstName} ${e.personal.lastName}`

/** Turns the year's tax picture into dashboard alerts: review-required first, then approaching, then one all-clear line. */
export function buildTaxAlerts({ year, rows }: TaxComplianceData): TaxAlerts {
  const review: TaxAlert[] = []
  const approaching: TaxAlert[] = []

  for (const row of rows) {
    const name = nameOf(row.employee)
    const { bucket } = row
    if (bucket.status === 'review') {
      review.push({
        id: `${row.employee.id}-13th`,
        level: 'review',
        title: 'Review Required',
        employeeId: row.employee.id,
        message: `${name} has exceeded the ${peso(bucket.ceiling)} non-taxable ceiling for 13th Month Pay & Other Benefits by ${peso(bucket.taxableExcess)}. Review the excess amount for applicable tax treatment.`,
      })
    } else if (bucket.status === 'approaching') {
      approaching.push({
        id: `${row.employee.id}-13th`,
        level: 'approaching',
        title: 'Approaching Threshold',
        employeeId: row.employee.id,
        message: `${name} ${bucket.isProjected ? 'is projected to reach' : 'has'} ${peso(bucket.total)} ${bucket.isProjected ? 'in' : 'accumulated in'} 13th Month Pay & Other Benefits. Only ${peso(bucket.remaining)} remains before reaching the ${peso(bucket.ceiling)} non-taxable ceiling.`,
      })
    }
    for (const item of row.deMinimisItems) {
      if (item.status === 'review') {
        review.push({
          id: `${row.employee.id}-${item.key}`,
          level: 'review',
          title: 'Review Required',
          employeeId: row.employee.id,
          message: `${name} has exceeded the prescribed ceiling for ${item.label} (${peso(item.projected)} against ${peso(item.ceiling)} a year). Review the ${peso(item.excess)} excess for applicable tax treatment.`,
        })
      } else if (item.status === 'approaching') {
        approaching.push({
          id: `${row.employee.id}-${item.key}`,
          level: 'approaching',
          title: 'Approaching Threshold',
          employeeId: row.employee.id,
          message: `${name}'s ${item.label} is at ${peso(item.projected)} of the ${peso(item.ceiling)} yearly ceiling. Only ${peso(item.remaining)} remains.`,
        })
      }
    }
  }

  const withDeMinimis = rows.filter((r) => r.deMinimisItems.length > 0)
  const within = withDeMinimis.filter((r) => r.deMinimisItems.every((i) => i.status === 'within'))
  const alerts: TaxAlert[] = [...review, ...approaching]
  if (within.length > 0) {
    alerts.push({
      id: 'within',
      level: 'within',
      title: 'Within Limit',
      message:
        within.length === 1
          ? `${nameOf(within[0].employee)}'s de minimis benefits are currently within the applicable ceilings.`
          : `${nameOf(within[0].employee)} and ${within.length - 1} other employees' de minimis benefits are currently within the applicable ceilings.`,
    })
  }

  return { year, alerts, counts: { review: review.length, approaching: approaching.length, within: within.length } }
}

export async function getTaxAlerts(session: SessionUser): Promise<TaxAlerts> {
  return buildTaxAlerts(await getTaxComplianceData(session, new Date().getFullYear()))
}
