import { useMemo, useState } from 'react'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useEmployees } from '@ops/features/employees/hooks/useEmployees'
import { useLoanTypes } from '@ops/features/loans-deductions/hooks/useBenefitsDeductions'
import { useLoans } from '@ops/features/loans-deductions/hooks/useLoans'
import { CardStat, ReportCardList, ReportRecordCard, ReportTableView } from '@ops/features/reports/components/ReportRecordCard'
import { FilterLabel, ReportFilterBar, ReportViewShell, StatTile } from '@ops/features/reports/components/shared'
import { useStatutoryContributionData } from '@ops/features/reports/hooks/useReports'
import type { ExcelExport, ReportMetaItem } from '@ops/features/reports/reportExport'
import { useTenant } from '@ops/hooks/useTenant'
import { PAY_RATE_TYPE_LABEL, formatBaseRateShort } from '@ops/lib/payroll/payRate'
import { cn } from '@ops/lib/utils/cn'
import { formatCurrency } from '@ops/lib/utils/format'
import type { Employee } from '@ops/types/domain'

const ALL = 'all'
const fullName = (e: Employee) => `${e.personal.firstName} ${e.personal.lastName}`
const monthLabel = (ym: string) => new Date(`${ym}-01T00:00:00`).toLocaleString('en-US', { month: 'long', year: 'numeric' })

interface Contribution {
  sssEe: number
  sssEr: number
  phEe: number
  phEr: number
  hdmfEe: number
  hdmfEr: number
}

const ZERO: Contribution = { sssEe: 0, sssEr: 0, phEe: 0, phEr: 0, hdmfEe: 0, hdmfEr: 0 }

interface Row extends Contribution {
  employee: Employee
  rate: string
  /** Active SSS and Pag-IBIG loans only. */
  sssLoan: number
  sssLoanBalance: number
  hdmfLoan: number
  hdmfLoanBalance: number
}

const eeTotal = (r: Contribution) => r.sssEe + r.phEe + r.hdmfEe
const erTotal = (r: Contribution) => r.sssEr + r.phEr + r.hdmfEr

/** Per employee: basic pay, employee (EE) and employer (ER) statutory contributions for a month, and what they owe SSS / Pag-IBIG in loans. */
export function PayStatutoryLoansReport() {
  const { employees, isLoading: employeesLoading } = useEmployees()
  const { rows: payroll, isSample, isLoading: payrollLoading } = useStatutoryContributionData()
  const { loans, isLoading: loansLoading } = useLoans()
  const { types } = useLoanTypes()
  const { branches } = useTenant()
  const [department, setDepartment] = useState(ALL)
  const [branchId, setBranchId] = useState(ALL)
  const [month, setMonth] = useState<string | undefined>(undefined)

  const departments = useMemo(() => [...new Set(employees.map((e) => e.employment.department))].sort(), [employees])
  const months = useMemo(() => [...new Set(payroll.map((r) => r.period.startDate.slice(0, 7)))].sort((a, b) => b.localeCompare(a)), [payroll])
  const activeMonth = month ?? months[0]

  const rows = useMemo<Row[]>(() => {
    const byEmployee = new Map<string, Contribution>()
    for (const { employee, period, line } of payroll) {
      if (period.startDate.slice(0, 7) !== activeMonth) continue
      const c = byEmployee.get(employee.id) ?? { ...ZERO }
      c.sssEe += line.sssEmployeeShare
      c.sssEr += line.sssEmployerShare
      c.phEe += line.philhealthEmployeeShare
      c.phEr += line.philhealthEmployerShare
      c.hdmfEe += line.pagibigEmployeeShare
      c.hdmfEr += line.pagibigEmployerShare
      byEmployee.set(employee.id, c)
    }
    const providerOf = (key: string) => types.find((t) => t.key === key)?.provider
    return employees
      .filter((e) => (department === ALL || e.employment.department === department) && (branchId === ALL || e.branchId === branchId))
      .map((e) => {
        const mine = loans.filter((l) => l.employeeId === e.id && l.status === 'active')
        const of = (provider: string) => mine.filter((l) => providerOf(l.type) === provider)
        const sum = (list: typeof mine, pick: 'monthlyDeduction' | 'balance') => list.reduce((s, l) => s + l[pick], 0)
        return {
          employee: e,
          rate: formatBaseRateShort(e.compensation.payType, e.compensation.basicPay, e.compensation.outputUnit),
          ...(byEmployee.get(e.id) ?? ZERO),
          sssLoan: sum(of('SSS'), 'monthlyDeduction'),
          sssLoanBalance: sum(of('SSS'), 'balance'),
          hdmfLoan: sum(of('Pag-IBIG'), 'monthlyDeduction'),
          hdmfLoanBalance: sum(of('Pag-IBIG'), 'balance'),
        }
      })
      .sort((a, b) => fullName(a.employee).localeCompare(fullName(b.employee)))
  }, [employees, payroll, loans, types, activeMonth, department, branchId])

  const sum = (pick: (r: Row) => number) => rows.reduce((s, r) => s + pick(r), 0)
  const scope = activeMonth ? monthLabel(activeMonth) : '—'
  const meta: ReportMetaItem[] = [
    { label: 'Month', value: scope },
    { label: 'Department', value: department === ALL ? 'All' : department },
    { label: 'Branch', value: branchId === ALL ? 'All' : (branches.find((b) => b.id === branchId)?.name ?? branchId) },
  ]

  function onExport(): ExcelExport {
    const header = [
      'Employee ID',
      'Employee',
      'Department',
      'Pay Rate Type',
      'Base Rate',
      'SSS EE',
      'SSS ER',
      'Total SSS',
      'PhilHealth EE',
      'PhilHealth ER',
      'Total PhilHealth',
      'Pag-IBIG EE',
      'Pag-IBIG ER',
      'Total Pag-IBIG',
      'Total EE',
      'Total ER',
      'SSS Loan / Month',
      'SSS Loan Balance',
      'Pag-IBIG Loan / Month',
      'Pag-IBIG Loan Balance',
    ]
    return {
      filename: 'pay-statutory-loans-report',
      rows: [
        header,
        ...rows.map((r) => [
          r.employee.employeeNumber,
          fullName(r.employee),
          r.employee.employment.department,
          PAY_RATE_TYPE_LABEL[r.employee.compensation.payType],
          r.rate,
          r.sssEe,
          r.sssEr,
          r.sssEe + r.sssEr,
          r.phEe,
          r.phEr,
          r.phEe + r.phEr,
          r.hdmfEe,
          r.hdmfEr,
          r.hdmfEe + r.hdmfEr,
          eeTotal(r),
          erTotal(r),
          r.sssLoan,
          r.sssLoanBalance,
          r.hdmfLoan,
          r.hdmfLoanBalance,
        ]),
      ],
      sumFooter: true,
      columnTypes: Object.fromEntries(header.slice(5).map((h) => [h, 'currency' as const])),
    }
  }

  const dirty = department !== ALL || branchId !== ALL || (month !== undefined && month !== months[0])
  const clear = () => (setDepartment(ALL), setBranchId(ALL), setMonth(undefined))
  const money = (v: number, tone?: string) => <TableCell className={cn('whitespace-nowrap text-right tabular-nums', tone)}>{formatCurrency(v)}</TableCell>

  return (
    <ReportViewShell
      title="Employee Pay, Statutory & Loans"
      description="Basic pay, employee and employer SSS / PhilHealth / Pag-IBIG contributions, and SSS / Pag-IBIG loans."
      meta={meta}
      orientation="landscape"
      onExportExcel={rows.length ? onExport : undefined}
    >
      {employeesLoading || payrollLoading || loansLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-4">
          {isSample && <p className="text-xs text-muted-foreground">No payroll has been run yet — contributions are computed from current rates as a sample.</p>}
          <ReportFilterBar onClear={dirty ? clear : undefined}>
            <FilterLabel label="Month" className="w-48">
              <Select value={activeMonth ?? ''} onValueChange={setMonth} options={months.map((m) => ({ value: m, label: monthLabel(m) }))} />
            </FilterLabel>
            <FilterLabel label="Department" className="w-44">
              <Select value={department} onValueChange={setDepartment} options={[{ value: ALL, label: 'All departments' }, ...departments.map((d) => ({ value: d, label: d }))]} />
            </FilterLabel>
            <FilterLabel label="Branch" className="w-44">
              <Select value={branchId} onValueChange={setBranchId} options={[{ value: ALL, label: 'All Branches' }, ...branches.map((b) => ({ value: b.id, label: b.name }))]} />
            </FilterLabel>
          </ReportFilterBar>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile label="Total Employee (EE)" value={formatCurrency(sum(eeTotal))} />
            <StatTile label="Total Employer (ER)" value={formatCurrency(sum(erTotal))} />
            <StatTile label="Gov't Loans / Month" value={formatCurrency(sum((r) => r.sssLoan + r.hdmfLoan))} />
            <StatTile label="Gov't Loan Balance" value={formatCurrency(sum((r) => r.sssLoanBalance + r.hdmfLoanBalance))} />
          </div>
          {rows.length === 0 ? (
            <EmptyState title="No employees for these filters" />
          ) : (
            <>
              <ReportCardList count={rows.length} noun={rows.length === 1 ? 'employee' : 'employees'} note="Sorted by name">
                {rows.map((r) => (
                  <ReportRecordCard
                    key={r.employee.id}
                    avatar={fullName(r.employee)}
                    title={fullName(r.employee)}
                    subtitle={r.employee.employment.department}
                    meta={r.employee.employeeNumber}
                    details={
                      <>
                        <CardStat label="SSS EE / ER">
                          {formatCurrency(r.sssEe)} / {formatCurrency(r.sssEr)}
                        </CardStat>
                        <CardStat label="PhilHealth EE / ER">
                          {formatCurrency(r.phEe)} / {formatCurrency(r.phEr)}
                        </CardStat>
                        <CardStat label="Pag-IBIG EE / ER">
                          {formatCurrency(r.hdmfEe)} / {formatCurrency(r.hdmfEr)}
                        </CardStat>
                        <CardStat label="Total SSS">{formatCurrency(r.sssEe + r.sssEr)}</CardStat>
                        <CardStat label="Total PhilHealth">{formatCurrency(r.phEe + r.phEr)}</CardStat>
                        <CardStat label="Total Pag-IBIG" className="col-span-2">
                          {formatCurrency(r.hdmfEe + r.hdmfEr)}
                        </CardStat>
                        <CardStat label="SSS loan (balance)">
                          {formatCurrency(r.sssLoan)} ({formatCurrency(r.sssLoanBalance)})
                        </CardStat>
                        <CardStat label="Pag-IBIG loan (balance)" className="col-span-2">
                          {formatCurrency(r.hdmfLoan)} ({formatCurrency(r.hdmfLoanBalance)})
                        </CardStat>
                      </>
                    }
                  >
                    <CardStat label="Base rate">{r.rate}</CardStat>
                    <CardStat label="Total EE">{formatCurrency(eeTotal(r))}</CardStat>
                    <CardStat label="Total ER">{formatCurrency(erTotal(r))}</CardStat>
                    <CardStat label="Gov't loans / month">{formatCurrency(r.sssLoan + r.hdmfLoan)}</CardStat>
                  </ReportRecordCard>
                ))}
              </ReportCardList>
              <ReportTableView>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Base Rate</TableHead>
                      <TableHead className="text-right">SSS EE</TableHead>
                      <TableHead className="text-right">SSS ER</TableHead>
                      <TableHead className="text-right bg-muted font-semibold">Total SSS</TableHead>
                      <TableHead className="text-right">PhilHealth EE</TableHead>
                      <TableHead className="text-right">PhilHealth ER</TableHead>
                      <TableHead className="text-right bg-muted font-semibold">Total PhilHealth</TableHead>
                      <TableHead className="text-right">Pag-IBIG EE</TableHead>
                      <TableHead className="text-right">Pag-IBIG ER</TableHead>
                      <TableHead className="text-right bg-muted font-semibold">Total Pag-IBIG</TableHead>
                      <TableHead className="text-right bg-muted font-semibold">Total EE</TableHead>
                      <TableHead className="text-right bg-muted font-semibold">Total ER</TableHead>
                      <TableHead className="text-right bg-amber-500/10">SSS Loan / Mo</TableHead>
                      <TableHead className="text-right bg-amber-500/10">SSS Balance</TableHead>
                      <TableHead className="text-right bg-amber-500/10">Pag-IBIG Loan / Mo</TableHead>
                      <TableHead className="text-right bg-amber-500/10">Pag-IBIG Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.employee.id}>
                        <TableCell>
                          <p className="font-medium">{fullName(r.employee)}</p>
                          <p className="text-[11px] text-muted-foreground">{r.employee.employeeNumber}</p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{r.rate}</TableCell>
                        {money(r.sssEe)}
                        {money(r.sssEr)}
                        {money(r.sssEe + r.sssEr, 'bg-muted font-semibold')}
                        {money(r.phEe)}
                        {money(r.phEr)}
                        {money(r.phEe + r.phEr, 'bg-muted font-semibold')}
                        {money(r.hdmfEe)}
                        {money(r.hdmfEr)}
                        {money(r.hdmfEe + r.hdmfEr, 'bg-muted font-semibold')}
                        {money(eeTotal(r), 'bg-muted font-semibold')}
                        {money(erTotal(r), 'bg-muted font-semibold')}
                        {money(r.sssLoan, 'bg-amber-500/10')}
                        {money(r.sssLoanBalance, 'bg-amber-500/10')}
                        {money(r.hdmfLoan, 'bg-amber-500/10')}
                        {money(r.hdmfLoanBalance, 'bg-amber-500/10')}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ReportTableView>
            </>
          )}
        </div>
      )}
    </ReportViewShell>
  )
}
