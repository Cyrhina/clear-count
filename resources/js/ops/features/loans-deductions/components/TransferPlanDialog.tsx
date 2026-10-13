import { ArrowRightLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Checkbox } from '@ops/components/ui/Checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { fullName } from '@ops/features/loans-deductions/loanUtils'
import { transferEmployeesToPlan } from '@ops/lib/services/benefitsApiService'
import { formatCurrency } from '@ops/lib/utils/format'
import type { BenefitPlan, Employee } from '@ops/types/domain'

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Moves employees from one plan to another of the same kind. The old enrolment ends the day before the effective date and a new one
 * starts on it, at the new plan's cost and employee share — so payroll never pays two plans for the same day.
 */
export function TransferPlanDialog({
  from,
  plans,
  members,
  preselected,
  onClose,
  onTransferred,
}: {
  from: BenefitPlan
  plans: BenefitPlan[]
  /** Employees currently enrolled (active or paused) in `from`. */
  members: Employee[]
  preselected: string[]
  onClose: () => void
  onTransferred: () => void
}) {
  const { notify } = useToast()
  const targets = useMemo(() => plans.filter((p) => p.id !== from.id && p.status === 'active'), [plans, from.id])
  const [targetId, setTargetId] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set(preselected))
  const [effective, setEffective] = useState(today())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSelected(new Set(preselected))
    setTargetId(targets[0]?.id ?? '')
  }, [preselected, targets])

  const target = targets.find((p) => p.id === targetId)
  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  async function save() {
    setSaving(true)
    const result = await transferEmployeesToPlan(from.id, targetId, [...selected], effective)
    setSaving(false)
    notify({
      title: result.moved ? `${result.moved} employee${result.moved === 1 ? '' : 's'} moved to ${target?.name}` : 'Nobody was moved',
      description: result.skipped ? `${result.skipped} skipped — already in ${target?.name} or no longer in ${from.name}.` : `${from.name} ends the day before ${effective}; ${target?.name} starts on it.`,
      tone: result.moved ? 'success' : 'default',
    })
    onClose()
    onTransferred()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogTitle>Transfer employees from {from.name}</DialogTitle>
        <DialogDescription>Move employees to another plan. Their coverage, company cost and employee share switch to the new plan from the effective date.</DialogDescription>

        {targets.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">There is no other active plan to transfer to. Add one first.</p>
        ) : (
          <div className="mt-5 space-y-4">
            <FormField label="Transfer to">
              <Select value={targetId} onValueChange={setTargetId} aria-label="Target plan" options={targets.map((p) => ({ value: p.id, label: `${p.name} · ${formatCurrency(p.monthlyValue)}/mo` }))} />
            </FormField>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-semibold">Employees ({selected.size} selected)</p>
                <div className="flex gap-3 text-xs">
                  <button type="button" className="text-primary hover:underline" onClick={() => setSelected(new Set(members.map((e) => e.id)))}>
                    Select all
                  </button>
                  <button type="button" className="text-muted-foreground hover:underline" onClick={() => setSelected(new Set())}>
                    Clear
                  </button>
                </div>
              </div>
              <div className="max-h-56 overflow-auto rounded-lg border border-border">
                {members.map((e) => (
                  <label key={e.id} className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50">
                    <Checkbox checked={selected.has(e.id)} onCheckedChange={(v) => toggle(e.id, v === true)} />
                    <span className="font-medium">{fullName(e)}</span>
                    <span className="text-xs text-muted-foreground">
                      {e.employeeNumber} · {e.employment.department}
                    </span>
                  </label>
                ))}
                {members.length === 0 && <p className="px-3 py-4 text-center text-xs text-muted-foreground">Nobody is enrolled in this plan.</p>}
              </div>
            </div>

            <FormField label="Effective date" hint={`${from.name} ends the day before; ${target?.name ?? 'the new plan'} starts on this date.`}>
              <Input type="date" value={effective} onChange={(e) => setEffective(e.target.value)} />
            </FormField>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" icon={<ArrowRightLeft className="size-4" />} onClick={save} isLoading={saving} disabled={!target || selected.size === 0 || !effective}>
            Transfer {selected.size || ''} Employee{selected.size === 1 ? '' : 's'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
