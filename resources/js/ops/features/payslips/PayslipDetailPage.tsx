import { ArrowLeft, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Button } from '@ops/components/ui/Button'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { usePayrollGroups } from '@ops/features/company-settings/hooks/usePayrollGroups'
import { usePayrollEmployees, usePayrollPeriods } from '@ops/features/payroll/hooks/usePayroll'
import { PayslipCard } from '@ops/features/payslips/components/PayslipCard'
import { useSession } from '@ops/hooks/useSession'
import { useTenant } from '@ops/hooks/useTenant'
import { findEmployeePayrollGroup } from '@ops/lib/payroll/groupAssignment'
import { fetchLoans } from '@ops/lib/services/loanApiService'
import { fetchDeductionConfigsForPayslips, fetchPayrollLine } from '@ops/lib/services/payrollApiService'
import type { DeductionConfig, LoanRecord, PayrollLine } from '@ops/types/domain'

export function PayslipDetailPage() {
  const { lineId } = useParams<{ lineId: string }>()
  // Opened from the Payslip Report? Go back to it (filters intact) instead of the payslips list.
  const from = (useLocation().state as { from?: string; fromLabel?: string } | null) ?? null
  const { user } = useSession()
  const { company } = useTenant()
  const [line, setLine] = useState<PayrollLine | null | undefined>(undefined)
  const [deductionConfigs, setDeductionConfigs] = useState<DeductionConfig[]>([])
  const [loans, setLoans] = useState<LoanRecord[]>([])
  const { groups: payrollGroups } = usePayrollGroups()
  const { periods } = usePayrollPeriods()

  useEffect(() => {
    if (!lineId) return
    setLine(undefined)
    fetchPayrollLine(lineId).then(setLine, () => setLine(null))
    fetchDeductionConfigsForPayslips().then(setDeductionConfigs)
    fetchLoans().then(setLoans)
  }, [user, lineId])

  const { employees } = usePayrollEmployees()
  const employee = employees.find((e) => e.id === line?.employeeId)
  const period = periods.find((p) => p.id === line?.periodId)
  const payrollGroup = employee ? findEmployeePayrollGroup(payrollGroups, employee.id) : undefined

  if (line === undefined || (line && !employee)) return <Skeleton className="h-96" />
  if (!line || !employee) return <p className="text-sm text-muted-foreground">Payslip not found.</p>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between print:hidden">
        <Link to={from?.from ?? '/payslips'} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          {from?.from ? `Back to ${from.fromLabel ?? 'previous page'}` : 'Back to payslips'}
        </Link>
        <Button size="sm" variant="secondary" icon={<Printer className="size-4" />} onClick={() => window.print()}>
          Print / Download
        </Button>
      </div>

      <PayslipCard
        company={company}
        employee={employee}
        period={period}
        payrollGroup={payrollGroup}
        line={line}
        deductionConfigs={deductionConfigs}
        loans={loans.filter((l) => l.employeeId === employee.id)}
      />
    </div>
  )
}
