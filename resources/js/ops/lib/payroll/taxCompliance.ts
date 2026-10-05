import { bonusAppliesToEmployee } from '@ops/lib/payroll/bonusMatching'
import { monthlyEquivalentFor } from '@ops/lib/payroll/rateBasis'
import type { BonusIncentive, Employee, EmployeeBenefit } from '@ops/types/domain'

/**
 * Tax & compliance rules for non-taxable pay: the ₱90,000 ceiling on 13th Month Pay & other benefits, and the
 * per-benefit ceilings for de minimis benefits (BIR RR 11-2018). Pure functions — no db access — so the
 * reports, the dashboard alerts and the seed data all read the same rules.
 */

/** 13th Month Pay and other benefits are exempt from income tax up to this amount a year; the excess is taxable. */
export const THIRTEENTH_MONTH_CEILING = 90_000
/** Within this share of a ceiling (but not over it) an employee is flagged "Approaching Threshold". */
export const APPROACHING_RATIO = 0.9

export type TaxStatus = 'within' | 'approaching' | 'review'

export const TAX_STATUS_LABEL: Record<TaxStatus, string> = {
  within: 'Within Limit',
  approaching: 'Approaching Threshold',
  review: 'Review Required',
}

const STATUS_RANK: Record<TaxStatus, number> = { within: 0, approaching: 1, review: 2 }

export function worstStatus(statuses: TaxStatus[]): TaxStatus {
  return statuses.reduce<TaxStatus>((worst, s) => (STATUS_RANK[s] > STATUS_RANK[worst] ? s : worst), 'within')
}

export function statusRank(status: TaxStatus): number {
  return STATUS_RANK[status]
}

/** Over the ceiling → review; at 90% or more of it → approaching; otherwise within. */
export function statusFor(amount: number, ceiling: number): TaxStatus {
  if (amount > ceiling) return 'review'
  return amount >= ceiling * APPROACHING_RATIO ? 'approaching' : 'within'
}

export interface DeMinimisCategory {
  key: string
  label: string
  /** Yearly ceiling. Monthly and semestral ceilings are annualized (₱2,000 × 12, ₱1,500 × 2). */
  ceilingPerYear: number
  /** The ceiling as the BIR states it. */
  ceilingNote: string
  /** Matches the benefit / allowance / bonus name. */
  match: RegExp
}

export const DE_MINIMIS_CATEGORIES: DeMinimisCategory[] = [
  { key: 'rice', label: 'Rice Subsidy', ceilingPerYear: 24_000, ceilingNote: '₱2,000 / month', match: /\brice\b/i },
  { key: 'uniform', label: 'Uniform & Clothing Allowance', ceilingPerYear: 6_000, ceilingNote: '₱6,000 / year', match: /uniform|clothing/i },
  { key: 'laundry', label: 'Laundry Allowance', ceilingPerYear: 3_600, ceilingNote: '₱300 / month', match: /laundry/i },
  { key: 'medical_cash', label: 'Medical Cash Allowance (Dependents)', ceilingPerYear: 3_000, ceilingNote: '₱1,500 / semester', match: /medical cash|dependents?\b.*allowance/i },
  { key: 'medical_assistance', label: 'Medical Assistance', ceilingPerYear: 10_000, ceilingNote: '₱10,000 / year', match: /medical (assistance|benefit)/i },
  { key: 'achievement', label: 'Employee Achievement Award', ceilingPerYear: 10_000, ceilingNote: '₱10,000 / year', match: /achievement|service award|anniversary award/i },
  { key: 'gift', label: 'Christmas & Anniversary Gift', ceilingPerYear: 5_000, ceilingNote: '₱5,000 / year', match: /\bgift\b/i },
  { key: 'productivity', label: 'Productivity & CBA Incentive', ceilingPerYear: 10_000, ceilingNote: '₱10,000 / year', match: /productivity|\bcba\b/i },
]

export function deMinimisCategoryFor(name: string): DeMinimisCategory | undefined {
  return DE_MINIMIS_CATEGORIES.find((c) => c.match.test(name))
}

/** Calendar months of `year` the employee was on the payroll (hire / separation clamped to the year), 0 when not employed at all. */
export function monthsEmployedInYear(employee: Employee, year: number): number {
  return monthsBetween(employee.employment.dateHired, employee.employment.dateSeparated, year)
}

/** Calendar months of `year` touched by the date range [start, end] (end open = through December). */
export function monthsBetween(start: string, end: string | undefined, year: number): number {
  const first = start.slice(0, 4) > String(year) ? 13 : start.slice(0, 4) < String(year) ? 1 : Number(start.slice(5, 7))
  const last = !end || end.slice(0, 4) > String(year) ? 12 : end.slice(0, 4) < String(year) ? 0 : Number(end.slice(5, 7))
  return Math.max(0, last - first + 1)
}

/** 13th Month Pay is one-twelfth of basic salary earned in the year, so a full year pays one month's basic. */
export function projectedThirteenthMonth(employee: Employee, year: number): number {
  return Math.round(((monthlyEquivalentFor(employee) * monthsEmployedInYear(employee, year)) / 12) * 100) / 100
}

/** Annual amount of each de minimis benefit an employee is set to receive in `year`: allowances × months active, plus matching bonuses. */
export function projectedDeMinimis(
  employee: Employee,
  year: number,
  benefits: EmployeeBenefit[],
  bonuses: BonusIncentive[],
): Map<string, { category: DeMinimisCategory; amount: number }> {
  const result = new Map<string, { category: DeMinimisCategory; amount: number }>()
  const add = (name: string, amount: number) => {
    const category = deMinimisCategoryFor(name)
    if (!category || amount <= 0) return
    const prev = result.get(category.key)
    result.set(category.key, { category, amount: (prev?.amount ?? 0) + amount })
  }

  for (const b of benefits) {
    if (b.employeeId !== employee.id || b.category !== 'allowance' || b.status !== 'active') continue
    add(b.name, b.monthlyValue * Math.min(monthsBetween(b.startDate, b.endDate, year), monthsEmployedInYear(employee, year)))
  }
  for (const a of employee.compensation.allowances) add(a.label, a.amount * monthsEmployedInYear(employee, year))
  for (const bonus of bonuses) {
    if (bonus.status !== 'approved' || bonus.taxable || !bonus.periodLabel.includes(String(year))) continue
    if (bonusAppliesToEmployee(bonus, employee)) add(bonus.name, bonus.amount)
  }
  return result
}

/** Approved non-taxable bonuses (other than de minimis) the employee receives in `year` — they count toward the ₱90,000 ceiling. */
export function nonTaxableBonusTotal(employee: Employee, year: number, bonuses: BonusIncentive[]): number {
  return bonuses
    .filter((b) => b.status === 'approved' && !b.taxable && b.periodLabel.includes(String(year)) && !deMinimisCategoryFor(b.name))
    .filter((b) => bonusAppliesToEmployee(b, employee))
    .reduce((sum, b) => sum + b.amount, 0)
}
