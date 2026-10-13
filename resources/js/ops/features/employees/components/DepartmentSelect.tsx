import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Select } from '@ops/components/ui/Select'
import { useDepartments } from '@ops/features/branches/hooks/useBranches'

/**
 * Department picker limited to the departments configured for a branch (Branches → Departments).
 * A value that isn't configured (older records) stays selectable and is marked, so editing never silently drops it.
 */
export function DepartmentSelect({ branchId, value, onChange, disabled }: { branchId: string | undefined; value: string | undefined; onChange: (department: string) => void; disabled?: boolean }) {
  const { departments: all, isLoading } = useDepartments()
  const departments = isLoading ? null : all.filter((d) => d.branchId === branchId)

  const options = useMemo(() => {
    const list = (departments ?? []).map((d) => ({ value: d.name, label: d.name }))
    if (value && !list.some((o) => o.value === value)) list.push({ value, label: `${value} (not set up for this branch)` })
    return list
  }, [departments, value])

  const none = !!branchId && departments !== null && departments.length === 0

  return (
    <div className="space-y-1">
      <Select
        value={value || undefined}
        onValueChange={onChange}
        options={options}
        placeholder={!branchId ? 'Choose a branch first' : none ? 'No departments set up' : 'Select department'}
        disabled={disabled || !branchId || options.length === 0}
        aria-label="Department"
      />
      {none && (
        <p className="text-xs text-muted-foreground">
          This branch has no departments yet. Add them under{' '}
          <Link to="/branches" className="font-medium text-primary hover:underline">
            Branches
          </Link>
          .
        </p>
      )}
    </div>
  )
}
