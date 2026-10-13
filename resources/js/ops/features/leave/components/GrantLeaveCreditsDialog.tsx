import { CalendarPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { EmployeePickerPanel } from '@ops/components/ui/EmployeePickerPanel'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { apiErrorMessage } from '@ops/lib/api/http'
import { grantCredits } from '@ops/lib/services/leaveApiService'
import type { Employee, LeaveType } from '@ops/types/domain'

/** Grants (or resets) leave credits for several employees at once: pick the employees, the leave type, and how many days. */
export function GrantLeaveCreditsDialog({ employees, leaveTypes, onGranted }: { employees: Employee[]; leaveTypes: LeaveType[]; onGranted: () => void }) {
  const { notify } = useToast()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [leaveTypeId, setLeaveTypeId] = useState('')
  const [mode, setMode] = useState<'add' | 'set'>('add')
  const [days, setDays] = useState('5')
  const [saving, setSaving] = useState(false)

  const active = useMemo(() => employees.filter((e) => e.employment.status === 'active'), [employees])
  const typeId = leaveTypes.some((t) => t.id === leaveTypeId) ? leaveTypeId : (leaveTypes[0]?.id ?? '')
  const leaveType = leaveTypes.find((t) => t.id === typeId)
  const amount = Number(days)
  const valid = !!leaveType && selected.length > 0 && Number.isFinite(amount) && (mode === 'set' ? amount >= 0 : amount > 0)

  async function save() {
    if (!leaveType) return
    setSaving(true)
    let n: number
    try {
      n = await grantCredits(selected, leaveType.id, amount, mode)
    } catch (error) {
      setSaving(false)
      return notify({ title: "Couldn't update the credits", description: apiErrorMessage(error), tone: 'danger' })
    }
    setSaving(false)
    notify({ title: `${leaveType.name} credits updated for ${n} employee${n === 1 ? '' : 's'}`, description: mode === 'add' ? `+${amount} day${amount === 1 ? '' : 's'} each.` : `Set to ${amount} day${amount === 1 ? '' : 's'} each.`, tone: 'success' })
    setOpen(false)
    setSelected([])
    onGranted()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" icon={<CalendarPlus className="size-4" />}>
          Grant Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogTitle>Grant leave credits</DialogTitle>
        <DialogDescription>Add days to, or reset, one leave type for the employees you pick.</DialogDescription>

        <div className="mt-6 space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Credit details</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              <FormField label="Leave type" className="col-span-2 sm:col-span-1">
              <Select value={typeId} onValueChange={setLeaveTypeId} aria-label="Leave type" options={leaveTypes.map((t) => ({ value: t.id, label: t.name }))} />
            </FormField>
              <FormField label="Action" className="col-span-1">
              <Select
                value={mode}
                onValueChange={(v) => setMode(v as 'add' | 'set')}
                aria-label="Action"
                options={[
                  { value: 'add', label: 'Add days' },
                  { value: 'set', label: 'Set credits to' },
                ]}
              />
            </FormField>
              <FormField label="Days" className="col-span-1">
                <Input type="number" min="0" step="0.5" value={days} onChange={(e) => setDays(e.target.value)} />
              </FormField>
            </div>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h3 className="text-sm font-semibold">Select employees</h3>
            <EmployeePickerPanel employees={active} value={selected} onChange={setSelected} maxHeightClass="max-h-56 sm:max-h-64" />
          </section>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={save} isLoading={saving} disabled={!valid}>
            {mode === 'add' ? 'Grant' : 'Set'} to {selected.length || ''} Employee{selected.length === 1 ? '' : 's'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
