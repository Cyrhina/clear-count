import { useEffect, useMemo, useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Checkbox } from '@ops/components/ui/Checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { addDays, dayShort, fromDateKey, shiftRangeLabel, weekDays } from '@ops/features/schedules/dateUtil'
import { cn } from '@ops/lib/utils/cn'
import { useSession } from '@ops/hooks/useSession'
import { useTenant } from '@ops/hooks/useTenant'
import { assignShifts, clearShifts } from '@ops/lib/services/scheduleService'
import type { Employee, Schedule } from '@ops/types/domain'

const REST = '__rest__'
const CLEAR = '__clear__'
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export interface AssignPreset {
  employeeIds: string[]
  from: string
  to: string
  /** Pre-selected shift: a template id, REST for a rest day. */
  scheduleId?: string | null
  /** A single roster cell was clicked — the employee list is fixed, not editable. */
  lockEmployees?: boolean
}

/**
 * Assigns a shift template, a rest day, or "not scheduled" to employees across a date range.
 * Opened from the Assign shift button (pick employees) or from a roster cell (one employee, one day).
 */
export function AssignShiftDialog({
  open,
  onOpenChange,
  employees,
  templates,
  preset,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: Employee[]
  templates: Schedule[]
  preset: AssignPreset
  onSaved: () => void
}) {
  const { user } = useSession()
  const { notify } = useToast()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [from, setFrom] = useState(preset.from)
  const [to, setTo] = useState(preset.to)
  const [days, setDays] = useState<Set<number>>(new Set(DAY_ORDER))
  const [shift, setShift] = useState<string>(templates[0]?.id ?? REST)
  const [search, setSearch] = useState('')
  const [branchId, setBranchId] = useState('all')
  const [department, setDepartment] = useState('all')
  const { branches } = useTenant()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelected(new Set(preset.employeeIds))
    setFrom(preset.from)
    setTo(preset.to)
    setDays(new Set(DAY_ORDER))
    setSearch('')
    setBranchId('all')
    setDepartment('all')
    setShift(preset.scheduleId === undefined ? (templates[0]?.id ?? REST) : (preset.scheduleId ?? REST))
  }, [open, preset, templates])

  // Departments offered are the ones that exist in the chosen branch.
  const departments = useMemo(() => [...new Set(employees.filter((e) => branchId === 'all' || e.branchId === branchId).map((e) => e.employment.department))].sort(), [employees, branchId])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return employees.filter(
      (e) =>
        (branchId === 'all' || e.branchId === branchId) &&
        (department === 'all' || e.employment.department === department) &&
        (!q || `${e.personal.firstName} ${e.personal.lastName} ${e.employeeNumber}`.toLowerCase().includes(q)),
    )
  }, [employees, search, branchId, department])
  const filtered = visible.length !== employees.length

  const pickedDates = useMemo(() => {
    const out: string[] = []
    if (!from || !to || to < from) return out
    for (let d = from; d <= to && out.length < 366; d = addDays(d, 1)) if (days.has(fromDateKey(d).getDay())) out.push(d)
    return out
  }, [from, to, days])

  const options = [
    ...templates.map((t) => ({ value: t.id, label: `${t.name} · ${shiftRangeLabel(t)}` })),
    { value: REST, label: 'Rest day' },
    { value: CLEAR, label: 'Clear (not yet scheduled)' },
  ]
  const invalidRange = !!from && !!to && to < from
  const canSave = selected.size > 0 && pickedDates.length > 0 && !saving

  async function save(wholeWeek = false) {
    setSaving(true)
    const employeeIds = [...selected]
    const dates = wholeWeek ? weekDays(from) : pickedDates
    const written = shift === CLEAR ? await clearShifts(user, { employeeIds, dates }) : await assignShifts(user, { employeeIds, dates, scheduleId: shift === REST ? null : shift })
    setSaving(false)
    notify({
      title: shift === CLEAR ? 'Roster cleared' : 'Roster updated',
      description: `${written} day${written === 1 ? '' : 's'} ${shift === CLEAR ? 'cleared' : 'assigned'} for ${employeeIds.length} employee${employeeIds.length === 1 ? '' : 's'}.`,
      tone: 'success',
    })
    onOpenChange(false)
    onSaved()
  }

  function toggle<T>(set: Set<T>, value: T, on: boolean): Set<T> {
    const next = new Set(set)
    if (on) next.add(value)
    else next.delete(value)
    return next
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl">
        <DialogTitle>{preset.lockEmployees ? 'Edit shift' : 'Assign shift'}</DialogTitle>
        <DialogDescription>
          {preset.lockEmployees
            ? `${employees.find((e) => e.id === preset.employeeIds[0])?.personal.firstName ?? 'Employee'} · ${dayShort(preset.from)}, ${preset.from}`
            : 'Choose who is scheduled, the dates, and the shift. Days already on the roster are replaced.'}
        </DialogDescription>

        <div className="mt-5 space-y-4">
          {!preset.lockEmployees && (
            <div>
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
              <div className="mb-1.5 mt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold">
                  Employees ({selected.size} selected{filtered ? ` · ${visible.length} shown` : ''})
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setSelected(new Set(employees.map((e) => e.id)))}>
                    Select all employees
                  </Button>
                  {filtered && (
                    <button type="button" className="text-primary hover:underline" onClick={() => setSelected(new Set([...selected, ...visible.map((e) => e.id)]))}>
                      Select all shown
                    </button>
                  )}
                  <button type="button" className="text-muted-foreground hover:underline" onClick={() => setSelected(new Set())}>
                    Clear
                  </button>
                </div>
              </div>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee…" aria-label="Search employees" />
              <div className="mt-2 max-h-40 overflow-auto rounded-lg border border-border">
                {visible.map((e) => (
                  <label key={e.id} className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50">
                    <Checkbox checked={selected.has(e.id)} onCheckedChange={(v) => setSelected((s) => toggle(s, e.id, v === true))} />
                    <span className="font-medium">
                      {e.personal.firstName} {e.personal.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {e.employeeNumber} · {e.employment.department}
                    </span>
                  </label>
                ))}
                {visible.length === 0 && <p className="px-3 py-4 text-center text-xs text-muted-foreground">No employees match.</p>}
              </div>
            </div>
          )}

          {!preset.lockEmployees && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="From" required>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </FormField>
              <FormField label="To" required error={invalidRange ? 'End date is before the start date' : undefined}>
                <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
              </FormField>
            </div>
          )}

          {!preset.lockEmployees && (
            <div>
              <p className="mb-1.5 text-xs font-semibold">Apply on</p>
              <div className="flex flex-wrap gap-3">
                {DAY_ORDER.map((d) => (
                  <label key={d} className="flex items-center gap-1.5 text-sm">
                    <Checkbox checked={days.has(d)} onCheckedChange={(v) => setDays((s) => toggle(s, d, v === true))} />
                    {DAY_NAMES[d]}
                  </label>
                ))}
              </div>
            </div>
          )}

          <FormField label="Shift">
            {/* Phones: big tap targets instead of a dropdown. */}
            <div className="space-y-2 sm:hidden" role="radiogroup" aria-label="Shift">
              {options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={shift === o.value}
                  onClick={() => setShift(o.value)}
                  className={cn('flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-medium', shift === o.value ? 'border-primary bg-primary/5' : 'border-border')}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <Select className="hidden sm:flex" value={shift} onValueChange={setShift} options={options} />
          </FormField>
          <p className="text-xs text-muted-foreground">
            {pickedDates.length} day{pickedDates.length === 1 ? '' : 's'} × {selected.size} employee{selected.size === 1 ? '' : 's'}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {preset.lockEmployees && shift !== CLEAR && (
            <Button type="button" variant="secondary" onClick={() => save(true)} disabled={saving} className="max-sm:flex-1">
              Apply to whole week
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} className="max-sm:hidden">
            Cancel
          </Button>
          <Button type="button" onClick={() => save()} className="max-sm:flex-1" isLoading={saving} disabled={!canSave}>
            {shift === CLEAR ? 'Clear roster' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
