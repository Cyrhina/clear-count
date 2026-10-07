import { useEffect, useState } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useSession } from '@ops/hooks/useSession'
import { getEmployeeAttendanceSummary } from '@ops/lib/services/managerService'
import type { EmployeeAttendanceSummary } from '@ops/lib/services/managerService'
import { formatDate } from '@ops/lib/utils/format'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TONE = { present: 'success', late: 'warning', undertime: 'neutral', absent: 'danger' } as const

/** Work schedule and the last 30 days of attendance for one employee — the "attendance summary" on a team member's profile. */
export function AttendanceSummaryTab({ employeeId }: { employeeId: string }) {
  const { user } = useSession()
  const [summary, setSummary] = useState<EmployeeAttendanceSummary | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    setSummary(undefined)
    getEmployeeAttendanceSummary(user, employeeId).then((result) => {
      if (!cancelled) setSummary(result ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [user, employeeId])

  if (summary === undefined) return <Skeleton className="h-48" />
  if (summary === null) return <EmptyState title="Attendance isn't available for this employee" />

  const tiles = [
    { label: 'Present', value: summary.present },
    { label: 'Late', value: summary.late },
    { label: 'Undertime', value: summary.undertime },
    { label: 'Absent', value: summary.absent },
  ]

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <Card.Title>Work Schedule</Card.Title>
        {summary.schedule ? (
          <p className="mt-2 text-sm">
            <span className="font-medium">{summary.schedule.name}</span> · {summary.schedule.startTime} – {summary.schedule.endTime} · {summary.schedule.daysOfWeek.map((d) => DAY_NAMES[d]).join(', ')}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No work schedule assigned yet.</p>
        )}
      </Card>

      <Card className="p-5">
        <Card.Title>Last 30 Days</Card.Title>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-xl border border-border px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.label}</p>
              <p className="font-display text-xl font-semibold tabular-nums">{t.value}</p>
            </div>
          ))}
        </div>
        {summary.recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No attendance records in this period.</p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead>Time Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.recent.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{formatDate(r.date)}</TableCell>
                  <TableCell className="tabular-nums">{r.timeIn ?? '—'}</TableCell>
                  <TableCell className="tabular-nums">{r.timeOut ?? '—'}</TableCell>
                  <TableCell>
                    <Badge tone={TONE[r.status as keyof typeof TONE] ?? 'neutral'} className="capitalize">
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
