import { useMemo, useState } from 'react'
import { Checkbox } from '@ops/components/ui/Checkbox'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useTenant } from '@ops/hooks/useTenant'
import { cn } from '@ops/lib/utils/cn'
import type { Employee } from '@ops/types/domain'

const fullName = (e: Employee) => `${e.personal.firstName} ${e.personal.lastName}`

/**
 * Pick employees in bulk: branch → department → search, then tick them one by one or "Select all shown".
 * Controlled — the caller owns the selection. `isDisabled` greys out rows that can't be picked (already
 * enrolled, etc.) and "Select all shown" skips them.
 */
export function EmployeePickerPanel({
  employees,
  value,
  onChange,
  isDisabled,
  disabledLabel = 'Unavailable',
  maxHeightClass = 'max-h-48',
}: {
  employees: Employee[]
  value: string[]
  onChange: (ids: string[]) => void
  isDisabled?: (employee: Employee) => boolean
  disabledLabel?: string | ((employee: Employee) => string)
  maxHeightClass?: string
}) {
  const { branches } = useTenant()
  const [branchId, setBranchId] = useState('all')
  const [department, setDepartment] = useState('all')
  const [search, setSearch] = useState('')
  const selected = useMemo(() => new Set(value), [value])

  const departments = useMemo(() => [...new Set(employees.filter((e) => branchId === 'all' || e.branchId === branchId).map((e) => e.employment.department))].sort(), [employees, branchId])
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return employees.filter(
      (e) =>
        (branchId === 'all' || e.branchId === branchId) &&
        (department === 'all' || e.employment.department === department) &&
        (!q || `${fullName(e)} ${e.employeeNumber}`.toLowerCase().includes(q)),
    )
  }, [employees, branchId, department, search])
  const pickable = visible.filter((e) => !isDisabled?.(e))
  const allShownPicked = pickable.length > 0 && pickable.every((e) => selected.has(e.id))

  const toggle = (id: string, on: boolean) => onChange(on ? [...new Set([...value, id])] : value.filter((v) => v !== id))
  const selectAllShown = () => onChange([...new Set([...value, ...pickable.map((e) => e.id)])])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
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

      <div>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className="text-xs font-semibold">Employees ({selected.size} selected)</p>
          <div className="flex gap-3 text-xs">
            <button type="button" className="text-primary hover:underline disabled:opacity-50" disabled={pickable.length === 0 || allShownPicked} onClick={selectAllShown}>
              Select all shown ({pickable.length})
            </button>
            <button type="button" className="text-muted-foreground hover:underline" onClick={() => onChange([])}>
              Clear
            </button>
          </div>
        </div>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee…" aria-label="Search employees" />
        <div className={cn('mt-3 divide-y divide-border/50 overflow-auto rounded-lg border border-border', maxHeightClass)}>
          {visible.map((e) => {
            const disabled = isDisabled?.(e) ?? false
            return (
              <label key={e.id} className={cn('flex items-center gap-3 px-3 py-2.5 text-sm sm:py-2', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-muted/50')}>
                <Checkbox checked={selected.has(e.id)} disabled={disabled} onCheckedChange={(v) => toggle(e.id, v === true)} />
                <span className="min-w-0 flex-1 sm:flex-none">
                  <span className="block truncate font-medium sm:inline">{fullName(e)}</span>
                  <span className="block truncate text-xs text-muted-foreground sm:ml-2 sm:inline">
                    {e.employeeNumber} · {e.employment.department}
                  </span>
                </span>
                {disabled && <span className="ml-auto text-xs text-warning">{typeof disabledLabel === 'function' ? disabledLabel(e) : disabledLabel}</span>}
              </label>
            )
          })}
          {visible.length === 0 && <p className="px-3 py-4 text-center text-xs text-muted-foreground">No employees match.</p>}
        </div>
      </div>
    </div>
  )
}
