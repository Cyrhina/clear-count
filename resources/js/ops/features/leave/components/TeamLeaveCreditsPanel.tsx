import { useMemo, useState } from 'react'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FilterField } from '@ops/components/ui/FiltersPopover'
import { SearchFilterBar } from '@ops/components/ui/SearchFilterBar'
import { Select } from '@ops/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useLeaveBalances } from '@ops/features/leave/hooks/useLeaveData'
import type { Employee, LeaveType } from '@ops/types/domain'

const ALL = 'all'
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

/** Leave credits of every team member — credits, used and remaining (available) days per leave type. View only. */
export function TeamLeaveCreditsPanel({ employees, leaveTypes }: { employees: Employee[]; leaveTypes: LeaveType[] }) {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState(ALL)
  const { balanceOf } = useLeaveBalances()

  const people = useMemo(() => employees.filter((e) => e.employment.status === 'active'), [employees])
  const departments = useMemo(() => [...new Set(people.map((e) => e.employment.department))].sort(), [people])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return people
      .filter((e) => (department === ALL || e.employment.department === department) && (!q || `${e.personal.firstName} ${e.personal.lastName} ${e.employeeNumber}`.toLowerCase().includes(q)))
      .map((e) => {
        const balances = leaveTypes.map((lt) => ({ type: lt, ...balanceOf(e.id, lt.id) }))
        return { employee: e, balances, remaining: balances.reduce((sum, b) => sum + b.remaining, 0) }
      })
      .sort((a, b) => `${a.employee.personal.lastName}${a.employee.personal.firstName}`.localeCompare(`${b.employee.personal.lastName}${b.employee.personal.firstName}`))
  }, [people, leaveTypes, search, department, balanceOf])

  return (
    <div className="space-y-4">
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search employee or ID…"
        activeCount={department !== ALL ? 1 : 0}
        onClear={() => {
          setSearch('')
          setDepartment(ALL)
        }}
        trailing={`${rows.length} of ${people.length} employees`}
        filters={
          <FilterField label="Department">
            <Select value={department} onValueChange={setDepartment} options={[{ value: ALL, label: 'All departments' }, ...departments.map((d) => ({ value: d, label: d }))]} />
          </FilterField>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="No employees match these filters" />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                {leaveTypes.map((lt) => (
                  <TableHead key={lt.id} className="text-right">
                    {lt.name}
                  </TableHead>
                ))}
                <TableHead className="text-right">Total Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ employee, balances, remaining }) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <p className="text-sm font-medium">
                      {employee.personal.firstName} {employee.personal.lastName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{employee.employeeNumber}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{employee.employment.department}</TableCell>
                  {balances.map((b) => (
                    <TableCell key={b.type.id} className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{fmt(b.remaining)} left</p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {fmt(b.credits)} credits · {fmt(b.used)} used
                      </p>
                    </TableCell>
                  ))}
                  <TableCell className="text-right text-sm font-semibold tabular-nums">{fmt(remaining)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
