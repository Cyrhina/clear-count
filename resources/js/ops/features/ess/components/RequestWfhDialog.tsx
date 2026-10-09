import { Home } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input, Textarea } from '@ops/components/ui/Input'
import { useToast } from '@ops/components/ui/Toast'
import { useSelfEmployee } from '@ops/features/ess/hooks/useSelfEmployee'
import { useSession } from '@ops/hooks/useSession'
import { createWfhBatch, todayKey } from '@ops/lib/services/wfhService'
import { cn } from '@ops/lib/utils/cn'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** An employee asks to work from home for a date range; their manager decides. */
export function RequestWfhDialog({ onRequested }: { onRequested?: () => void }) {
  const { user } = useSession()
  const { employee } = useSelfEmployee()
  const { notify } = useToast()
  const [open, setOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState(todayKey())
  const [dateTo, setDateTo] = useState(todayKey())
  const [days, setDays] = useState<number[]>([])
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  // Monday of this week (+7 for next week) through Friday.
  const week = (offset: number) => {
    const mon = addDays(todayKey(), -((new Date().getDay() + 6) % 7) + offset * 7)
    setDateFrom(mon)
    setDateTo(addDays(mon, 4))
    setDays([])
  }
  const toggle = (d: number) => setDays((l) => (l.includes(d) ? l.filter((x) => x !== d) : [...l, d]))

  const submit = async () => {
    if (!employee) return
    setSaving(true)
    setError(undefined)
    try {
      const r = await createWfhBatch(user, { employeeIds: [employee.id], kind: 'temporary', dateFrom, dateTo, daysOfWeek: days, times: 'default', reason })
      if (r.created.length === 0) throw new Error(r.skipped[0]?.reason ?? 'Could not send the request.')
      notify({ title: r.created[0].status === 'approved' ? 'WFH set' : 'WFH request sent to your manager', tone: 'success' })
      setOpen(false)
      setReason('')
      setDays([])
      onRequested?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the request.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setError(undefined)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" icon={<Home className="size-4" />}>
          Request WFH
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Request work from home</DialogTitle>
        <DialogDescription>Your manager will approve or reject it. Approved days are filled in from your schedule.</DialogDescription>
        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => week(0)}>
              This week
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => week(1)}>
              Next week
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="From" required>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </FormField>
            <FormField label="To" required error={dateTo && dateTo < dateFrom ? 'Must not be before the start date' : undefined}>
              <Input type="date" value={dateTo} min={dateFrom} onChange={(e) => setDateTo(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Only these weekdays" hint="Leave empty for every working day in the range">
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((label, d) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={days.includes(d)}
                  onClick={() => toggle(d)}
                  className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors', days.includes(d) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}
                >
                  {label}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Reason" required>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why do you need to work from home?" />
          </FormField>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" isLoading={saving} disabled={!employee || !reason.trim() || !dateFrom || !dateTo || dateTo < dateFrom} onClick={submit}>
              Send request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
