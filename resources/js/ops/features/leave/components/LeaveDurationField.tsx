import { FormField } from '@ops/components/ui/FormField'
import { Select } from '@ops/components/ui/Select'
import type { LeaveDayPortion } from '@ops/types/domain'

const OPTIONS: { value: LeaveDayPortion; label: string }[] = [
  { value: 'full', label: 'Full day(s)' },
  { value: 'half_am', label: 'Half day – morning (AM)' },
  { value: 'half_pm', label: 'Half day – afternoon (PM)' },
]

/** Full day(s) or a half day. A half day is a single date and uses 0.5 of the employee's leave credits. */
export function LeaveDurationField({ value, onChange }: { value: LeaveDayPortion; onChange: (value: LeaveDayPortion) => void }) {
  return (
    <FormField label="Duration" className="col-span-2" hint={value === 'full' ? undefined : 'A half day covers a single date and uses 0.5 day of leave credits.'}>
      <Select value={value} onValueChange={(v) => onChange(v as LeaveDayPortion)} options={OPTIONS} />
    </FormField>
  )
}
