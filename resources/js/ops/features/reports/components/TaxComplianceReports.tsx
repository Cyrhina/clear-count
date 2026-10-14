import { Search } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { Card } from '@ops/components/ui/Card'
import { RowCheckbox, SelectAllCheckbox } from '@ops/components/ui/SelectCheckboxes'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { CardSelectionContext, CardStat, ReportCardList, ReportRecordCard, ReportTableView } from '@ops/features/reports/components/ReportRecordCard'
import { FilterLabel, ReportFilterBar, ReportViewShell, StatTile } from '@ops/features/reports/components/shared'
import { useFinalizedPayrollLines, useTaxComplianceData } from '@ops/features/reports/hooks/useReports'
import { monthLabel } from '@ops/features/reports/payrollAggregates'
import type { ExcelExport } from '@ops/features/reports/reportExport'
import { DE_MINIMIS_CATEGORIES, THIRTEENTH_MONTH_CEILING, TAX_STATUS_LABEL, statusRank, type TaxStatus } from '@ops/lib/payroll/taxCompliance'
import type { DeMinimisItem, TaxEmployeeRow } from '@ops/lib/services/taxComplianceService'
import { useRowSelection } from '@ops/hooks/useRowSelection'
import { cn } from '@ops/lib/utils/cn'
import { formatCurrency } from '@ops/lib/utils/format'

const fullName = (e: TaxEmployeeRow['employee']) => `${e.personal.firstName} ${e.personal.lastName}`
const r2 = (n: number) => Math.round(n * 100) / 100
const STATUS_TONE = { within: 'success', approaching: 'warning', review: 'danger' } as const

function TaxStatusBadge({ status }: { status: TaxStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{TAX_STATUS_LABEL[status]}</Badge>
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'review', label: TAX_STATUS_LABEL.review },
  { value: 'approaching', label: TAX_STATUS_LABEL.approaching },
  { value: 'within', label: TAX_STATUS_LABEL.within },
]

/** Row selection for "Export Selected": with nothing ticked the export covers every row, otherwise only the ticked ones. */
function useExportSelection<T>(rows: T[], keyOf: (row: T) => string) {
  const ids = useMemo(() => rows.map(keyOf), [rows]) // eslint-disable-line react-hooks/exhaustive-deps
  const selection = useRowSelection(ids)
  const chosen = selection.selected.size > 0 ? rows.filter((r) => selection.selected.has(keyOf(r))) : rows
  return { selection, chosen }
}

function SelectionNote({ count, onClear }: { count: number; onClear: () => void }) {
  return (
    <p className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-1.5 text-xs text-muted-foreground print:hidden">
      <span className="font-semibold text-foreground">{count} selected</span>— Export to Excel will include only these rows.
      <button type="button" className="ml-auto text-primary hover:underline" onClick={onClear}>
        Clear
      </button>
    </p>
  )
}

/** Gives the `ReportRecordCard` inside it the export-selection checkbox (shown in its header; ticking it never expands the card). */
function SelectableCard({ checked, onChange, label, children }: { checked: boolean; onChange: (checked: boolean) => void; label: string; children: ReactNode }) {
  return <CardSelectionContext.Provider value={{ checked, onChange, label }}>{children}</CardSelectionContext.Provider>
}

/** The totals row of a table, as the last card of the card list. */
function TotalCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card watermark={null} className="space-y-2.5 bg-muted/50 p-4 text-sm sm:col-span-2">
      <p className="font-semibold">{title}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">{children}</div>
    </Card>
  )
}

const money = (n: number) => <span className="whitespace-nowrap">{formatCurrency(n)}</span>

function MoneyCell({ value, className }: { value: number; className?: string }) {
  return <TableCell className={cn('whitespace-nowrap text-right tabular-nums', className)}>{formatCurrency(value)}</TableCell>
}

function EmployeeCell({ row }: { row: TaxEmployeeRow }) {
  return (
    <TableCell className="whitespace-nowrap">
      <p className="text-sm font-medium leading-tight">{fullName(row.employee)}</p>
      <p className="text-xs leading-tight text-muted-foreground">
        {row.employee.employeeNumber} · {row.employee.employment.department}
      </p>
    </TableCell>
  )
}

/** Year, department, employee search and (optionally) status filters shared by the tax & compliance reports. */
function useTaxReport({ withStatus = false }: { withStatus?: boolean } = {}) {
  const [yearState, setYear] = useState<number | undefined>(undefined)
  const { data, rows, years, isLoading } = useTaxComplianceData(yearState)
  const [department, setDepartment] = useState('all')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const year = data?.year ?? yearState ?? new Date().getFullYear()
  const departments = useMemo(() => [...new Set(rows.map((r) => r.employee.employment.department))].sort(), [rows])
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter(
      (r) =>
        (department === 'all' || r.employee.employment.department === department) &&
        (!q || `${fullName(r.employee)} ${r.employee.employeeNumber}`.toLowerCase().includes(q)),
    )
  }, [rows, department, search])
  const hasExtraFilters = department !== 'all' || search.trim().length > 0 || status !== 'all'

  const filters = (
    <ReportFilterBar
      onClear={
        hasExtraFilters
          ? () => {
              setDepartment('all')
              setSearch('')
              setStatus('all')
            }
          : undefined
      }
    >
      <FilterLabel label="Tax Year" className="w-32">
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))} options={years.map((y) => ({ value: String(y), label: String(y) }))} />
      </FilterLabel>
      <FilterLabel label="Department" className="w-44">
        <Select value={department} onValueChange={setDepartment} options={[{ value: 'all', label: 'All Departments' }, ...departments.map((d) => ({ value: d, label: d }))]} />
      </FilterLabel>
      {withStatus && (
        <FilterLabel label="Status" className="w-52">
          <Select value={status} onValueChange={setStatus} options={STATUS_OPTIONS} />
        </FilterLabel>
      )}
      <FilterLabel label="Employee" className="w-56">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or ID…" className="pl-9" />
        </div>
      </FilterLabel>
    </ReportFilterBar>
  )

  const meta = [
    { label: 'Tax Year', value: String(year) },
    { label: 'Department', value: department === 'all' ? 'All' : department },
    ...(withStatus && status !== 'all' ? [{ label: 'Status', value: TAX_STATUS_LABEL[status as TaxStatus] }] : []),
  ]

  return { year, isLoading, rows: filtered, allRows: rows, status, filters, meta }
}

/** The 13th month bucket and each de minimis category in one place; flags every employee at or over a ceiling. */
export function TaxMonitoringReport() {
  const { year, isLoading, rows, status, filters, meta } = useTaxReport({ withStatus: true })
  const visible = useMemo(
    () => rows.filter((r) => status === 'all' || r.status === status).sort((a, b) => statusRank(b.status) - statusRank(a.status) || a.employee.personal.lastName.localeCompare(b.employee.personal.lastName)),
    [rows, status],
  )
  const count = (s: TaxStatus) => rows.filter((r) => r.status === s).length
  const flagged = (r: TaxEmployeeRow) => [...(r.bucket.status !== 'within' ? ['13th Month & Other Benefits'] : []), ...r.deMinimisItems.filter((i) => i.status !== 'within').map((i) => i.label)]

  const { selection, chosen } = useExportSelection(visible, (r) => r.employee.id)

  function onExport(): ExcelExport {
    const header = ['Employee ID', 'Employee Name', 'Department', '13th Month & Other Benefits', '% of Ceiling', 'Flagged Items', 'Status']
    const body = chosen.map((r) => [r.employee.employeeNumber, fullName(r.employee), r.employee.employment.department, r.bucket.total, Math.round((r.bucket.total / r.bucket.ceiling) * 100), flagged(r).join('; ') || '—', TAX_STATUS_LABEL[r.status]])
    return { filename: `tax-monitoring-${year}`, rows: [header, ...body] }
  }

  return (
    <ReportViewShell
      title="Tax Monitoring"
      exportLabel={selection.selected.size > 0 ? `Export Selected (${selection.selected.size})` : undefined}
      description={`Employees against the ${formatCurrency(THIRTEENTH_MONTH_CEILING)} ceiling on 13th Month Pay & other benefits and the de minimis ceilings — projected for the full year.`}
      meta={meta}
      orientation="landscape"
      onExportExcel={visible.length > 0 ? onExport : undefined}
    >
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-4">
          {filters}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile label="Employees Monitored" value={String(rows.length)} />
            <StatTile label="Review Required" value={String(count('review'))} />
            <StatTile label="Approaching Threshold" value={String(count('approaching'))} />
            <StatTile label="Within Limit" value={String(count('within'))} />
          </div>
          {selection.selected.size > 0 && <SelectionNote count={selection.selected.size} onClear={selection.clear} />}
          {visible.length === 0 ? (
            <EmptyState title="No employees match these filters" />
          ) : (
            <>
            <ReportCardList selectAll={{ state: selection.headerState, onChange: selection.toggleAll }} count={visible.length} noun={visible.length === 1 ? 'employee' : 'employees'}>
              {visible.map((r) => (
                <SelectableCard key={r.employee.id} checked={selection.selected.has(r.employee.id)} onChange={(c) => selection.toggle(r.employee.id, c)} label={fullName(r.employee)}>
                  <ReportRecordCard
                    avatar={fullName(r.employee)}
                    title={fullName(r.employee)}
                    badge={<TaxStatusBadge status={r.status} />}
                    subtitle={r.employee.employment.department}
                    meta={r.employee.employeeNumber}
                  >
                    <CardStat label="13th Month & Other Benefits">{money(r.bucket.total)}</CardStat>
                    <CardStat label="% of Ceiling">{Math.round((r.bucket.total / r.bucket.ceiling) * 100)}%</CardStat>
                    <CardStat label="Flagged" className="col-span-2">
                      <span className="text-xs font-normal text-muted-foreground">{flagged(r).join(', ') || '—'}</span>
                    </CardStat>
                  </ReportRecordCard>
                </SelectableCard>
              ))}
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 print:hidden">
                    <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} label="Select all rows" />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">13th Month & Other Benefits</TableHead>
                  <TableHead className="text-right">% of Ceiling</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <TableRow key={r.employee.id}>
                    <TableCell className="w-10 print:hidden">
                      <RowCheckbox checked={selection.selected.has(r.employee.id)} onChange={(c) => selection.toggle(r.employee.id, c)} label={fullName(r.employee)} />
                    </TableCell>
                                        <EmployeeCell row={r} />
                    <MoneyCell value={r.bucket.total} />
                    <TableCell className="text-right tabular-nums">{Math.round((r.bucket.total / r.bucket.ceiling) * 100)}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{flagged(r).join(', ') || '—'}</TableCell>
                    <TableCell>
                      <TaxStatusBadge status={r.status} />
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

/** Gross pay to date, less employee contributions and de minimis, plus whatever of 13th month & other benefits is over the ceiling. */
export function TaxableCompensationReport() {
  const { year, isLoading, rows, filters, meta } = useTaxReport()
  const totals = rows.reduce(
    (a, r) => ({ gross: a.gross + r.grossYtd, statutory: a.statutory + r.statutoryYtd, deMinimis: a.deMinimis + r.deMinimisPaidYtd, taxable: a.taxable + r.taxableCompensationYtd, tax: a.tax + r.withholdingYtd }),
    { gross: 0, statutory: 0, deMinimis: 0, taxable: 0, tax: 0 },
  )

  const { selection, chosen } = useExportSelection(rows, (r) => r.employee.id)

  function onExport(): ExcelExport {
    const header = ['Employee ID', 'Employee Name', 'Department', 'Gross Compensation', 'SSS / PhilHealth / Pag-IBIG (EE)', 'De Minimis Benefits', 'Taxable Compensation', 'Tax Withheld']
    const body = chosen.map((r) => [r.employee.employeeNumber, fullName(r.employee), r.employee.employment.department, r.grossYtd, r.statutoryYtd, r.deMinimisPaidYtd, r.taxableCompensationYtd, r.withholdingYtd])
    return { filename: `taxable-compensation-${year}`, rows: [header, ...body], footer: selection.selected.size > 0 ? undefined : ['TOTAL', `${rows.length} employees`, '', r2(totals.gross), r2(totals.statutory), r2(totals.deMinimis), r2(totals.taxable), r2(totals.tax)] }
  }

  return (
    <ReportViewShell
      title="Taxable Compensation"
      exportLabel={selection.selected.size > 0 ? `Export Selected (${selection.selected.size})` : undefined}
      description="Compensation paid so far in the year that is subject to income tax: gross pay less employee SSS, PhilHealth and Pag-IBIG and de minimis benefits, plus any 13th month & other benefits over the ceiling."
      meta={meta}
      orientation="landscape"
      onExportExcel={rows.length > 0 ? onExport : undefined}
    >
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-4">
          {filters}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile label="Gross Compensation" value={formatCurrency(totals.gross)} />
            <StatTile label="Non-taxable (Contributions + De Minimis)" value={formatCurrency(totals.statutory + totals.deMinimis)} />
            <StatTile label="Taxable Compensation" value={formatCurrency(totals.taxable)} />
            <StatTile label="Tax Withheld" value={formatCurrency(totals.tax)} />
          </div>
          {selection.selected.size > 0 && <SelectionNote count={selection.selected.size} onClear={selection.clear} />}
          {rows.length === 0 ? (
            <EmptyState title="No employees match these filters" />
          ) : (
            <>
            <ReportCardList selectAll={{ state: selection.headerState, onChange: selection.toggleAll }} count={rows.length} noun={rows.length === 1 ? 'employee' : 'employees'}>
              {rows.map((r) => (
                <SelectableCard key={r.employee.id} checked={selection.selected.has(r.employee.id)} onChange={(c) => selection.toggle(r.employee.id, c)} label={fullName(r.employee)}>
                  <ReportRecordCard avatar={fullName(r.employee)} title={fullName(r.employee)} subtitle={r.employee.employment.department} meta={r.employee.employeeNumber}>
                    <CardStat label="Gross Compensation">{money(r.grossYtd)}</CardStat>
                    <CardStat label="SSS / PhilHealth / Pag-IBIG">{money(r.statutoryYtd)}</CardStat>
                    <CardStat label="De Minimis">{money(r.deMinimisPaidYtd)}</CardStat>
                    <CardStat label="Tax Withheld">{money(r.withholdingYtd)}</CardStat>
                    <CardStat label="Taxable Compensation" className="col-span-2">
                      {money(r.taxableCompensationYtd)}
                    </CardStat>
                  </ReportRecordCard>
                </SelectableCard>
              ))}
              <TotalCard title={`Total (${rows.length} ${rows.length === 1 ? 'employee' : 'employees'})`}>
                <CardStat label="Gross Compensation">{money(totals.gross)}</CardStat>
                <CardStat label="SSS / PhilHealth / Pag-IBIG">{money(totals.statutory)}</CardStat>
                <CardStat label="De Minimis">{money(totals.deMinimis)}</CardStat>
                <CardStat label="Tax Withheld">{money(totals.tax)}</CardStat>
                <CardStat label="Taxable Compensation" className="col-span-2">
                  {money(totals.taxable)}
                </CardStat>
              </TotalCard>
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 print:hidden">
                    <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} label="Select all rows" />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Gross Compensation</TableHead>
                  <TableHead className="text-right">SSS / PhilHealth / Pag-IBIG</TableHead>
                  <TableHead className="text-right">De Minimis</TableHead>
                  <TableHead className="text-right">Taxable Compensation</TableHead>
                  <TableHead className="text-right">Tax Withheld</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.employee.id}>
                    <TableCell className="w-10 print:hidden">
                      <RowCheckbox checked={selection.selected.has(r.employee.id)} onChange={(c) => selection.toggle(r.employee.id, c)} label={fullName(r.employee)} />
                    </TableCell>
                                        <EmployeeCell row={r} />
                    <MoneyCell value={r.grossYtd} />
                    <MoneyCell value={r.statutoryYtd} />
                    <MoneyCell value={r.deMinimisPaidYtd} />
                    <MoneyCell value={r.taxableCompensationYtd} className="font-medium" />
                    <MoneyCell value={r.withholdingYtd} />
                  </TableRow>
                ))}
              </TableBody>
              <tfoot className="border-t-2 border-border bg-muted/50">
                <TableRow>
                  <TableCell className="print:hidden" />
                  <TableCell className="font-semibold">Total ({rows.length})</TableCell>
                  <MoneyCell value={totals.gross} className="font-semibold" />
                  <MoneyCell value={totals.statutory} className="font-semibold" />
                  <MoneyCell value={totals.deMinimis} className="font-semibold" />
                  <MoneyCell value={totals.taxable} className="font-semibold" />
                  <MoneyCell value={totals.tax} className="font-semibold" />
                </TableRow>
              </tfoot>
            </Table>
            </ReportTableView>
            </>
          )}
        </div>
      )}
    </ReportViewShell>
  )
}

/** 13th Month Pay, other non-taxable benefits and de minimis excess against the ₱90,000 ceiling. */
export function ThirteenthMonthBenefitsReport() {
  const { year, isLoading, rows, status, filters, meta } = useTaxReport({ withStatus: true })
  const visible = useMemo(() => rows.filter((r) => status === 'all' || r.bucket.status === status), [rows, status])
  const totals = visible.reduce(
    (a, r) => ({ thirteenth: a.thirteenth + r.bucket.thirteenthMonth, other: a.other + r.bucket.otherBenefits, excess: a.excess + r.bucket.deMinimisExcess, total: a.total + r.bucket.total, taxable: a.taxable + r.bucket.taxableExcess }),
    { thirteenth: 0, other: 0, excess: 0, total: 0, taxable: 0 },
  )
  const over = visible.filter((r) => r.bucket.status === 'review').length

  const { selection, chosen } = useExportSelection(visible, (r) => r.employee.id)

  function onExport(): ExcelExport {
    const header = ['Employee ID', 'Employee Name', 'Department', '13th Month Pay', 'Basis', 'Other Benefits', 'De Minimis Excess', 'Total', 'Ceiling', 'Remaining', 'Taxable Excess', 'Status']
    const body = chosen.map((r) => [r.employee.employeeNumber, fullName(r.employee), r.employee.employment.department, r.bucket.thirteenthMonth, r.bucket.isProjected ? 'Projected' : 'Generated', r.bucket.otherBenefits, r.bucket.deMinimisExcess, r.bucket.total, r.bucket.ceiling, r.bucket.remaining, r.bucket.taxableExcess, TAX_STATUS_LABEL[r.bucket.status]])
    return { filename: `13th-month-and-other-benefits-${year}`, rows: [header, ...body], footer: selection.selected.size > 0 ? undefined : ['TOTAL', `${visible.length} employees`, '', r2(totals.thirteenth), '', r2(totals.other), r2(totals.excess), r2(totals.total), '', '', r2(totals.taxable), ''] }
  }

  return (
    <ReportViewShell
      title="13th Month & Other Benefits"
      exportLabel={selection.selected.size > 0 ? `Export Selected (${selection.selected.size})` : undefined}
      description={`13th Month Pay plus other non-taxable benefits against the ${formatCurrency(THIRTEENTH_MONTH_CEILING)} yearly ceiling. Anything above it is taxable. Employees without a generated 13th Month batch show one-twelfth of basic pay earned (projected).`}
      meta={meta}
      orientation="landscape"
      onExportExcel={visible.length > 0 ? onExport : undefined}
    >
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-4">
          {filters}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile label="13th Month Pay" value={formatCurrency(totals.thirteenth)} />
            <StatTile label="Other Benefits" value={formatCurrency(totals.other + totals.excess)} />
            <StatTile label="Taxable Excess" value={formatCurrency(totals.taxable)} />
            <StatTile label="Over the Ceiling" value={`${over} employee${over === 1 ? '' : 's'}`} />
          </div>
          {selection.selected.size > 0 && <SelectionNote count={selection.selected.size} onClear={selection.clear} />}
          {visible.length === 0 ? (
            <EmptyState title="No employees match these filters" />
          ) : (
            <>
            <ReportCardList selectAll={{ state: selection.headerState, onChange: selection.toggleAll }} count={visible.length} noun={visible.length === 1 ? 'employee' : 'employees'}>
              {visible.map((r) => (
                <SelectableCard key={r.employee.id} checked={selection.selected.has(r.employee.id)} onChange={(c) => selection.toggle(r.employee.id, c)} label={fullName(r.employee)}>
                  <ReportRecordCard
                    avatar={fullName(r.employee)}
                    title={fullName(r.employee)}
                    badge={<TaxStatusBadge status={r.bucket.status} />}
                    subtitle={r.employee.employment.department}
                    meta={r.employee.employeeNumber}
                    details={
                      <>
                        <CardStat label="Other Benefits">{money(r.bucket.otherBenefits)}</CardStat>
                        <CardStat label="De Minimis Excess">{money(r.bucket.deMinimisExcess)}</CardStat>
                      </>
                    }
                  >
                    <CardStat label="13th Month Pay">
                      {money(r.bucket.thirteenthMonth)}
                      {r.bucket.isProjected && <span className="ml-1.5 text-[10px] font-normal uppercase text-muted-foreground">proj.</span>}
                    </CardStat>
                    <CardStat label="Total">{money(r.bucket.total)}</CardStat>
                    <CardStat label="Remaining">{money(r.bucket.remaining)}</CardStat>
                    <CardStat label="Taxable Excess" className={r.bucket.taxableExcess > 0 ? 'text-danger' : undefined}>
                      {money(r.bucket.taxableExcess)}
                    </CardStat>
                  </ReportRecordCard>
                </SelectableCard>
              ))}
              <TotalCard title={`Total (${visible.length} ${visible.length === 1 ? 'employee' : 'employees'})`}>
                <CardStat label="13th Month Pay">{money(totals.thirteenth)}</CardStat>
                <CardStat label="Other Benefits">{money(totals.other)}</CardStat>
                <CardStat label="De Minimis Excess">{money(totals.excess)}</CardStat>
                <CardStat label="Total">{money(totals.total)}</CardStat>
                <CardStat label="Taxable Excess" className="col-span-2">
                  {money(totals.taxable)}
                </CardStat>
              </TotalCard>
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 print:hidden">
                    <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} label="Select all rows" />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">13th Month Pay</TableHead>
                  <TableHead className="text-right">Other Benefits</TableHead>
                  <TableHead className="text-right">De Minimis Excess</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Taxable Excess</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <TableRow key={r.employee.id}>
                    <TableCell className="w-10 print:hidden">
                      <RowCheckbox checked={selection.selected.has(r.employee.id)} onChange={(c) => selection.toggle(r.employee.id, c)} label={fullName(r.employee)} />
                    </TableCell>
                                        <EmployeeCell row={r} />
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      {formatCurrency(r.bucket.thirteenthMonth)}
                      {r.bucket.isProjected && <span className="ml-1.5 text-[10px] uppercase text-muted-foreground">proj.</span>}
                    </TableCell>
                    <MoneyCell value={r.bucket.otherBenefits} />
                    <MoneyCell value={r.bucket.deMinimisExcess} />
                    <MoneyCell value={r.bucket.total} className="font-medium" />
                    <MoneyCell value={r.bucket.remaining} />
                    <MoneyCell value={r.bucket.taxableExcess} className={r.bucket.taxableExcess > 0 ? 'font-medium text-danger' : undefined} />
                    <TableCell>
                      <TaxStatusBadge status={r.bucket.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot className="border-t-2 border-border bg-muted/50">
                <TableRow>
                  <TableCell className="print:hidden" />
                  <TableCell className="font-semibold">Total ({visible.length})</TableCell>
                  <MoneyCell value={totals.thirteenth} className="font-semibold" />
                  <MoneyCell value={totals.other} className="font-semibold" />
                  <MoneyCell value={totals.excess} className="font-semibold" />
                  <MoneyCell value={totals.total} className="font-semibold" />
                  <TableCell />
                  <MoneyCell value={totals.taxable} className="font-semibold" />
                  <TableCell />
                </TableRow>
              </tfoot>
            </Table>
            </ReportTableView>
            </>
          )}
        </div>
      )}
    </ReportViewShell>
  )
}

interface DeMinimisRow {
  row: TaxEmployeeRow
  item: DeMinimisItem
}

/** Every de minimis benefit each employee receives, against its BIR ceiling. */
export function DeMinimisBenefitsReport() {
  const { year, isLoading, rows, status, filters, meta } = useTaxReport({ withStatus: true })
  const [benefit, setBenefit] = useState('all')

  const items = useMemo(
    () =>
      rows
        .flatMap((row) => row.deMinimisItems.map((item): DeMinimisRow => ({ row, item })))
        .filter(({ item }) => (benefit === 'all' || item.key === benefit) && (status === 'all' || item.status === status))
        .sort((a, b) => statusRank(b.item.status) - statusRank(a.item.status) || fullName(a.row.employee).localeCompare(fullName(b.row.employee))),
    [rows, benefit, status],
  )
  const count = (s: TaxStatus) => items.filter((i) => i.item.status === s).length
  const totalExcess = items.reduce((sum, i) => sum + i.item.excess, 0)

  const { selection, chosen } = useExportSelection(items, ({ row, item }) => `${row.employee.id}-${item.key}`)

  function onExport(): ExcelExport {
    const header = ['Employee ID', 'Employee Name', 'Department', 'Benefit', 'Ceiling', 'Ceiling Basis', 'Paid to Date', 'Projected (Full Year)', 'Remaining', 'Excess', 'Status']
    const body = chosen.map(({ row, item }) => [row.employee.employeeNumber, fullName(row.employee), row.employee.employment.department, item.label, item.ceiling, item.ceilingNote, item.paidYtd, item.projected, item.remaining, item.excess, TAX_STATUS_LABEL[item.status]])
    return { filename: `de-minimis-benefits-${year}`, rows: [header, ...body] }
  }

  return (
    <ReportViewShell
      title="De Minimis Benefits"
      exportLabel={selection.selected.size > 0 ? `Export Selected (${selection.selected.size})` : undefined}
      description="Rice subsidy, uniform and clothing, laundry and other de minimis benefits against their yearly ceilings. Amounts over a ceiling are taxable (they count toward the 13th Month & Other Benefits ceiling first)."
      meta={[...meta, ...(benefit !== 'all' ? [{ label: 'Benefit', value: DE_MINIMIS_CATEGORIES.find((c) => c.key === benefit)?.label ?? benefit }] : [])]}
      orientation="landscape"
      onExportExcel={items.length > 0 ? onExport : undefined}
    >
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-4">
          {filters}
          <div className="max-w-xs print:hidden">
            <FilterLabel label="Benefit">
              <Select value={benefit} onValueChange={setBenefit} options={[{ value: 'all', label: 'All Benefits' }, ...DE_MINIMIS_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))]} />
            </FilterLabel>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile label="Benefit Records" value={String(items.length)} />
            <StatTile label="Review Required" value={String(count('review'))} />
            <StatTile label="Approaching Threshold" value={String(count('approaching'))} />
            <StatTile label="Total Excess (Taxable)" value={formatCurrency(totalExcess)} />
          </div>
          {selection.selected.size > 0 && <SelectionNote count={selection.selected.size} onClear={selection.clear} />}
          {items.length === 0 ? (
            <EmptyState title="No de minimis benefits match these filters" />
          ) : (
            <>
            <ReportCardList selectAll={{ state: selection.headerState, onChange: selection.toggleAll }} count={items.length} noun={items.length === 1 ? 'benefit record' : 'benefit records'}>
              {items.map(({ row, item }) => (
                <SelectableCard
                  key={`${row.employee.id}-${item.key}`}
                  checked={selection.selected.has(`${row.employee.id}-${item.key}`)}
                  onChange={(c) => selection.toggle(`${row.employee.id}-${item.key}`, c)}
                  label={`${fullName(row.employee)} ${item.label}`}
                >
                  <ReportRecordCard
                    avatar={fullName(row.employee)}
                    title={fullName(row.employee)}
                    badge={<TaxStatusBadge status={item.status} />}
                    subtitle={item.label}
                    meta={`${row.employee.employeeNumber} · ${row.employee.employment.department}`}
                    details={<CardStat label="Remaining">{money(item.remaining)}</CardStat>}
                  >
                    <CardStat label="Ceiling">
                      {money(item.ceiling)}
                      <span className="block text-[10px] font-normal text-muted-foreground">{item.ceilingNote}</span>
                    </CardStat>
                    <CardStat label="Paid to Date">{money(item.paidYtd)}</CardStat>
                    <CardStat label="Projected (Year)">{money(item.projected)}</CardStat>
                    <CardStat label="Excess" className={item.excess > 0 ? 'text-danger' : undefined}>
                      {money(item.excess)}
                    </CardStat>
                  </ReportRecordCard>
                </SelectableCard>
              ))}
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 print:hidden">
                    <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} label="Select all rows" />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Benefit</TableHead>
                  <TableHead className="text-right">Ceiling</TableHead>
                  <TableHead className="text-right">Paid to Date</TableHead>
                  <TableHead className="text-right">Projected (Year)</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Excess</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(({ row, item }) => (
                  <TableRow key={`${row.employee.id}-${item.key}`}>
                    <TableCell className="w-10 print:hidden">
                      <RowCheckbox checked={selection.selected.has(`${row.employee.id}-${item.key}`)} onChange={(c) => selection.toggle(`${row.employee.id}-${item.key}`, c)} label={`${fullName(row.employee)} ${item.label}`} />
                    </TableCell>
                                        <EmployeeCell row={row} />
                    <TableCell className="whitespace-nowrap">{item.label}</TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      {formatCurrency(item.ceiling)}
                      <span className="block text-[10px] text-muted-foreground">{item.ceilingNote}</span>
                    </TableCell>
                    <MoneyCell value={item.paidYtd} />
                    <MoneyCell value={item.projected} className="font-medium" />
                    <MoneyCell value={item.remaining} />
                    <MoneyCell value={item.excess} className={item.excess > 0 ? 'font-medium text-danger' : undefined} />
                    <TableCell>
                      <TaxStatusBadge status={item.status} />
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

const VIEW_OPTIONS = [
  { value: 'month', label: 'By Month' },
  { value: 'employee', label: 'By Employee' },
]

/** Tax withheld on compensation, by payroll month or by employee, for a calendar year. */
export function WithholdingTaxSummaryReport() {
  const { year, isLoading, rows, filters, meta } = useTaxReport()
  const { rows: lines, isLoading: linesLoading } = useFinalizedPayrollLines()
  const [view, setView] = useState<'month' | 'employee'>('month')

  const months = useMemo(() => {
    const byMonth = new Map<string, { employees: Set<string>; gross: number; tax: number }>()
    for (const { period, line, employee } of lines) {
      if (!period.payDate.startsWith(String(year))) continue
      const key = period.payDate.slice(0, 7)
      const bucket = byMonth.get(key) ?? { employees: new Set<string>(), gross: 0, tax: 0 }
      bucket.employees.add(employee.id)
      bucket.gross += line.grossPay
      bucket.tax += line.withholdingTax
      byMonth.set(key, bucket)
    }
    return [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([month, b]) => ({ month, employees: b.employees.size, gross: b.gross, tax: b.tax }))
  }, [lines, year])

  const paid = rows.filter((r) => r.grossYtd > 0)
  const monthTotals = months.reduce((a, m) => ({ gross: a.gross + m.gross, tax: a.tax + m.tax }), { gross: 0, tax: 0 })
  const empTotals = paid.reduce((a, r) => ({ gross: a.gross + r.grossYtd, taxable: a.taxable + r.taxableCompensationYtd, tax: a.tax + r.withholdingYtd }), { gross: 0, taxable: 0, tax: 0 })
  const rate = (tax: number, base: number) => (base > 0 ? `${((tax / base) * 100).toFixed(1)}%` : '—')

  const { selection, chosen } = useExportSelection(paid, (r) => r.employee.id)
  const picking = view === 'employee' && selection.selected.size > 0

  function onExport(): ExcelExport {
    if (view === 'month') {
      const header = ['Month', 'Employees Paid', 'Gross Compensation', 'Tax Withheld', 'Effective Rate (% of Gross)']
      const body = months.map((m) => [monthLabel(m.month), m.employees, r2(m.gross), r2(m.tax), rate(m.tax, m.gross)])
      return { filename: `withholding-tax-by-month-${year}`, rows: [header, ...body], footer: ['TOTAL', '', r2(monthTotals.gross), r2(monthTotals.tax), rate(monthTotals.tax, monthTotals.gross)] }
    }
    const header = ['Employee ID', 'Employee Name', 'TIN', 'Gross Compensation', 'Taxable Compensation', 'Tax Withheld', 'Effective Rate (% of Taxable)']
    const body = chosen.map((r) => [r.employee.employeeNumber, fullName(r.employee), r.employee.government.tinNo ?? '—', r.grossYtd, r.taxableCompensationYtd, r.withholdingYtd, rate(r.withholdingYtd, r.taxableCompensationYtd)])
    return { filename: `withholding-tax-by-employee-${year}`, rows: [header, ...body], footer: picking ? undefined : ['TOTAL', `${paid.length} employees`, '', r2(empTotals.gross), r2(empTotals.taxable), r2(empTotals.tax), rate(empTotals.tax, empTotals.taxable)] }
  }

  const loading = isLoading || linesLoading
  const empty = view === 'month' ? months.length === 0 : paid.length === 0

  return (
    <ReportViewShell
      title="Withholding Tax Summary"
      exportLabel={picking ? `Export Selected (${selection.selected.size})` : undefined}
      description="Income tax withheld on compensation, by month (the 1601-C remittance basis) or by employee (the 2316 basis)."
      meta={[...meta, { label: 'View', value: view === 'month' ? 'By Month' : 'By Employee' }]}
      onExportExcel={!loading && !empty ? onExport : undefined}
    >
      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-4">
          {filters}
          <div className="max-w-[10rem] print:hidden">
            <FilterLabel label="View">
              <Select value={view} onValueChange={(v) => setView(v as 'month' | 'employee')} options={VIEW_OPTIONS} />
            </FilterLabel>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 max-sm:[&>*:last-child]:col-span-2">
            <StatTile label="Employees Paid" value={String(view === 'month' ? new Set(lines.filter((l) => l.period.payDate.startsWith(String(year))).map((l) => l.employee.id)).size : paid.length)} />
            <StatTile label="Gross Compensation" value={formatCurrency(view === 'month' ? monthTotals.gross : empTotals.gross)} />
            <StatTile label="Total Tax Withheld" value={formatCurrency(view === 'month' ? monthTotals.tax : empTotals.tax)} />
          </div>
          {empty ? (
            <EmptyState title="No payroll runs paid in this year" />
          ) : view === 'month' ? (
            <>
            <ReportCardList count={months.length} noun={months.length === 1 ? 'month' : 'months'}>
              {months.map((m) => (
                <ReportRecordCard key={m.month} title={monthLabel(m.month)} subtitle={`${m.employees} ${m.employees === 1 ? 'employee' : 'employees'} paid`}>
                  <CardStat label="Gross Compensation">{money(m.gross)}</CardStat>
                  <CardStat label="Tax Withheld">{money(m.tax)}</CardStat>
                  <CardStat label="Rate (% of Gross)">{rate(m.tax, m.gross)}</CardStat>
                </ReportRecordCard>
              ))}
              <TotalCard title="Year to date">
                <CardStat label="Gross Compensation">{money(monthTotals.gross)}</CardStat>
                <CardStat label="Tax Withheld">{money(monthTotals.tax)}</CardStat>
                <CardStat label="Rate (% of Gross)">{rate(monthTotals.tax, monthTotals.gross)}</CardStat>
              </TotalCard>
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Employees Paid</TableHead>
                  <TableHead className="text-right">Gross Compensation</TableHead>
                  <TableHead className="text-right">Tax Withheld</TableHead>
                  <TableHead className="text-right">Rate (% of Gross)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell className="font-medium">{monthLabel(m.month)}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.employees}</TableCell>
                    <MoneyCell value={m.gross} />
                    <MoneyCell value={m.tax} className="font-medium" />
                    <TableCell className="text-right tabular-nums">{rate(m.tax, m.gross)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot className="border-t-2 border-border bg-muted/50">
                <TableRow>
                  <TableCell className="font-semibold">Year to date</TableCell>
                  <TableCell />
                  <MoneyCell value={monthTotals.gross} className="font-semibold" />
                  <MoneyCell value={monthTotals.tax} className="font-semibold" />
                  <TableCell className="text-right font-semibold tabular-nums">{rate(monthTotals.tax, monthTotals.gross)}</TableCell>
                </TableRow>
              </tfoot>
            </Table>
            </ReportTableView>
            </>
          ) : (
            <>
            {selection.selected.size > 0 && <SelectionNote count={selection.selected.size} onClear={selection.clear} />}
            <ReportCardList selectAll={{ state: selection.headerState, onChange: selection.toggleAll }} count={paid.length} noun={paid.length === 1 ? 'employee' : 'employees'}>
              {paid.map((r) => (
                <SelectableCard key={r.employee.id} checked={selection.selected.has(r.employee.id)} onChange={(c) => selection.toggle(r.employee.id, c)} label={fullName(r.employee)}>
                  <ReportRecordCard
                    avatar={fullName(r.employee)}
                    title={fullName(r.employee)}
                    subtitle={`${r.employee.employeeNumber} · ${r.employee.employment.department}`}
                    meta={`TIN ${r.employee.government.tinNo ?? '—'}`}
                  >
                    <CardStat label="Gross Compensation">{money(r.grossYtd)}</CardStat>
                    <CardStat label="Taxable Compensation">{money(r.taxableCompensationYtd)}</CardStat>
                    <CardStat label="Tax Withheld">{money(r.withholdingYtd)}</CardStat>
                    <CardStat label="Rate (% of Taxable)">{rate(r.withholdingYtd, r.taxableCompensationYtd)}</CardStat>
                  </ReportRecordCard>
                </SelectableCard>
              ))}
              <TotalCard title={`Total (${paid.length} ${paid.length === 1 ? 'employee' : 'employees'})`}>
                <CardStat label="Gross Compensation">{money(empTotals.gross)}</CardStat>
                <CardStat label="Taxable Compensation">{money(empTotals.taxable)}</CardStat>
                <CardStat label="Tax Withheld">{money(empTotals.tax)}</CardStat>
                <CardStat label="Rate (% of Taxable)">{rate(empTotals.tax, empTotals.taxable)}</CardStat>
              </TotalCard>
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 print:hidden">
                    <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} label="Select all rows" />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>TIN</TableHead>
                  <TableHead className="text-right">Gross Compensation</TableHead>
                  <TableHead className="text-right">Taxable Compensation</TableHead>
                  <TableHead className="text-right">Tax Withheld</TableHead>
                  <TableHead className="text-right">Rate (% of Taxable)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paid.map((r) => (
                  <TableRow key={r.employee.id}>
                    <TableCell className="w-10 print:hidden">
                      <RowCheckbox checked={selection.selected.has(r.employee.id)} onChange={(c) => selection.toggle(r.employee.id, c)} label={fullName(r.employee)} />
                    </TableCell>
                    <EmployeeCell row={r} />
                    <TableCell className="whitespace-nowrap text-muted-foreground">{r.employee.government.tinNo ?? '—'}</TableCell>
                    <MoneyCell value={r.grossYtd} />
                    <MoneyCell value={r.taxableCompensationYtd} />
                    <MoneyCell value={r.withholdingYtd} className="font-medium" />
                    <TableCell className="text-right tabular-nums">{rate(r.withholdingYtd, r.taxableCompensationYtd)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot className="border-t-2 border-border bg-muted/50">
                <TableRow>
                  <TableCell className="print:hidden" />
                  <TableCell className="font-semibold">Total ({paid.length})</TableCell>
                  <TableCell />
                  <MoneyCell value={empTotals.gross} className="font-semibold" />
                  <MoneyCell value={empTotals.taxable} className="font-semibold" />
                  <MoneyCell value={empTotals.tax} className="font-semibold" />
                  <TableCell className="text-right font-semibold tabular-nums">{rate(empTotals.tax, empTotals.taxable)}</TableCell>
                </TableRow>
              </tfoot>
            </Table>
            </ReportTableView>
            </>
          )}
        </div>
      )}
    </ReportViewShell>
  )
}
