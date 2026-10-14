import { Calculator, TrendingDown, TrendingUp } from 'lucide-react'
import { BreakdownCard, type BreakdownRow } from '@ops/features/payslips/components/PayslipCard'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { ThirteenthMonthLine } from '@ops/types/domain'

function listDates(dates: string[]): string {
  const shown = dates.slice(0, 6).map((d) => formatDate(d, { year: undefined, month: 'short', day: 'numeric' }))
  return dates.length > 6 ? `${shown.join(', ')} +${dates.length - 6} more` : shown.join(', ')
}

/**
 * Month-by-month view of a 13th Month computation, laid out like the regular payslip:
 * an Earnings panel listing every eligible month's basic salary (pro-rated for the hire /
 * separation month), a separate Deductions panel (undertime, unpaid absences), then the ÷ 12.
 */
export function ThirteenthMonthBreakdown({ line }: { line: ThirteenthMonthLine }) {
  const months = line.months ?? []

  const earningRows: BreakdownRow[] = months.map((m) => ({ key: m.key, type: 'Basic Pay', description: m.label, amount: m.amount, hint: m.detail }))
  const earningsTotal = months.reduce((sum, m) => sum + m.amount, 0)

  const undertimeAmount = line.undertimeDeduction ?? 0
  const absenceAmount = line.absenceDeduction ?? 0
  const deductionRows: BreakdownRow[] = []
  if (undertimeAmount > 0) {
    deductionRows.push({
      key: 'undertime',
      type: 'Undertime',
      description: `${line.undertimeHours ?? 0} hr × ${formatCurrency(line.hourlyRate ?? 0)}/hr`,
      amount: undertimeAmount,
      hint: line.undertimeDates?.length ? listDates(line.undertimeDates) : undefined,
    })
  }
  if (absenceAmount > 0) {
    const days = line.unpaidAbsenceDays ?? 0
    deductionRows.push({
      key: 'absences',
      type: 'Unpaid Absence',
      description: `${days} day${days === 1 ? '' : 's'} × ${formatCurrency(line.dailyRate ?? 0)}/day`,
      amount: absenceAmount,
      hint: line.absenceDates?.length ? listDates(line.absenceDates) : undefined,
    })
  }
  const deductionsTotal = undertimeAmount + absenceAmount

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <BreakdownCard tone="success" icon={TrendingUp} title="Earnings" total={earningsTotal} rows={earningRows} emptyLabel="No eligible earnings in this period." />
        <BreakdownCard
          tone="danger"
          icon={TrendingDown}
          title="Deductions"
          total={deductionsTotal}
          rows={deductionRows}
          emptyLabel="No undertime or unpaid absences recorded."
        />
      </div>

      <div className="space-y-2 rounded-2xl border border-border p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total Earnings</span>
          <span className="tabular-nums">{formatCurrency(earningsTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Less: Total Deductions</span>
          <span className="tabular-nums text-danger">−{formatCurrency(deductionsTotal)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2 font-semibold">
          <span>Total Basic Salary Earned</span>
          <span className="tabular-nums">{formatCurrency(line.annualBasicEarned)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-primary/10 p-4">
        <div className="flex items-center gap-2">
          <Calculator className="size-4 shrink-0 text-primary" />
          <span className="text-sm font-medium text-primary">{formatCurrency(line.annualBasicEarned)} ÷ 12 = 13th Month Pay</span>
        </div>
        <span className="font-display text-lg font-semibold text-primary">{formatCurrency(line.thirteenthMonthPay)}</span>
      </div>
    </div>
  )
}
