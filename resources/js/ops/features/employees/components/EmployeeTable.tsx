import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@ops/components/ui/Avatar'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { SEPARATION_LABEL } from '@ops/lib/services/employeeService'
import { RowCheckbox, SelectAllCheckbox } from '@ops/components/ui/SelectCheckboxes'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { usePermission } from '@ops/hooks/usePermission'
import { useMixedCompensationStore, summarizeMixedCompensationShort } from '@ops/features/employees/mixedCompensationStore'
import { formatBaseRateShort } from '@ops/lib/payroll/payRate'
import type { Employee } from '@ops/types/domain'

export interface EmployeeSelection {
  selected: Set<string>
  toggle: (id: string, checked: boolean) => void
  toggleAll: (checked: boolean) => void
  headerState: boolean | 'indeterminate'
}

export function EmployeeTable({ employees, branches, selection }: { employees: Employee[]; branches: { id: string; name: string }[]; selection?: EmployeeSelection }) {
  const navigate = useNavigate()
  const mixedStructures = useMixedCompensationStore((s) => s.structures)
  const canViewPay = usePermission('employees.pay.view')

  const allColumns: ColumnDef<Employee, unknown>[] = [
    {
      id: 'name',
      header: 'Employee',
      cell: ({ row }) => {
        const e = row.original
        const fullName = `${e.personal.firstName} ${e.personal.lastName}`
        return (
          <div className="flex items-center gap-3">
            <Avatar name={fullName} size="sm" />
            <div>
              <p className="text-sm font-medium leading-tight">{fullName}</p>
              <p className="text-xs leading-tight text-muted-foreground">{e.employeeNumber}</p>
            </div>
          </div>
        )
      },
    },
    {
      id: 'department',
      header: 'Department',
      accessorFn: (e) => e.employment.department,
    },
    {
      id: 'position',
      header: 'Position',
      accessorFn: (e) => e.employment.position,
    },
    {
      id: 'branch',
      header: 'Branch',
      cell: ({ row }) => branches.find((b) => b.id === row.original.branchId)?.name ?? '—',
    },
    {
      id: 'baseRate',
      header: 'Base Rate',
      cell: ({ row }) => {
        const mixed = mixedStructures[row.original.id]
        if (mixed) return <span className="tabular-nums">{summarizeMixedCompensationShort(mixed)}</span>
        const { basicPay, payType, outputUnit } = row.original.compensation
        return <span className="tabular-nums">{formatBaseRateShort(payType, basicPay, outputUnit)}</span>
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { dateSeparated, separationReason, status } = row.original.employment
        return dateSeparated && separationReason ? <Badge tone="danger">{SEPARATION_LABEL[separationReason]}</Badge> : <StatusBadge status={status} />
      },
    },
    {
      id: 'actions',
      header: '',
      cell: () => <ChevronRight className="size-4 text-muted-foreground" />,
    },
  ]

  // Pay rates are only shown to roles that may see pay details (managers see their team without them).
  const columns = allColumns.filter((c) => canViewPay || c.id !== 'baseRate')

  const table = useReactTable({
    data: employees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (employees.length === 0) {
    return <EmptyState title="No employees match these filters" description="Try clearing a filter or add a new employee." />
  }

  const baseRateLabel = (e: Employee) => {
    const mixed = mixedStructures[e.id]
    if (mixed) return summarizeMixedCompensationShort(mixed)
    return formatBaseRateShort(e.compensation.payType, e.compensation.basicPay, e.compensation.outputUnit)
  }

  return (
    <>
      {/* Phones and tablets: one card per employee — one column on phones, two on tablets. */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:hidden">
        {selection && (
          <label className="flex w-fit items-center gap-2 px-1 text-xs text-muted-foreground sm:col-span-2">
            <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} label="Select all employees" />
            Select all
          </label>
        )}
        {employees.map((e) => {
          const fullName = `${e.personal.firstName} ${e.personal.lastName}`
          const { dateSeparated, separationReason, status } = e.employment
          return (
            <Card key={e.id} watermark={null} className="h-full cursor-pointer p-4 transition-colors hover:bg-muted/30" onClick={() => navigate(`/employees/${e.id}`)}>
              <div className="flex items-start gap-3">
                {selection && (
                  <div className="pt-1" onClick={(event) => event.stopPropagation()}>
                    <RowCheckbox checked={selection.selected.has(e.id)} onChange={(c) => selection.toggle(e.id, c)} label={fullName} />
                  </div>
                )}
                <Avatar name={fullName} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold leading-tight">{fullName}</p>
                      <p className="text-xs text-muted-foreground">{e.employeeNumber}</p>
                    </div>
                    {dateSeparated && separationReason ? <Badge tone="danger">{SEPARATION_LABEL[separationReason]}</Badge> : <StatusBadge status={status} />}
                  </div>
                  <p className="mt-2 text-sm">{e.employment.position}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.employment.department} · {branches.find((b) => b.id === e.branchId)?.name ?? '—'}
                  </p>
                  {canViewPay && <p className="mt-1.5 text-xs font-medium tabular-nums">{baseRateLabel(e)}</p>}
                </div>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
              </div>
            </Card>
          )
        })}
      </div>

      <div className="hidden lg:block">
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {selection && (
              <TableHead className="w-10">
                <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} label="Select all employees" />
              </TableHead>
            )}
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            className="cursor-pointer"
            onClick={() => navigate(`/employees/${row.original.id}`)}
          >
            {selection && (
              <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                <RowCheckbox checked={selection.selected.has(row.original.id)} onChange={(c) => selection.toggle(row.original.id, c)} label={`${row.original.personal.firstName} ${row.original.personal.lastName}`} />
              </TableCell>
            )}
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
      </div>
    </>
  )
}
