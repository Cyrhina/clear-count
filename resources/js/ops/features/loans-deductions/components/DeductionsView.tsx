import { CalendarClock, Pencil } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FilterField } from '@ops/components/ui/FiltersPopover'
import { SearchFilterBar } from '@ops/components/ui/SearchFilterBar'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useToast } from '@ops/components/ui/Toast'
import { DeductionDialog } from '@ops/features/loans-deductions/components/DeductionDialog'
import { RecordCard } from '@ops/features/loans-deductions/components/RecordCard'
import { RecordDetailsDialog } from '@ops/features/loans-deductions/components/RecordDetailsDialog'
import { useEmployeeDeductions } from '@ops/features/loans-deductions/hooks/useBenefitsDeductions'
import { fullName } from '@ops/features/loans-deductions/loanUtils'
import { StatTile } from '@ops/features/reports/components/shared'
import { updateEmployeeDeduction } from '@ops/lib/services/benefitsApiService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { Employee, EmployeeDeduction } from '@ops/types/domain'

export type DeductionsViewKind = 'one_time'

const COPY: Record<DeductionsViewKind, { title: string; description: string }> = {
  one_time: {
    title: 'One-time Deductions',
    description: 'Single amounts (uniforms, replacement fees, damages…) taken in full in the pay run that covers the due date.',
  },
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Taken in payroll' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_ORDER = { active: 0, paused: 1, completed: 2, cancelled: 3 } as const

const today = () => new Date().toISOString().slice(0, 10)

function scheduleText(d: EmployeeDeduction): string {
  if (d.kind === 'one_time') return d.dueDate ? `Due ${formatDate(d.dueDate)}` : '—'
  return `From ${formatDate(d.startDate)}${d.endDate ? ` to ${formatDate(d.endDate)}` : ' · open-ended'}`
}

export function DeductionsView({ kind, employees, canManage }: { kind: DeductionsViewKind; employees: Employee[]; canManage: boolean }) {
  const { deductions, isLoading, refetch } = useEmployeeDeductions()
  const { notify } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [viewing, setViewing] = useState<EmployeeDeduction | null>(null)
  const copy = COPY[kind]
  const employeeById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])

  const scoped = useMemo(() => deductions.filter((d) => d.kind === kind && employeeById.has(d.employeeId)), [deductions, kind, employeeById])
  const filtered = scoped
    .filter((d) => {
      if (status !== 'all' && d.status !== status) return false
      const query = search.trim().toLowerCase()
      return !query || `${fullName(employeeById.get(d.employeeId))} ${employeeById.get(d.employeeId)?.employeeNumber ?? ''} ${d.name} ${d.reason ?? ''}`.toLowerCase().includes(query)
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || fullName(employeeById.get(a.employeeId)).localeCompare(fullName(employeeById.get(b.employeeId))))

  const pendingOneTime = scoped.filter((d) => d.kind === 'one_time' && d.status === 'active')

  async function change(d: EmployeeDeduction, updates: Partial<EmployeeDeduction>, message: string) {
    await updateEmployeeDeduction(d.id, updates)
    notify({ title: `${d.name} ${message}`, tone: 'success' })
    refetch()
  }

  function noteFor(d: EmployeeDeduction): string {
    if (d.status === 'paused') return 'Paused — left out of payroll until resumed.'
    if (d.status === 'cancelled') return 'Cancelled — no longer included in payroll.'
    if (d.status === 'completed') return 'Taken in payroll — nothing more to deduct.'
    return d.kind === 'one_time'
      ? `Taken in full in the pay run covering ${d.dueDate ? formatDate(d.dueDate) : 'its due date'}.`
      : 'Split across the month’s pay runs and taken in each payroll run.'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{copy.title}</p>
          <p className="max-w-3xl text-xs text-muted-foreground">{copy.description}</p>
        </div>
        {canManage && <DeductionDialog employees={employees} lockedKind={kind} onSaved={refetch} />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile label="Scheduled one-time" value={formatCurrency(pendingOneTime.reduce((s, d) => s + d.amount, 0))} />
        <StatTile label="Employees affected" value={String(new Set(pendingOneTime.map((d) => d.employeeId)).size)} />
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search employee or deduction…"
        activeCount={status !== 'all' ? 1 : 0}
        onClear={() => {
          setSearch('')
          setStatus('all')
        }}
        trailing={
          <>
            {filtered.length} of {scoped.length} records
          </>
        }
        filters={
          <FilterField label="Status">
            <Select value={status} onValueChange={setStatus} options={STATUS_OPTIONS} />
          </FilterField>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No deductions found" description={scoped.length === 0 ? 'Add a deduction to include it in the next payroll run.' : 'Try clearing the search or status filter.'} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => {
            const employee = employeeById.get(d.employeeId)
            return (
              <RecordCard
                key={d.id}
                title={fullName(employee)}
                subtitle={`${d.name} · ${d.kind === 'recurring' ? 'Recurring' : 'One-time'}`}
                status={d.status}
                headline={formatCurrency(d.amount)}
                headlineHint={d.kind === 'recurring' ? 'per month' : 'one-time'}
                lines={[scheduleText(d), d.reason]}
                note={<p className="text-muted-foreground">{noteFor(d)}</p>}
                noteIcon={<CalendarClock className="mt-0.5 size-3.5 shrink-0 text-primary" />}
                onView={() => setViewing(d)}
                edit={
                  <DeductionDialog
                    employees={employees}
                    deduction={d}
                    lockedKind={kind}
                    onSaved={refetch}
                    trigger={
                      <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} disabled={!canManage || d.status === 'completed' || d.status === 'cancelled'} title={d.status === 'completed' || d.status === 'cancelled' ? `This record is ${d.status}.` : undefined}>
                        Edit
                      </Button>
                    }
                  />
                }
                onPause={() => change(d, { status: 'paused' }, 'paused — left out of payroll until resumed')}
                onResume={() => change(d, { status: 'active' }, 'resumed')}
                onCancel={() => change(d, { status: 'cancelled', endDate: d.kind === 'recurring' ? (d.endDate ?? today()) : d.endDate }, 'cancelled')}
                cancelName={d.name}
                cancelConsequence={`${d.name} for ${fullName(employee)} will no longer be deducted in future payroll runs.`}
                canManage={canManage}
                dimmed={d.status === 'cancelled' || d.status === 'completed'}
              />
            )
          })}
        </div>
      )}

      <RecordDetailsDialog
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? ''}
        subtitle={viewing ? `${fullName(employeeById.get(viewing.employeeId))} · ${employeeById.get(viewing.employeeId)?.employeeNumber ?? ''} · ${employeeById.get(viewing.employeeId)?.employment.department ?? ''}` : undefined}
        status={viewing?.status ?? 'active'}
        notes={viewing?.reason}
        fields={
          viewing
            ? [
                { label: 'Type', value: viewing.kind === 'recurring' ? 'Recurring (monthly)' : 'One-time' },
                { label: viewing.kind === 'recurring' ? 'Amount / month' : 'Amount', value: formatCurrency(viewing.amount) },
                ...(viewing.kind === 'recurring'
                  ? [
                      { label: 'Start date', value: formatDate(viewing.startDate) },
                      { label: 'End date', value: viewing.endDate ? formatDate(viewing.endDate) : 'Open-ended' },
                    ]
                  : [{ label: 'Due date', value: viewing.dueDate ? formatDate(viewing.dueDate) : '—', wide: true }]),
              ]
            : []
        }
      />
    </div>
  )
}
