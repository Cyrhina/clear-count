import { PageHeader } from '@ops/components/layout/PageHeader'
import { StatusBadge } from '@ops/components/ui/Badge'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useSelfEmployee } from '@ops/features/ess/hooks/useSelfEmployee'
import { useLoans } from '@ops/features/loans-deductions/hooks/useLoans'
import { useHighlightTarget } from '@ops/hooks/useHighlightTarget'
import { cn } from '@ops/lib/utils/cn'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'

const TYPE_LABELS: Record<string, string> = {
  sss_salary_loan: 'SSS Loan – Salary',
  sss_calamity_loan: 'SSS Loan – Calamity',
  pagibig_multipurpose_loan: 'Pag-IBIG Loan – Multi-Purpose',
  pagibig_calamity_loan: 'Pag-IBIG Loan – Calamity',
  pagibig_mp2: 'Pag-IBIG MP2 Savings',
  company_loan: 'Company Loan / Emergency Advance',
  other_deduction: 'Other Deduction',
}

export function EssLoansPage() {
  const { employee, isLoading } = useSelfEmployee()
  const { highlightId } = useHighlightTarget()
  const { loans: all, isLoading: isLoadingLoans } = useLoans()

  if (isLoading || isLoadingLoans) return <Skeleton className="h-72" />
  if (!employee) return <p className="text-sm text-muted-foreground">No employee record linked to this account.</p>

  const loans = all.filter((l) => l.employeeId === employee.id)

  return (
    <div className="space-y-5">
      <PageHeader title="My Loans & Deductions" description="Your loan balances and recurring payroll deductions." />

      {loans.length === 0 && <EmptyState title="No loans or deductions" description="Loans and recurring deductions set up by HR will show here." />}
      <div className="grid gap-4 sm:grid-cols-2">
        {loans.map((loan) => {
          const progress = Math.round(((loan.principal - loan.balance) / loan.principal) * 100)
          return (
            <Card key={loan.id} id={`row-${loan.id}`} className={cn('p-5', loan.id === highlightId && 'highlight-target')}>
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium">{TYPE_LABELS[loan.type] ?? loan.label}</p>
                <StatusBadge status={loan.status} />
              </div>
              <p className="mt-3 font-display text-lg font-semibold">{formatCurrency(loan.balance)}</p>
              <p className="text-xs text-muted-foreground">of {formatCurrency(loan.principal)} remaining</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {formatCurrency(loan.monthlyDeduction)}/month &middot; started {formatDate(loan.startDate)}
              </p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
