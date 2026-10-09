import { AlertTriangle, Home, Plane } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { AdjustmentRequestDialog } from '@ops/features/attendance/components/AdjustmentRequestDialog'
import { lateOrdinal } from '@ops/features/attendance/lateCycle'
import type { LeaveResolution } from '@ops/features/attendance/leaveStatus'
import { formatDate } from '@ops/lib/utils/format'
import { usePermission } from '@ops/hooks/usePermission'
import type { AttendanceRecord, Employee } from '@ops/types/domain'

export function DailyAttendanceTable({
  records,
  employees,
  leaveResolutions,
  lateDates,
  onAdjustmentCreated,
}: {
  records: AttendanceRecord[]
  employees: Employee[]
  /** Approved-leave status per employee for this date (overrides Absent). */
  leaveResolutions?: Map<string, LeaveResolution>
  /** Late dates per employee, for the "Late #n" count. */
  lateDates?: Map<string, string[]>
  onAdjustmentCreated: () => void
}) {
  const canAdjust = usePermission('attendance.adjust')
  const [adjusting, setAdjusting] = useState<AttendanceRecord | null>(null)

  const employeeById = new Map(employees.map((e) => [e.id, e]))

  if (records.length === 0) {
    return <EmptyState title="No attendance recorded for this date" description="Try a different date or check back tomorrow." />
  }

  // Where the day was worked, when it was not onsite.
  function workTypeBadge(record: AttendanceRecord) {
    if (record.workType !== 'wfh' && record.workType !== 'field') return null
    return (
      <Badge tone="brand" className="gap-1 whitespace-nowrap">
        <Home className="size-3" />
        {record.workType === 'wfh' ? 'WFH' : 'Field'}
        {record.autoRecorded && ' · auto'}
      </Badge>
    )
  }

  // "Late #3" — which late this is in the employee's current cycle (a cycle starts on their first late and lasts a year).
  function lateNote(record: AttendanceRecord) {
    const o = record.status === 'late' ? lateOrdinal(lateDates?.get(record.employeeId), record.date) : undefined
    return o ? (
      <p className="text-[11px] font-medium text-warning" title={`Counting since ${formatDate(o.cycle.start)}, resets after ${formatDate(o.cycle.end)}`}>
        Late #{o.n} this cycle
      </p>
    ) : null
  }

  // Status for one record: the approved-leave resolution when there is one, otherwise the recorded attendance status.
  function statusBlock(record: AttendanceRecord, leave: LeaveResolution | undefined) {
    return leave ? (
      <div className="space-y-0.5">
        <Badge tone="brand" className="gap-1 whitespace-nowrap">
          <Plane className="size-3" />
          {leave.label}
        </Badge>
        <p className="text-[11px] text-muted-foreground">{leave.leaveLabel}</p>
        {leave.detail && <p className="text-[11px] text-muted-foreground">{leave.detail}</p>}
        {leave.review && (
          <p className="flex max-w-72 items-start gap-1 text-[11px] font-medium text-warning">
            <AlertTriangle className="mt-px size-3 shrink-0" />
            Review: {leave.review}
          </p>
        )}
      </div>
    ) : (
      <div className="space-y-0.5">
        <StatusBadge status={record.status} />
        {workTypeBadge(record)}
        {lateNote(record)}
      </div>
    )
  }

  return (
    <>
      {/* Phones and tablets: one card per employee — one column on phones, two on tablets. */}
      <div className="space-y-2.5 sm:block sm:columns-2 sm:gap-2.5 sm:space-y-0 lg:hidden">
        {records.map((record) => {
          const employee = employeeById.get(record.employeeId)
          if (!employee) return null
          const leave = leaveResolutions?.get(record.employeeId)
          const isLeaveOnlyRow = record.id.startsWith('leave-')
          const canRequest = canAdjust && record.status !== 'present' && !isLeaveOnlyRow && (!leave || leave.review)
          return (
            <Card key={record.id} watermark={null} className="p-4 sm:mb-2.5 sm:break-inside-avoid">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">
                    {employee.personal.firstName} {employee.personal.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{employee.employeeNumber}</p>
                </div>
                <div className="shrink-0">
                  {leave ? (
                    <Badge tone="brand" className="gap-1 whitespace-nowrap">
                      <Plane className="size-3" />
                      {leave.label}
                    </Badge>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={record.status} />
                      {workTypeBadge(record)}
                    </div>
                  )}
                </div>
              </div>
              {leave && (
                <div className="mt-2 space-y-0.5">
                  <p className="text-xs text-muted-foreground">{leave.leaveLabel}</p>
                  {leave.detail && <p className="text-xs text-muted-foreground">{leave.detail}</p>}
                  {leave.review && (
                    <p className="flex items-start gap-1 text-xs font-medium text-warning">
                      <AlertTriangle className="mt-px size-3 shrink-0" />
                      Review: {leave.review}
                    </p>
                  )}
                </div>
              )}
              <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">AM In</dt>
                  <dd className="tabular-nums">{record.timeIn ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">AM Out</dt>
                  <dd className="tabular-nums">{record.breakOut ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">PM In</dt>
                  <dd className="tabular-nums">{record.breakIn ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">PM Out</dt>
                  <dd className="tabular-nums">{record.timeOut ?? '—'}</dd>
                </div>
              </dl>
              {canRequest && (
                <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => setAdjusting(record)}>
                  Request Adjustment
                </Button>
              )}
            </Card>
          )
        })}
      </div>

      <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>AM In</TableHead>
            <TableHead>AM Out</TableHead>
            <TableHead>PM In</TableHead>
            <TableHead>PM Out</TableHead>
            <TableHead>Status</TableHead>
            {canAdjust && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const employee = employeeById.get(record.employeeId)
            if (!employee) return null
            const leave = leaveResolutions?.get(record.employeeId)
            // Rows added only to show an employee's leave have no punch record to adjust.
            const isLeaveOnlyRow = record.id.startsWith('leave-')
            return (
              <TableRow key={record.id}>
                <TableCell>
                  <p className="text-sm font-medium">
                    {employee.personal.firstName} {employee.personal.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{employee.employeeNumber}</p>
                </TableCell>
                <TableCell className="tabular-nums">{record.timeIn ?? '—'}</TableCell>
                <TableCell className="tabular-nums">{record.breakOut ?? '—'}</TableCell>
                <TableCell className="tabular-nums">{record.breakIn ?? '—'}</TableCell>
                <TableCell className="tabular-nums">{record.timeOut ?? '—'}</TableCell>
                <TableCell>
                  {statusBlock(record, leave)}
                </TableCell>
                {canAdjust && (
                  <TableCell>
                    {record.status !== 'present' && !isLeaveOnlyRow && (!leave || leave.review) && (
                      <Button size="sm" variant="secondary" onClick={() => setAdjusting(record)}>
                        Request Adjustment
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      </div>

      <AdjustmentRequestDialog
        record={adjusting}
        employeeName={
          adjusting ? `${employeeById.get(adjusting.employeeId)?.personal.firstName ?? ''} ${employeeById.get(adjusting.employeeId)?.personal.lastName ?? ''}` : ''
        }
        onOpenChange={(open) => !open && setAdjusting(null)}
        onCreated={onAdjustmentCreated}
      />
    </>
  )
}
