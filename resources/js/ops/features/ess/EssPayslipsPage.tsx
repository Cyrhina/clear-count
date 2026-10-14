import { Download, Eye } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Button } from '@ops/components/ui/Button'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FilterField, SortControl } from '@ops/components/ui/FiltersPopover'
import type { SortDirection } from '@ops/components/ui/FiltersPopover'
import { SearchFilterBar } from '@ops/components/ui/SearchFilterBar'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { EssCardList, EssRecordCard, EssTableView } from '@ops/features/ess/components/EssRecordCard'
import { useSelfEmployee } from '@ops/features/ess/hooks/useSelfEmployee'
import { useOvertimeRecords } from '@ops/features/overtime/hooks/useOvertime'
import { useMyPayslips } from '@ops/features/payroll/hooks/usePayroll'
import { useHighlightTarget } from '@ops/hooks/useHighlightTarget'
import { cn } from '@ops/lib/utils/cn'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { PayrollLine } from '@ops/types/domain'

function statutoryTotal(line: PayrollLine): number {
  return line.sssEmployeeShare + line.philhealthEmployeeShare + line.pagibigEmployeeShare + line.withholdingTax
}

export function EssPayslipsPage() {
  const { employee, isLoading } = useSelfEmployee()
  const { payslips, isLoading: loadingPayslips } = useMyPayslips()
  const { records: overtimeRecords } = useOvertimeRecords()
  const { highlightId } = useHighlightTarget()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('all')
  const [sortBy, setSortBy] = useState('payDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  if (isLoading || loadingPayslips) return <Skeleton className="h-72" />
  if (!employee) return <p className="text-sm text-muted-foreground">No employee record linked to this account.</p>

  const rows = payslips.map(({ line, period }) => ({
    line,
    period,
    otHours: overtimeRecords
      .filter((r) => r.employeeId === employee.id && r.status === 'approved' && r.date >= period.startDate && r.date <= period.endDate)
      .reduce((sum, r) => sum + r.hours, 0),
  }))

  const years = [...new Set(rows.map((r) => r.period.payDate.slice(0, 4)))].sort().reverse()
  const query = search.trim().toLowerCase()
  const visible = rows
    .filter(
      ({ period }) =>
        (year === 'all' || period.payDate.startsWith(year)) &&
        (!query || `${period.label} ${period.payrollNumber} ${period.payDate}`.toLowerCase().includes(query)),
    )
    .sort((a, b) => {
      const result = sortBy === 'netPay' ? a.line.netPay - b.line.netPay : a.period.payDate.localeCompare(b.period.payDate)
      return sortDirection === 'asc' ? result : -result
    })
  const activeFilterCount = year !== 'all' ? 1 : 0

  return (
    <div className="space-y-5">
      <PageHeader title="My Payslips" description="View and download your payslips after each payroll run is finalized." />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search period or payroll no.…"
        activeCount={activeFilterCount}
        onClear={() => {
          setSearch('')
          setYear('all')
        }}
        trailing={`${visible.length} of ${rows.length} payslips`}
        filters={
          <>
            <FilterField label="Pay Year">
              <Select value={year} onValueChange={setYear} options={[{ value: 'all', label: 'All years' }, ...years.map((y) => ({ value: y, label: y }))]} />
            </FilterField>
            <SortControl
              value={sortBy}
              onValueChange={setSortBy}
              options={[
                { value: 'payDate', label: 'Pay Date' },
                { value: 'netPay', label: 'Net Pay' },
              ]}
              direction={sortDirection}
              onDirectionChange={setSortDirection}
            />
          </>
        }
      />

      {visible.length === 0 ? (
        <EmptyState title="No payslips match these filters" description="Try another year or clear the search." />
      ) : (
      <>
      <EssCardList>
        {visible.map(({ period, line, otHours }) => (
          <EssRecordCard
            key={line.id}
            className={cn(line.id === highlightId && 'highlight-target')}
            id={line.id}
            title={period.label}
            subtitle={`${period.payrollNumber} · Pay date ${formatDate(period.payDate)}`}
            stats={[
              { label: 'Gross Pay', value: formatCurrency(line.grossPay) },
              { label: 'Net Pay', value: formatCurrency(line.netPay) },
              { label: 'Statutory', value: formatCurrency(statutoryTotal(line)) },
              { label: 'Overtime', value: otHours > 0 ? `${otHours} hrs` : '—' },
            ]}
            actions={
              <>
                <Button size="sm" variant="secondary" icon={<Eye className="size-3.5" />} onClick={() => navigate(`/ess/payslips/${line.id}`)}>
                  View
                </Button>
                <Button size="sm" variant="secondary" icon={<Download className="size-3.5" />} onClick={() => window.location.assign(`/api/payslips/${line.id}/pdf`)}>
                  Download
                </Button>
              </>
            }
          />
        ))}
      </EssCardList>
      <EssTableView>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Gross Pay</TableHead>
            <TableHead>Statutory Deductions</TableHead>
            <TableHead>Overtime</TableHead>
            <TableHead>Net Pay</TableHead>
            <TableHead>Pay Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map(({ period, line, otHours }) => (
            <TableRow key={line.id} id={`row-${line.id}`} className={cn(line.id === highlightId && 'highlight-target')}>
              <TableCell className="font-medium">
                {period.label}
                <span className="ml-2 text-xs font-normal tabular-nums text-muted-foreground">{period.payrollNumber}</span>
              </TableCell>
              <TableCell>{formatCurrency(line.grossPay)}</TableCell>
              <TableCell>{formatCurrency(statutoryTotal(line))}</TableCell>
              <TableCell>{otHours > 0 ? `${otHours} hrs` : '—'}</TableCell>
              <TableCell>{formatCurrency(line.netPay)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{formatDate(period.payDate)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Eye className="size-3.5" />}
                    onClick={() => navigate(`/ess/payslips/${line.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Download className="size-3.5" />}
                    onClick={() => window.location.assign(`/api/payslips/${line.id}/pdf`)}
                  >
                    Download
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </EssTableView>
      </>
      )}
    </div>
  )
}
