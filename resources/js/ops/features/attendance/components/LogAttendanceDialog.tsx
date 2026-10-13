import { ClipboardPen } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Checkbox, RadioGroup, RadioGroupItem } from '@ops/components/ui/Checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { EmployeePickerPanel } from '@ops/components/ui/EmployeePickerPanel'
import { FormField } from '@ops/components/ui/FormField'
import { Input, Textarea } from '@ops/components/ui/Input'
import { useToast } from '@ops/components/ui/Toast'
import { useAllEmployees } from '@ops/features/employees/hooks/useAllEmployees'
import { usePermission } from '@ops/hooks/usePermission'
import { apiErrorMessage } from '@ops/lib/api/http'
import { logAttendance } from '@ops/lib/services/attendanceService'
import { defaultTimesFor, scheduleOn, todayKey } from '@ops/lib/services/wfhService'
import type { AttendanceRecord } from '@ops/types/domain'

type WorkType = NonNullable<AttendanceRecord['workType']>
const WORK_TYPES: { value: WorkType; label: string }[] = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'wfh', label: 'WFH' },
  { value: 'field', label: 'Field' },
]
const FALLBACK = { timeIn: '08:00', breakOut: '12:00', breakIn: '13:00', timeOut: '17:00' }

/** Manual attendance entry for HR / managers: one or many employees, a date range, the four punches and a reason. */
export function LogAttendanceDialog({
  employeeIds,
  trigger,
  open: openProp,
  onOpenChange,
  onLogged,
}: {
  employeeIds?: string[]
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onLogged?: () => void
}) {
  const allowed = usePermission('attendance.adjust')
  const { notify } = useToast()
  const { employees } = useAllEmployees()
  const active = useMemo(() => employees.filter((e) => e.employment.status === 'active'), [employees])
  const [innerOpen, setInnerOpen] = useState(false)
  const open = openProp ?? innerOpen
  const [picked, setPicked] = useState<string[]>(employeeIds ?? [])
  const [dateFrom, setDateFrom] = useState(todayKey())
  const [dateTo, setDateTo] = useState(todayKey())
  const [workType, setWorkType] = useState<WorkType>('onsite')
  const [times, setTimes] = useState({ timeIn: '', breakOut: '', breakIn: '', timeOut: '' })
  const [reason, setReason] = useState('')
  const [overwrite, setOverwrite] = useState(false)
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  if (!allowed) return null

  const setOpen = (o: boolean) => {
    if (o) {
      setPicked(employeeIds ?? [])
      setError(undefined)
    }
    setInnerOpen(o)
    onOpenChange?.(o)
  }
  const set = (key: keyof typeof times) => (e: React.ChangeEvent<HTMLInputElement>) => setTimes((t) => ({ ...t, [key]: e.target.value }))
  const breakOrder = !!times.breakOut && !!times.breakIn && times.breakIn <= times.breakOut
  const invalid = picked.length === 0 || !dateFrom || !dateTo || !times.timeIn || !times.timeOut || breakOrder || !reason.trim()

  const useDefaults = () => {
    const employee = employees.find((e) => e.id === picked[0])
    const s = employee ? scheduleOn(employee, dateFrom).schedule : undefined
    if (!s) return setTimes(FALLBACK)
    setTimes(defaultTimesFor(s))
  }

  const submit = async () => {
    setSaving(true)
    setError(undefined)
    try {
      const r = await logAttendance({
        employeeIds: picked,
        dateFrom,
        dateTo,
        workType,
        timeIn: times.timeIn,
        breakOut: times.breakOut || undefined,
        breakIn: times.breakIn || undefined,
        timeOut: times.timeOut,
        reason,
        overwrite,
      })
      notify({ title: `${r.created} logged, ${r.updated} updated, ${r.skipped} skipped (rest days, holidays or existing records)`, tone: 'success' })
      setOpen(false)
      setReason('')
      setTimes({ timeIn: '', breakOut: '', breakIn: '', timeOut: '' })
      onLogged?.()
    } catch (e) {
      setError(apiErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== undefined ? (
        trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="secondary" icon={<ClipboardPen className="size-4" />}>
            Log Attendance
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogTitle>Log Attendance</DialogTitle>
        <DialogDescription>Enter attendance by hand for one or more employees. Rest days and holidays are skipped.</DialogDescription>

        <div className="mt-4 space-y-4">
          <FormField label={`Employees (${picked.length} selected)`} required>
            <EmployeePickerPanel employees={active} value={picked} onChange={setPicked} />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Date from" required>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </FormField>
            <FormField label="Date to" required error={dateTo && dateTo < dateFrom ? 'Must not be before the start date' : undefined}>
              <Input type="date" value={dateTo} min={dateFrom} onChange={(e) => setDateTo(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Work type">
            <RadioGroup value={workType} onValueChange={(v) => setWorkType(v as WorkType)} className="flex flex-wrap gap-4">
              {WORK_TYPES.map((w) => (
                <label key={w.value} className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value={w.value} />
                  {w.label}
                </label>
              ))}
            </RadioGroup>
          </FormField>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <FormField label="AM time in" required>
                <Input type="time" value={times.timeIn} onChange={set('timeIn')} />
              </FormField>
              <FormField label="AM time out">
                <Input type="time" value={times.breakOut} onChange={set('breakOut')} />
              </FormField>
              <FormField label="PM time in" error={breakOrder ? 'Must be after AM time out' : undefined}>
                <Input type="time" value={times.breakIn} onChange={set('breakIn')} />
              </FormField>
              <FormField label="PM time out" required hint="Earlier than AM in = next day">
                <Input type="time" value={times.timeOut} onChange={set('timeOut')} />
              </FormField>
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={useDefaults}>
              Use default schedule times
            </Button>
          </div>
          <FormField label="Reason" required>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this being logged by hand?" />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={overwrite} onCheckedChange={(c) => setOverwrite(c === true)} />
            Replace days that already have a record
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={invalid} isLoading={saving} onClick={submit}>
              Log attendance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
