import { useEffect, useMemo, useState } from 'react'
import { StatusBadge } from '@ops/components/ui/Badge'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useBonuses } from '@ops/features/bonuses/hooks/useBonuses'
import { useEmployees } from '@ops/features/employees/hooks/useEmployees'
import { CardStat, ReportCardList, ReportRecordCard, ReportTableView } from '@ops/features/reports/components/ReportRecordCard'
import { FilterLabel, ReportFilterBar, ReportViewShell, StatTile } from '@ops/features/reports/components/shared'
import { useAllPayrollLines } from '@ops/features/reports/hooks/useReports'
import type { ExcelExport, ReportMetaItem } from '@ops/features/reports/reportExport'
import { useThirteenthMonthRuns } from '@ops/features/thirteenth-month/hooks/useThirteenthMonth'
import { useSession } from '@ops/hooks/useSession'
import { getThirteenthMonthLines } from '@ops/lib/services/thirteenthMonthService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { Employee, ThirteenthMonthLine } from '@ops/types/domain'

const fullName = (e: Employee) => `${e.personal.firstName} ${e.personal.lastName}`
const label = (value: string) => value.replace(/_/g, ' ')
const ALL = 'all'

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

/** Payroll History — every payroll run with its status and totals. */
export function PayrollHistoryReport() {
  const { rows, isLoading } = useAllPayrollLines()
  const [year, setYear] = useState(ALL)
  const [status, setStatus] = useState(ALL)

  const runs = useMemo(() => {
    const byPeriod = new Map<string, { period: (typeof rows)[number]['period']; employees: number; gross: number; deductions: number; net: number; employer: number }>()
    for (const { period, line } of rows) {
      const entry = byPeriod.get(period.id) ?? { period, employees: 0, gross: 0, deductions: 0, net: 0, employer: 0 }
      entry.employees += 1
      entry.gross += line.grossPay
      entry.deductions += line.totalDeductions
      entry.net += line.netPay
      entry.employer += line.sssEmployerShare + line.philhealthEmployerShare + line.pagibigEmployerShare
      byPeriod.set(period.id, entry)
    }
    return [...byPeriod.values()].sort((a, b) => b.period.startDate.localeCompare(a.period.startDate))
  }, [rows])

  const years = useMemo(() => [...new Set(runs.map((r) => r.period.payDate.slice(0, 4)))].sort().reverse(), [runs])
  const visible = runs.filter((r) => (year === ALL || r.period.payDate.startsWith(year)) && (status === ALL || r.period.status === status))
  const hasFilters = year !== ALL || status !== ALL

  const meta: ReportMetaItem[] = [
    { label: 'Pay year', value: year === ALL ? 'All' : year },
    { label: 'Status', value: status === ALL ? 'All' : label(status) },
  ]

  function onExport(): ExcelExport {
    const header = ['Payroll No.', 'Period', 'Pay Date', 'Status', 'Employees', 'Gross Pay', 'Total Deductions', 'Net Pay', 'Employer Contributions']
    const body = visible.map((r) => [r.period.payrollNumber, r.period.label, r.period.payDate, label(r.period.status), r.employees, r.gross, r.deductions, r.net, r.employer])
    return {
      filename: 'payroll-history',
      rows: [header, ...body],
      sumFooter: true,
      columnTypes: { Employees: 'integer', 'Gross Pay': 'currency', 'Total Deductions': 'currency', 'Net Pay': 'currency', 'Employer Contributions': 'currency' },
    }
  }

  return (
    <ReportViewShell
      title="Payroll History"
      description="Every payroll run, its status and totals."
      meta={meta}
      orientation="landscape"
      onExportExcel={visible.length > 0 ? onExport : undefined}
    >
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : runs.length === 0 ? (
        <EmptyState title="No payroll runs yet" description="Runs appear here once they are created and calculated." />
      ) : (
        <div className="space-y-4">
          <ReportFilterBar onClear={hasFilters ? () => (setYear(ALL), setStatus(ALL)) : undefined}>
            <FilterLabel label="Pay year" className="w-36">
              <Select value={year} onValueChange={setYear} options={[{ value: ALL, label: 'All years' }, ...years.map((y) => ({ value: y, label: y }))]} />
            </FilterLabel>
            <FilterLabel label="Status" className="w-44">
              <Select
                value={status}
                onValueChange={setStatus}
                options={[
                  { value: ALL, label: 'All statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'review', label: 'In review' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'finalized', label: 'Finalized' },
                ]}
              />
            </FilterLabel>
          </ReportFilterBar>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile label="Payroll Runs" value={String(visible.length)} />
            <StatTile label="Total Gross Pay" value={formatCurrency(sum(visible.map((r) => r.gross)))} />
            <StatTile label="Total Deductions" value={formatCurrency(sum(visible.map((r) => r.deductions)))} />
            <StatTile label="Total Net Pay" value={formatCurrency(sum(visible.map((r) => r.net)))} />
          </div>

          {visible.length === 0 ? (
            <EmptyState title="No payroll runs match these filters" />
          ) : (
            <>
            <ReportCardList count={visible.length} noun={visible.length === 1 ? 'payroll run' : 'payroll runs'} note="Newest first">
              {visible.map((r) => (
                <ReportRecordCard
                  key={r.period.id}
                  title={r.period.payrollNumber}
                  badge={<StatusBadge status={r.period.status} />}
                  subtitle={r.period.label}
                  meta={`Pay date ${formatDate(r.period.payDate)}`}
                >
                  <CardStat label="Employees">{r.employees}</CardStat>
                  <CardStat label="Gross Pay">{formatCurrency(r.gross)}</CardStat>
                  <CardStat label="Deductions">{formatCurrency(r.deductions)}</CardStat>
                  <CardStat label="Net Pay">{formatCurrency(r.net)}</CardStat>
                </ReportRecordCard>
              ))}
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payroll No.</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Employees</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <TableRow key={r.period.id}>
                    <TableCell className="font-medium">{r.period.payrollNumber}</TableCell>
                    <TableCell>{r.period.label}</TableCell>
                    <TableCell>{formatDate(r.period.payDate)}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.period.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.employees}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(r.gross)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(r.deductions)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatCurrency(r.net)}</TableCell>
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

/** Bonus Report — every bonus and incentive with who it targets, its tax treatment and approval status. */
export function BonusReport() {
  const { bonuses, isLoading } = useBonuses()
  const { employees } = useEmployees()
  const [status, setStatus] = useState(ALL)
  const [taxable, setTaxable] = useState(ALL)

  const byId = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])
  const targetOf = (b: (typeof bonuses)[number]) => {
    if (b.targetType === 'company') return 'Whole company'
    if (b.targetType === 'department') return b.targetDepartment ?? 'Department'
    if (b.targetType === 'employees') return `${b.targetEmployeeIds?.length ?? 0} selected employees`
    const e = b.targetEmployeeId ? byId.get(b.targetEmployeeId) : undefined
    return e ? fullName(e) : 'Employee'
  }
  const amountOf = (b: (typeof bonuses)[number]) => (b.bonusType === 'percentage' ? `${b.amount}% of monthly basic` : formatCurrency(b.amount))

  const visible = bonuses.filter((b) => (status === ALL || b.status === status) && (taxable === ALL || (taxable === 'taxable' ? b.taxable : !b.taxable)))
  const hasFilters = status !== ALL || taxable !== ALL
  const approved = visible.filter((b) => b.status === 'approved')
  const meta: ReportMetaItem[] = [
    { label: 'Status', value: status === ALL ? 'All' : label(status) },
    { label: 'Tax treatment', value: taxable === ALL ? 'All' : taxable },
  ]

  function onExport(): ExcelExport {
    const header = ['Bonus / Incentive', 'Type', 'Target', 'Amount', 'Tax Treatment', 'Frequency', 'Payroll Period', 'Status']
    const body = visible.map((b) => [b.name, label(b.bonusType), targetOf(b), b.bonusType === 'percentage' ? `${b.amount}%` : b.amount, b.taxable ? 'Taxable' : 'Non-taxable', label(b.frequency), b.periodLabel, label(b.status)])
    return { filename: 'bonus-report', rows: [header, ...body], columnTypes: { Amount: 'currency' } }
  }

  return (
    <ReportViewShell
      title="Bonus Report"
      description="Bonuses and incentives with their targets, tax treatment and approval status."
      meta={meta}
      orientation="landscape"
      onExportExcel={visible.length > 0 ? onExport : undefined}
    >
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : bonuses.length === 0 ? (
        <EmptyState title="No bonuses or incentives yet" />
      ) : (
        <div className="space-y-4">
          <ReportFilterBar onClear={hasFilters ? () => (setStatus(ALL), setTaxable(ALL)) : undefined}>
            <FilterLabel label="Status" className="w-44">
              <Select
                value={status}
                onValueChange={setStatus}
                options={[
                  { value: ALL, label: 'All statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
              />
            </FilterLabel>
            <FilterLabel label="Tax treatment" className="w-44">
              <Select
                value={taxable}
                onValueChange={setTaxable}
                options={[
                  { value: ALL, label: 'All' },
                  { value: 'taxable', label: 'Taxable' },
                  { value: 'non-taxable', label: 'Non-taxable' },
                ]}
              />
            </FilterLabel>
          </ReportFilterBar>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:col-span-1">
            <StatTile label="Bonuses Listed" value={String(visible.length)} />
            <StatTile label="Approved" value={String(approved.length)} />
            <StatTile label="Approved Fixed Amounts" value={formatCurrency(sum(approved.filter((b) => b.bonusType !== 'percentage').map((b) => b.amount)))} />
          </div>

          {visible.length === 0 ? (
            <EmptyState title="No bonuses match these filters" />
          ) : (
            <>
            <ReportCardList count={visible.length} noun={visible.length === 1 ? 'bonus' : 'bonuses'}>
              {visible.map((b) => (
                <ReportRecordCard
                  key={b.id}
                  title={b.name}
                  badge={<StatusBadge status={b.status} />}
                  subtitle={targetOf(b)}
                  meta={`${b.periodLabel} · ${label(b.frequency)}`}
                  details={
                    <>
                      <CardStat label="Type" className="capitalize">
                        {label(b.bonusType)}
                      </CardStat>
                      <CardStat label="Tax">{b.taxable ? 'Taxable' : 'Non-taxable'}</CardStat>
                      <CardStat label="Frequency" className="capitalize">
                        {label(b.frequency)}
                      </CardStat>
                      <CardStat label="Payroll Period">{b.periodLabel}</CardStat>
                      <CardStat label="Target" className="col-span-2">
                        {targetOf(b)}
                      </CardStat>
                    </>
                  }
                >
                  <CardStat label="Amount" className="col-span-2">
                    {amountOf(b)}
                  </CardStat>
                </ReportRecordCard>
              ))}
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bonus / Incentive</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Payroll Period</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="capitalize">{label(b.bonusType)}</TableCell>
                    <TableCell>{targetOf(b)}</TableCell>
                    <TableCell className="text-right tabular-nums">{amountOf(b)}</TableCell>
                    <TableCell>{b.taxable ? 'Taxable' : 'Non-taxable'}</TableCell>
                    <TableCell className="capitalize">{label(b.frequency)}</TableCell>
                    <TableCell>{b.periodLabel}</TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
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

/** 13th Month Pay Report — per-employee 13th month computations across every batch. */
export function ThirteenthMonthPayReport() {
  const { user } = useSession()
  const { runs, isLoading: runsLoading } = useThirteenthMonthRuns()
  const { employees, isLoading: employeesLoading } = useEmployees()
  const [linesByRun, setLinesByRun] = useState<Map<string, ThirteenthMonthLine[]> | null>(null)
  const [year, setYear] = useState(ALL)

  useEffect(() => {
    if (runsLoading) return
    let cancelled = false
    Promise.all(runs.map(async (run) => [run.id, await getThirteenthMonthLines(user, run.id)] as const)).then((entries) => {
      if (!cancelled) setLinesByRun(new Map(entries))
    })
    return () => {
      cancelled = true
    }
  }, [user, runs, runsLoading])

  const byId = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])
  const rows = useMemo(
    () =>
      runs.flatMap((run) =>
        (linesByRun?.get(run.id) ?? []).flatMap((line) => {
          const employee = byId.get(line.employeeId)
          return employee ? [{ run, line, employee }] : []
        }),
      ),
    [runs, linesByRun, byId],
  )

  const years = [...new Set(runs.map((r) => String(r.year)))].sort().reverse()
  const visible = rows.filter((r) => year === ALL || String(r.run.year) === year)
  const loading = runsLoading || employeesLoading || linesByRun === null
  const meta: ReportMetaItem[] = [{ label: 'Year', value: year === ALL ? 'All' : year }]

  function onExport(): ExcelExport {
    const header = ['Year', 'Employee ID', 'Employee Name', 'Department', 'Months Credited', 'Basic Salary Earned', '13th Month Pay', 'Batch Status']
    const body = visible.map((r) => [r.run.year, r.employee.employeeNumber, fullName(r.employee), r.employee.employment.department, r.line.monthsCredited, r.line.annualBasicEarned, r.line.thirteenthMonthPay, r.run.status])
    return {
      filename: '13th-month-pay-report',
      rows: [header, ...body],
      sumFooter: true,
      columnTypes: { Year: 'text', 'Months Credited': 'number', 'Basic Salary Earned': 'currency', '13th Month Pay': 'currency' },
    }
  }

  return (
    <ReportViewShell
      title="13th Month Pay Report"
      description="13th Month Pay computed per employee, across every batch."
      meta={meta}
      orientation="landscape"
      onExportExcel={visible.length > 0 ? onExport : undefined}
    >
      {loading ? (
        <Skeleton className="h-64" />
      ) : runs.length === 0 ? (
        <EmptyState title="No 13th Month Pay batches yet" description="Generate a batch under 13th Month Pay and it will appear here." />
      ) : (
        <div className="space-y-4">
          <ReportFilterBar onClear={year !== ALL ? () => setYear(ALL) : undefined}>
            <FilterLabel label="Year" className="w-36">
              <Select value={year} onValueChange={setYear} options={[{ value: ALL, label: 'All years' }, ...years.map((y) => ({ value: y, label: y }))]} />
            </FilterLabel>
          </ReportFilterBar>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:col-span-1">
            <StatTile label="Employees Covered" value={String(new Set(visible.map((r) => r.employee.id)).size)} />
            <StatTile label="Total Basic Earned" value={formatCurrency(sum(visible.map((r) => r.line.annualBasicEarned)))} />
            <StatTile label="Total 13th Month Pay" value={formatCurrency(sum(visible.map((r) => r.line.thirteenthMonthPay)))} />
          </div>

          {visible.length === 0 ? (
            <EmptyState title="No records for this year" />
          ) : (
            <>
            <ReportCardList count={visible.length} noun={visible.length === 1 ? 'record' : 'records'}>
              {visible.map(({ run, line, employee }) => (
                <ReportRecordCard
                  key={line.id}
                  avatar={fullName(employee)}
                  title={fullName(employee)}
                  badge={<StatusBadge status={run.status} />}
                  subtitle={employee.employment.department}
                  meta={`${employee.employeeNumber} · ${run.year} batch`}
                >
                  <CardStat label="Months Credited">{line.monthsCredited}</CardStat>
                  <CardStat label="Basic Earned">{formatCurrency(line.annualBasicEarned)}</CardStat>
                  <CardStat label="13th Month Pay" className="col-span-2">
                    {formatCurrency(line.thirteenthMonthPay)}
                  </CardStat>
                </ReportRecordCard>
              ))}
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Months</TableHead>
                  <TableHead className="text-right">Basic Earned</TableHead>
                  <TableHead className="text-right">13th Month Pay</TableHead>
                  <TableHead>Batch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map(({ run, line, employee }) => (
                  <TableRow key={line.id}>
                    <TableCell>{run.year}</TableCell>
                    <TableCell>
                      <p className="font-medium">{fullName(employee)}</p>
                      <p className="text-[11px] text-muted-foreground">{employee.employeeNumber}</p>
                    </TableCell>
                    <TableCell>{employee.employment.department}</TableCell>
                    <TableCell className="text-right tabular-nums">{line.monthsCredited}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(line.annualBasicEarned)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatCurrency(line.thirteenthMonthPay)}</TableCell>
                    <TableCell>
                      <StatusBadge status={run.status} />
                    </TableCell>
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
