import { useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'

/** The four times of one attendance day, as `<input type="time">` values ('' = none). */
export interface PunchTimes {
  timeIn: string
  timeOut: string
  breakOut: string
  breakIn: string
}

/** Inline editor for one employee-day in the biometrics preview: fix a wrong time-in, add a missing punch, set the lunch break. */
export function PunchEditor({
  initial,
  onSave,
  onCancel,
  onReset,
}: {
  initial: PunchTimes
  onSave: (times: PunchTimes) => void
  onCancel: () => void
  /** Restores what the file said (only for rows that came from the file). */
  onReset?: () => void
}) {
  const [v, setV] = useState(initial)
  const set = (key: keyof PunchTimes) => (e: React.ChangeEvent<HTMLInputElement>) => setV((t) => ({ ...t, [key]: e.target.value }))
  const breakOrder = !!v.breakOut && !!v.breakIn && v.breakIn <= v.breakOut
  const invalid = !v.timeIn || breakOrder

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FormField label="AM time in" required>
          <Input type="time" value={v.timeIn} onChange={set('timeIn')} />
        </FormField>
        <FormField label="AM time out">
          <Input type="time" value={v.breakOut} onChange={set('breakOut')} />
        </FormField>
        <FormField label="PM time in" error={breakOrder ? 'Must be after AM time out' : undefined}>
          <Input type="time" value={v.breakIn} onChange={set('breakIn')} />
        </FormField>
        <FormField label="PM time out" hint="Earlier than AM in = next day">
          <Input type="time" value={v.timeOut} onChange={set('timeOut')} />
        </FormField>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {onReset && (
          <Button type="button" size="sm" variant="ghost" onClick={onReset}>
            Reset to file
          </Button>
        )}
        <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" size="sm" disabled={invalid} onClick={() => onSave(v)}>
          Save changes
        </Button>
      </div>
    </div>
  )
}
