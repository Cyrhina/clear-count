/*
 * Late count per employee. The year is not the calendar year: a cycle starts on the employee's first late
 * and runs for one year, ending on that date's anniversary (inclusive). The next cycle starts on the first
 * late after that. Example: first late 2026-04-28 → cycle ends 2027-04-28; a late on 2027-04-28 still counts
 * in it, the next cycle starts on the first late after 2027-04-28.
 */

export interface LateCycle {
  /** First late of the cycle. */
  start: string
  /** Anniversary of `start` — the last day the cycle counts. */
  end: string
  /** Late dates inside the cycle, oldest first. */
  dates: string[]
}

function addYear(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const next = new Date(y + 1, m - 1, d) // Feb 29 rolls to Mar 1
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
}

/** Splits an employee's late dates into cycles. */
export function lateCycles(lateDates: string[]): LateCycle[] {
  const sorted = [...new Set(lateDates)].sort()
  const cycles: LateCycle[] = []
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

/** Late dates per employee id from attendance-like rows (status 'late'). */
export function lateDatesByEmployee(records: { employeeId: string; date: string; status: string }[]): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const r of records) if (r.status === 'late') map.set(r.employeeId, [...(map.get(r.employeeId) ?? []), r.date])
  return map
}

/** For one late date: which late it is in its cycle (1-based) and the cycle's window. */
export function lateOrdinal(lateDates: string[] | undefined, date: string): { n: number; cycle: LateCycle } | undefined {
  const cycle = lateCycles(lateDates ?? []).find((c) => c.dates.includes(date))
  return cycle ? { n: cycle.dates.indexOf(date) + 1, cycle } : undefined
}
