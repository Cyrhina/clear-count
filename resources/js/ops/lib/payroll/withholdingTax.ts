import type { PayrollFrequency, StatutoryConfig, TaxBracket } from '@ops/types/domain'

/** The pay periods BIR publishes a withholding table for. */
export type TaxFrequency = 'annual' | 'monthly' | 'semi_monthly' | 'weekly' | 'daily'

export const TAX_FREQUENCIES: { value: TaxFrequency; label: string; unit: string }[] = [
  { value: 'annual', label: 'Annual', unit: 'year' },
  { value: 'monthly', label: 'Monthly', unit: 'month' },
  { value: 'semi_monthly', label: 'Semi-Monthly', unit: 'semi-monthly pay period' },
  { value: 'weekly', label: 'Weekly', unit: 'week' },
  { value: 'daily', label: 'Daily', unit: 'day' },
]

export const taxFrequencyLabel = (f: TaxFrequency) => TAX_FREQUENCIES.find((t) => t.value === f)?.label ?? f

/**
 * Which withholding table a pay date falls under — the table of the pay frequency of that pay date.
 * BIR publishes no bi-weekly or custom table, so a bi-weekly period (about 14 days) uses the semi-monthly table and a custom
 * period uses the table closest to its length, from how many pay periods it runs per month.
 */
export function taxFrequencyForPay(frequency: PayrollFrequency, periodsPerMonth = 2): TaxFrequency {
  if (frequency === 'daily' || frequency === 'weekly' || frequency === 'semi_monthly' || frequency === 'monthly') return frequency
  if (frequency === 'biweekly') return 'semi_monthly'
  if (periodsPerMonth >= 15) return 'daily'
  if (periodsPerMonth >= 3.5) return 'weekly'
  if (periodsPerMonth >= 1.5) return 'semi_monthly'
  if (periodsPerMonth >= 0.5) return 'monthly'
  return 'annual'
}

/** The company's bracket table for a frequency (the monthly table is `taxBrackets`). */
export function taxBracketsFor(config: Pick<StatutoryConfig, 'taxBrackets' | 'taxBracketTables'>, frequency: TaxFrequency): TaxBracket[] | undefined {
  if (frequency === 'monthly') return config.taxBrackets
  const table = config.taxBracketTables?.[frequency]
  return table && table.length > 0 ? table : undefined
}

const bracketAt = (taxable: number, brackets: TaxBracket[]) => brackets.find((b) => taxable >= b.min && (b.max === null || taxable < b.max))

/** Tax on a taxable income in one pay period: the bracket's base tax plus its rate on the excess over the bracket minimum. */
export function withholdingTaxOn(taxable: number, brackets: TaxBracket[]): number {
  const bracket = bracketAt(taxable, brackets)
  return bracket ? bracket.baseTax + (taxable - bracket.min) * bracket.rate : 0
}

/** The rate charged on the next peso at this taxable income. */
export function marginalRateOn(taxable: number, brackets: TaxBracket[]): number {
  return bracketAt(taxable, brackets)?.rate ?? 0
}
