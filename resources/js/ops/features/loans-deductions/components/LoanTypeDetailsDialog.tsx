import { Landmark, Pencil, Search, UserPlus } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { Input } from '@ops/components/ui/Input'
import { LoanTypeDialog } from '@ops/features/loans-deductions/components/LoanTypeDialog'
import { fullName } from '@ops/features/loans-deductions/loanUtils'
import { formatCurrency } from '@ops/lib/utils/format'
import type { Employee, LoanRecord, LoanTypeConfig } from '@ops/types/domain'

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-lg font-semibold">{value}</p>
    </div>
  )
}

export const isLive = (loan: LoanRecord) => loan.status === 'active' || loan.status === 'suspended'

/** A loan type's full picture: its terms and every loan under it as a card with View / Edit / Pause / Cancel. */
export function LoanTypeDetailsDialog({
  type,
  allTypes,
  loans,
  employeeById,
  canManage,
  renderLoanCard,
  onAdd,
  onClose,
  onChanged,
}: {
  type: LoanTypeConfig
  allTypes: LoanTypeConfig[]
  loans: LoanRecord[]
  employeeById: Map<string, Employee>
  canManage: boolean
  renderLoanCard: (loan: LoanRecord) => ReactNode
  onAdd: () => void
  onClose: () => void
  onChanged: () => void
}) {
  const [query, setQuery] = useState('')
  const live = loans.filter(isLive)
  const q = query.trim().toLowerCase()
  const list = loans
    .filter((l) => !q || `${fullName(employeeById.get(l.employeeId))} ${employeeById.get(l.employeeId)?.employeeNumber ?? ''}`.toLowerCase().includes(q))
    .sort((a, b) => Number(!isLive(a)) - Number(!isLive(b)) || fullName(employeeById.get(a.employeeId)).localeCompare(fullName(employeeById.get(b.employeeId))))

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogTitle className="flex flex-wrap items-center gap-2 pr-8">
          <Landmark className="size-5 text-muted-foreground" />
          {type.label}
          <Badge tone="neutral">{type.provider}</Badge>
          {!type.isActive && <Badge tone="neutral">Inactive</Badge>}
        </DialogTitle>
        <DialogDescription>{type.description}</DialogDescription>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Borrowers" value={live.length} />
          <Stat label="Outstanding balance" value={formatCurrency(live.filter((l) => l.status === 'active').reduce((s, l) => s + l.balance, 0))} />
          <Stat label="Deducted / month" value={formatCurrency(live.filter((l) => l.status === 'active').reduce((s, l) => s + Math.min(l.monthlyDeduction, l.balance), 0))} />
          <Stat label="Terms" value={type.amountType === 'fixed' ? `${formatCurrency(type.fixedPrincipal ?? 0)} · ${formatCurrency(type.fixedMonthlyDeduction ?? 0)}/mo` : 'Set per employee'} />
        </div>
        <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Typical term {type.typicalTerm} · typical amount {type.typicalAmount}
        </p>

        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">Loans ({loans.length})</p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employees…" className="pl-9" />
              </div>
              {canManage && (
                <>
                  <LoanTypeDialog
                    type={type}
                    existing={allTypes}
                    onSaved={onChanged}
                    trigger={
                      <Button type="button" size="sm" variant="ghost" icon={<Pencil className="size-3.5" />}>
                        Edit Loan Type
                      </Button>
                    }
                  />
                  {type.isActive && (
                    <Button type="button" size="sm" icon={<UserPlus className="size-3.5" />} onClick={onAdd}>
                      Add Employees
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">{loans.length === 0 ? 'No employees have this loan yet.' : 'No employees match.'}</p>
          ) : (
            <div className="grid max-h-[55vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">{list.map((loan) => renderLoanCard(loan))}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
