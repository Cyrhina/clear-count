import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input, Textarea } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { formatMultiplierPct } from '@ops/features/company-settings/payrollRatesStore'
import { useOvertimeRates } from '@ops/features/overtime/hooks/useOvertime'
import { apiErrorMessage } from '@ops/lib/api/http'
import { fileOvertime } from '@ops/lib/services/overtimeApiService'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

/** Hours between two times, to a tenth; an end before the start crosses midnight (night differential). The server works out the same figure. */
function totalHoursOf(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  let minutes = endH * 60 + endM - (startH * 60 + startM)
  if (minutes <= 0) minutes += 24 * 60
  return Math.round((minutes / 60) * 10) / 10
}

const EMPTY_FORM = { type: 'regular', date: todayKey(), startTime: '', endTime: '', reason: '' }

/** An employee asks to be paid overtime or night differential for a day; their manager decides. */
export function OvertimeApplicationDialog({ employeeId, onSubmitted }: { employeeId: string; onSubmitted?: () => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const { rates } = useOvertimeRates()
  const typeOptions = rates.map((r) => ({ value: r.key, label: `${r.label} (${formatMultiplierPct(r.multiplier)})` }))
  const { notify } = useToast()

  const totalHours = totalHoursOf(form.startTime, form.endTime)
  const canSubmit = form.date && form.startTime && form.endTime && form.reason.trim().length > 0

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setForm(EMPTY_FORM)
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      await fileOvertime({ employeeId, type: form.type, date: form.date, startTime: form.startTime, endTime: form.endTime, reason: form.reason.trim(), source: 'ess' })
    } catch (error) {
      notify({ title: "Couldn't submit the application", description: apiErrorMessage(error), tone: 'danger' })
      return
    } finally {
      setSaving(false)
    }
    notify({ title: 'Application submitted', description: 'Your request is now pending approval.', tone: 'success' })
    onOpenChange(false)
    onSubmitted?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button icon={<Plus className="size-4" />}>Apply Overtime / Night Diff</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Apply for Overtime / Night Differential</DialogTitle>
        <DialogDescription>File a request for your manager to review. This will be recorded as pending approval.</DialogDescription>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <FormField label="Application Type" required className="col-span-2">
            <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))} options={typeOptions} />
          </FormField>

          <FormField label="Date of Rendering" required className="col-span-2">
            <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </FormField>

          <FormField label="Start Time" required>
            <Input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
          </FormField>
          <FormField label="End Time" required>
            <Input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
          </FormField>

          <FormField label="Total Hours" className="col-span-2" hint="Automatically computed from start and end time.">
            <p className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-sm font-semibold tabular-nums">
              {totalHours > 0 ? `${totalHours} hrs` : '—'}
            </p>
          </FormField>

          <FormField label="Reason / Justification" required className="col-span-2">
            <Textarea
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="e.g. Project crunch delivery, system deployment duty…"
            />
          </FormField>

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!canSubmit} isLoading={saving} onClick={handleSubmit}>
              Submit Application
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
