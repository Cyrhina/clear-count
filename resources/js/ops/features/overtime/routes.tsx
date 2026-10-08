import { Banknote, Download, Hourglass, MoonStar, Search, Timer } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Avatar } from '@ops/components/ui/Avatar'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { BulkActionBar } from '@ops/components/ui/BulkActionBar'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FilterField, FiltersPopover, SortControl, type SortDirection } from '@ops/components/ui/FiltersPopover'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { RowCheckbox, SelectAllCheckbox } from '@ops/components/ui/SelectCheckboxes'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import { useEmployees } from '@ops/features/employees/hooks/useEmployees'
import { NewOvertimeRequestDialog } from '@ops/features/overtime/components/NewOvertimeRequestDialog'
import { OvertimeDetailsDialog } from '@ops/features/overtime/components/OvertimeDetailsDialog'
import { useOvertimeRecords, useOvertimeSummary } from '@ops/features/overtime/hooks/useOvertime'
import { usePermission } from '@ops/hooks/usePermission'
import { useRowSelection } from '@ops/hooks/useRowSelection'
import { useSession } from '@ops/hooks/useSession'
import { decideOvertimeRecord, decideOvertimeRecords, exportOvertimeSummaryCsv } from '@ops/lib/services/overtimeService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { OvertimeRecord, OvertimeType } from '@ops/types/domain'

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'regular', label: 'Regular Overtime (125%)' },
  { value: 'rest_day_holiday', label: 'Rest Day / Holiday OT (130%-200%)' },
  { value: 'night_diff', label: 'Night Differential (110%)' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const PERIOD_OPTIONS = [
  { value: 'current', label: 'Current Period (last 15 days)' },
  { value: 'previous', label: 'Previous Period' },
  { value: 'all', label: 'All Time' },
]

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'hours', label: 'Hours Logged' },
  { value: 'name', label: 'Employee Name' },
]

const TYPE_LABEL: Record<OvertimeType, string> = {
  regular: 'Regular OT',
  rest_day_holiday: 'Rest Day OT',
  night_diff: 'Night Diff',
}

const TYPE_TONE: Record<OvertimeType, 'brand' | 'warning' | 'neutral'> = {
  regular: 'brand',
  rest_day_holiday: 'warning',
  night_diff: 'neutral',
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function MetricCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: LucideIcon }) {
  return (
    // Same corner placement as the dashboard KPI cards (MetricCard).
    <Card watermark={icon} watermarkClassName="-right-3 -top-3 size-20" className="overflow-hidden p-4 sm:p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">{label}</p>
      <p className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Card>
  )
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function OvertimePage() {
  const { user } = useSession()
  const { notify } = useToast()
  const { employees } = useEmployees()
  const { records, isLoading, refetch } = useOvertimeRecords()
  const [refreshKey, setRefreshKey] = useState(0)
  const { summary, isLoading: summaryLoading } = useOvertimeSummary(refreshKey)
  const canApprove = usePermission('overtime.approve')
  const canFile = usePermission('overtime.log')

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [period, setPeriod] = useState('current')
  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedRecord, setSelectedRecord] = useState<OvertimeRecord | null>(null)

  const employeeById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])

  function refetchAll() {
    refetch()
    setRefreshKey((k) => k + 1)
  }

  const filtered = records
    .filter((record) => {
      if (type !== 'all' && record.type !== type) return false
      if (status !== 'all' && record.status !== status) return false

      if (period === 'current' && new Date(record.date) < daysAgo(15)) return false
      if (period === 'previous') {
        const date = new Date(record.date)
        if (date < daysAgo(30) || date > daysAgo(16)) return false
      }

      const query = search.trim().toLowerCase()
      if (query) {
        const employee = employeeById.get(record.employeeId)
        const haystack = employee
          ? `${employee.personal.firstName} ${employee.personal.lastName} ${employee.employeeNumber} ${employee.employment.department}`.toLowerCase()
          : ''
        if (!haystack.includes(query)) return false
      }

      return true
    })
    .sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (a.status !== 'pending' && b.status === 'pending') return 1
      let result = 0
      if (sortBy === 'hours') result = a.hours - b.hours
      else if (sortBy === 'name') {
        const employeeA = employeeById.get(a.employeeId)
        const employeeB = employeeById.get(b.employeeId)
        result = `${employeeA?.personal.firstName} ${employeeA?.personal.lastName}`.localeCompare(
          `${employeeB?.personal.firstName} ${employeeB?.personal.lastName}`,
        )
      } else {
        result = a.date.localeCompare(b.date)
      }
      return sortDirection === 'asc' ? result : -result
    })

  async function handleDecide(record: OvertimeRecord, decision: 'approved' | 'rejected') {
    await decideOvertimeRecord(user, record.id, decision)
    notify({ title: `Request ${decision}`, tone: 'success' })
    setSelectedRecord(null)
    refetchAll()
  }

  const pendingIds = useMemo(() => (canApprove ? filtered.filter((r) => r.status === 'pending').map((r) => r.id) : []), [filtered, canApprove])
  const selection = useRowSelection(pendingIds)

  async function handleBulkDecide(decision: 'approved' | 'rejected') {
    const n = await decideOvertimeRecords(user, [...selection.selected], decision)
    notify({ title: `${n} request${n === 1 ? '' : 's'} ${decision}`, tone: 'success' })
    selection.clear()
    refetchAll()
  }

  async function handleExport() {
    const csv = await exportOvertimeSummaryCsv(user)
    downloadCsv('overtime-summary.csv', csv)
    notify({ title: 'Overtime summary exported', tone: 'success' })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Overtime & Night Differential"
        description="Manage, track, and approve employee overtime and night shift differential requests."
        actions={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <Button variant="secondary" icon={<Download className="size-4" />} onClick={handleExport} className="whitespace-nowrap">
              <span className="sm:hidden">Export</span>
              <span className="hidden sm:inline">Export Summary</span>
            </Button>
            {canFile && <NewOvertimeRequestDialog employees={employees} onCreated={refetchAll} />}
          </div>
        }
      />

      {summaryLoading || !summary ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <MetricCard
            label="Pending Approvals"
            icon={Hourglass}
            value={`${summary.pendingCount} Requests`}
            hint={`${summary.pendingOvertimeCount} Overtime | ${summary.pendingNightDiffCount} Night Diff`}
          />
          <MetricCard
            label="Total OT Hours (Current Period)"
            icon={Timer}
            value={`${summary.totalOvertimeHours} hrs`}
            hint={
              summary.overtimeHoursChangePct === null
                ? 'No prior period data'
                : `${summary.overtimeHoursChangePct > 0 ? '+' : ''}${summary.overtimeHoursChangePct}% from last pay period`
            }
          />
          <MetricCard
            label="Night Diff Hours"
            icon={MoonStar}
            value={`${summary.nightDiffHours} hrs`}
            hint={`${summary.activeNightShiftWorkers} active night shift workers`}
          />
          <MetricCard
            label="Estimated OT Cost"
            icon={Banknote}
            value={formatCurrency(summary.estimatedCost)}
            hint="Ready for payroll integration"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee, ID, department…"
            className="pl-9"
          />
        </div>
        <FiltersPopover activeCount={[type !== 'all', status !== 'all', period !== 'current'].filter(Boolean).length}>
          <FilterField label="Type">
            <Select value={type} onValueChange={setType} options={TYPE_OPTIONS} />
          </FilterField>
          <FilterField label="Status">
            <Select value={status} onValueChange={setStatus} options={STATUS_OPTIONS} />
          </FilterField>
          <FilterField label="Period">
            <Select value={period} onValueChange={setPeriod} options={PERIOD_OPTIONS} />
          </FilterField>
          <SortControl
            value={sortBy}
            onValueChange={setSortBy}
            options={SORT_OPTIONS}
            direction={sortDirection}
            onDirectionChange={setSortDirection}
          />
        </FiltersPopover>
        <div className="ml-auto flex items-center gap-4 self-center">
          {canApprove && pendingIds.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground lg:hidden">
              <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} label="Select all pending requests" />
              Select all pending ({pendingIds.length})
            </label>
          )}
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {records.length} records
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No overtime records match these filters" description="Try clearing a filter or log a new request." />
      ) : (
        <>
        {/* Phones and tablets: one card per request, two columns on tablet. */}
        <div className="grid items-start gap-2.5 sm:grid-cols-2 lg:hidden">
          {filtered.map((record) => {
            const employee = employeeById.get(record.employeeId)
            const name = employee ? `${employee.personal.firstName} ${employee.personal.lastName}` : 'Unknown'
            const pending = canApprove && record.status === 'pending'
            return (
              <Card key={record.id} watermark={null} className="cursor-pointer space-y-3 p-4" onClick={() => setSelectedRecord(record)}>
                <div className="flex items-start gap-3">
                  {pending && (
                    <span className="pt-2.5" onClick={(e) => e.stopPropagation()}>
                      <RowCheckbox checked={selection.selected.has(record.id)} onChange={(c) => selection.toggle(record.id, c)} label={name} />
                    </span>
                  )}
                  <Avatar name={name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {employee?.employeeNumber} · {employee?.employment.department}
                    </p>
                  </div>
                  <StatusBadge status={record.status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                  <Badge tone={TYPE_TONE[record.type]}>{TYPE_LABEL[record.type]}</Badge>
                  <span className="font-semibold">{record.hours} hrs</span>
                  <span className="text-muted-foreground">{Math.round(record.multiplier * 100)}% rate</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(record.date)} · {record.startTime} – {record.endTime}
                </p>
                {pending && (
                  <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="secondary" onClick={() => handleDecide(record, 'rejected')}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => handleDecide(record, 'approved')}>
                      Approve
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
        <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              {canApprove && (
                <TableHead className="w-10">
                  <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} label="Select all pending requests" disabled={pendingIds.length === 0} />
                </TableHead>
              )}
              <TableHead>Employee</TableHead>
              <TableHead>Department / Position</TableHead>
              <TableHead>Date & Schedule</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Hours Logged</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((record) => {
              const employee = employeeById.get(record.employeeId)
              return (
                <TableRow key={record.id} className="cursor-pointer" onClick={() => setSelectedRecord(record)}>
                  {canApprove && (
                    <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                      {record.status === 'pending' && (
                        <RowCheckbox checked={selection.selected.has(record.id)} onChange={(c) => selection.toggle(record.id, c)} label={employee ? `${employee.personal.firstName} ${employee.personal.lastName}` : 'request'} />
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={employee ? `${employee.personal.firstName} ${employee.personal.lastName}` : '?'} size="sm" />
                      <div>
                        <p className="text-sm font-medium leading-tight">
                          {employee ? `${employee.personal.firstName} ${employee.personal.lastName}` : 'Unknown'}
                        </p>
                        <p className="text-xs leading-tight text-muted-foreground">{employee?.employeeNumber}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {employee?.employment.department} / {employee?.employment.position}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    <p>{formatDate(record.date)}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.startTime} – {record.endTime}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge tone={TYPE_TONE[record.type]}>{TYPE_LABEL[record.type]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{record.hours} hrs</TableCell>
                  <TableCell className="text-sm">{Math.round(record.multiplier * 100)}%</TableCell>
                  <TableCell>
                    <StatusBadge status={record.status} />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {canApprove && record.status === 'pending' ? (
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => handleDecide(record, 'rejected')}>
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleDecide(record, 'approved')}>
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setSelectedRecord(record)}>
                        View Details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </div>
        </>
      )}

      <BulkActionBar count={selection.selected.size} noun={selection.selected.size === 1 ? 'request selected' : 'requests selected'} onClear={selection.clear}>
        <Button size="sm" variant="secondary" onClick={() => handleBulkDecide('rejected')}>
          Reject Selected
        </Button>
        <Button size="sm" onClick={() => handleBulkDecide('approved')}>
          Approve Selected
        </Button>
      </BulkActionBar>

      <OvertimeDetailsDialog
        record={selectedRecord}
        employee={selectedRecord ? employeeById.get(selectedRecord.employeeId) : undefined}
        canApprove={canApprove}
        onClose={() => setSelectedRecord(null)}
        onDecide={(decision) => selectedRecord && handleDecide(selectedRecord, decision)}
      />
    </div>
  )
}
