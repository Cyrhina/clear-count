import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FilterField } from '@ops/components/ui/FiltersPopover'
import { SearchFilterBar } from '@ops/components/ui/SearchFilterBar'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { CreatePeriodDialog } from '@ops/features/payroll/components/CreatePeriodDialog'
import { usePayrollPeriods } from '@ops/features/payroll/hooks/usePayroll'
import { usePayrollGroups } from '@ops/features/company-settings/hooks/usePayrollGroups'
import { usePermission } from '@ops/hooks/usePermission'
import { formatDate } from '@ops/lib/utils/format'

const ALL = 'all'
const ALL_EMPLOYEES = 'everyone'

const STATUS_OPTIONS = [
  { value: ALL, label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In review' },
  { value: 'approved', label: 'Approved' },
  { value: 'finalized', label: 'Finalized' },
]

/** "2026-09" → "2026-10". */
function nextMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
}

/** "2026-09" → "September 2026". */
function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1))
}

export function PayrollListPage() {
  const { periods, isLoading, refetch } = usePayrollPeriods()
  const { groups } = usePayrollGroups()
  const canRun = usePermission('payroll.run')
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(ALL)
  const [groupId, setGroupId] = useState(ALL)
  const [year, setYear] = useState(ALL)
  const [month, setMonth] = useState(ALL)

  const groupName = (id?: string) => (id ? (groups.find((g) => g.id === id)?.name ?? 'Unknown Group') : 'All Employees')
  const years = useMemo(() => [...new Set(periods.map((p) => String(p.payrollYear)))].sort().reverse(), [periods])
  // Months a run covers (a weekly run can span two), newest first — "2026-09" style keys.
  const monthsOf = (p: { startDate: string; endDate: string }) => {
    const out: string[] = []
    for (let k = p.startDate.slice(0, 7); k <= p.endDate.slice(0, 7); k = nextMonth(k)) out.push(k)
    return out
  }
  const monthOptions = useMemo(() => [...new Set(periods.flatMap(monthsOf))].sort().reverse(), [periods])
  const activeCount = [status !== ALL, groupId !== ALL, year !== ALL, month !== ALL].filter(Boolean).length

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return periods.filter(
      (p) =>
        (!q || `${p.payrollNumber} ${p.label} ${groupName(p.payrollGroupId)}`.toLowerCase().includes(q)) &&
        (status === ALL || p.status === status) &&
        (groupId === ALL || (groupId === ALL_EMPLOYEES ? !p.payrollGroupId : p.payrollGroupId === groupId)) &&
        (year === ALL || String(p.payrollYear) === year) &&
        (month === ALL || monthsOf(p).includes(month)),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods, groups, search, status, groupId, year, month])

  function clearFilters() {
    setSearch('')
    setStatus(ALL)
    setGroupId(ALL)
    setYear(ALL)
    setMonth(ALL)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payroll Runs"
        description="Create payroll periods, run calculations, and move each period through review, approval, and finalization."
        actions={canRun && <CreatePeriodDialog onCreated={refetch} />}
      />

      {isLoading ? (
        <Skeleton className="h-72" />
      ) : periods.length === 0 ? (
        <EmptyState
          title="No payroll periods yet"
          description="Create your first payroll period to start running calculations."
        />
      ) : (
        <>
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search payroll no., period, or group…"
            activeCount={activeCount}
            onClear={clearFilters}
            trailing={`${visible.length} of ${periods.length} runs`}
            filters={
              <>
                <FilterField label="Status">
                  <Select value={status} onValueChange={setStatus} options={STATUS_OPTIONS} />
                </FilterField>
                <FilterField label="Payroll Group">
                  <Select
                    value={groupId}
                    onValueChange={setGroupId}
                    options={[
                      { value: ALL, label: 'All groups' },
                      { value: ALL_EMPLOYEES, label: 'All Employees (no group)' },
                      ...groups.map((g) => ({ value: g.id, label: g.name })),
                    ]}
                  />
                </FilterField>
                <FilterField label="Month">
                  <Select value={month} onValueChange={setMonth} options={[{ value: ALL, label: 'All months' }, ...monthOptions.map((m) => ({ value: m, label: monthLabel(m) }))]} />
                </FilterField>
                <FilterField label="Payroll Year">
                  <Select value={year} onValueChange={setYear} options={[{ value: ALL, label: 'All years' }, ...years.map((y) => ({ value: y, label: y }))]} />
                </FilterField>
              </>
            }
          />

          {visible.length === 0 ? (
            <EmptyState title="No payroll runs match these filters" description="Try clearing a filter or search term." />
          ) : (
            <>
            {/* Phones and tablets: one card per payroll run (two columns on tablet). */}
            <div className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-2 lg:hidden">
              {visible.map((period) => (
                <Card key={period.id} watermark={null} className="cursor-pointer space-y-3 p-4 transition-shadow hover:shadow-soft-lg" onClick={() => navigate(`/payroll/${period.id}`)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium tabular-nums text-muted-foreground">{period.payrollNumber}</p>
                      <p className="text-sm font-semibold">{period.label}</p>
                    </div>
                    <StatusBadge status={period.status} />
                  </div>
                  <div>{period.payrollGroupId ? <Badge tone="brand">{groupName(period.payrollGroupId)}</Badge> : <Badge tone="neutral">All Employees</Badge>}</div>
                  <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Coverage</dt>
                      <dd className="mt-0.5 font-medium">
                        {formatDate(period.startDate)} &ndash; {formatDate(period.endDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Pay date</dt>
                      <dd className="mt-0.5 font-medium">{formatDate(period.payDate)}</dd>
                    </div>
                  </dl>
                </Card>
              ))}
            </div>
            <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payroll No.</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Payroll Group</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((period) => (
                  <TableRow key={period.id} className="cursor-pointer" onClick={() => navigate(`/payroll/${period.id}`)}>
                    <TableCell className="whitespace-nowrap font-medium tabular-nums" title={`${period.payrollNumber} for ${period.payrollYear}`}>
                      {period.payrollNumber}
                    </TableCell>
                    <TableCell className="font-medium">{period.label}</TableCell>
                    <TableCell>
                      {period.payrollGroupId ? (
                        <Badge tone="brand">{groupName(period.payrollGroupId)}</Badge>
                      ) : (
                        <Badge tone="neutral">All Employees</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(period.startDate)} &ndash; {formatDate(period.endDate)}
                    </TableCell>
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
        </>
      )}
    </div>
  )
}
