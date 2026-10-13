import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Button } from '@ops/components/ui/Button'
import { FilterField, FiltersPopover, SortControl, type SortDirection } from '@ops/components/ui/FiltersPopover'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useBranches, useDepartments } from '@ops/features/branches/hooks/useBranches'
import { AddEmployeeDialog } from '@ops/features/employees/components/AddEmployeeDialog'
import { BulkEmployeeActions } from '@ops/features/employees/components/BulkEmployeeActions'
import { ImportEmployeesDialog } from '@ops/features/employees/components/ImportEmployeesDialog'
import { EmployeeTable } from '@ops/features/employees/components/EmployeeTable'
import { useEmployeeList } from '@ops/features/employees/hooks/useEmployeeRecords'
import type { EmployeeListParams } from '@ops/features/employees/types'
import { usePermission } from '@ops/hooks/usePermission'
import { useRowSelection } from '@ops/hooks/useRowSelection'
import { apiErrorMessage } from '@ops/lib/api/http'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
]

/** Sort options of the screen, mapped to the columns the server sorts by. "Date hired" is the date the record was added. */
const SORT_COLUMN: Record<string, NonNullable<EmployeeListParams['sort']>> = { name: 'name', department: 'department', hired: 'created_at' }
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'department', label: 'Department' },
  { value: 'hired', label: 'Date added' },
]

const PAGE_SIZE = 25

export function EmployeeListPage() {
  const { branches } = useBranches()
  const { departments } = useDepartments()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('active')
  const [branchId, setBranchId] = useState('all')
  const [department, setDepartment] = useState('all')
  const [page, setPage] = useState(1)
  // The dashboard's "Recent Employees" links here with ?sort=hired&dir=desc to show the newest hires first.
  const [searchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState(() => (searchParams.get('sort') && SORT_COLUMN[searchParams.get('sort')!] ? (searchParams.get('sort') as string) : 'name'))
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => (searchParams.get('dir') === 'desc' ? 'desc' : 'asc'))

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Any change to what is shown starts again from the first page.
  useEffect(() => setPage(1), [debouncedSearch, status, branchId, department, sortBy, sortDirection])

  const { employees, total, lastPage, isLoading, error, refetch } = useEmployeeList({
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    branchId: branchId === 'all' ? undefined : branchId,
    department: department === 'all' ? undefined : department,
    sort: SORT_COLUMN[sortBy],
    direction: sortDirection,
    page,
    perPage: PAGE_SIZE,
  })

  const branchOptions = useMemo(() => [{ value: 'all', label: 'All branches' }, ...branches.map((b) => ({ value: b.id, label: b.name }))], [branches])
  const departmentOptions = useMemo(() => {
    const unique = Array.from(new Set(departments.map((d) => d.name))).sort()
    return [{ value: 'all', label: 'All departments' }, ...unique.map((d) => ({ value: d, label: d }))]
  }, [departments])

  const activeFilterCount = [status !== 'active', branchId !== 'all', department !== 'all'].filter(Boolean).length
  const hasActiveFilters = search.trim() !== '' || activeFilterCount > 0

  function resetFilters() {
    setSearch('')
    setStatus('active')
    setBranchId('all')
    setDepartment('all')
  }

  const canManageRoster = usePermission('employees.edit')
  const canBulkEdit = canManageRoster || usePermission('settings.payroll.edit')
  // Selection covers the page on screen.
  const selection = useRowSelection(useMemo(() => employees.map((e) => e.id), [employees]))

  return (
    <div className="space-y-5">
      <PageHeader
        title={canManageRoster ? 'Employees' : 'My Team'}
        description={canManageRoster ? 'View, add, and manage everyone on the company roster.' : 'Your team — their positions, departments, schedules, and attendance.'}
        actions={
          canManageRoster && (
            <div className="flex items-center gap-2">
              <ImportEmployeesDialog />
              <AddEmployeeDialog />
            </div>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, ID, department…" className="pl-9" />
        </div>
        <FiltersPopover
          activeCount={activeFilterCount}
          footer={
            hasActiveFilters && (
              <Button size="sm" variant="ghost" icon={<X className="size-3.5" />} onClick={resetFilters}>
                Clear Filters
              </Button>
            )
          }
        >
          <FilterField label="Status">
            <Select value={status} onValueChange={setStatus} options={STATUS_OPTIONS} />
          </FilterField>
          <FilterField label="Department">
            <Select value={department} onValueChange={setDepartment} options={departmentOptions} />
          </FilterField>
          <FilterField label="Branch">
            <Select value={branchId} onValueChange={setBranchId} options={branchOptions} />
          </FilterField>
          <SortControl value={sortBy} onValueChange={setSortBy} options={SORT_OPTIONS} direction={sortDirection} onDirectionChange={setSortDirection} />
        </FiltersPopover>
        <p className="ml-auto self-center text-sm text-muted-foreground">
          {total} employee{total === 1 ? '' : 's'}
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{apiErrorMessage(error)}</p>
      ) : isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <EmployeeTable employees={employees} branches={branches} selection={canBulkEdit ? selection : undefined} />
      )}

      {canBulkEdit && <BulkEmployeeActions selected={[...selection.selected]} employees={employees} departments={departmentOptions.slice(1).map((o) => o.value)} onClear={selection.clear} onDone={refetch} />}

      {lastPage > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="secondary" icon={<ChevronLeft className="size-4" />} disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {lastPage}
          </span>
          <Button size="sm" variant="secondary" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
