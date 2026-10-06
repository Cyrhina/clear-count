import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
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

export function PayrollListPage() {
  const { periods, isLoading, refetch } = usePayrollPeriods()
  const { groups } = usePayrollGroups()
  const canRun = usePermission('payroll.run')
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(ALL)
  const [groupId, setGroupId] = useState(ALL)
  const [year, setYear] = useState(ALL)

  const groupName = (id?: string) => (id ? (groups.find((g) => g.id === id)?.name ?? 'Unknown Group') : 'All Employees')
  const years = useMemo(() => [...new Set(periods.map((p) => String(p.payrollYear)))].sort().reverse(), [periods])
  const activeCount = [status !== ALL, groupId !== ALL, year !== ALL].filter(Boolean).length

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return periods.filter(
      (p) =>
        (!q || `${p.payrollNumber} ${p.label} ${groupName(p.payrollGroupId)}`.toLowerCase().includes(q)) &&
        (status === ALL || p.status === status) &&
        (groupId === ALL || (groupId === ALL_EMPLOYEES ? !p.payrollGroupId : p.payrollGroupId === groupId)) &&
        (year === ALL || String(p.payrollYear) === year),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods, groups, search, status, groupId, year])

  function clearFilters() {
    setSearch('')
    setStatus(ALL)
    setGroupId(ALL)
    setYear(ALL)
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
                <FilterField label="Payroll Year">
                  <Select value={year} onValueChange={setYear} options={[{ value: ALL, label: 'All years' }, ...years.map((y) => ({ value: y, label: y }))]} />
                </FilterField>
              </>
            }
          />

          {visible.length === 0 ? (
            <EmptyState title="No payroll runs match these filters" description="Try clearing a filter or search term." />
          ) : (
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
          )}
        </>
      )}
    </div>
  )
}
