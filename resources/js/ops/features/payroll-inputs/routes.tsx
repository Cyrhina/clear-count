import { Boxes, Clock, Link2, ListChecks } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge } from '@ops/components/ui/Badge'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FilterField } from '@ops/components/ui/FiltersPopover'
import { PlainCards } from '@ops/components/ui/PlainCards'
import { SearchFilterBar } from '@ops/components/ui/SearchFilterBar'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { usePayrollPeriods } from '@ops/features/payroll/hooks/usePayroll'
import { useSession } from '@ops/hooks/useSession'
import { getPayrollInputs } from '@ops/lib/services/payrollInputsService'
import type { PayrollInputs } from '@ops/lib/services/payrollInputsService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'

const ALL = 'all'
const hours = (n: number) => (n === 0 ? '—' : n.toLocaleString('en-PH', { maximumFractionDigits: 2 }))
const count = (n: number) => (n === 0 ? '—' : String(n))

type InputsTab = 'time' | 'output' | 'other'

function usePayrollInputs(periodId: string | undefined) {
  const { user } = useSession()
  const [inputs, setInputs] = useState<PayrollInputs | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    setInputs(undefined)
    if (!periodId) return
    getPayrollInputs(user, periodId).then((result) => {
      if (!cancelled) setInputs(result ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [user, periodId])

  return inputs
}

/**
 * Payroll Inputs — the approved time, output, leave and adjustment records a payroll run reads for a period.
 * Read-only: Payroll consumes what HR and managers approved; it never approves employee work itself.
 */
export function PayrollInputsPage() {
  const { periods, isLoading } = usePayrollPeriods()
  const [periodId, setPeriodId] = useState<string | undefined>()
  const [tab, setTab] = useState<InputsTab>('time')

  const ordered = useMemo(() => [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate)), [periods])
  const selectedId = periodId ?? (ordered.find((p) => p.status !== 'finalized') ?? ordered[0])?.id
  const inputs = usePayrollInputs(selectedId)
  const selected = ordered.find((p) => p.id === selectedId)

  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState(ALL)
  const [outputStatus, setOutputStatus] = useState(ALL)
  const [otherKind, setOtherKind] = useState(ALL)
  const clearFilters = () => {
    setSearch('')
    setDepartment(ALL)
    setOutputStatus(ALL)
    setOtherKind(ALL)
  }

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matches = (name: string, number?: string, extra = '') => !q || `${name} ${number ?? ''} ${extra}`.toLowerCase().includes(q)
    return {
      time: (inputs?.time ?? []).filter((r) => matches(r.name, r.employeeNumber, r.department) && (department === ALL || r.department === department)),
      output: (inputs?.output ?? []).filter((r) => matches(r.name, r.employeeNumber, r.description) && (outputStatus === ALL || r.status === outputStatus)),
      other: (inputs?.other ?? []).filter((r) => matches(r.name, r.employeeNumber, r.detail) && (otherKind === ALL || r.kind === otherKind)),
    }
  }, [inputs, search, department, outputStatus, otherKind])
  const departments = useMemo(() => [...new Set((inputs?.time ?? []).map((r) => r.department))].sort(), [inputs])
  const kinds = useMemo(() => [...new Set((inputs?.other ?? []).map((r) => r.kind))].sort(), [inputs])

  // The Filters panel only offers what applies to the tab you are on; the badge counts those filters.
  const activeCount = tab === 'time' ? Number(department !== ALL) : tab === 'output' ? Number(outputStatus !== ALL) : Number(otherKind !== ALL)
  const filtersActive = search.trim() !== '' || department !== ALL || outputStatus !== ALL || otherKind !== ALL

  if (isLoading) return <Skeleton className="h-96" />

  if (ordered.length === 0) {
    return (
      <PlainCards>
        <div className="space-y-5">
          <PageHeader title="Payroll Inputs" description="The approved records your payroll runs are built from." />
          <EmptyState icon={ListChecks} title="No payroll runs yet" description="Create a payroll run first — its inputs will appear here." />
        </div>
      </PlainCards>
    )
  }

  const pendingTotal = inputs ? inputs.pending.output + inputs.pending.overtime + inputs.pending.leave + inputs.pending.adjustments : 0

  return (
    <PlainCards>
      <div className="space-y-5">
        <PageHeader
          title="Payroll Inputs"
          description="The approved time, output, leave and adjustment records a payroll run reads. Read-only — approvals happen with HR and managers."
          actions={
            <Select
              value={selectedId}
              onValueChange={setPeriodId}
              aria-label="Payroll period"
              options={ordered.map((p) => ({ value: p.id, label: `${p.payrollNumber} · ${p.label}` }))}
              className="min-w-64"
            />
          }
        />

        {selected && (
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="text-sm">
              <p className="font-medium">
                {selected.payrollNumber} · {selected.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(selected.startDate)} – {formatDate(selected.endDate)} · pay date {formatDate(selected.payDate)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={selected.status === 'finalized' ? 'success' : 'brand'} className="capitalize">
                {selected.status}
              </Badge>
              {pendingTotal > 0 && <Badge tone="warning">{pendingTotal} not yet approved — not paid in this run</Badge>}
              <Link to={`/payroll/${selected.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <Link2 className="size-3.5" /> Open payroll run
              </Link>
            </div>
          </Card>
        )}

        {inputs === undefined ? (
          <Skeleton className="h-72" />
        ) : inputs === null ? (
          <EmptyState title="Period not found" />
        ) : (
          <div className="space-y-4">
            <SearchFilterBar
              search={search}
              onSearchChange={setSearch}
              placeholder="Search name, ID, department, details…"
              activeCount={activeCount}
              onClear={clearFilters}
              filters={
                tab === 'time' ? (
                  <FilterField label="Department">
                    <Select value={department} onValueChange={setDepartment} options={[{ value: ALL, label: 'All departments' }, ...departments.map((d) => ({ value: d, label: d }))]} />
                  </FilterField>
                ) : tab === 'output' ? (
                  <FilterField label="Status">
                    <Select
                      value={outputStatus}
                      onValueChange={setOutputStatus}
                      options={[
                        { value: ALL, label: 'All statuses' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'rejected', label: 'Rejected' },
                      ]}
                    />
                  </FilterField>
                ) : (
                  <FilterField label="Input type">
                    <Select value={otherKind} onValueChange={setOtherKind} options={[{ value: ALL, label: 'All types' }, ...kinds.map((k) => ({ value: k, label: k }))]} />
                  </FilterField>
                )
              }
              trailing={
                tab === 'time'
                  ? `${shown.time.length} of ${inputs.time.length} employees`
                  : tab === 'output'
                    ? `${shown.output.length} of ${inputs.output.length} records`
                    : `${shown.other.length} of ${inputs.other.length} inputs`
              }
            />

            <Tabs value={tab} onValueChange={(value) => setTab(value as InputsTab)}>
              <TabsList>
                <TabsTrigger value="time">Time Records ({shown.time.length})</TabsTrigger>
                <TabsTrigger value="output">Output Records ({shown.output.length})</TabsTrigger>
                <TabsTrigger value="other">Other Inputs ({shown.other.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="time" className="pt-4">
                {shown.time.length === 0 ? (
                  <EmptyState icon={Clock} title={filtersActive ? 'No time records match these filters' : 'No time records in this period'} />
                ) : (
                  <Card className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead className="text-right">Days present</TableHead>
                          <TableHead className="text-right">Regular hrs</TableHead>
                          <TableHead className="text-right">Late</TableHead>
                          <TableHead className="text-right">Undertime</TableHead>
                          <TableHead className="text-right">Absent</TableHead>
                          <TableHead className="text-right">OT hrs</TableHead>
                          <TableHead className="text-right">ND hrs</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shown.time.map((row) => (
                          <TableRow key={row.employeeId}>
                            <TableCell>
                              <p className="text-sm font-medium">{row.name}</p>
                              <p className="text-[11px] text-muted-foreground">{row.employeeNumber}</p>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{row.department}</TableCell>
                            <TableCell className="text-right tabular-nums">{count(row.daysPresent)}</TableCell>
                            <TableCell className="text-right tabular-nums">{hours(row.regularHours)}</TableCell>
                            <TableCell className="text-right tabular-nums">{count(row.late)}</TableCell>
                            <TableCell className="text-right tabular-nums">{count(row.undertime)}</TableCell>
                            <TableCell className="text-right tabular-nums">{count(row.absent)}</TableCell>
                            <TableCell className="text-right tabular-nums">{hours(row.overtimeHours)}</TableCell>
                            <TableCell className="text-right tabular-nums">{hours(row.nightDiffHours)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="output" className="pt-4">
                {shown.output.length === 0 ? (
                  <EmptyState
                    icon={Boxes}
                    title={filtersActive ? 'No output records match these filters' : 'No output records in this period'}
                    description={filtersActive ? undefined : 'Piece-rate and output-based entries dated in this period show up here once submitted.'}
                  />
                ) : (
                  <Card className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Output</TableHead>
                          <TableHead className="text-right">Piece rate</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shown.output.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>
                              <p className="text-sm font-medium">{row.name}</p>
                              <p className="text-[11px] text-muted-foreground">{row.employeeNumber}</p>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{formatDate(row.workDate)}</TableCell>
                            <TableCell className="text-sm">{row.description || row.unitLabel}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatCurrency(row.rate)}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {row.quantity} {row.unitLabel}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{formatCurrency(row.amount)}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Badge tone={row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'} className="capitalize">
                                  {row.status}
                                </Badge>
                                {row.payrollNumber && <span className="text-[11px] text-muted-foreground">Paid in {row.payrollNumber}</span>}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="other" className="pt-4">
                {shown.other.length === 0 ? (
                  <EmptyState icon={ListChecks} title={filtersActive ? 'No other inputs match these filters' : 'No other inputs for this period'} />
                ) : (
                  <Card className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Employee / item</TableHead>
                          <TableHead>Detail</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shown.other.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>
                              <Badge tone="brand">{row.kind}</Badge>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-medium">{row.name}</p>
                              {row.employeeNumber && <p className="text-[11px] text-muted-foreground">{row.employeeNumber}</p>}
                            </TableCell>
                            <TableCell className="text-sm capitalize text-muted-foreground">{row.detail}</TableCell>
                            <TableCell className="text-right tabular-nums">{row.amount === undefined ? '—' : formatCurrency(row.amount)}</TableCell>
                            <TableCell className="text-sm capitalize text-muted-foreground">{row.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </PlainCards>
  )
}
