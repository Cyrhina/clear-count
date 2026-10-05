import { AlertTriangle, CalendarOff, Info, Plane } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Checkbox } from '@ops/components/ui/Checkbox'
import { Select } from '@ops/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import type { ScheduleReviewRow } from '@ops/features/attendance/scheduleReview'
import { cn } from '@ops/lib/utils/cn'
import { formatDate } from '@ops/lib/utils/format'
import type { Schedule } from '@ops/types/domain'

const STATUS_TONE: Record<ScheduleReviewRow['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
  present: 'success',
  late: 'warning',
  undertime: 'warning',
  absent: 'danger',
}

const weekday = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })

/**
 * Review table for schedule-based imports: each day is shown against the employee's schedule with its
 * discrepancies. Rows that need review stay out of the import until someone approves them; the schedule
 * can be switched per row (manager-assigned or shifting schedules) and everything is re-checked.
 */
export function ScheduleReviewTable({
  rows,
  schedules,
  isIncluded,
  onToggle,
  onOverride,
  hasLeave,
}: {
  rows: ScheduleReviewRow[]
  schedules: Schedule[]
  isIncluded: (row: ScheduleReviewRow) => boolean
  onToggle: (key: string, include: boolean) => void
  onOverride: (key: string, scheduleId: string) => void
  hasLeave: (key: string) => boolean
}) {
  const [onlyReview, setOnlyReview] = useState(false)
  const flagged = rows.filter((r) => r.needsReview && r.applicable)
  const visible = onlyReview ? rows.filter((r) => r.needsReview) : rows
  const scheduleOptions = schedules.map((s) => ({ value: s.id, label: `${s.name} · ${s.startTime}–${s.endTime}` }))

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2 text-xs">
        <label className="inline-flex cursor-pointer items-center gap-2 font-medium">
          <Checkbox checked={onlyReview} onCheckedChange={(v) => setOnlyReview(v === true)} />
          Show only rows that need review ({rows.filter((r) => r.needsReview).length})
        </label>
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="ghost" disabled={flagged.length === 0} onClick={() => flagged.forEach((r) => onToggle(r.key, true))}>
            Approve all flagged
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={flagged.length === 0} onClick={() => flagged.forEach((r) => onToggle(r.key, false))}>
            Exclude all flagged
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Employee</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="min-w-52">Schedule</TableHead>
            <TableHead>Punches</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((row) => {
            const included = isIncluded(row)
            return (
              <TableRow key={row.key} className={cn(!included && 'opacity-70')}>
                <TableCell className="align-top">
                  <Checkbox checked={included} disabled={!row.applicable} onCheckedChange={(v) => onToggle(row.key, v === true)} aria-label={`Include ${row.record.employeeName} on ${row.record.date}`} />
                </TableCell>
                <TableCell className="align-top">
                  <p className="font-medium">{row.record.employeeName}</p>
                  <p className="text-xs text-muted-foreground">{row.record.employeeNumber}</p>
                </TableCell>
                <TableCell className="whitespace-nowrap align-top">
                  {formatDate(row.record.date)}
                  <p className="text-xs text-muted-foreground">{weekday(row.record.date)}</p>
                </TableCell>
                <TableCell className="align-top">
                  {schedules.length > 0 ? (
                    <Select value={row.schedule?.id} onValueChange={(id) => onOverride(row.key, id)} options={scheduleOptions} className="h-8 text-xs" aria-label="Schedule for this day" />
                  ) : (
                    <span className="text-xs text-muted-foreground">No schedules set up</span>
                  )}
                  {row.scheduleSource === 'override' && <p className="mt-0.5 text-[11px] text-primary">Changed for this import</p>}
                  {row.scheduleSource === 'roster' && <p className="mt-0.5 text-[11px] text-muted-foreground">From the Schedules roster</p>}
                </TableCell>
                <TableCell className="whitespace-nowrap align-top tabular-nums">
                  {row.timeIn ?? '—'} – {row.timeOut ?? '—'}
                  {row.record.punchCount > 0 && <p className="text-xs text-muted-foreground">{row.record.punchCount} punch{row.record.punchCount === 1 ? '' : 'es'}</p>}
                </TableCell>
                <TableCell className="whitespace-normal align-top">
                  <div className="flex flex-wrap items-center gap-1">
                    {row.isRestDay ? <Badge tone="warning">Rest day</Badge> : <Badge tone={STATUS_TONE[row.status]} className="capitalize">{row.status}</Badge>}
                    {row.needsReview && <Badge tone="danger">Needs review</Badge>}
                    {hasLeave(row.key) && (
                      <Badge tone="brand" className="gap-1">
                        <Plane className="size-3" />
                        Leave
                      </Badge>
                    )}
                  </div>
                  {row.discrepancies.map((d) => (
                    <p key={d.code + d.message} className={cn('mt-1 flex max-w-72 items-start gap-1 text-[11px]', d.severity === 'review' ? 'font-medium text-warning' : 'text-muted-foreground')}>
                      {d.severity === 'review' ? <AlertTriangle className="mt-px size-3 shrink-0" /> : <Info className="mt-px size-3 shrink-0" />}
                      {d.message}
                    </p>
                  ))}
                  {row.discrepancies.length === 0 && <p className="mt-1 text-[11px] text-muted-foreground">Matches the schedule</p>}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {visible.length === 0 && (
        <p className="flex items-center justify-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
          <CalendarOff className="size-4" />
          Nothing to review.
        </p>
      )}
    </>
  )
}
