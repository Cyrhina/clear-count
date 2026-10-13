import { UserPlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Checkbox } from '@ops/components/ui/Checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { fullName } from '@ops/features/loans-deductions/loanUtils'
import { useTenant } from '@ops/hooks/useTenant'
import { createLoansForType } from '@ops/lib/services/loanApiService'
import { formatCurrency } from '@ops/lib/utils/format'
import type { Employee, LoanRecord, LoanTypeConfig } from '@ops/types/domain'

const today = () => new Date().toISOString().slice(0, 10)

interface Amounts {
  principal: string
  monthly: string
}

/**
 * Adds loans of one type for several employees. Pick by branch and department, tick employees, and — for a customizable
 * type — enter each employee's principal and monthly deduction. A fixed-terms type applies its own amounts to everyone.
 * Someone with an active or paused loan of this type is shown but can't be picked.
 */
export function AddEmployeesToLoanTypeDialog({
  type,
  employees,
  loans,
  onClose,
  onAdded,
}: {
  type: LoanTypeConfig
  employees: Employee[]
  /** Every loan, to see who already has one of this type. */
  loans: LoanRecord[]
  onClose: () => void
  onAdded: () => void
}) {
  const { notify } = useToast()
  const { branches } = useTenant()
  const fixed = type.amountType === 'fixed'
  const [branchId, setBranchId] = useState('all')
  const [department, setDepartment] = useState('all')
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState(today())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [amounts, setAmounts] = useState<Record<string, Amounts>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSelected(new Set())
    setAmounts({})
  }, [type.id])

  const active = useMemo(() => employees.filter((e) => e.employment.status === 'active'), [employees])
  const departments = useMemo(() => [...new Set(active.filter((e) => branchId === 'all' || e.branchId === branchId).map((e) => e.employment.department))].sort(), [active, branchId])
  const hasLoan = useMemo(() => new Set(loans.filter((l) => l.type === type.key && (l.status === 'active' || l.status === 'suspended')).map((l) => l.employeeId)), [loans, type.key])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return active.filter(
      (e) =>
        (branchId === 'all' || e.branchId === branchId) &&
        (department === 'all' || e.employment.department === department) &&
        (!q || `${fullName(e)} ${e.employeeNumber}`.toLowerCase().includes(q)),
    )
  }, [active, branchId, department, search])
  const pickable = visible.filter((e) => !hasLoan.has(e.id))
  const chosen = active.filter((e) => selected.has(e.id))

  const amountsFor = (id: string): Amounts => amounts[id] ?? { principal: '', monthly: '' }
  const rowInvalid = (id: string) => {
    const a = amountsFor(id)
    const principal = Number(a.principal)
    const monthly = Number(a.monthly)
    return !(principal > 0) || !(monthly > 0) || monthly > principal
  }
  const invalid = !fixed && chosen.some((e) => rowInvalid(e.id))

  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  async function save() {
    setSaving(true)
    const entries = chosen.map((e) => ({ employeeId: e.id, principal: Number(amountsFor(e.id).principal), monthlyDeduction: Number(amountsFor(e.id).monthly) }))
    const result = await createLoansForType(type, entries, startDate)
    setSaving(false)
    notify({
      title: `${result.added} loan${result.added === 1 ? '' : 's'} added to ${type.label}`,
      description: result.skipped ? `${result.skipped} skipped — already have an active loan of this type.` : 'Deductions start with the next payroll run on or after the start date.',
      tone: result.added ? 'success' : 'default',
    })
    onClose()
    onAdded()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogTitle>Add employees to {type.label}</DialogTitle>
        <DialogDescription>
          {fixed
            ? `Fixed terms: every loan is ${formatCurrency(type.fixedPrincipal ?? 0)} repaid at ${formatCurrency(type.fixedMonthlyDeduction ?? 0)} a month.`
            : 'Choose a branch and department, tick the employees, then enter each one’s principal and monthly deduction.'}
        </DialogDescription>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Branch">
              <Select
                value={branchId}
                onValueChange={(v) => {
                  setBranchId(v)
                  setDepartment('all')
                }}
                aria-label="Branch"
                options={[{ value: 'all', label: 'All branches' }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
              />
            </FormField>
            <FormField label="Department">
              <Select value={department} onValueChange={setDepartment} aria-label="Department" options={[{ value: 'all', label: 'All departments' }, ...departments.map((d) => ({ value: d, label: d }))]} />
            </FormField>
          </div>

          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold">Employees ({selected.size} selected)</p>
              <div className="flex gap-3 text-xs">
                <button type="button" className="text-primary hover:underline" disabled={pickable.length === 0} onClick={() => setSelected(new Set([...selected, ...pickable.map((e) => e.id)]))}>
                  Select all shown
                </button>
                <button type="button" className="text-muted-foreground hover:underline" onClick={() => setSelected(new Set())}>
                  Clear
                </button>
              </div>
            </div>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee…" aria-label="Search employees" />
            <div className="mt-2 max-h-48 overflow-auto rounded-lg border border-border">
              {visible.map((e) => {
                const taken = hasLoan.has(e.id)
                return (
                  <label key={e.id} className={`flex items-center gap-2 px-3 py-1.5 text-sm ${taken ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-muted/50'}`}>
                    <Checkbox checked={selected.has(e.id)} disabled={taken} onCheckedChange={(v) => toggle(e.id, v === true)} />
                    <span className="font-medium">{fullName(e)}</span>
                    <span className="text-xs text-muted-foreground">
                      {e.employeeNumber} · {e.employment.department}
                    </span>
                    {taken && <span className="ml-auto text-xs text-warning">Has an active loan</span>}
                  </label>
                )
              })}
              {visible.length === 0 && <p className="px-3 py-4 text-center text-xs text-muted-foreground">No employees match.</p>}
            </div>
          </div>

          {!fixed && chosen.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold">Terms per employee (PHP)</p>
              <div className="max-h-48 divide-y divide-border overflow-auto rounded-lg border border-border">
                {chosen.map((e) => {
                  const a = amountsFor(e.id)
                  const bad = (a.principal !== '' || a.monthly !== '') && rowInvalid(e.id)
                  return (
                    <div key={e.id} className="flex items-center gap-2 px-3 py-1.5">
                      <span className="min-w-0 flex-1 truncate text-sm">{fullName(e)}</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Principal"
                        className="h-8 w-28"
                        aria-label={`Principal for ${fullName(e)}`}
                        value={a.principal}
                        onChange={(ev) => setAmounts((prev) => ({ ...prev, [e.id]: { ...amountsFor(e.id), principal: ev.target.value } }))}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Per month"
                        className={`h-8 w-28 ${bad ? 'border-danger' : ''}`}
                        aria-label={`Monthly deduction for ${fullName(e)}`}
                        value={a.monthly}
                        onChange={(ev) => setAmounts((prev) => ({ ...prev, [e.id]: { ...amountsFor(e.id), monthly: ev.target.value } }))}
                      />
                    </div>
                  )
                })}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Principal and monthly deduction must both be above 0, and the deduction can’t exceed the principal.</p>
            </div>
          )}

          <FormField label="Start date" hint="Deductions begin with the next payroll run on or after this date.">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </FormField>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" icon={<UserPlus className="size-4" />} onClick={save} isLoading={saving} disabled={selected.size === 0 || !startDate || invalid}>
            Add {selected.size || ''} Employee{selected.size === 1 ? '' : 's'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
