import { ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { StatusBadge } from '@ops/components/ui/Badge'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FilterField, SortControl, type SortDirection } from '@ops/components/ui/FiltersPopover'
import { SearchFilterBar } from '@ops/components/ui/SearchFilterBar'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { usePayrollPeriods } from '@ops/features/payroll/hooks/usePayroll'
import { MONTH_NAMES } from '@ops/lib/payroll/complianceDeadlines'
import { formatDate } from '@ops/lib/utils/format'

const ALL = 'all'

const SORT_OPTIONS = [
  { value: 'payDate', label: 'Pay Date' },
  { value: 'payrollNumber', label: 'Payroll No.' },
  { value: 'label', label: 'Period' },
]

const MONTH_OPTIONS = [{ value: ALL, label: 'All Months' }, ...MONTH_NAMES.map((name, i) => ({ value: String(i + 1).padStart(2, '0'), label: name }))]

export function PayslipsListPage() {
  const { periods, isLoading } = usePayrollPeriods()
  const navigate = useNavigate()
  const finalized = useMemo(() => periods.filter((p) => p.status === 'finalized'), [periods])

  const [search, setSearch] = useState('')
  const [year, setYear] = useState(ALL)
  const [month, setMonth] = useState(ALL)
  const [sortBy, setSortBy] = useState('payDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Year and month refer to the pay date — when the payslips are released.
  const yearOptions = useMemo(
    () => [{ value: ALL, label: 'All Years' }, ...[...new Set(finalized.map((p) => p.payDate.slice(0, 4)))].sort().reverse().map((y) => ({ value: y, label: y }))],
    [finalized],
  )
  const activeCount = Number(year !== ALL) + Number(month !== ALL)

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return finalized
      .filter((p) => {
        if (year !== ALL && p.payDate.slice(0, 4) !== year) return false
        if (month !== ALL && p.payDate.slice(5, 7) !== month) return false
        return !q || `${p.payrollNumber} ${p.label}`.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        const result = sortBy === 'payrollNumber' ? a.payrollNumber.localeCompare(b.payrollNumber, undefined, { numeric: true }) : sortBy === 'label' ? a.label.localeCompare(b.label) : a.payDate.localeCompare(b.payDate)
        return sortDirection === 'asc' ? result : -result
      })
  }, [finalized, search, year, month, sortBy, sortDirection])

  const filtersActive = search.trim() !== '' || activeCount > 0
  const clearFilters = () => {
    setSearch('')
    setYear(ALL)
    setMonth(ALL)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Payslips" description="Payslips become available once a payroll period is finalized." />

      {isLoading ? (
        <Skeleton className="h-72" />
      ) : finalized.length === 0 ? (
        <EmptyState
          title="No finalized payroll periods yet"
          description="Once a payroll admin finalizes a run, its payslips will appear here."
        />
      ) : (
        <div className="space-y-4">
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search payroll no. or period…"
            activeCount={activeCount}
            onClear={clearFilters}
            filters={
              <>
                <FilterField label="Year">
                  <Select value={year} onValueChange={setYear} options={yearOptions} />
                </FilterField>
                <FilterField label="Month">
                  <Select value={month} onValueChange={setMonth} options={MONTH_OPTIONS} />
                </FilterField>
                <SortControl value={sortBy} onValueChange={setSortBy} options={SORT_OPTIONS} direction={sortDirection} onDirectionChange={setSortDirection} />
              </>
            }
            trailing={`${shown.length} of ${finalized.length} payroll runs`}
          />

          {shown.length === 0 ? (
            <EmptyState
              title="No payroll runs match these filters"
              description={filtersActive ? 'Try clearing a filter or searching for something else.' : undefined}
            />
          ) : (
            <>
              {/* Phones and tablets: one card per payroll run — one column on phones, two on tablets. */}
              <div className="grid gap-2.5 sm:grid-cols-2 lg:hidden">
                {shown.map((period) => (
                  <Card key={period.id} watermark={null} className="cursor-pointer p-4 transition-colors hover:bg-muted/30" onClick={() => navigate(`/payroll/${period.id}`)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium tabular-nums text-muted-foreground">{period.payrollNumber}</p>
                        <p className="mt-0.5 text-sm font-semibold leading-tight">{period.label}</p>
                      </div>
                      <StatusBadge status={period.status} />
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-3 border-t border-border pt-3">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Pay date</p>
                        <p className="text-sm font-medium">{formatDate(period.payDate)}</p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                  </Card>
                ))}
              </div>

              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payroll No.</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Pay Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shown.map((period) => (
                      <TableRow key={period.id} className="cursor-pointer" onClick={() => navigate(`/payroll/${period.id}`)}>
                        <TableCell className="whitespace-nowrap font-medium tabular-nums">{period.payrollNumber}</TableCell>
                        <TableCell className="font-medium">{period.label}</TableCell>
                        <TableCell>{formatDate(period.payDate)}</TableCell>
                        <TableCell>
                          <StatusBadge status={period.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
