import { Archive, ArchiveRestore, ArrowRightLeft, Eye, Gift, HeartPulse, Pencil, Search, ShieldCheck, UserPlus, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Avatar } from '@ops/components/ui/Avatar'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Input } from '@ops/components/ui/Input'
import { useToast } from '@ops/components/ui/Toast'
import { AddEmployeesToPlanDialog } from '@ops/features/loans-deductions/components/AddEmployeesToPlanDialog'
import { BenefitPlanDialog } from '@ops/features/loans-deductions/components/BenefitPlanDialog'
import { TransferPlanDialog } from '@ops/features/loans-deductions/components/TransferPlanDialog'
import { BENEFIT_CATEGORY_META, fullName } from '@ops/features/loans-deductions/loanUtils'
import { useSession } from '@ops/hooks/useSession'
import { setBenefitPlanStatus } from '@ops/lib/services/benefitsService'
import { formatCurrency } from '@ops/lib/utils/format'
import type { BenefitCategory, BenefitPlan, Employee, EmployeeBenefit } from '@ops/types/domain'

const PLAN_ICON: Record<BenefitCategory, LucideIcon> = { hmo: HeartPulse, allowance: Wallet, insurance: ShieldCheck, other: Gift }
const PLAN_PLURAL: Record<BenefitCategory, string> = { hmo: 'HMO plans', allowance: 'allowances', insurance: 'insurance policies', other: 'benefits' }

/** One enrolment as the Benefits tab shows it (an employee's benefit record). */
export interface EnrollmentRow {
  key: string
  employee: Employee
  status: EmployeeBenefit['status']
  monthlyValue: number
  employeeShare: number
  coverage?: string
  benefit?: EmployeeBenefit
}

interface Props<R extends EnrollmentRow> {
  category: BenefitCategory
  plans: BenefitPlan[]
  /** Every enrolment, unfiltered — plan totals come from these. */
  rows: R[]
  /** The enrolments matching the search / status filter — what the cards list. */
  filteredRows: R[]
  filtersActive: boolean
  employees: Employee[]
  benefits: EmployeeBenefit[]
  canManage: boolean
  /** The per-employee card with its View / Edit / Pause / Cancel actions, exactly as on the Benefits tab. */
  /** `extraActions` are appended to the card's action row (the plan view adds Transfer). */
  renderRecordCard: (row: R, extraActions?: ReactNode) => ReactNode
  onChanged: () => void
}

const liveRows = <R extends EnrollmentRow>(rows: R[]) => rows.filter((r) => r.status !== 'cancelled')

/**
 * Benefits by plan (HMO plans, allowances, insurance policies, other benefits): a card per plan listing the employees
 * enrolled in it, with View Details, Transfer and Add Employees.
 * Per-employee actions (view, edit, pause/resume, cancel) live in the plan's details.
 */
export function BenefitPlansView<R extends EnrollmentRow>({ category, plans, rows, filteredRows, filtersActive, employees, benefits, canManage, renderRecordCard, onChanged }: Props<R>) {
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [transfer, setTransfer] = useState<{ planId: string; employeeIds: string[] } | null>(null)

  const rowsOf = (planId: string, source: R[]) => source.filter((r) => r.benefit?.planId === planId)
  const planIds = new Set(plans.map((p) => p.id))
  const unlinked = filteredRows.filter((r) => r.benefit && (!r.benefit.planId || !planIds.has(r.benefit.planId)))
  const PlanIcon = PLAN_ICON[category]
  const plural = PLAN_PLURAL[category]
  const shown = plans.filter((p) => !filtersActive || rowsOf(p.id, filteredRows).length > 0)

  const viewing = plans.find((p) => p.id === viewingId)
  const adding = plans.find((p) => p.id === addingId)
  const transferFrom = plans.find((p) => p.id === transfer?.planId)
  const canTransfer = canManage && plans.filter((p) => p.status === 'active').length > 1
  const membersOf = (planId: string) => liveRows(rowsOf(planId, rows)).map((r) => r.employee)

  /** The per-employee Transfer button, added to that employee's card actions. */
  const transferAction = (row: R) =>
    canTransfer && row.benefit?.planId && row.status !== 'cancelled' ? (
      <Button size="sm" variant="ghost" icon={<ArrowRightLeft className="size-3.5" />} onClick={() => setTransfer({ planId: row.benefit!.planId!, employeeIds: [row.employee.id] })}>
        Transfer
      </Button>
    ) : undefined

  if (plans.length === 0 && unlinked.length === 0) {
    return <EmptyState title={`No ${plural} yet`} description={canManage ? `Add one, then add employees to it from its card.` : `No ${plural} have been set up.`} />
  }

  return (
    <>
      {shown.length === 0 && unlinked.length === 0 ? (
        <EmptyState title={`No ${plural} found`} description="Try clearing the search or status filter." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map((plan) => {
            const all = rowsOf(plan.id, rows)
            const live = liveRows(all)
            const list = rowsOf(plan.id, filteredRows).sort((a, b) => fullName(a.employee).localeCompare(fullName(b.employee)))
            return (
              <Card key={plan.id} className="flex flex-col">
                <Card.Header className="items-start">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <PlanIcon className="size-4 shrink-0 text-muted-foreground" />
                      <Card.Title className="truncate">{plan.name}</Card.Title>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{[plan.provider, plan.coverage].filter(Boolean).join(' · ') || (category === 'allowance' ? (plan.amountType === 'custom' ? 'Amount customizable per employee' : 'Fixed amount for everyone') : 'No coverage details yet')}</p>
                  </div>
                  {plan.status === 'archived' && <Badge tone="neutral">Archived</Badge>}
                </Card.Header>

                <Card.Body className="flex flex-1 flex-col gap-3 pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">
                      {plan.amountType === 'custom' ? (
                        <>
                          <span className="font-semibold text-foreground">Set per employee</span> · default {formatCurrency(plan.monthlyValue)}
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-foreground">{formatCurrency(plan.monthlyValue)}</span> {category === 'allowance' ? 'paid monthly · fixed' : 'company-paid / month'}
                        </>
                      )}
                      {plan.employeeShare > 0 && <> · {formatCurrency(plan.employeeShare)} employee share</>}
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{live.length}</span> enrolled · {live.filter((r) => r.status === 'active').length} active
                    </span>
                  </div>

                  <div className="flex-1 overflow-hidden rounded-xl border border-border">
                    {list.length === 0 ? (
                      <p className="px-3 py-6 text-center text-xs text-muted-foreground">{all.length === 0 ? 'No employees enrolled yet.' : 'No enrolled employees match the filters.'}</p>
                    ) : (
                      <ul className="max-h-60 divide-y divide-border overflow-y-auto">
                        {list.map((r) => (
                          <li key={r.key} className="flex items-center gap-2.5 px-3 py-2">
                            <Avatar name={fullName(r.employee)} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{fullName(r.employee)}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {r.employee.employment.department}
                                {category === 'allowance' && ` · ${formatCurrency(r.monthlyValue)}/month`}
                                {r.employeeShare > 0 && ` · employee share ${formatCurrency(r.employeeShare)}`}
                              </p>
                            </div>
                            <StatusBadge status={r.status} />
                          </li>
                        ))}
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
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium">Not linked to a plan ({unlinked.length})</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{unlinked.map((r) => renderRecordCard(r))}</div>
        </div>
      )}

      {viewing && (
        <PlanDetailsDialog
          plan={viewing}
          rows={rowsOf(viewing.id, rows)}
          canManage={canManage}
          renderRecordCard={(row) => renderRecordCard(row, transferAction(row))}
          canTransfer={canTransfer}
          onTransfer={() => setTransfer({ planId: viewing.id, employeeIds: [] })}
          onAdd={() => setAddingId(viewing.id)}
          onClose={() => setViewingId(null)}
          onChanged={onChanged}
        />
      )}

      {transferFrom && <TransferPlanDialog from={transferFrom} plans={plans} members={membersOf(transferFrom.id)} preselected={transfer?.employeeIds ?? []} onClose={() => setTransfer(null)} onTransferred={onChanged} />}

      {adding && <AddEmployeesToPlanDialog plan={adding} open onOpenChange={(o) => !o && setAddingId(null)} employees={employees} benefits={benefits} plans={plans} onAdded={onChanged} />}
    </>
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

/** A plan's full picture: its terms and every enrolled employee as a card with View / Edit / Pause / Cancel. */
function PlanDetailsDialog<R extends EnrollmentRow>({
  plan,
  rows,
  canManage,
  renderRecordCard,
  canTransfer,
  onTransfer,
  onAdd,
  onClose,
  onChanged,
}: {
  plan: BenefitPlan
  rows: R[]
  canManage: boolean
  renderRecordCard: (row: R) => ReactNode
  canTransfer: boolean
  onTransfer: () => void
  onAdd: () => void
  onClose: () => void
  onChanged: () => void
}) {
  const { user } = useSession()
  const { notify } = useToast()
  const [query, setQuery] = useState('')
  const PlanIcon = PLAN_ICON[plan.category]
  const isAllowance = plan.category === 'allowance'
  const live = liveRows(rows)
  const q = query.trim().toLowerCase()
  const list = rows
    .filter((r) => !q || `${fullName(r.employee)} ${r.employee.employeeNumber} ${r.employee.employment.department}`.toLowerCase().includes(q))
    .sort((a, b) => Number(a.status === 'cancelled') - Number(b.status === 'cancelled') || fullName(a.employee).localeCompare(fullName(b.employee)))

  async function toggleArchive() {
    const result = await setBenefitPlanStatus(user, plan.id, plan.status === 'active' ? 'archived' : 'active')
    notify(result.ok ? { title: plan.status === 'active' ? 'Plan archived' : 'Plan restored', tone: 'success' } : { title: "Couldn't change the plan", description: result.error, tone: 'danger' })
    onChanged()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogTitle className="flex flex-wrap items-center gap-2 pr-8">
          <PlanIcon className="size-5 text-muted-foreground" />
          {plan.name}
          {plan.status === 'archived' && <Badge tone="neutral">Archived</Badge>}
        </DialogTitle>
        <DialogDescription>{[plan.provider, plan.coverage].filter(Boolean).join(' · ') || BENEFIT_CATEGORY_META[plan.category].singular}</DialogDescription>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Enrolled" value={live.length} />
          <Stat label={isAllowance ? 'Paid monthly' : 'Company cost / month'} value={formatCurrency(live.filter((r) => r.status === 'active').reduce((s, r) => s + r.monthlyValue, 0))} />
          {!isAllowance && <Stat label="Employee contributions / month" value={formatCurrency(live.filter((r) => r.status === 'active').reduce((s, r) => s + r.employeeShare, 0))} />}
          <Stat label={plan.amountType === 'custom' ? 'Default / month' : 'Per employee / month'} value={formatCurrency(plan.monthlyValue)} />
        </div>
        {plan.notes && <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{plan.notes}</p>}

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
                  <BenefitPlanDialog
                    category={plan.category}
                    plan={plan}
                    enrolledCount={live.length}
                    onSaved={onChanged}
                    trigger={
                      <Button type="button" size="sm" variant="ghost" icon={<Pencil className="size-3.5" />}>
                        Edit Plan
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
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">{rows.length === 0 ? 'No employees enrolled in this plan yet.' : 'No employees match.'}</p>
          ) : (
            <div className="grid max-h-[55vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">{list.map((r) => renderRecordCard(r))}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
