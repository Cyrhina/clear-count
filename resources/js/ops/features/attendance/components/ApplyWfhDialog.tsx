import { Home } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Checkbox } from '@ops/components/ui/Checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { EmployeePickerPanel } from '@ops/components/ui/EmployeePickerPanel'
import { FormField } from '@ops/components/ui/FormField'
import { Input, Textarea } from '@ops/components/ui/Input'
import { useToast } from '@ops/components/ui/Toast'
import { useWfh } from '@ops/features/attendance/hooks/useWfh'
import { useAllEmployees } from '@ops/features/employees/hooks/useAllEmployees'
import { apiErrorMessage } from '@ops/lib/api/http'
import { cn } from '@ops/lib/utils/cn'
import { createWfh, previewWfh, validateWfhInput } from '@ops/lib/services/wfhArrangementService'
import type { WfhInput, WfhPreviewRow } from '@ops/lib/services/wfhArrangementService'
import type { WfhKind, WfhTimes } from '@ops/types/domain'

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad = (n: number) => String(n).padStart(2, '0')
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
/** Monday–Sunday of the week `offset` weeks from now. */
function weekRange(offset: number): [string, string] {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7)
  const from = dateKey(d)
  d.setDate(d.getDate() + 6)
  return [from, dateKey(d)]
}

const fullName = (e: WfhPreviewRow['employee']) => `${e.personal.firstName} ${e.personal.lastName}`

function Radio({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="radio" className="size-4 accent-[var(--color-primary)]" checked={checked} onChange={onChange} />
      {children}
    </label>
  )
}

export function WeekdayChips({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {WEEKDAYS.map((label, i) => {
        const on = value.includes(i)
        return (
          <button
            key={label}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((d) => d !== i) : [...value, i].sort())}
            className={cn('h-8 rounded-full border px-3 text-xs font-medium transition-colors', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

const MONTH_LABEL = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })

export function ApplyWfhDialog({
  employeeIds,
  trigger,
  open: openProp,
  onOpenChange,
  onApplied,
}: {
  employeeIds?: string[]
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onApplied?: () => void
}) {
  const { notify } = useToast()
  const { employees } = useAllEmployees()
  const { monthlyLimit, refetch: refetchWfh } = useWfh()
  const [innerOpen, setInnerOpen] = useState(false)
  const open = openProp ?? innerOpen
  const setOpen = (v: boolean) => {
    setInnerOpen(v)
    onOpenChange?.(v)
  }

  const [step, setStep] = useState<'form' | 'preview'>('form')
  const [selected, setSelected] = useState<string[]>(employeeIds ?? [])
  const [invert, setInvert] = useState(false)
  const [kind, setKind] = useState<WfhKind>('temporary')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [days, setDays] = useState<number[]>([])
  const [times, setTimes] = useState<WfhTimes>('default')
  const [custom, setCustom] = useState({ timeIn: '', breakOut: '', breakIn: '', timeOut: '' })
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string>()
  const [rows, setRows] = useState<WfhPreviewRow[]>([])
  const [included, setIncluded] = useState<Set<string>>(new Set())
  const [replace, setReplace] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) setSelected(employeeIds ?? [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const active = useMemo(() => employees.filter((e) => e.employment.status === 'active'), [employees])
  const activeIds = useMemo(() => new Set(active.map((e) => e.id)), [active])
  const targetIds = useMemo(() => (invert ? active.filter((e) => !selected.includes(e.id)).map((e) => e.id) : selected.filter((id) => activeIds.has(id))), [invert, active, activeIds, selected])

  const buildInput = (ids: string[]): WfhInput => ({
    employeeIds: ids,
    kind,
    dateFrom,
    dateTo: dateTo || null,
    daysOfWeek: days,
    times,
    custom: times === 'custom' ? custom : undefined,
    reason,
    replaceOverlaps: replace,
  })

  function reset() {
    setStep('form')
    setError(undefined)
    setReason('')
    setReplace(false)
    setInvert(false)
  }

  async function toPreview() {
    const input = buildInput(targetIds)
    const err = validateWfhInput(input)
    if (err) return setError(err)
    setError(undefined)
    setBusy(true)
    let result: WfhPreviewRow[]
    try {
      result = await previewWfh(input, employees)
    } catch (e) {
      setBusy(false)
      return setError(apiErrorMessage(e))
    }
    setBusy(false)
    setRows(result)
    setIncluded(new Set(result.filter((r) => r.overlapIds.length === 0).map((r) => r.employee.id)))
    setStep('preview')
  }

  async function apply() {
    setBusy(true)
    try {
      const ids = rows.filter((r) => included.has(r.employee.id)).map((r) => r.employee.id)
      const result = await createWfh(buildInput(ids))
      const skipped = result.skipped.length + (rows.length - ids.length)
      refetchWfh()
      notify({
        title: `${result.created} employee${result.created === 1 ? '' : 's'} set to WFH`,
        description: skipped ? `${skipped} skipped` : undefined,
        tone: 'success',
      })
      setOpen(false)
      reset()
      onApplied?.()
    } catch (e) {
      setError(apiErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const setWeek = (offset: number) => {
    const [from, to] = weekRange(offset)
    setDateFrom(from)
    setDateTo(to)
  }
  const hasOverlap = rows.some((r) => r.overlapIds.length > 0)
  const overLimit = rows.filter((r) => r.overLimit.length > 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button icon={<Home className="size-4" />}>Apply WFH</Button>}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Apply work from home</DialogTitle>
        <DialogDescription>{step === 'form' ? 'Choose who, when and how attendance is recorded.' : 'Check who will be affected before applying.'}</DialogDescription>

        {step === 'form' ? (
          <div className="mt-5 space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold">Who</p>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={invert} onCheckedChange={(v) => setInvert(v === true)} />
                Everyone except the selected
              </label>
              <EmployeePickerPanel employees={active} value={selected} onChange={setSelected} />
              <p className="text-xs text-muted-foreground">
                {targetIds.length} employee{targetIds.length === 1 ? '' : 's'} will get WFH{invert ? ' (everyone active except the ticked ones)' : ''}.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold">When</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Radio checked={kind === 'temporary'} onChange={() => setKind('temporary')}>
                  Temporary
                </Radio>
                <Radio checked={kind === 'standing'} onChange={() => setKind('standing')}>
                  Standing
                </Radio>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={kind === 'temporary' ? 'From' : 'Starting'} required>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </FormField>
                <FormField label={kind === 'temporary' ? 'To' : 'Until (optional)'} required={kind === 'temporary'}>
                  <Input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} />
                </FormField>
              </div>
              {kind === 'temporary' && (
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setWeek(0)}>
                    This week
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setWeek(1)}>
                    Next week
                  </Button>
                </div>
              )}
              <FormField label="Weekdays" hint="Leave empty for all working days.">
                <WeekdayChips value={days} onChange={setDays} />
              </FormField>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold">Times</p>
              <div className="flex flex-col gap-2">
                <Radio checked={times === 'default'} onChange={() => setTimes('default')}>
                  Schedule default times
                </Radio>
                <Radio checked={times === 'custom'} onChange={() => setTimes('custom')}>
                  Fixed times
                </Radio>
                <Radio checked={times === 'self_log'} onChange={() => setTimes('self_log')}>
                  They log it themselves (nothing auto-recorded)
                </Radio>
              </div>
              {times === 'custom' && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {(
                    [
                      ['timeIn', 'AM In'],
                      ['breakOut', 'AM Out'],
                      ['breakIn', 'PM In'],
                      ['timeOut', 'PM Out'],
                    ] as const
                  ).map(([k, label]) => (
                    <FormField key={k} label={label}>
                      <Input type="time" value={custom[k]} onChange={(e) => setCustom((c) => ({ ...c, [k]: e.target.value }))} />
                    </FormField>
                  ))}
                </div>
              )}
            </div>

            <FormField label="Reason" required>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this WFH being set?" />
            </FormField>

            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={toPreview} isLoading={busy}>
                Preview
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {overLimit.length > 0 && (
              <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
                Over the monthly limit of {monthlyLimit} day{monthlyLimit === 1 ? '' : 's'}: {overLimit.map((r) => `${fullName(r.employee)} (${r.overLimit.map(MONTH_LABEL).join(', ')})`).join('; ')}. You can still apply.
              </p>
            )}
            {hasOverlap && (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={replace} onCheckedChange={(v) => setReplace(v === true)} />
                Replace overlapping arrangements
              </label>
            )}
            <div className="max-h-80 divide-y divide-border/50 overflow-auto rounded-lg border border-border">
              {rows.map((r) => {
                const id = r.employee.id
                const s = r.skipped
                const skipBits = [s.leave && `leave ${s.leave}`, s.holiday && `holiday ${s.holiday}`, s.rest && `rest ${s.rest}`, s.punches && `has punches ${s.punches}`].filter(Boolean)
                return (
                  <label key={id} className="flex cursor-pointer items-start gap-3 px-3 py-2.5 text-sm hover:bg-muted/50">
                    <Checkbox
                      className="mt-0.5"
                      checked={included.has(id)}
                      onCheckedChange={(v) =>
                        setIncluded((prev) => {
                          const next = new Set(prev)
                          if (v === true) next.add(id)
                          else next.delete(id)
                          return next
                        })
                      }
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {fullName(r.employee)} <span className="text-xs font-normal text-muted-foreground">{r.employee.employeeNumber}</span>
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {r.workDays} work day{r.workDays === 1 ? '' : 's'}
                        {skipBits.length > 0 && ` · skipped: ${skipBits.join(', ')}`}
                      </span>
                      {r.overlapIds.length > 0 && <span className="block text-xs text-warning">Already has WFH in these dates{replace ? ' (will be replaced)' : ' (skipped unless included and replaced)'}</span>}
                    </span>
                    {r.overLimit.length > 0 && <Badge tone="warning">Over limit</Badge>}
                  </label>
                )
              })}
              {rows.length === 0 && <p className="px-3 py-4 text-center text-xs text-muted-foreground">No employees to preview.</p>}
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep('form')}>
                Back
              </Button>
              <Button type="button" onClick={apply} isLoading={busy} disabled={included.size === 0}>
                Apply to {included.size}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
