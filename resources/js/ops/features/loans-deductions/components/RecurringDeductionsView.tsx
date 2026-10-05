import { Archive, ArchiveRestore, ArrowRightLeft, CalendarClock, Eye, MinusCircle, Pencil, Search, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Avatar } from '@ops/components/ui/Avatar'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useToast } from '@ops/components/ui/Toast'
import { AddEmployeesToDeductionPlanDialog } from '@ops/features/loans-deductions/components/AddEmployeesToDeductionPlanDialog'
import { DeductionDialog } from '@ops/features/loans-deductions/components/DeductionDialog'
import { DeductionPlanDialog } from '@ops/features/loans-deductions/components/DeductionPlanDialog'
import { RecordCard } from '@ops/features/loans-deductions/components/RecordCard'
import { RecordDetailsDialog } from '@ops/features/loans-deductions/components/RecordDetailsDialog'
import { TransferDeductionPlanDialog } from '@ops/features/loans-deductions/components/TransferDeductionPlanDialog'
import { useDeductionPlans, useEmployeeDeductions } from '@ops/features/loans-deductions/hooks/useBenefitsDeductions'
import { fullName } from '@ops/features/loans-deductions/loanUtils'
import { StatTile } from '@ops/features/reports/components/shared'
import { useSession } from '@ops/hooks/useSession'
import { setDeductionPlanStatus, updateEmployeeDeduction } from '@ops/lib/services/benefitsService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { DeductionPlan, Employee, EmployeeDeduction } from '@ops/types/domain'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
]

const today = () => new Date().toISOString().slice(0, 10)
const isLive = (d: EmployeeDeduction) => d.status === 'active' || d.status === 'paused'

/**
 * Recurring deductions by plan (Cooperative Savings, Union Dues…): a card per plan listing the employees in it, with View Details,
 * Transfer and Add Employees. Each employee's own actions (view, edit, pause/resume, cancel) are in the plan's details.
 */
export function RecurringDeductionsView({ employees, canManage }: { employees: Employee[]; canManage: boolean }) {
  const { deductions, isLoading, refetch } = useEmployeeDeductions()
  const { plans, refetch: refetchPlans } = useDeductionPlans()
  const { user } = useSession()
  const { notify } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [transfer, setTransfer] = useState<{ planId: string; employeeIds: string[] } | null>(null)
  const [viewingRecord, setViewingRecord] = useState<EmployeeDeduction | null>(null)

  const employeeById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])
  const refreshAll = () => {
    refetch()
    refetchPlans()
  }

  const recurring = useMemo(() => deductions.filter((d) => d.kind === 'recurring' && employeeById.has(d.employeeId)), [deductions, employeeById])
  const matches = (d: EmployeeDeduction) => {
    if (status !== 'all' && d.status !== status) return false
    const q = search.trim().toLowerCase()
    return !q || `${fullName(employeeById.get(d.employeeId))} ${employeeById.get(d.employeeId)?.employeeNumber ?? ''} ${d.name}`.toLowerCase().includes(q)
  }
  const filtersActive = search.trim() !== '' || status !== 'all'
  const rowsOf = (planId: string, source = recurring) => source.filter((d) => d.planId === planId)
  const planIds = new Set(plans.map((p) => p.id))
  const unlinked = recurring.filter((d) => matches(d) && (!d.planId || !planIds.has(d.planId)))
  const shown = plans.filter((p) => !filtersActive || rowsOf(p.id).some(matches))

  const active = recurring.filter((d) => d.status === 'active')
  const canTransfer = canManage && plans.filter((p) => p.status === 'active').length > 1
  const viewing = plans.find((p) => p.id === viewingId)
  const adding = plans.find((p) => p.id === addingId)
  const transferFrom = plans.find((p) => p.id === transfer?.planId)
  const membersOf = (planId: string) => rowsOf(planId).filter(isLive).flatMap((d) => (employeeById.get(d.employeeId) ? [employeeById.get(d.employeeId)!] : []))

  async function change(d: EmployeeDeduction, updates: Partial<EmployeeDeduction>, message: string) {
    await updateEmployeeDeduction(user, d.id, updates)
    notify({ title: `${d.name} ${message}`, tone: 'success' })
    refetch()
  }

  /** One employee's recurring deduction: View / Edit / (Transfer) / Pause·Resume / Cancel. */
  function renderDeductionCard(d: EmployeeDeduction) {
    const employee = employeeById.get(d.employeeId)
    const plan = plans.find((p) => p.id === d.planId)
    return (
      <RecordCard
        key={d.id}
        title={fullName(employee)}
        subtitle={`${d.name} · Recurring`}
        status={d.status}
        headline={formatCurrency(d.amount)}
        headlineHint="per month"
        lines={[`From ${formatDate(d.startDate)}${d.endDate ? ` to ${formatDate(d.endDate)}` : ' · open-ended'}`, d.reason]}
        note={
          <p className="text-muted-foreground">
            {d.status === 'paused' ? 'Paused — left out of payroll until resumed.' : d.status === 'cancelled' ? 'Cancelled — no longer included in payroll.' : 'Split across the month’s pay runs and taken in each payroll run.'}
          </p>
        }
        noteIcon={<CalendarClock className="mt-0.5 size-3.5 shrink-0 text-primary" />}
        onView={() => setViewingRecord(d)}
        edit={
          <>
            <DeductionDialog
              employees={employees}
              deduction={d}
              lockedKind="recurring"
              amountLocked={plan?.amountType !== 'custom' && !!plan}
              onSaved={refetch}
              trigger={
                <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} disabled={!canManage || d.status === 'completed' || d.status === 'cancelled'} title={d.status === 'cancelled' ? `This record is ${d.status}.` : undefined}>
                  Edit
                </Button>
              }
            />
            {canTransfer && d.planId && isLive(d) && (
              <Button size="sm" variant="ghost" icon={<ArrowRightLeft className="size-3.5" />} onClick={() => setTransfer({ planId: d.planId!, employeeIds: [d.employeeId] })}>
                Transfer
              </Button>
            )}
          </>
        }
        onPause={() => change(d, { status: 'paused' }, 'paused — left out of payroll until resumed')}
        onResume={() => change(d, { status: 'active' }, 'resumed')}
        onCancel={() => change(d, { status: 'cancelled', endDate: d.endDate ?? today() }, 'cancelled')}
        cancelName={d.name}
        cancelConsequence={`${d.name} for ${fullName(employee)} will no longer be deducted in future payroll runs.`}
        canManage={canManage}
        dimmed={d.status === 'cancelled'}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Recurring Deductions</p>
          <p className="max-w-3xl text-xs text-muted-foreground">Monthly amounts (cooperative savings, union dues, meal plans…), organised by deduction. Add employees to a deduction from its card; the amount is split across the month’s pay runs until it ends or is cancelled.</p>
        </div>
        {canManage && <DeductionPlanDialog onSaved={refreshAll} />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile label="Recurring / month" value={formatCurrency(active.reduce((s, d) => s + d.amount, 0))} />
        <StatTile label="Employees affected" value={String(new Set(active.map((d) => d.employeeId)).size)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee or deduction…" className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus} options={STATUS_OPTIONS} className="w-44" />
        <p className="ml-auto text-sm text-muted-foreground">
          {recurring.filter(matches).length} of {recurring.length} records
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : shown.length === 0 && unlinked.length === 0 ? (
        <EmptyState title="No recurring deductions found" description={plans.length === 0 ? (canManage ? 'Add a deduction, then add employees to it from its card.' : 'No recurring deductions have been set up.') : 'Try clearing the search or status filter.'} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map((plan) => {
            const all = rowsOf(plan.id)
            const live = all.filter(isLive)
            const list = all.filter(matches).sort((a, b) => Number(!isLive(a)) - Number(!isLive(b)) || fullName(employeeById.get(a.employeeId)).localeCompare(fullName(employeeById.get(b.employeeId))))
            return (
              <Card key={plan.id} className="flex flex-col">
                <Card.Header className="items-start">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <MinusCircle className="size-4 shrink-0 text-muted-foreground" />
                      <Card.Title className="truncate">{plan.name}</Card.Title>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{plan.reason || (plan.amountType === 'custom' ? 'Amount customizable per employee' : 'Fixed amount for everyone')}</p>
                  </div>
                  {plan.status === 'archived' && <Badge tone="neutral">Archived</Badge>}
                </Card.Header>
                <Card.Body className="flex flex-1 flex-col gap-3 pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">
                      {plan.amountType === 'custom' ? (
                        <>
                          <span className="font-semibold text-foreground">Set per employee</span> · default {formatCurrency(plan.amount)}
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-foreground">{formatCurrency(plan.amount)}</span> per month · fixed
                        </>
                      )}
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{live.length}</span> enrolled · {live.filter((d) => d.status === 'active').length} active
                    </span>
                  </div>

                  <div className="flex-1 overflow-hidden rounded-xl border border-border">
                    {list.length === 0 ? (
                      <p className="px-3 py-6 text-center text-xs text-muted-foreground">{all.length === 0 ? 'No employees enrolled yet.' : 'No enrolled employees match the filters.'}</p>
                    ) : (
                      <ul className="max-h-60 divide-y divide-border overflow-y-auto">
                        {list.map((d) => {
                          const employee = employeeById.get(d.employeeId)
                          return (
                            <li key={d.id} className="flex items-center gap-2.5 px-3 py-2">
                              <Avatar name={fullName(employee)} size="sm" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{fullName(employee)}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {employee?.employment.department} · {formatCurrency(d.amount)}/month
                                </p>
                              </div>
                              <StatusBadge status={d.status} />
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="ghost" icon={<Eye className="size-3.5" />} onClick={() => setViewingId(plan.id)}>
                      View Details
                    </Button>
                    {canTransfer && live.length > 0 && (
                      <Button size="sm" variant="ghost" icon={<ArrowRightLeft className="size-3.5" />} onClick={() => setTransfer({ planId: plan.id, employeeIds: [] })}>
                        Transfer
                      </Button>
                    )}
                    {canManage && plan.status === 'active' && (
                      <Button size="sm" variant="secondary" icon={<UserPlus className="size-3.5" />} onClick={() => setAddingId(plan.id)}>
                        Add Employees
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            )
          })}
        </div>
      )}

      {unlinked.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Not linked to a plan ({unlinked.length})</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{unlinked.map((d) => renderDeductionCard(d))}</div>
        </div>
      )}

      {viewing && (
        <PlanDetailsDialog
          plan={viewing}
          rows={rowsOf(viewing.id)}
          employeeById={employeeById}
          canManage={canManage}
          canTransfer={canTransfer}
          renderCard={renderDeductionCard}
          onTransfer={() => setTransfer({ planId: viewing.id, employeeIds: [] })}
          onAdd={() => setAddingId(viewing.id)}
          onClose={() => setViewingId(null)}
          onChanged={refreshAll}
        />
      )}

      {adding && <AddEmployeesToDeductionPlanDialog plan={adding} employees={employees} deductions={deductions} onClose={() => setAddingId(null)} onAdded={refreshAll} />}
      {transferFrom && <TransferDeductionPlanDialog from={transferFrom} plans={plans} members={membersOf(transferFrom.id)} preselected={transfer?.employeeIds ?? []} onClose={() => setTransfer(null)} onTransferred={refreshAll} />}

      <RecordDetailsDialog
        open={viewingRecord !== null}
        onClose={() => setViewingRecord(null)}
        title={viewingRecord?.name ?? ''}
        subtitle={viewingRecord ? `${fullName(employeeById.get(viewingRecord.employeeId))} · ${employeeById.get(viewingRecord.employeeId)?.employeeNumber ?? ''} · ${employeeById.get(viewingRecord.employeeId)?.employment.department ?? ''}` : undefined}
        status={viewingRecord?.status ?? 'active'}
        notes={viewingRecord?.reason}
        fields={
          viewingRecord
            ? [
                { label: 'Type', value: 'Recurring (monthly)' },
                { label: 'Amount / month', value: formatCurrency(viewingRecord.amount) },
                { label: 'Start date', value: formatDate(viewingRecord.startDate) },
                { label: 'End date', value: viewingRecord.endDate ? formatDate(viewingRecord.endDate) : 'Open-ended' },
              ]
            : []
        }
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-lg font-semibold">{value}</p>
    </div>
  )
}

/** A plan's full picture: its terms and every enrolled employee as a card with View / Edit / Transfer / Pause / Cancel. */
function PlanDetailsDialog({
  plan,
  rows,
  employeeById,
  canManage,
  canTransfer,
  renderCard,
  onTransfer,
  onAdd,
  onClose,
  onChanged,
}: {
  plan: DeductionPlan
  rows: EmployeeDeduction[]
  employeeById: Map<string, Employee>
  canManage: boolean
  canTransfer: boolean
  renderCard: (d: EmployeeDeduction) => ReactNode
  onTransfer: () => void
  onAdd: () => void
  onClose: () => void
  onChanged: () => void
}) {
  const { user } = useSession()
  const { notify } = useToast()
  const [query, setQuery] = useState('')
  const live = rows.filter(isLive)
  const q = query.trim().toLowerCase()
  const list = rows
    .filter((d) => !q || `${fullName(employeeById.get(d.employeeId))} ${employeeById.get(d.employeeId)?.employeeNumber ?? ''}`.toLowerCase().includes(q))
    .sort((a, b) => Number(!isLive(a)) - Number(!isLive(b)) || fullName(employeeById.get(a.employeeId)).localeCompare(fullName(employeeById.get(b.employeeId))))

  async function toggleArchive() {
    const result = await setDeductionPlanStatus(user, plan.id, plan.status === 'active' ? 'archived' : 'active')
    notify(result.ok ? { title: plan.status === 'active' ? 'Deduction archived' : 'Deduction restored', tone: 'success' } : { title: "Couldn't change the deduction", description: result.error, tone: 'danger' })
    onChanged()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogTitle className="flex flex-wrap items-center gap-2 pr-8">
          <MinusCircle className="size-5 text-muted-foreground" />
          {plan.name}
          {plan.status === 'archived' && <Badge tone="neutral">Archived</Badge>}
        </DialogTitle>
        <DialogDescription>{plan.reason || 'Recurring deduction'}</DialogDescription>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Enrolled" value={live.length} />
          <Stat label="Deducted / month" value={formatCurrency(live.filter((d) => d.status === 'active').reduce((s, d) => s + d.amount, 0))} />
          <Stat label={plan.amountType === 'custom' ? 'Default / month' : 'Per employee / month'} value={formatCurrency(plan.amount)} />
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">Enrolled employees ({rows.length})</p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employees…" className="pl-9" />
              </div>
              {canManage && (
                <>
                  <DeductionPlanDialog
                    plan={plan}
                    enrolledCount={live.length}
                    onSaved={onChanged}
                    trigger={
                      <Button type="button" size="sm" variant="ghost" icon={<Pencil className="size-3.5" />}>
                        Edit Deduction
                      </Button>
                    }
                  />
                  <Button type="button" size="sm" variant="ghost" icon={plan.status === 'active' ? <Archive className="size-3.5" /> : <ArchiveRestore className="size-3.5" />} onClick={toggleArchive}>
                    {plan.status === 'active' ? 'Archive' : 'Restore'}
                  </Button>
                  {canTransfer && live.length > 0 && (
                    <Button type="button" size="sm" variant="ghost" icon={<ArrowRightLeft className="size-3.5" />} onClick={onTransfer}>
                      Transfer
                    </Button>
                  )}
                  {plan.status === 'active' && (
                    <Button type="button" size="sm" icon={<UserPlus className="size-3.5" />} onClick={onAdd}>
                      Add Employees
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">{rows.length === 0 ? 'No employees are enrolled yet.' : 'No employees match.'}</p>
          ) : (
            <div className="grid max-h-[55vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">{list.map((d) => renderCard(d))}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
