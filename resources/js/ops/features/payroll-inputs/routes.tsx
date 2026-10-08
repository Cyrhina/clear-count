import { Boxes, Clock, Link2, ListChecks } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FilterField } from '@ops/components/ui/FiltersPopover'
import { PlainCards } from '@ops/components/ui/PlainCards'
import { SearchFilterBar } from '@ops/components/ui/SearchFilterBar'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { usePayrollPeriods } from '@ops/features/payroll/hooks/usePayroll'
import { useSession } from '@ops/hooks/useSession'
import { MONTH_NAMES } from '@ops/lib/payroll/complianceDeadlines'
import { getPayrollInputs } from '@ops/lib/services/payrollInputsService'
import type { PayrollInputs } from '@ops/lib/services/payrollInputsService'
import { formatDate } from '@ops/lib/utils/format'
import { OtherInputsView, OutputRecordsView, TimeRecordsView } from './components/InputRecordViews'

const ALL = 'all'

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

  const [year, setYear] = useState(ALL)
  const [month, setMonth] = useState(ALL)

  const ordered = useMemo(() => [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate)), [periods])
  const years = useMemo(() => [...new Set(ordered.flatMap((p) => [p.startDate.slice(0, 4), p.endDate.slice(0, 4)]))].sort().reverse(), [ordered])
  // A period matches a month/year when it starts or ends in it, so a period spanning two months shows under both.
  const visible = useMemo(
    () => ordered.filter((p) => [p.startDate, p.endDate].some((d) => (year === ALL || d.slice(0, 4) === year) && (month === ALL || d.slice(5, 7) === month))),
    [ordered, year, month],
  )
  const selectedId = (visible.find((p) => p.id === periodId) ?? visible.find((p) => p.status !== 'finalized') ?? visible[0])?.id
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
    setYear(ALL)
    setMonth(ALL)
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
  const activeCount =
    Number(year !== ALL) + Number(month !== ALL) + (tab === 'time' ? Number(department !== ALL) : tab === 'output' ? Number(outputStatus !== ALL) : Number(otherKind !== ALL))
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

  const periodFilters = (
    <>
      <FilterField label="Year">
        <Select value={year} onValueChange={setYear} options={[{ value: ALL, label: 'All years' }, ...years.map((y) => ({ value: y, label: y }))]} />
      </FilterField>
      <FilterField label="Month">
        <Select
          value={month}
          onValueChange={setMonth}
          options={[{ value: ALL, label: 'All months' }, ...MONTH_NAMES.map((name, i) => ({ value: String(i + 1).padStart(2, '0'), label: name }))]}
        />
      </FilterField>
    </>
  )

  // The period picker sits in the same row as search and Filters; `contents` lets the bar's items flow in this row.
  const toolbar = (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      {visible.length > 0 && (
        <Select
          value={selectedId}
          onValueChange={setPeriodId}
          aria-label="Payroll period"
          options={visible.map((p) => ({ value: p.id, label: `${p.payrollNumber} · ${p.label}` }))}
          className="w-full sm:w-72"
        />
      )}
      <SearchFilterBar
        className="contents"
        search={search}
      onSearchChange={setSearch}
      placeholder="Search name, ID, department, details…"
      activeCount={activeCount}
      onClear={clearFilters}
      filters={
        <>
          {periodFilters}
          {inputs &&
            (tab === 'time' ? (
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
            ))}
        </>
      }
      trailing={
        inputs &&
        (tab === 'time'
          ? `${shown.time.length} of ${inputs.time.length} employees`
          : tab === 'output'
            ? `${shown.output.length} of ${inputs.output.length} records`
            : `${shown.other.length} of ${inputs.other.length} inputs`)
      }
      />
    </div>
  )

  return (
    <PlainCards>
      <div className="space-y-5">
        <PageHeader
          title="Payroll Inputs"
          description="The approved time, output, leave and adjustment records a payroll run reads. Read-only — approvals happen with HR and managers."
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

        {!selected ? (
          <div className="space-y-4">
            {toolbar}
            <EmptyState
              icon={ListChecks}
              title="No payroll periods in this month"
              description="Try another month or year in Filters."
              action={
                <Button size="sm" variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              }
            />
          </div>
        ) : inputs === undefined ? (
          <Skeleton className="h-72" />
        ) : inputs === null ? (
          <EmptyState title="Period not found" />
        ) : (
          <div className="space-y-4">
            {toolbar}

            <Tabs value={tab} onValueChange={(value) => setTab(value as InputsTab)}>
              {/* Phones and tablets: a dropdown instead of a row of tabs. */}
              <Select
                className="lg:hidden"
                value={tab}
                onValueChange={(value) => setTab(value as InputsTab)}
                aria-label="Input type"
                options={[
                  { value: 'time', label: `Time Records (${shown.time.length})` },
                  { value: 'output', label: `Output Records (${shown.output.length})` },
                  { value: 'other', label: `Other Inputs (${shown.other.length})` },
                ]}
              />
              <TabsList className="hidden lg:flex">
                <TabsTrigger value="time">Time Records ({shown.time.length})</TabsTrigger>
                <TabsTrigger value="output">Output Records ({shown.output.length})</TabsTrigger>
                <TabsTrigger value="other">Other Inputs ({shown.other.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="time" className="pt-4">
                {shown.time.length === 0 ? (
                  <EmptyState icon={Clock} title={filtersActive ? 'No time records match these filters' : 'No time records in this period'} />
                ) : (
                  <TimeRecordsView rows={shown.time} />
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
                  <OutputRecordsView rows={shown.output} />
                )}
              </TabsContent>

              <TabsContent value="other" className="pt-4">
                {shown.other.length === 0 ? (
                  <EmptyState icon={ListChecks} title={filtersActive ? 'No other inputs match these filters' : 'No other inputs for this period'} />
                ) : (
                  <OtherInputsView rows={shown.other} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </PlainCards>
  )
}
