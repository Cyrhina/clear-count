/*
 * Late count per employee. How the counting year is cut depends on the company's Late Policy
 * (Company & Payroll Settings → Payroll Settings → Late Policy):
 *  - calendar_year: Jan 1 – Dec 31, shared by everyone.
 *  - rolling:       starts on the employee's first late and ends on that date's anniversary (inclusive); the next
 *                   cycle starts on the first late after that. First late 2026-04-28 → ends 2027-04-28.
 *  - anniversary:   the employee's work-anniversary year, from the anniversary to the day before the next one.
 *  - custom:        a fixed yearly period starting on a company-set month/day (e.g. Jul 1 – Jun 30).
 *  - monthly:       each calendar month on its own.
 */
import type { LateCountingPeriod, PayrollRules } from '@ops/types/domain'

export type LatePolicy = Pick<PayrollRules, 'lateCountingPeriod' | 'lateCustomStartMonth' | 'lateCustomStartDay'>

export const DEFAULT_LATE_POLICY: LatePolicy = { lateCountingPeriod: 'calendar_year', lateCustomStartMonth: 1, lateCustomStartDay: 1 }

export interface LateCycle {
  /** First day of the counting period (for `rolling`: the first late of the cycle). */
  start: string
  /** Last day the period counts (inclusive). */
  end: string
  /** Late dates inside the period, oldest first. */
  dates: string[]
}

const iso = (d: Date) => d.toISOString().slice(0, 10)
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d))
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate()
/** Feb 29/30/31 settings fall on the month's last day in years that don't have them. */
const anchor = (y: number, m: number, d: number) => iso(utc(y, m, Math.min(d, daysIn(y, m))))
const dayBefore = (date: string) => iso(new Date(Date.parse(date) - 86_400_000))

function addYear(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return anchor(y + 1, m, d)
}

/** The period of a yearly cycle that starts every year on `month`/`day` and contains `date`. */
function yearlyWindow(date: string, month: number, day: number): { start: string; end: string } {
  const year = Number(date.slice(0, 4))
  const start = anchor(year, month, day) <= date ? anchor(year, month, day) : anchor(year - 1, month, day)
  return { start, end: dayBefore(anchor(Number(start.slice(0, 4)) + 1, month, day)) }
}

function fixedWindow(date: string, policy: LatePolicy, dateHired?: string): { start: string; end: string } {
  const [y, m] = date.split('-').map(Number)
  switch (policy.lateCountingPeriod) {
    case 'monthly':
      return { start: anchor(y, m, 1), end: anchor(y, m, 31) }
    case 'custom':
      return yearlyWindow(date, policy.lateCustomStartMonth, policy.lateCustomStartDay)
    case 'anniversary': {
      if (!dateHired) return { start: `${y}-01-01`, end: `${y}-12-31` } // no hire date on file: calendar year
      const [, hm, hd] = dateHired.split('-').map(Number)
      return yearlyWindow(date, hm, hd)
    }
    default:
      return { start: `${y}-01-01`, end: `${y}-12-31` }
  }
}

/** Splits an employee's late dates into counting periods. `dateHired` (YYYY-MM-DD) is only needed for `anniversary`. */
export function lateCycles(lateDates: string[], policy: LatePolicy = DEFAULT_LATE_POLICY, dateHired?: string): LateCycle[] {
  const sorted = [...new Set(lateDates)].sort()
  const cycles: LateCycle[] = []

  if (policy.lateCountingPeriod === 'rolling') {
    let i = 0
    while (i < sorted.length) {
      const start = sorted[i]
      const end = addYear(start)
      const dates: string[] = []
      while (i < sorted.length && sorted[i] <= end) dates.push(sorted[i++])
      cycles.push({ start, end, dates })
    }
    return cycles
  }

  for (const date of sorted) {
    const { start, end } = fixedWindow(date, policy, dateHired)
    const last = cycles.at(-1)
    if (last?.start === start) last.dates.push(date)
    else cycles.push({ start, end, dates: [date] })
  }
  return cycles
}

/** Late dates per employee id from attendance-like rows (status 'late'). */
export function lateDatesByEmployee(records: { employeeId: string; date: string; status: string }[]): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const r of records) if (r.status === 'late') map.set(r.employeeId, [...(map.get(r.employeeId) ?? []), r.date])
  return map
}

/** For one late date: which late it is in its period (1-based) and the period's window. */
export function lateOrdinal(lateDates: string[] | undefined, date: string, policy: LatePolicy = DEFAULT_LATE_POLICY, dateHired?: string): { n: number; cycle: LateCycle } | undefined {
  const cycle = lateCycles(lateDates ?? [], policy, dateHired).find((c) => c.dates.includes(date))
  return cycle ? { n: cycle.dates.indexOf(date) + 1, cycle } : undefined
}

export const LATE_PERIOD_LABEL: Record<LateCountingPeriod, string> = {
  calendar_year: 'Calendar Year',
  rolling: 'Rolling Period',
  anniversary: 'Employment Anniversary Year',
  custom: 'Custom Fixed Period',
  monthly: 'Monthly Reset',
}
