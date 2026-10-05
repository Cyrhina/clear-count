import { UserPlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { EmployeePickerPanel } from '@ops/components/ui/EmployeePickerPanel'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { useToast } from '@ops/components/ui/Toast'
import { fullName } from '@ops/features/loans-deductions/loanUtils'
import { useSession } from '@ops/hooks/useSession'
import { enrollEmployeesInPlan, isExclusiveCategory } from '@ops/lib/services/benefitsService'
import { formatCurrency } from '@ops/lib/utils/format'
import type { BenefitPlan, Employee, EmployeeBenefit } from '@ops/types/domain'

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Enrols employees in a plan. Pick by branch and department, then tick employees. Someone already in this plan is shown but
 * can't be picked — and for HMO, neither can someone already in another plan (cancel or transfer them first).
 */
export function AddEmployeesToPlanDialog({
  plan,
  open,
  onOpenChange,
  employees,
  benefits,
  plans,
  onAdded,
}: {
  plan: BenefitPlan
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: Employee[]
  /** Every benefit record, to see who is already enrolled where. */
  benefits: EmployeeBenefit[]
  plans: BenefitPlan[]
  onAdded: () => void
}) {
  const { user } = useSession()
  const { notify } = useToast()
  const [startDate, setStartDate] = useState(today())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const custom = plan.amountType === 'custom'

  useEffect(() => {
    if (!open) return
    setStartDate(today())
    setSelected(new Set())
    setAmounts({})
  }, [open])

  const active = useMemo(() => employees.filter((e) => e.employment.status === 'active'), [employees])

  // Where each employee is already enrolled (a live plan record), for the "Already in …" label.
  const enrolledIn = useMemo(() => {
    const planName = new Map(plans.map((p) => [p.id, p.name]))
    const map = new Map<string, string>()
    const exclusive = isExclusiveCategory(plan.category)
    for (const b of benefits) if (b.category === plan.category && b.planId && b.status !== 'cancelled' && (exclusive || b.planId === plan.id)) map.set(b.employeeId, planName.get(b.planId) ?? b.name)
    return map
  }, [benefits, plans, plan.category])

  const chosen = active.filter((e) => selected.has(e.id))
  const amountInvalid = custom && chosen.some((e) => !(Number(amounts[e.id] ?? plan.monthlyValue) > 0))


  async function save() {
    setSaving(true)
    const perEmployee = Object.fromEntries([...selected].map((id) => [id, Number(amounts[id] ?? plan.monthlyValue)]))
    const result = await enrollEmployeesInPlan(user, plan.id, [...selected], startDate, perEmployee)
    setSaving(false)
    notify({
      title: `${result.added} employee${result.added === 1 ? '' : 's'} added to ${plan.name}`,
      description: result.skipped ? `${result.skipped} skipped — already enrolled.` : 'They will be included in the next payroll run.',
      tone: result.added ? 'success' : 'default',
    })
    onOpenChange(false)
    onAdded()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogTitle>Add employees to {plan.name}</DialogTitle>
        <DialogDescription>Choose a branch and department, then tick the employees to enrol. Cost and employee share come from the plan${plan.amountType === 'custom' ? ' — set each employee’s amount below' : ''}.</DialogDescription>

        <div className="mt-5 space-y-4">
          <EmployeePickerPanel
            employees={active}
            value={[...selected]}
            onChange={(ids) => setSelected(new Set(ids))}
            isDisabled={(e) => enrolledIn.has(e.id)}
            disabledLabel={(e) => `Already in ${enrolledIn.get(e.id)}`}
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
                      value={amounts[e.id] ?? String(plan.monthlyValue)}
                      onChange={(ev) => setAmounts((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Pre-filled with the plan’s default of {formatCurrency(plan.monthlyValue)}.</p>
            </div>
          )}

          <FormField label="Start date" hint={custom ? 'The allowance is included in payroll from this date.' : 'Coverage is included in payroll from this date.'}>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </FormField>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" icon={<UserPlus className="size-4" />} onClick={save} isLoading={saving} disabled={selected.size === 0 || !startDate || amountInvalid}>
            Add {selected.size || ''} Employee{selected.size === 1 ? '' : 's'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
