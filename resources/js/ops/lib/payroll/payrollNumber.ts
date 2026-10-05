/*
 * Payroll numbers: "PR001", "PR002", … per company, restarting at PR001 every year. The year is the run's pay-date year.
 * The same code therefore repeats across years — `payrollRef` adds the year ("PR004/2026") wherever it has to stand alone.
 */

/** 1 → "PR001", 42 → "PR042", 1000 → "PR1000" (no cap). */
export function formatPayrollNumber(sequence: number): string {
  return `PR${String(sequence).padStart(3, '0')}`
}

/** "PR004" → 4. Returns 0 when the text isn't a payroll number. */
export function parsePayrollNumber(value: string | undefined): number {
  const match = /^PR(\d+)$/.exec(value ?? '')
  return match ? Number(match[1]) : 0
}

/** The year a run belongs to for numbering — its pay date's year. */
export function payrollYearOf(payDate: string): number {
  return Number(payDate.slice(0, 4))
}

/** The next sequence number for a year, given the runs that already exist (any company's — pass that company's only). */
export function nextPayrollSequence(existing: { payrollNumber?: string; payrollYear?: number }[], year: number): number {
  return existing.filter((p) => p.payrollYear === year).reduce((max, p) => Math.max(max, parsePayrollNumber(p.payrollNumber)), 0) + 1
}

/** "PR004/2026" — unambiguous across years, for exports and file names. */
export function payrollRef(period: { payrollNumber: string; payrollYear: number }): string {
  return `${period.payrollNumber}/${period.payrollYear}`
}
