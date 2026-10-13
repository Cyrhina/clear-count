import { UserPlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { EmployeePickerPanel } from '@ops/components/ui/EmployeePickerPanel'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { useToast } from '@ops/components/ui/Toast'
import { fullName } from '@ops/features/loans-deductions/loanUtils'
import { enrollEmployeesInDeductionPlan } from '@ops/lib/services/benefitsApiService'
import { formatCurrency } from '@ops/lib/utils/format'
import type { DeductionPlan, Employee, EmployeeDeduction } from '@ops/types/domain'

const today = () => new Date().toISOString().slice(0, 10)

/** Adds employees to a recurring deduction: pick by branch and department, tick employees, and (for a customizable plan) set each one's amount. */
export function AddEmployeesToDeductionPlanDialog({
  plan,
  employees,
  deductions,
  onClose,
  onAdded,
}: {
  plan: DeductionPlan
  employees: Employee[]
  /** Every deduction, to see who is already in this plan. */
  deductions: EmployeeDeduction[]
  onClose: () => void
  onAdded: () => void
}) {
  const { notify } = useToast()
  const custom = plan.amountType === 'custom'
  const [startDate, setStartDate] = useState(today())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSelected(new Set())
    setAmounts({})
  }, [plan.id])

  const active = useMemo(() => employees.filter((e) => e.employment.status === 'active'), [employees])
  const inPlan = useMemo(() => new Set(deductions.filter((d) => d.planId === plan.id && (d.status === 'active' || d.status === 'paused')).map((d) => d.employeeId)), [deductions, plan.id])

  const chosen = active.filter((e) => selected.has(e.id))
  const amountOf = (id: string) => Number(amounts[id] ?? plan.amount)
  const invalid = custom && chosen.some((e) => !(amountOf(e.id) > 0))


  async function save() {
    setSaving(true)
    const result = await enrollEmployeesInDeductionPlan(plan.id, [...selected], startDate, Object.fromEntries(chosen.map((e) => [e.id, amountOf(e.id)])))
    setSaving(false)
    notify({
      title: `${result.added} employee${result.added === 1 ? '' : 's'} added to ${plan.name}`,
      description: result.skipped ? `${result.skipped} skipped — already enrolled.` : 'They will be deducted starting with the next payroll run.',
      tone: result.added ? 'success' : 'default',
    })
    onClose()
    onAdded()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogTitle>Add employees to {plan.name}</DialogTitle>
        <DialogDescription>
          {custom ? 'Choose a branch and department, tick the employees, then set each one’s monthly amount.' : `Fixed amount: ${formatCurrency(plan.amount)} a month for every employee added.`}
        </DialogDescription>

        <div className="mt-5 space-y-4">
          <EmployeePickerPanel
            employees={active}
            value={[...selected]}
            onChange={(ids) => setSelected(new Set(ids))}
            isDisabled={(e) => inPlan.has(e.id)}
            disabledLabel="Already in this plan"
            maxHeightClass="max-h-56"
          />

          {custom && chosen.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold">Amount per employee (PHP / month)</p>
              <div className="max-h-44 divide-y divide-border overflow-auto rounded-lg border border-border">
                {chosen.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 px-3 py-1.5">
                    <span className="min-w-0 flex-1 truncate text-sm">{fullName(e)}</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-8 w-32"
                      aria-label={`Amount for ${fullName(e)}`}
                      value={amounts[e.id] ?? String(plan.amount)}
                      onChange={(ev) => setAmounts((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Pre-filled with the plan’s default of {formatCurrency(plan.amount)}.</p>
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
