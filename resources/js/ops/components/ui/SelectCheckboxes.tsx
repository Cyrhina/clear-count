import { Checkbox } from '@ops/components/ui/Checkbox'

export function SelectAllCheckbox({ state, onChange, disabled, label = 'Select all' }: { state: boolean | 'indeterminate'; onChange: (checked: boolean) => void; disabled?: boolean; label?: string }) {
  return <Checkbox aria-label={label} checked={state} disabled={disabled} onCheckedChange={(v) => onChange(v === true)} />
}

export function RowCheckbox({ checked, onChange, label, disabled }: { checked: boolean; onChange: (checked: boolean) => void; label: string; disabled?: boolean }) {
  return <Checkbox aria-label={`Select ${label}`} checked={checked} disabled={disabled} onCheckedChange={(v) => onChange(v === true)} />
}
