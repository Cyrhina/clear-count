import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { StatusBadge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { EmployeeCombobox } from '@ops/components/ui/EmployeeCombobox'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import { usePayrollGroups } from '@ops/features/company-settings/hooks/usePayrollGroups'
import { useEmployees } from '@ops/features/employees/hooks/useEmployees'
import { useOvertimeRecords } from '@ops/features/overtime/hooks/useOvertime'
import { useLoans } from '@ops/features/loans-deductions/hooks/useLoans'
import { CardStat, ReportCardList, ReportRecordCard, ReportTableView } from '@ops/features/reports/components/ReportRecordCard'
import { FilterLabel, ReportFilterBar, ReportScopePicker, ReportViewShell, StatTile, useScopedPayrollLines } from '@ops/features/reports/components/shared'
import { useEmployeeBenefits } from '@ops/features/loans-deductions/hooks/useBenefitsDeductions'
import { BENEFIT_CATEGORY_META } from '@ops/features/loans-deductions/loanUtils'
import { deductionBreakdown, defaultScope, inScope, monthLabel, payrollMonthKey, scopeLabel, summarizeBy, type ReportScope } from '@ops/features/reports/payrollAggregates'
import { parseCsv, type ExcelExport, type ReportMetaItem } from '@ops/features/reports/reportExport'
import {
  useAllPayrollLines,
  useEmployeeMasterlist,
  usePayrollPeriodOptions,
  usePayrollRegister,
} from '@ops/features/reports/hooks/useReports'
import { usePermission } from '@ops/hooks/usePermission'
import { useSession } from '@ops/hooks/useSession'
import { useTenant } from '@ops/hooks/useTenant'
import { findEmployeePayrollGroup } from '@ops/lib/payroll/groupAssignment'
import { PAY_RATE_TYPE_LABEL, formatBaseRateShort } from '@ops/lib/payroll/payRate'
import { hourlyRateFor } from '@ops/lib/payroll/rateBasis'
import { exportEmployeeMasterlistCsv } from '@ops/lib/services/integrationService'
import { getDeductionConfigs } from '@ops/lib/services/payrollConfigService'
import { exportOvertimeSummaryCsv } from '@ops/lib/services/overtimeService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { BenefitCategory, DeductionConfig, Employee, PayrollGroup } from '@ops/types/domain'

function fullName(personal: { firstName: string; lastName: string }) {
  return `${personal.firstName} ${personal.lastName}`
}

/** Department / Branch / Employee filter context for the export header. */
function employeeFilterMeta(
  { employeeIds, department, branchId }: { employeeIds: string[]; department: string; branchId: string },
  branches: { id: string; name: string }[],
): ReportMetaItem[] {
  return [
    { label: 'Department', value: department === 'all' ? 'All' : department },
    { label: 'Branch', value: branchId === 'all' ? 'All' : (branches.find((b) => b.id === branchId)?.name ?? branchId) },
    ...(employeeIds.length > 0 ? [{ label: 'Employees', value: `${employeeIds.length} selected` }] : []),
  ]
}

/** Keep only the CSV rows (after the header) whose `column` value belongs to the on-screen, filtered employees. */
function filterCsvRows(rows: string[][], column: string, allowed: Set<string>): string[][] {
  const [header = [], ...body] = rows
  const index = header.indexOf(column)
  return index < 0 ? rows : [header, ...body.filter((r) => allowed.has(r[index]))]
}

/** Closing card of a card list, standing in for the table's totals row. */
function TotalCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card watermark={null} className="bg-muted/50 p-3.5 sm:col-span-2">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-border pt-3 sm:grid-cols-4">{children}</div>
    </Card>
  )
}

function comboboxOptions(employees: Employee[]) {
  return employees.map((e) => ({ id: e.id, name: fullName(e.personal), employeeNumber: e.employeeNumber, department: e.employment.department }))
}

const FREQUENCY_LABEL: Record<PayrollGroup['frequency'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  semi_monthly: 'Semi-monthly',
  monthly: 'Monthly',
  custom: 'Custom',
}

export function EmployeeMasterListReport() {
  const { employees, isLoading } = useEmployeeMasterlist()
  const { branches } = useTenant()
  const { user } = useSession()
  const { notify } = useToast()

  const [employeeIds, setEmployeeIds] = useState<string[]>([])
  const [department, setDepartment] = useState('all')
  const [branchId, setBranchId] = useState('all')

  const departmentOptions = useMemo(() => {
    const unique = Array.from(new Set(employees.map((e) => e.employment.department))).sort()
    return [{ value: 'all', label: 'All Departments' }, ...unique.map((d) => ({ value: d, label: d }))]
  }, [employees])
  const branchOptions = useMemo(
    () => [{ value: 'all', label: 'All Branches' }, ...branches.map((b) => ({ value: b.id, label: b.name }))],
    [branches],
  )

  const filteredEmployees = employees.filter(
    (e) =>
      (employeeIds.length === 0 || employeeIds.includes(e.id)) &&
      (department === 'all' || e.employment.department === department) &&
      (branchId === 'all' || e.branchId === branchId),
  )

  const hasActiveFilters = employeeIds.length > 0 || department !== 'all' || branchId !== 'all'
  function clearFilters() {
    setEmployeeIds([])
    setDepartment('all')
    setBranchId('all')
  }

  async function onExport(): Promise<ExcelExport> {
    const rows = parseCsv(await exportEmployeeMasterlistCsv(user))
    notify({ title: 'Employee masterlist exported', tone: 'success' })
    return { filename: 'employee-masterlist', rows: filterCsvRows(rows, 'Employee #', new Set(filteredEmployees.map((e) => e.employeeNumber))) }
  }

  return (
    <ReportViewShell
      title="Employee Master List"
      description="Full profile and demographic export for every employee."
      meta={employeeFilterMeta({ employeeIds, department, branchId }, branches)}
      onExportExcel={onExport}
    >
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : employees.length === 0 ? (
        <EmptyState title="No employees yet" />
      ) : (
        <div className="space-y-4">
          <ReportFilterBar onClear={hasActiveFilters ? clearFilters : undefined}>
            <FilterLabel label="" className="w-64">
              <EmployeeCombobox
                multiple
                employees={comboboxOptions(employees)}
                value={employeeIds}
                onChange={setEmployeeIds}
                placeholder="Search by name or employee #"
              />
            </FilterLabel>
            <FilterLabel label="Department" className="w-44">
              <Select value={department} onValueChange={setDepartment} options={departmentOptions} />
            </FilterLabel>
            <FilterLabel label="Branch" className="w-44">
              <Select value={branchId} onValueChange={setBranchId} options={branchOptions} />
            </FilterLabel>
          </ReportFilterBar>

          {filteredEmployees.length === 0 ? (
            <EmptyState title="No matching employee records found" description="Try adjusting or clearing the filters above." />
          ) : (
            <>
            <ReportCardList count={filteredEmployees.length} noun={filteredEmployees.length === 1 ? 'employee' : 'employees'} note="Sorted by last name">
              {filteredEmployees.map((e) => (
                <ReportRecordCard
                  key={e.id}
                  avatar={fullName(e.personal)}
                  title={fullName(e.personal)}
                  badge={<StatusBadge status={e.employment.status} />}
                  subtitle={`${e.employment.position} · ${e.employment.department}`}
                  meta={`${e.employeeNumber} · Hired ${formatDate(e.employment.dateHired)}`}
                  details={
                    <>
                      <CardStat label="Employee #">{e.employeeNumber}</CardStat>
                      <CardStat label="Date Hired">{formatDate(e.employment.dateHired)}</CardStat>
                      <CardStat label="Department">{e.employment.department}</CardStat>
                      <CardStat label="Position">{e.employment.position}</CardStat>
                      <CardStat label="Branch">{branches.find((b) => b.id === e.branchId)?.name ?? '—'}</CardStat>
                      <CardStat label="Status" className="capitalize">
                        {e.employment.status}
                      </CardStat>
                    </>
                  }
                />
              ))}
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Date Hired</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.employeeNumber}</TableCell>
                    <TableCell className="font-medium">{fullName(e.personal)}</TableCell>
                    <TableCell>{e.employment.department}</TableCell>
                    <TableCell>{e.employment.position}</TableCell>
                    <TableCell>{formatDate(e.employment.dateHired)}</TableCell>
                    <TableCell className="capitalize">{e.employment.status}</TableCell>
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

export function EmployeeCompensationReport() {
  const { employees, isLoading } = useEmployees()
  const { groups } = usePayrollGroups()

  function onExport(): ExcelExport {
    const header = ['Employee', 'Position', 'Pay Rate Type', 'Base Rate', 'Allowances', 'Pay Frequency']
    const rows = employees.map((e) => {
      const group = findEmployeePayrollGroup(groups, e.id)
      const allowances = e.compensation.allowances.reduce((s, a) => s + a.amount, 0)
      return [
        fullName(e.personal),
        e.employment.position,
        PAY_RATE_TYPE_LABEL[e.compensation.payType],
        formatBaseRateShort(e.compensation.payType, e.compensation.basicPay, e.compensation.outputUnit),
        allowances,
        group ? FREQUENCY_LABEL[group.frequency] : '',
      ]
    })
    return { filename: 'employee-compensation-report', rows: [header, ...rows], columnTypes: { Allowances: 'currency' } }
  }

  return (
    <ReportViewShell
      title="Employee Compensation Report"
      description="Breakdown of basic rates, allowances, and pay frequency per employee."
      meta={[{ label: 'Employees', value: `All (${employees.length})` }]}
      onExportExcel={onExport}
    >
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : employees.length === 0 ? (
        <EmptyState title="No employees yet" />
      ) : (
        <>
        <ReportCardList count={employees.length} noun={employees.length === 1 ? 'employee' : 'employees'}>
          {employees.map((e) => {
            const group = findEmployeePayrollGroup(groups, e.id)
            const allowances = e.compensation.allowances.reduce((s, a) => s + a.amount, 0)
            return (
              <ReportRecordCard
                key={e.id}
                avatar={fullName(e.personal)}
                title={fullName(e.personal)}
                subtitle={e.employment.position}
                meta={`${PAY_RATE_TYPE_LABEL[e.compensation.payType]} · ${group ? FREQUENCY_LABEL[group.frequency] : '—'}`}
              >
                <CardStat label="Base Rate">{formatBaseRateShort(e.compensation.payType, e.compensation.basicPay, e.compensation.outputUnit)}</CardStat>
                <CardStat label="Allowances">{formatCurrency(allowances)}</CardStat>
              </ReportRecordCard>
            )
          })}
        </ReportCardList>
        <ReportTableView>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Pay Rate Type</TableHead>
              <TableHead>Base Rate</TableHead>
              <TableHead>Allowances</TableHead>
              <TableHead>Pay Frequency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((e) => {
              const group = findEmployeePayrollGroup(groups, e.id)
              const allowances = e.compensation.allowances.reduce((s, a) => s + a.amount, 0)
              return (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{fullName(e.personal)}</TableCell>
                  <TableCell>{e.employment.position}</TableCell>
                  <TableCell>{PAY_RATE_TYPE_LABEL[e.compensation.payType]}</TableCell>
                  <TableCell>{formatBaseRateShort(e.compensation.payType, e.compensation.basicPay, e.compensation.outputUnit)}</TableCell>
                  <TableCell>{formatCurrency(allowances)}</TableCell>
                  <TableCell>{group ? FREQUENCY_LABEL[group.frequency] : '—'}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </ReportTableView>
        </>
      )}
    </ReportViewShell>
  )
}

export function PayrollRegisterReport() {
  const { periods, isLoading: periodsLoading } = usePayrollPeriodOptions()
  const { rows: allLines, isLoading: linesLoading } = useAllPayrollLines()
  const [periodId, setPeriodId] = useState<string | undefined>(undefined)
  const [scopeState, setScope] = useState<ReportScope | undefined>(undefined)
  const scope = scopeState ?? defaultScope(periods)
  const { report: runReport, isLoading: runLoading } = usePayrollRegister(periodId ?? periods[0]?.id)

  // Month / year / date range: each employee's pay summed across every run in the range.
  const rangeReport = useMemo(() => {
    if (scope.basis === 'run') return null
    type Row = { employee: Employee; grossPay: number; sssEmployeeShare: number; philhealthEmployeeShare: number; pagibigEmployeeShare: number; withholdingTax: number; totalDeductions: number; netPay: number }
    const byEmployee = new Map<string, Row>()
    const runIds = new Set<string>()
    for (const { period, employee, line } of allLines) {
      if (!inScope(period, scope)) continue
      runIds.add(period.id)
      const prev = byEmployee.get(employee.id)
      byEmployee.set(employee.id, {
        employee,
        grossPay: (prev?.grossPay ?? 0) + line.grossPay,
        sssEmployeeShare: (prev?.sssEmployeeShare ?? 0) + line.sssEmployeeShare,
        philhealthEmployeeShare: (prev?.philhealthEmployeeShare ?? 0) + line.philhealthEmployeeShare,
        pagibigEmployeeShare: (prev?.pagibigEmployeeShare ?? 0) + line.pagibigEmployeeShare,
        withholdingTax: (prev?.withholdingTax ?? 0) + line.withholdingTax,
        totalDeductions: (prev?.totalDeductions ?? 0) + line.totalDeductions,
        netPay: (prev?.netPay ?? 0) + line.netPay,
      })
    }
    const rows = [...byEmployee.values()].sort((a, b) => fullName(a.employee.personal).localeCompare(fullName(b.employee.personal)))
    return {
      runs: runIds.size,
      rows,
      totals: {
        grossPay: rows.reduce((s, r) => s + r.grossPay, 0),
        totalDeductions: rows.reduce((s, r) => s + r.totalDeductions, 0),
        netPay: rows.reduce((s, r) => s + r.netPay, 0),
      },
    }
  }, [allLines, scope])

  const report = scope.basis === 'run' ? runReport : rangeReport
  const isLoading = scope.basis === 'run' ? runLoading : linesLoading

  function onExport(): ExcelExport {
    const header = ['Employee', 'Gross Pay', 'SSS', 'PhilHealth', 'Pag-IBIG', 'Withholding Tax', 'Total Deductions', 'Net Pay']
    const rows = (report?.rows ?? []).map((r) => [
      fullName(r.employee.personal),
      r.grossPay,
      r.sssEmployeeShare,
      r.philhealthEmployeeShare,
      r.pagibigEmployeeShare,
      r.withholdingTax,
      r.totalDeductions,
      r.netPay,
    ])
    return {
      filename: scope.basis === 'run' ? `payroll-register-${runReport?.period ? `${runReport.period.payrollNumber}-${runReport.period.payrollYear}-${runReport.period.label}` : 'period'}` : `payroll-register-${scopeLabel(scope).replace(/\s+/g, '-').toLowerCase()}`,
      rows: [header, ...rows],
      sumFooter: true,
      columnTypes: { SSS: 'currency', PhilHealth: 'currency', 'Pag-IBIG': 'currency' },
    }
  }

  return (
    <ReportViewShell
      title="Payroll Register"
      description="Detailed payroll breakdown per employee — for one payroll run, a month, a year or any date range."
      meta={
        scope.basis !== 'run'
          ? [
              { label: 'Report Period', value: scopeLabel(scope) },
              { label: 'Payroll Runs Included', value: String(rangeReport?.runs ?? 0) },
            ]
          : runReport?.period
            ? [
                { label: 'Payroll Period', value: runReport.period.label },
                { label: 'Pay Date', value: formatDate(runReport.period.payDate) },
              ]
            : []
      }
      onExportExcel={report ? onExport : undefined}
    >
      {periodsLoading ? (
        <Skeleton className="h-72" />
      ) : periods.length === 0 ? (
        <EmptyState title="No payroll periods yet" description="Run a payroll period first to see the register here." />
      ) : (
        <div className="space-y-4">
          <ReportFilterBar>
            <ReportScopePicker scope={scope} onChange={setScope} periods={periods} />
            {scope.basis === 'run' && (
              <FilterLabel label="Payroll Run" className="w-72">
                <Select value={periodId ?? periods[0]?.id} onValueChange={setPeriodId} options={periods.map((p) => ({ value: p.id, label: p.label }))} />
              </FilterLabel>
            )}
          </ReportFilterBar>

          {isLoading || !report ? (
            <Skeleton className="h-72" />
          ) : report.rows.length === 0 ? (
            <EmptyState title="No payroll lines" description={scope.basis === 'run' ? "This period hasn't been run yet." : 'No payroll runs fall in this report period.'} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                <StatTile className="max-sm:col-span-2" label="Gross Pay" value={formatCurrency(report.totals.grossPay)} />
                <StatTile label="Total Deductions" value={formatCurrency(report.totals.totalDeductions)} />
                <StatTile label="Net Pay" value={formatCurrency(report.totals.netPay)} />
              </div>

              <ReportCardList count={report.rows.length} noun={report.rows.length === 1 ? 'employee' : 'employees'}>
                {report.rows.map((row) => (
                  <ReportRecordCard
                    key={row.employee.id}
                    avatar={fullName(row.employee.personal)}
                    title={fullName(row.employee.personal)}
                    subtitle={row.employee.employment.department}
                    meta={row.employee.employeeNumber}
                    details={
                      <>
                        <CardStat label="SSS">{formatCurrency(row.sssEmployeeShare)}</CardStat>
                        <CardStat label="PhilHealth">{formatCurrency(row.philhealthEmployeeShare)}</CardStat>
                        <CardStat label="Pag-IBIG">{formatCurrency(row.pagibigEmployeeShare)}</CardStat>
                        <CardStat label="Tax">{formatCurrency(row.withholdingTax)}</CardStat>
                      </>
                    }
                  >
                    <CardStat label="Gross Pay">{formatCurrency(row.grossPay)}</CardStat>
                    <CardStat label="Total Deductions">{formatCurrency(row.totalDeductions)}</CardStat>
                    <CardStat label="Net Pay">{formatCurrency(row.netPay)}</CardStat>
                  </ReportRecordCard>
                ))}
              </ReportCardList>
              <ReportTableView>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>SSS</TableHead>
                    <TableHead>PhilHealth</TableHead>
                    <TableHead>Pag-IBIG</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Total Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.rows.map((row) => (
                    <TableRow key={row.employee.id}>
                      <TableCell className="font-medium">{fullName(row.employee.personal)}</TableCell>
                      <TableCell>{formatCurrency(row.grossPay)}</TableCell>
                      <TableCell>{formatCurrency(row.sssEmployeeShare)}</TableCell>
                      <TableCell>{formatCurrency(row.philhealthEmployeeShare)}</TableCell>
                      <TableCell>{formatCurrency(row.pagibigEmployeeShare)}</TableCell>
                      <TableCell>{formatCurrency(row.withholdingTax)}</TableCell>
                      <TableCell>{formatCurrency(row.totalDeductions)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(row.netPay)}</TableCell>
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

export function PayrollSummaryReport() {
  const { rows: allRows, isLoading } = useAllPayrollLines()
  const { groups } = usePayrollGroups()
  const [scopeState, setScope] = useState<ReportScope | undefined>(undefined)
  const scope = scopeState ?? defaultScope(allRows.map((r) => r.period))
  const rows = useMemo(() => allRows.filter((r) => inScope(r.period, scope)), [allRows, scope])
  const groupName = (id?: string) => (id ? (groups.find((g) => g.id === id)?.name ?? '—') : 'All Employees')

  /** Payouts per department across every run, with the deduction split. */
  const byDepartment = useMemo(() => summarizeBy(rows, (r) => r.employee.employment.department), [rows])

  const byPeriod = useMemo(() => {
    const map = new Map<string, { period: (typeof rows)[number]['period']; employees: number; gross: number; deductions: number; net: number }>()
    for (const { period, line } of rows) {
      const bucket = map.get(period.id) ?? { period, employees: 0, gross: 0, deductions: 0, net: 0 }
      bucket.employees += 1
      bucket.gross += line.grossPay
      bucket.deductions += line.totalDeductions
      bucket.net += line.netPay
      map.set(period.id, bucket)
    }
    return [...map.values()].sort((a, b) => b.period.startDate.localeCompare(a.period.startDate))
  }, [rows])

  // Annual reports roll the runs up into one row per payroll month.
  const byMonth = useMemo(
    () =>
      summarizeBy(rows, (r) => payrollMonthKey(r.period), false)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, t]) => ({ key, runs: t.runs, employees: t.employees, gross: t.gross, deductions: t.totalDeductions, net: t.net })),
    [rows],
  )
  const monthlyRollup = scope.basis === 'year'

  const grandTotal = byPeriod.reduce(
    (acc, p) => ({ gross: acc.gross + p.gross, deductions: acc.deductions + p.deductions, net: acc.net + p.net }),
    { gross: 0, deductions: 0, net: 0 },
  )

  function onExport(): ExcelExport {
    if (monthlyRollup) {
      return {
        filename: `payroll-summary-${scope.year}`,
        rows: [['Month', 'Payroll Runs', 'Employees', 'Gross Pay', 'Total Deductions', 'Net Pay'], ...byMonth.map((m) => [monthLabel(m.key), m.runs, m.employees, m.gross, m.deductions, m.net])],
        sumFooter: true,
      }
    }
    const header = ['Period', 'Payroll Group', 'Pay Date', 'Status', 'Employees', 'Gross Pay', 'Total Deductions', 'Net Pay']
    const dataRows = byPeriod.map((p) => [p.period.label, groupName(p.period.payrollGroupId), p.period.payDate, p.period.status, p.employees, p.gross, p.deductions, p.net])
    return { filename: 'payroll-summary', rows: [header, ...dataRows], sumFooter: true }
  }

  return (
    <ReportViewShell
      title="Payroll Summary"
      description="High-level payroll totals per payroll run, month, year or custom date range, and payouts by department."
      meta={[{ label: 'Report Period', value: scopeLabel(scope) }, { label: 'Payroll Runs', value: String(byPeriod.length) }]}
      onExportExcel={byPeriod.length > 0 ? onExport : undefined}
    >
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : byPeriod.length === 0 ? (
        <EmptyState title="No payroll periods run yet" />
      ) : (
        <div className="space-y-4">
          <ReportFilterBar>
            <ReportScopePicker scope={scope} onChange={setScope} periods={allRows.map((r) => r.period)} />
          </ReportFilterBar>
          {byPeriod.length === 0 && <EmptyState title="No payroll runs in this report period" description="Try another month, year or date range." />}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <StatTile className="max-sm:col-span-2" label={scope.basis === 'run' ? 'Gross Pay (All Periods)' : `Gross Pay (${scopeLabel(scope)})`} value={formatCurrency(grandTotal.gross)} />
            <StatTile label="Total Deductions" value={formatCurrency(grandTotal.deductions)} />
            <StatTile label="Net Pay" value={formatCurrency(grandTotal.net)} />
          </div>
          {monthlyRollup && byMonth.length > 0 && (
            <>
            <ReportCardList count={byMonth.length} noun={byMonth.length === 1 ? 'month' : 'months'}>
              {byMonth.map((m) => (
                <ReportRecordCard key={m.key} title={monthLabel(m.key)} meta={`${m.runs} ${m.runs === 1 ? 'run' : 'runs'} · ${m.employees} employees`}>
                  <CardStat label="Gross Pay">{formatCurrency(m.gross)}</CardStat>
                  <CardStat label="Deductions">{formatCurrency(m.deductions)}</CardStat>
                  <CardStat label="Net Pay">{formatCurrency(m.net)}</CardStat>
                </ReportRecordCard>
              ))}
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Payroll Runs</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byMonth.map((m) => (
                  <TableRow key={m.key}>
                    <TableCell className="font-medium">{monthLabel(m.key)}</TableCell>
                    <TableCell>{m.runs}</TableCell>
                    <TableCell>{m.employees}</TableCell>
                    <TableCell>{formatCurrency(m.gross)}</TableCell>
                    <TableCell>{formatCurrency(m.deductions)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(m.net)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </ReportTableView>
            </>
          )}
          {!monthlyRollup && byPeriod.length > 0 && (
          <>
          <ReportCardList count={byPeriod.length} noun={byPeriod.length === 1 ? 'payroll run' : 'payroll runs'}>
            {byPeriod.map((p) => (
              <ReportRecordCard
                key={p.period.id}
                title={p.period.label}
                badge={<StatusBadge status={p.period.status} />}
                subtitle={groupName(p.period.payrollGroupId)}
                meta={`Pay date ${formatDate(p.period.payDate)} · ${p.employees} employees`}
              >
                <CardStat label="Gross Pay">{formatCurrency(p.gross)}</CardStat>
                <CardStat label="Deductions">{formatCurrency(p.deductions)}</CardStat>
                <CardStat label="Net Pay">{formatCurrency(p.net)}</CardStat>
              </ReportRecordCard>
            ))}
          </ReportCardList>
          <ReportTableView>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Payroll Group</TableHead>
                <TableHead>Pay Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byPeriod.map((p) => (
                <TableRow key={p.period.id}>
                  <TableCell className="font-medium">{p.period.label}</TableCell>
                  <TableCell className="text-muted-foreground">{groupName(p.period.payrollGroupId)}</TableCell>
                  <TableCell>{formatDate(p.period.payDate)}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.period.status} />
                  </TableCell>
                  <TableCell>{p.employees}</TableCell>
                  <TableCell>{formatCurrency(p.gross)}</TableCell>
                  <TableCell>{formatCurrency(p.deductions)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(p.net)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </ReportTableView>
          </>
          )}

          <div className="pt-2">
            <p className="text-sm font-semibold">Payout by Department</p>
            <p className="text-xs text-muted-foreground">{scope.basis === 'run' ? 'All payroll periods combined' : scopeLabel(scope)}, with deductions by type.</p>
          </div>
          <ReportCardList count={byDepartment.length} noun={byDepartment.length === 1 ? 'department' : 'departments'}>
            {byDepartment.map(([dept, t]) => (
              <ReportRecordCard
                key={dept}
                title={dept}
                meta={`${t.employees} employees · ${grandTotal.net > 0 ? `${((t.net / grandTotal.net) * 100).toFixed(1)}%` : '—'} of net`}
                details={
                  <>
                    <CardStat label="Statutory">{formatCurrency(t.statutory)}</CardStat>
                    <CardStat label="Tax">{formatCurrency(t.tax)}</CardStat>
                    <CardStat label="Loans">{formatCurrency(t.loans)}</CardStat>
                    <CardStat label="Share of Net">{grandTotal.net > 0 ? `${((t.net / grandTotal.net) * 100).toFixed(1)}%` : '—'}</CardStat>
                  </>
                }
              >
                <CardStat label="Gross Pay">{formatCurrency(t.gross)}</CardStat>
                <CardStat label="Net Pay">{formatCurrency(t.net)}</CardStat>
              </ReportRecordCard>
            ))}
          </ReportCardList>
          <ReportTableView>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Statutory</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Loans</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Share of Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byDepartment.map(([dept, t]) => (
                <TableRow key={dept}>
                  <TableCell className="font-medium">{dept}</TableCell>
                  <TableCell>{t.employees}</TableCell>
                  <TableCell>{formatCurrency(t.gross)}</TableCell>
                  <TableCell>{formatCurrency(t.statutory)}</TableCell>
                  <TableCell>{formatCurrency(t.tax)}</TableCell>
                  <TableCell>{formatCurrency(t.loans)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(t.net)}</TableCell>
                  <TableCell>{grandTotal.net > 0 ? `${((t.net / grandTotal.net) * 100).toFixed(1)}%` : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </ReportTableView>
        </div>
      )}
    </ReportViewShell>
  )
}

export function PayrollSummaryPerEmployeeReport() {
  const { employees, isLoading: employeesLoading } = useEmployees()
  const { rows, isLoading } = useAllPayrollLines()
  const [employeeId, setEmployeeId] = useState<string | undefined>(undefined)
  const [scopeState, setScope] = useState<ReportScope | undefined>(undefined)
  const scope = scopeState ?? defaultScope(rows.map((r) => r.period))

  const activeEmployeeId = employeeId ?? employees[0]?.id
  const employeeRows = rows.filter((r) => r.employee.id === activeEmployeeId && inScope(r.period, scope)).sort((a, b) => a.period.startDate.localeCompare(b.period.startDate))

  const activeEmployee = employees.find((e) => e.id === activeEmployeeId)

  function onExport(): ExcelExport {
    const header = ['Period', 'Pay Date', 'Gross Pay', 'Total Deductions', 'Net Pay']
    const dataRows = employeeRows.map((r) => [r.period.label, r.period.payDate, r.line.grossPay, r.line.totalDeductions, r.line.netPay])
    return { filename: `payroll-summary-${activeEmployee?.employeeNumber ?? 'employee'}`, rows: [header, ...dataRows], sumFooter: true }
  }

  return (
    <ReportViewShell
      title="Payroll Summary per Employee"
      description="Compare one employee's pay across payroll runs, or limit it to a month, a year or a date range."
      meta={
        activeEmployee
          ? [
              { label: 'Report Period', value: scopeLabel(scope) },
              { label: 'Employee', value: `${fullName(activeEmployee.personal)} (${activeEmployee.employeeNumber})` },
              { label: 'Department', value: activeEmployee.employment.department },
            ]
          : []
      }
      onExportExcel={employeeRows.length > 0 ? onExport : undefined}
    >
      {employeesLoading || isLoading ? (
        <Skeleton className="h-64" />
      ) : employees.length === 0 ? (
        <EmptyState title="No employees yet" />
      ) : (
        <div className="space-y-4">
          <ReportFilterBar>
            <FilterLabel label="Employee" className="w-64">
              <EmployeeCombobox employees={comboboxOptions(employees)} value={activeEmployeeId} onChange={setEmployeeId} />
            </FilterLabel>
            <ReportScopePicker scope={scope} onChange={setScope} periods={rows.map((r) => r.period)} />
          </ReportFilterBar>
          {employeeRows.length === 0 ? (
            <EmptyState title="No payroll history for this employee" />
          ) : (
            <>
              <ReportCardList count={employeeRows.length} noun={employeeRows.length === 1 ? 'payroll run' : 'payroll runs'}>
                {employeeRows.map((r) => (
                  <ReportRecordCard key={r.period.id} title={r.period.label} meta={`Paid ${formatDate(r.period.payDate)}`}>
                    <CardStat label="Gross Pay">{formatCurrency(r.line.grossPay)}</CardStat>
                    <CardStat label="Total Deductions">{formatCurrency(r.line.totalDeductions)}</CardStat>
                    <CardStat label="Net Pay">{formatCurrency(r.line.netPay)}</CardStat>
                  </ReportRecordCard>
                ))}
              </ReportCardList>
              <ReportTableView>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Pay Date</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Total Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeRows.map((r) => (
                      <TableRow key={r.period.id}>
                        <TableCell className="font-medium">{r.period.label}</TableCell>
                        <TableCell>{formatDate(r.period.payDate)}</TableCell>
                        <TableCell>{formatCurrency(r.line.grossPay)}</TableCell>
                        <TableCell>{formatCurrency(r.line.totalDeductions)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(r.line.netPay)}</TableCell>
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

export function PayslipReportView() {
  const { employees, isLoading: employeesLoading } = useEmployees()
  const { rows: allRows, isLoading: rowsLoading } = useAllPayrollLines()
  const { branches } = useTenant()

  // Filters live in the URL so opening a payslip and coming back lands on the same filtered report.
  const location = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const setParam = (updates: Record<string, string | undefined>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(updates)) {
          if (value === undefined || value === '') next.delete(key)
          else next.set(key, value)
        }
        return next
      },
      { replace: true },
    )
  const employeeId = params.get('employee') ?? undefined
  const department = params.get('department') ?? 'all'
  const branchId = params.get('branch') ?? 'all'
  const setEmployeeId = (value: string | undefined) => setParam({ employee: value })
  const setDepartment = (value: string) => setParam({ department: value === 'all' ? undefined : value })
  const setBranchId = (value: string) => setParam({ branch: value === 'all' ? undefined : value })

  // Payslips exist once a run is finalized.
  const finalizedRows = useMemo(() => allRows.filter((r) => r.period.status === 'finalized'), [allRows])
  const defaults = defaultScope(finalizedRows.map((r) => r.period))
  const scope: ReportScope = {
    basis: (params.get('basis') as ReportScope['basis'] | null) ?? 'run',
    month: params.get('month') ?? defaults.month,
    year: params.get('year') ?? defaults.year,
    from: params.get('from') ?? defaults.from,
    to: params.get('to') ?? defaults.to,
  }
  const setScope = (next: ReportScope) =>
    setParam({ basis: next.basis === 'run' ? undefined : next.basis, month: next.basis === 'month' ? next.month : undefined, year: next.basis === 'year' ? next.year : undefined, from: next.basis === 'range' ? next.from : undefined, to: next.basis === 'range' ? next.to : undefined })

  const departmentOptions = useMemo(() => {
    const unique = Array.from(new Set(employees.map((e) => e.employment.department))).sort()
    return [{ value: 'all', label: 'All Departments' }, ...unique.map((d) => ({ value: d, label: d }))]
  }, [employees])
  const branchOptions = useMemo(
    () => [{ value: 'all', label: 'All Branches' }, ...branches.map((b) => ({ value: b.id, label: b.name }))],
    [branches],
  )

  const payslips = useMemo(
    () =>
      finalizedRows
        .filter(
          (r) =>
            inScope(r.period, scope) &&
            (!employeeId || r.employee.id === employeeId) &&
            (department === 'all' || r.employee.employment.department === department) &&
            (branchId === 'all' || r.employee.branchId === branchId),
        )
        .map((r) => {
          const d = deductionBreakdown(r.line)
          return {
            ...r,
            statutory: d.statutory,
            tax: d.tax,
            otherDeductions: d.loans + d.other,
            benefits: (r.line.benefitsProvided ?? []).reduce((sum, b) => sum + b.amount, 0),
          }
        })
        .sort((a, b) => b.period.startDate.localeCompare(a.period.startDate) || fullName(a.employee.personal).localeCompare(fullName(b.employee.personal))),
    [finalizedRows, scope, employeeId, department, branchId],
  )

  const totals = payslips.reduce(
    (acc, p) => ({
      gross: acc.gross + p.line.grossPay,
      net: acc.net + p.line.netPay,
      statutory: acc.statutory + p.statutory,
      tax: acc.tax + p.tax,
      other: acc.other + p.otherDeductions,
      benefits: acc.benefits + p.benefits,
    }),
    { gross: 0, net: 0, statutory: 0, tax: 0, other: 0, benefits: 0 },
  )
  const selectedEmployee = employees.find((e) => e.id === employeeId)

  const hasActiveFilters = !!employeeId || department !== 'all' || branchId !== 'all'
  function clearFilters() {
    setEmployeeId(undefined)
    setDepartment('all')
    setBranchId('all')
  }

  function onExport(): ExcelExport {
    const header = ['Employee #', 'Employee', 'Department', 'Payroll Period', 'Pay Date', 'Gross Pay', 'Statutory Contributions', 'Withholding Tax', 'Loans & Other Deductions', 'Net Pay', 'Benefits Provided']
    const dataRows = payslips.map((p) => [
      p.employee.employeeNumber,
      fullName(p.employee.personal),
      p.employee.employment.department,
      p.period.label,
      p.period.payDate,
      p.line.grossPay,
      p.statutory,
      p.tax,
      p.otherDeductions,
      p.line.netPay,
      p.benefits,
    ])
    return { filename: `payslip-report-${selectedEmployee?.employeeNumber ?? scopeLabel(scope).replace(/\s+/g, '-').toLowerCase()}`, rows: [header, ...dataRows], sumFooter: true }
  }

  return (
    <ReportViewShell
      title="Payslip Report"
      description="Every finalized payslip with its pay breakdown — for all payroll runs, or a month, a year or a date range. Select an employee for an overview of their totals."
      orientation="landscape"
      meta={[
        { label: 'Report Period', value: scopeLabel(scope) },
        ...(selectedEmployee ? [{ label: 'Employee', value: `${fullName(selectedEmployee.personal)} (${selectedEmployee.employeeNumber})` }] : []),
        ...(department !== 'all' ? [{ label: 'Department', value: department }] : []),
        ...(branchId !== 'all' ? [{ label: 'Branch', value: branches.find((b) => b.id === branchId)?.name ?? branchId }] : []),
      ]}
      onExportExcel={payslips.length > 0 ? onExport : undefined}
    >
      {employeesLoading || rowsLoading ? (
        <Skeleton className="h-64" />
      ) : finalizedRows.length === 0 ? (
        <EmptyState title="No finalized payslips yet" description="Payslips become available once a payroll run is finalized." />
      ) : (
        <div className="space-y-4">
          <ReportFilterBar onClear={hasActiveFilters ? clearFilters : undefined}>
            <FilterLabel label="Employee" className="w-64">
              <EmployeeCombobox employees={comboboxOptions(employees)} value={employeeId} onChange={setEmployeeId} />
            </FilterLabel>
            <FilterLabel label="Department" className="w-44">
              <Select value={department} onValueChange={setDepartment} options={departmentOptions} />
            </FilterLabel>
            <FilterLabel label="Branch" className="w-44">
              <Select value={branchId} onValueChange={setBranchId} options={branchOptions} />
            </FilterLabel>
            <ReportScopePicker scope={scope} onChange={setScope} periods={finalizedRows.map((r) => r.period)} />
          </ReportFilterBar>

          {selectedEmployee && (
            <div>
              <p className="mb-2 text-sm font-semibold">
                {fullName(selectedEmployee.personal)} · overview <span className="font-normal text-muted-foreground">({scopeLabel(scope)}, {payslips.length} payslip{payslips.length === 1 ? '' : 's'})</span>
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                <StatTile label="Total Gross Pay" value={formatCurrency(totals.gross)} />
                <StatTile label="Total Net Pay" value={formatCurrency(totals.net)} />
                <StatTile label="Statutory Contributions" value={formatCurrency(totals.statutory)} />
                <StatTile label="Withholding Tax" value={formatCurrency(totals.tax)} />
                <StatTile label="Loans & Other Deductions" value={formatCurrency(totals.other)} />
                <StatTile label="Benefits Provided" value={formatCurrency(totals.benefits)} />
              </div>
            </div>
          )}

          {payslips.length === 0 ? (
            <EmptyState title="No payslips found" description="Try another report period or clear the filters above." />
          ) : (
            <>
            <ReportCardList count={payslips.length} noun={payslips.length === 1 ? 'payslip' : 'payslips'}>
              {payslips.map((p) => (
                <ReportRecordCard
                  key={p.line.id}
                  avatar={fullName(p.employee.personal)}
                  title={fullName(p.employee.personal)}
                  subtitle={p.period.label}
                  meta={`${p.employee.employeeNumber} · Paid ${formatDate(p.period.payDate)}`}
                  onClick={() => navigate(`/payslips/${p.line.id}`, { state: { from: `${location.pathname}${location.search}`, fromLabel: 'Payslip Report' } })}
                >
                  <CardStat label="Gross Pay">{formatCurrency(p.line.grossPay)}</CardStat>
                  <CardStat label="Net Pay">{formatCurrency(p.line.netPay)}</CardStat>
                  <CardStat label="Statutory">{formatCurrency(p.statutory)}</CardStat>
                  <CardStat label="Tax">{formatCurrency(p.tax)}</CardStat>
                  <CardStat label="Loans & Other">{formatCurrency(p.otherDeductions)}</CardStat>
                </ReportRecordCard>
              ))}
              <TotalCard title={`Total (${payslips.length} payslips)`}>
                <CardStat label="Gross Pay">{formatCurrency(totals.gross)}</CardStat>
                <CardStat label="Net Pay">{formatCurrency(totals.net)}</CardStat>
                <CardStat label="Statutory">{formatCurrency(totals.statutory)}</CardStat>
                <CardStat label="Tax">{formatCurrency(totals.tax)}</CardStat>
                <CardStat label="Loans & Other">{formatCurrency(totals.other)}</CardStat>
              </TotalCard>
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Payroll Period</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">Statutory</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Loans & Other</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead className="text-right print:hidden">Payslip</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((p) => (
                  <TableRow key={p.line.id}>
                    <TableCell className="font-medium">
                      {fullName(p.employee.personal)}
                      <span className="block text-xs font-normal text-muted-foreground">{p.employee.employeeNumber}</span>
                    </TableCell>
                    <TableCell>{p.period.label}</TableCell>
                    <TableCell>{formatDate(p.period.payDate)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(p.line.grossPay)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(p.statutory)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(p.tax)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(p.otherDeductions)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatCurrency(p.line.netPay)}</TableCell>
                    <TableCell className="text-right print:hidden">
                      <Button size="sm" variant="secondary" asChild>
                        <Link to={`/payslips/${p.line.id}`} state={{ from: `${location.pathname}${location.search}`, fromLabel: 'Payslip Report' }}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={3}>Total ({payslips.length} payslips)</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(totals.gross)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(totals.statutory)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(totals.tax)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(totals.other)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(totals.net)}</TableCell>
                  <TableCell className="print:hidden" />
                </TableRow>
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

export function OvertimeReportView() {
  const canSeeCost = usePermission('reports.payroll.view')
  const { records, isLoading: recordsLoading } = useOvertimeRecords()
  const { employees, isLoading: employeesLoading } = useEmployees()
  const { branches } = useTenant()
  const { user } = useSession()
  const { notify } = useToast()

  const [employeeIds, setEmployeeIds] = useState<string[]>([])
  const [department, setDepartment] = useState('all')
  const [branchId, setBranchId] = useState('all')

  const departmentOptions = useMemo(() => {
    const unique = Array.from(new Set(employees.map((e) => e.employment.department))).sort()
    return [{ value: 'all', label: 'All Departments' }, ...unique.map((d) => ({ value: d, label: d }))]
  }, [employees])
  const branchOptions = useMemo(
    () => [{ value: 'all', label: 'All Branches' }, ...branches.map((b) => ({ value: b.id, label: b.name }))],
    [branches],
  )

  const rows = useMemo(() => {
    const employeeById = new Map(employees.map((e) => [e.id, e]))
    const byEmployee = new Map<string, { employee: (typeof employees)[number]; regular: number; nightDiff: number; restDay: number; cost: number }>()
    for (const r of records) {
      if (r.status === 'rejected') continue
      const employee = employeeById.get(r.employeeId)
      if (!employee) continue
      const bucket = byEmployee.get(employee.id) ?? { employee, regular: 0, nightDiff: 0, restDay: 0, cost: 0 }
      if (r.type === 'regular') bucket.regular += r.hours
      else if (r.type === 'night_diff') bucket.nightDiff += r.hours
      else bucket.restDay += r.hours
      // Same basis as the payroll engine: hourly rate × the record's own OT rate multiplier.
      bucket.cost += r.hours * hourlyRateFor(employee) * r.multiplier
      byEmployee.set(employee.id, bucket)
    }
    return [...byEmployee.values()].sort((a, b) => a.employee.personal.lastName.localeCompare(b.employee.personal.lastName))
  }, [records, employees])

  const filteredRows = rows.filter(
    (row) =>
      (employeeIds.length === 0 || employeeIds.includes(row.employee.id)) &&
      (department === 'all' || row.employee.employment.department === department) &&
      (branchId === 'all' || row.employee.branchId === branchId),
  )

  const hasActiveFilters = employeeIds.length > 0 || department !== 'all' || branchId !== 'all'
  function clearFilters() {
    setEmployeeIds([])
    setDepartment('all')
    setBranchId('all')
  }

  async function onExport(): Promise<ExcelExport> {
    const rows = parseCsv(await exportOvertimeSummaryCsv(user))
    notify({ title: 'Overtime report exported', tone: 'success' })
    return {
      filename: 'overtime-report',
      rows: filterCsvRows(rows, 'Employee ID', new Set(filteredRows.map((r) => r.employee.employeeNumber))),
      sumFooter: true,
      columnTypes: { Hours: 'number' },
    }
  }

  return (
    <ReportViewShell
      title="Overtime Report"
      description="Overtime and night differential hours & estimated cost per employee."
      meta={employeeFilterMeta({ employeeIds, department, branchId }, branches)}
      onExportExcel={onExport}
    >
      {recordsLoading || employeesLoading ? (
        <Skeleton className="h-64" />
      ) : rows.length === 0 ? (
        <EmptyState title="No overtime recorded yet" />
      ) : (
        <div className="space-y-4">
          <ReportFilterBar onClear={hasActiveFilters ? clearFilters : undefined}>
            <FilterLabel label="Employee" className="w-64">
              <EmployeeCombobox multiple employees={comboboxOptions(employees)} value={employeeIds} onChange={setEmployeeIds} />
            </FilterLabel>
            <FilterLabel label="Department" className="w-44">
              <Select value={department} onValueChange={setDepartment} options={departmentOptions} />
            </FilterLabel>
            <FilterLabel label="Branch" className="w-44">
              <Select value={branchId} onValueChange={setBranchId} options={branchOptions} />
            </FilterLabel>
          </ReportFilterBar>

          {filteredRows.length === 0 ? (
            <EmptyState title="No matching employee records found" description="Try adjusting or clearing the filters above." />
          ) : (
            <>
            <ReportCardList count={filteredRows.length} noun={filteredRows.length === 1 ? 'employee' : 'employees'}>
              {filteredRows.map((row) => (
                <ReportRecordCard
                  key={row.employee.id}
                  avatar={fullName(row.employee.personal)}
                  title={fullName(row.employee.personal)}
                  subtitle={row.employee.employment.department}
                  meta={row.employee.employeeNumber}
                >
                  <CardStat label="Regular OT Hours">{row.regular.toFixed(1)}</CardStat>
                  <CardStat label="Night Diff Hours">{row.nightDiff.toFixed(1)}</CardStat>
                  <CardStat label="Rest Day / Holiday Hours">{row.restDay.toFixed(1)}</CardStat>
                  {canSeeCost && <CardStat label="Estimated Cost">{formatCurrency(Math.round(row.cost))}</CardStat>}
                </ReportRecordCard>
              ))}
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Regular OT Hours</TableHead>
                  <TableHead>Night Diff Hours</TableHead>
                  <TableHead>Rest Day / Holiday Hours</TableHead>
                  {canSeeCost && <TableHead>Estimated Cost</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.employee.id}>
                    <TableCell className="font-medium">{fullName(row.employee.personal)}</TableCell>
                    <TableCell>{row.employee.employment.department}</TableCell>
                    <TableCell>{row.regular.toFixed(1)}</TableCell>
                    <TableCell>{row.nightDiff.toFixed(1)}</TableCell>
                    <TableCell>{row.restDay.toFixed(1)}</TableCell>
                    {canSeeCost && <TableCell className="font-medium">{formatCurrency(Math.round(row.cost))}</TableCell>}
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

export function BenefitsReportView() {
  const { benefits, isLoading: benefitsLoading } = useEmployeeBenefits()
  const { employees, isLoading: employeesLoading } = useEmployees()
  const { rows: payrollRows, isLoading: payrollLoading, scope, setScope, scopeMeta } = useScopedPayrollLines()
  const { branches } = useTenant()

  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [department, setDepartment] = useState('all')
  const [branchId, setBranchId] = useState('all')
  const [employeeIds, setEmployeeIds] = useState<string[]>([])

  const employeeById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])
  const departmentOptions = useMemo(() => {
    const unique = Array.from(new Set(employees.map((e) => e.employment.department))).sort()
    return [{ value: 'all', label: 'All Departments' }, ...unique.map((d) => ({ value: d, label: d }))]
  }, [employees])
  const branchOptions = useMemo(() => [{ value: 'all', label: 'All Branches' }, ...branches.map((b) => ({ value: b.id, label: b.name }))], [branches])
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...(Object.keys(BENEFIT_CATEGORY_META) as BenefitCategory[]).map((value) => ({ value, label: BENEFIT_CATEGORY_META[value].title })),
  ]
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  // What payroll actually gave/took for each benefit in the report period (finalized runs only).
  const paidByBenefit = useMemo(() => {
    const map = new Map<string, { companyPaid: number; employeeShare: number }>()
    for (const { period, line, employee } of payrollRows) {
      if (period.status !== 'finalized') continue
      for (const b of benefits) {
        if (b.employeeId !== employee.id) continue
        const entry = map.get(b.id) ?? { companyPaid: 0, employeeShare: 0 }
        if (b.category === 'allowance') entry.companyPaid += line.earnings.filter((e) => e.label === b.name).reduce((s, e) => s + e.amount, 0)
        else entry.companyPaid += (line.benefitsProvided ?? []).filter((p) => p.label === b.name).reduce((s, p) => s + p.amount, 0)
        entry.employeeShare += line.otherDeductions.filter((d) => d.label === `${b.name} – Employee Share`).reduce((s, d) => s + d.amount, 0)
        map.set(b.id, entry)
      }
    }
    return map
  }, [payrollRows, benefits])

  const rows = useMemo(
    () =>
      benefits
        .map((b) => ({ benefit: b, employee: employeeById.get(b.employeeId), paid: paidByBenefit.get(b.id) ?? { companyPaid: 0, employeeShare: 0 } }))
        .filter(
          (r): r is typeof r & { employee: Employee } =>
            !!r.employee &&
            (category === 'all' || r.benefit.category === category) &&
            (status === 'all' || r.benefit.status === status) &&
            (department === 'all' || r.employee.employment.department === department) &&
            (branchId === 'all' || r.employee.branchId === branchId) &&
            (employeeIds.length === 0 || employeeIds.includes(r.employee.id)),
        )
        .sort((a, b) => fullName(a.employee.personal).localeCompare(fullName(b.employee.personal)) || a.benefit.name.localeCompare(b.benefit.name)),
    [benefits, employeeById, paidByBenefit, category, status, department, branchId, employeeIds],
  )

  const active = rows.filter((r) => r.benefit.status === 'active')
  const totals = {
    enrolled: new Set(active.map((r) => r.employee.id)).size,
    monthlyCost: active.reduce((s, r) => s + r.benefit.monthlyValue, 0),
    monthlyShare: active.reduce((s, r) => s + r.benefit.employeeShare, 0),
    companyPaid: rows.reduce((s, r) => s + r.paid.companyPaid, 0),
    employeeShare: rows.reduce((s, r) => s + r.paid.employeeShare, 0),
  }
  const byCategory = (Object.keys(BENEFIT_CATEGORY_META) as BenefitCategory[])
    .map((key) => {
      const items = rows.filter((r) => r.benefit.category === key)
      const live = items.filter((r) => r.benefit.status === 'active')
      return {
        key,
        employees: new Set(live.map((r) => r.employee.id)).size,
        records: live.length,
        monthlyCost: live.reduce((s, r) => s + r.benefit.monthlyValue, 0),
        companyPaid: items.reduce((s, r) => s + r.paid.companyPaid, 0),
        employeeShare: items.reduce((s, r) => s + r.paid.employeeShare, 0),
      }
    })
    .filter((c) => c.records > 0 || c.companyPaid > 0)

  const hasActiveFilters = category !== 'all' || status !== 'all' || department !== 'all' || branchId !== 'all' || employeeIds.length > 0
  function clearFilters() {
    setCategory('all')
    setStatus('all')
    setDepartment('all')
    setBranchId('all')
    setEmployeeIds([])
  }

  function onExport(): ExcelExport {
    const header = ['Employee #', 'Employee', 'Department', 'Category', 'Benefit', 'Provider', 'Coverage', 'Monthly Value', 'Employee Share / Month', 'Start Date', 'End Date', 'Status', 'Company-paid in Period', 'Employee Share Deducted in Period']
    const dataRows = rows.map((r) => [
      r.employee.employeeNumber,
      fullName(r.employee.personal),
      r.employee.employment.department,
      BENEFIT_CATEGORY_META[r.benefit.category].title,
      r.benefit.name,
      r.benefit.provider ?? '',
      r.benefit.coverage ?? '',
      r.benefit.monthlyValue,
      r.benefit.employeeShare,
      r.benefit.startDate,
      r.benefit.endDate ?? '',
      r.benefit.status,
      r.paid.companyPaid,
      r.paid.employeeShare,
    ])
    return { filename: 'benefits-report', rows: [header, ...dataRows], sumFooter: true, columnTypes: {} }
  }

  return (
    <ReportViewShell
      title="Benefits Report"
      description="Every employee benefit — HMO, allowances, insurance and other perks — with what the company and employees actually paid through payroll in the report period."
      orientation="landscape"
      meta={[
        scopeMeta,
        ...(category !== 'all' ? [{ label: 'Category', value: BENEFIT_CATEGORY_META[category as BenefitCategory].title }] : []),
        ...(department !== 'all' ? [{ label: 'Department', value: department }] : []),
        ...(branchId !== 'all' ? [{ label: 'Branch', value: branches.find((b) => b.id === branchId)?.name ?? branchId }] : []),
        ...(employeeIds.length > 0 ? [{ label: 'Employees', value: `${employeeIds.length} selected` }] : []),
      ]}
      onExportExcel={rows.length > 0 ? onExport : undefined}
    >
      {benefitsLoading || employeesLoading || payrollLoading ? (
        <Skeleton className="h-64" />
      ) : benefits.length === 0 ? (
        <EmptyState title="No benefits recorded yet" description="Add benefits under Benefits, Loans & Deductions to report on them here." />
      ) : (
        <div className="space-y-4">
          <ReportFilterBar onClear={hasActiveFilters ? clearFilters : undefined}>
            <FilterLabel label="Employee" className="w-64">
              <EmployeeCombobox multiple employees={comboboxOptions(employees)} value={employeeIds} onChange={setEmployeeIds} />
            </FilterLabel>
            <FilterLabel label="Category" className="w-44">
              <Select value={category} onValueChange={setCategory} options={categoryOptions} />
            </FilterLabel>
            <FilterLabel label="Status" className="w-40">
              <Select value={status} onValueChange={setStatus} options={statusOptions} />
            </FilterLabel>
            <FilterLabel label="Department" className="w-44">
              <Select value={department} onValueChange={setDepartment} options={departmentOptions} />
            </FilterLabel>
            <FilterLabel label="Branch" className="w-44">
              <Select value={branchId} onValueChange={setBranchId} options={branchOptions} />
            </FilterLabel>
            <ReportScopePicker scope={scope} onChange={setScope} periods={payrollRows.map((r) => r.period)} />
          </ReportFilterBar>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile label="Employees Covered" value={String(totals.enrolled)} />
            <StatTile label="Company Cost / Month" value={formatCurrency(totals.monthlyCost)} />
            <StatTile label={`Company-paid (${scopeLabel(scope)})`} value={formatCurrency(totals.companyPaid)} />
            <StatTile label={`Employee Share Deducted (${scopeLabel(scope)})`} value={formatCurrency(totals.employeeShare)} />
          </div>

          {rows.length === 0 ? (
            <EmptyState title="No matching benefits found" description="Try adjusting or clearing the filters above." />
          ) : (
            <>
              {byCategory.length > 0 && (
                <>
                  <ReportCardList count={byCategory.length} noun={byCategory.length === 1 ? 'category' : 'categories'}>
                    {byCategory.map((c) => (
                      <ReportRecordCard key={c.key} title={BENEFIT_CATEGORY_META[c.key].title}>
                        <CardStat label="Employees">{c.employees}</CardStat>
                        <CardStat label="Active Records">{c.records}</CardStat>
                        <CardStat label="Cost / Month">{formatCurrency(c.monthlyCost)}</CardStat>
                        <CardStat label="Company-paid in Period">{formatCurrency(c.companyPaid)}</CardStat>
                        <CardStat label="Employee Share in Period">{formatCurrency(c.employeeShare)}</CardStat>
                      </ReportRecordCard>
                    ))}
                  </ReportCardList>
                  <ReportTableView>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Employees</TableHead>
                          <TableHead className="text-right">Active Records</TableHead>
                          <TableHead className="text-right">Cost / Month</TableHead>
                          <TableHead className="text-right">Company-paid in Period</TableHead>
                          <TableHead className="text-right">Employee Share in Period</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {byCategory.map((c) => (
                          <TableRow key={c.key}>
                            <TableCell className="font-medium">{BENEFIT_CATEGORY_META[c.key].title}</TableCell>
                            <TableCell className="text-right tabular-nums">{c.employees}</TableCell>
                            <TableCell className="text-right tabular-nums">{c.records}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatCurrency(c.monthlyCost)}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatCurrency(c.companyPaid)}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatCurrency(c.employeeShare)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ReportTableView>
                </>
              )}

              <ReportCardList count={rows.length} noun={rows.length === 1 ? 'benefit' : 'benefits'}>
                {rows.map((r) => (
                  <ReportRecordCard
                    key={r.benefit.id}
                    avatar={fullName(r.employee.personal)}
                    title={fullName(r.employee.personal)}
                    badge={<StatusBadge status={r.benefit.status} />}
                    subtitle={r.benefit.name}
                    meta={[BENEFIT_CATEGORY_META[r.benefit.category].title, r.benefit.provider, r.benefit.coverage].filter(Boolean).join(' · ')}
                    details={
                      <>
                        <CardStat label="Department">{r.employee.employment.department}</CardStat>
                        <CardStat label="Category">{BENEFIT_CATEGORY_META[r.benefit.category].title}</CardStat>
                        {r.benefit.provider && <CardStat label="Provider">{r.benefit.provider}</CardStat>}
                        {r.benefit.coverage && <CardStat label="Coverage">{r.benefit.coverage}</CardStat>}
                      </>
                    }
                  >
                    <CardStat label="Monthly Value">{formatCurrency(r.benefit.monthlyValue)}</CardStat>
                    <CardStat label="Employee Share / Mo">{r.benefit.employeeShare > 0 ? formatCurrency(r.benefit.employeeShare) : '—'}</CardStat>
                    <CardStat label="Company-paid in Period">{formatCurrency(r.paid.companyPaid)}</CardStat>
                    <CardStat label="Employee Share in Period">{r.paid.employeeShare > 0 ? formatCurrency(r.paid.employeeShare) : '—'}</CardStat>
                  </ReportRecordCard>
                ))}
                <TotalCard title={`Total (${rows.length} records)`}>
                  <CardStat label="Monthly Value">{formatCurrency(rows.reduce((s, r) => s + r.benefit.monthlyValue, 0))}</CardStat>
                  <CardStat label="Employee Share / Mo">{formatCurrency(rows.reduce((s, r) => s + r.benefit.employeeShare, 0))}</CardStat>
                  <CardStat label="Company-paid in Period">{formatCurrency(totals.companyPaid)}</CardStat>
                  <CardStat label="Employee Share in Period">{formatCurrency(totals.employeeShare)}</CardStat>
                </TotalCard>
              </ReportCardList>
              <ReportTableView>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Benefit</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Monthly Value</TableHead>
                    <TableHead className="text-right">Employee Share / Mo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Company-paid in Period</TableHead>
                    <TableHead className="text-right">Employee Share in Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.benefit.id}>
                      <TableCell className="font-medium">
                        {fullName(r.employee.personal)}
                        <span className="block text-xs font-normal text-muted-foreground">{r.employee.employment.department}</span>
                      </TableCell>
                      <TableCell>
                        {r.benefit.name}
                        {(r.benefit.provider || r.benefit.coverage) && (
                          <span className="block text-xs text-muted-foreground">{[r.benefit.provider, r.benefit.coverage].filter(Boolean).join(' · ')}</span>
                        )}
                      </TableCell>
                      <TableCell>{BENEFIT_CATEGORY_META[r.benefit.category].title}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(r.benefit.monthlyValue)}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.benefit.employeeShare > 0 ? formatCurrency(r.benefit.employeeShare) : '—'}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.benefit.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(r.paid.companyPaid)}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.paid.employeeShare > 0 ? formatCurrency(r.paid.employeeShare) : '—'}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={3}>Total ({rows.length} records)</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(rows.reduce((s, r) => s + r.benefit.monthlyValue, 0))}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(rows.reduce((s, r) => s + r.benefit.employeeShare, 0))}</TableCell>
                    <TableCell />
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.companyPaid)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.employeeShare)}</TableCell>
                  </TableRow>
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

export function LoansDeductionsReportView() {
  const { loans, isLoading: loansLoading } = useLoans()
  const { employees, isLoading: employeesLoading } = useEmployees()
  const { user } = useSession()
  const [deductionConfigs, setDeductionConfigs] = useState<DeductionConfig[]>([])

  useEffect(() => {
    getDeductionConfigs().then((list) => setDeductionConfigs(list.map((c) => ({ ...c, companyId: '' }))))
  }, [user])

  const employeeById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])
  const activeLoans = loans.filter((l) => l.status === 'active')

  function onExport(): ExcelExport {
    const header = ['Employee', 'Loan Type', 'Label', 'Principal', 'Balance', 'Monthly Deduction', 'Status']
    const rows = loans.map((l) => {
      const employee = employeeById.get(l.employeeId)
      return [employee ? fullName(employee.personal) : l.employeeId, l.type, l.label, l.principal, l.balance, l.monthlyDeduction, l.status]
    })
    return { filename: 'loans-deductions-report', rows: [header, ...rows], sumFooter: true }
  }

  return (
    <ReportViewShell
      title="Loans & Deductions Report"
      description="Active company loans and recurring deduction configuration."
      meta={[{ label: 'Loans', value: `${loans.length} total · ${activeLoans.length} active` }]}
      onExportExcel={onExport}
    >
      {loansLoading || employeesLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Active Loans ({activeLoans.length})
            </p>
            {activeLoans.length === 0 ? (
              <EmptyState title="No active loans" />
            ) : (
              <>
                <ReportCardList count={activeLoans.length} noun={activeLoans.length === 1 ? 'active loan' : 'active loans'}>
                  {activeLoans.map((l) => {
                    const employee = employeeById.get(l.employeeId)
                    return (
                      <ReportRecordCard
                        key={l.id}
                        avatar={employee ? fullName(employee.personal) : undefined}
                        title={employee ? fullName(employee.personal) : '—'}
                        subtitle={l.label}
                      >
                        <CardStat label="Principal">{formatCurrency(l.principal)}</CardStat>
                        <CardStat label="Balance">{formatCurrency(l.balance)}</CardStat>
                        <CardStat label="Monthly Deduction">{formatCurrency(l.monthlyDeduction)}</CardStat>
                      </ReportRecordCard>
                    )
                  })}
                </ReportCardList>
                <ReportTableView>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Monthly Deduction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeLoans.map((l) => {
                        const employee = employeeById.get(l.employeeId)
                        return (
                          <TableRow key={l.id}>
                            <TableCell className="font-medium">{employee ? fullName(employee.personal) : '—'}</TableCell>
                            <TableCell>{l.label}</TableCell>
                            <TableCell>{formatCurrency(l.principal)}</TableCell>
                            <TableCell>{formatCurrency(l.balance)}</TableCell>
                            <TableCell>{formatCurrency(l.monthlyDeduction)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </ReportTableView>
              </>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recurring Company Deductions</p>
            {deductionConfigs.length === 0 ? (
              <EmptyState title="No deduction configs set up" />
            ) : (
              <>
                <ReportCardList count={deductionConfigs.length} noun={deductionConfigs.length === 1 ? 'deduction' : 'deductions'}>
                  {deductionConfigs.map((d) => (
                    <ReportRecordCard key={d.id} title={d.name} subtitle={<span className="capitalize">{d.category}</span>} badge={<StatusBadge status={d.isActive ? 'active' : 'inactive'} />}>
                      <CardStat label="Recurrence" className="capitalize">
                        {d.recurrence.replace('_', ' ')}
                      </CardStat>
                      <CardStat label="Allocation" className="capitalize">
                        {d.allocationMethod?.replace('_', ' ') ?? '—'}
                      </CardStat>
                    </ReportRecordCard>
                  ))}
                </ReportCardList>
                <ReportTableView>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Recurrence</TableHead>
                        <TableHead>Allocation</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deductionConfigs.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">{d.name}</TableCell>
                          <TableCell className="capitalize">{d.category}</TableCell>
                          <TableCell className="capitalize">{d.recurrence.replace('_', ' ')}</TableCell>
                          <TableCell className="capitalize">{d.allocationMethod?.replace('_', ' ') ?? '—'}</TableCell>
                          <TableCell>{d.isActive ? 'Active' : 'Inactive'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ReportTableView>
              </>
            )}
          </div>
        </div>
      )}
    </ReportViewShell>
  )
}
