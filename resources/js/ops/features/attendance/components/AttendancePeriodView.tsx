import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useLateCounting } from '@ops/features/attendance/hooks/useLateCounting'
import { lateDatesByEmployee } from '@ops/features/attendance/lateCycle'
import { dayMonth, fromDateKey, monthDays, rangeLabel, shiftAnchor, todayKey, viewRange, weekDays } from '@ops/features/schedules/dateUtil'
import { useSession } from '@ops/hooks/useSession'
import { cn } from '@ops/lib/utils/cn'
import { getApprovedLeavesInRange, getAttendanceRecords, getSchedules } from '@ops/lib/services/attendanceService'
import { formatDate } from '@ops/lib/utils/format'
import type { AttendanceRecord, Employee, Schedule } from '@ops/types/domain'

type DayCode = 'present' | 'late' | 'undertime' | 'absent' | 'leave' | 'rest' | 'none'

// Tones match StatusBadge (late = warning, absent = danger, undertime = neutral); leave matches the Daily tab's brand badge.
const CODES: Record<DayCode, { code: string; label: string; tone: 'success' | 'warning' | 'danger' | 'brand' | 'neutral'; plain?: boolean }> = {
  present: { code: 'P', label: 'Present', tone: 'success' },
  late: { code: 'L', label: 'Late', tone: 'warning' },
  undertime: { code: 'UT', label: 'Undertime', tone: 'neutral' },
  absent: { code: 'A', label: 'Absent', tone: 'danger' },
  leave: { code: 'LV', label: 'On leave', tone: 'brand' },
  rest: { code: 'R', label: 'Rest day', tone: 'neutral', plain: true },
  none: { code: '–', label: 'No record', tone: 'neutral', plain: true },
}
const TOTALS: DayCode[] = ['present', 'late', 'undertime', 'absent', 'leave']

function Cell({ code, title, className, wfh }: { code: DayCode; title?: string; className?: string; wfh?: boolean }) {
  const c = CODES[code]
  return (
    <Badge tone={c.tone} title={wfh ? `${title ?? c.label} (WFH)` : (title ?? c.label)} className={cn('min-w-7 justify-center rounded-md px-1 py-0.5 text-[11px]', c.plain && 'bg-transparent', wfh && 'ring-2 ring-primary', className)}>
      {c.code}
    </Badge>
  )
}

export function AttendancePeriodView({ employees }: { employees: Employee[] }) {
  const { user } = useSession()
  const [view, setView] = useState<'week' | 'month'>('week')
  const [anchor, setAnchor] = useState(todayKey)
  const [records, setRecords] = useState<AttendanceRecord[] | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [leaves, setLeaves] = useState<Awaited<ReturnType<typeof getApprovedLeavesInRange>>>([])
  const lateCounting = useLateCounting()

  const days = useMemo(() => (view === 'week' ? weekDays(anchor) : monthDays(anchor)), [view, anchor])
  const { from, to } = viewRange(anchor, view)

  useEffect(() => {
    getAttendanceRecords(user).then(setRecords)
    getSchedules(user).then(setSchedules)
  }, [user])
  useEffect(() => {
    getApprovedLeavesInRange(user, from, to).then(setLeaves)
  }, [user, from, to])

  const rows = useMemo(() => {
    const byKey = new Map((records ?? []).map((r) => [`${r.employeeId}|${r.date}`, r]))
    const lates = lateDatesByEmployee(records ?? [])
    return employees.map((employee) => {
      const schedule = schedules.find((s) => s.assignedEmployeeIds?.includes(employee.id))
      const myLeaves = leaves.filter((l) => l.request.employeeId === employee.id)
      const totals: Record<DayCode, number> = { present: 0, late: 0, undertime: 0, absent: 0, leave: 0, rest: 0, none: 0 }
      const cells = days.map((date) => {
        const record = byKey.get(`${employee.id}|${date}`)
        let code: DayCode
        if (myLeaves.some((l) => l.request.dateFrom <= date && date <= l.request.dateTo)) code = 'leave'
        else if (record) code = record.status
        else if (schedule && !schedule.daysOfWeek.includes(fromDateKey(date).getDay())) code = 'rest'
        else code = 'none'
        totals[code]++
        return { date, code, wfh: record?.workType === 'wfh' }
      })
      const cycle = lateCounting.cycles(employee.id, lates.get(employee.id)).at(-1)
      return { employee, cells, totals, cycle }
    })
  }, [records, schedules, leaves, employees, days, lateCounting])

  const name = (e: Employee) => `${e.personal.firstName} ${e.personal.lastName}`
  const cycleNote = (cycle: (typeof rows)[number]['cycle']) => (cycle ? `Late cycle: ${cycle.dates.length} since ${formatDate(cycle.start)}` : 'Late cycle: none')
  const dayLabel = (date: string) => `${dayMonth(date)} (${new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(fromDateKey(date))})`

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" aria-label="Previous" icon={<ChevronLeft className="size-4" />} onClick={() => setAnchor((a) => shiftAnchor(a, view, -1))} />
          <span className="min-w-40 text-center text-sm font-medium">{rangeLabel(anchor, view)}</span>
          <Button size="sm" variant="secondary" aria-label="Next" icon={<ChevronRight className="size-4" />} onClick={() => setAnchor((a) => shiftAnchor(a, view, 1))} />
          <Button size="sm" variant="ghost" onClick={() => setAnchor(todayKey())}>
            Today
          </Button>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(['week', 'month'] as const).map((v) => (
            <Button key={v} size="sm" variant={view === v ? 'primary' : 'ghost'} onClick={() => setView(v)} className="capitalize">
              {v === 'week' ? 'Week' : 'Month'}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground print:hidden">
        {(Object.keys(CODES) as DayCode[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1">
            <Cell code={k} /> {CODES[k].label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          <Badge tone="neutral" className="min-w-7 justify-center rounded-md px-1 py-0.5 text-[11px] ring-2 ring-primary">
            P
          </Badge>{' '}
          Ring = worked from home
        </span>
      </div>

      {records === null ? (
        <Skeleton className="h-72" />
      ) : rows.length === 0 ? (
        <EmptyState title="No employees match" description="Adjust the filters above." />
      ) : (
        <>
          {/* Phones and tablets: one card per employee — one column on phones, two from sm. */}
          <div className="grid gap-2.5 sm:grid-cols-2 lg:hidden print:hidden">
            {rows.map(({ employee, cells, totals, cycle }) => (
              <div key={employee.id} className="rounded-2xl border border-border bg-card p-3 shadow-soft">
                <p className="font-medium">{name(employee)}</p>
                <p className="text-xs text-muted-foreground">
                  {employee.employeeNumber} · {employee.employment.department}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {TOTALS.map((k) => (
                    <span key={k}>
                      <span className="text-muted-foreground">{CODES[k].code}</span> <span className="font-semibold">{totals[k]}</span>
                    </span>
                  ))}
                </div>
                <div className={cn('mt-2 flex flex-wrap gap-1', view === 'week' && 'grid grid-cols-7')}>
                  {cells.map(({ date, code, wfh }) =>
                    view === 'week' ? (
                      <div key={date} className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-muted-foreground">{dayLabel(date).slice(-4, -1)}</span>
                        <Cell code={code} wfh={wfh} title={`${dayLabel(date)}: ${CODES[code].label}`} className="w-full" />
                      </div>
                    ) : (
                      <Cell key={date} code={code} wfh={wfh} title={`${dayLabel(date)}: ${CODES[code].label}`} className="size-6 min-w-0 px-0 text-[10px]" />
                    ),
                  )}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{cycleNote(cycle)}</p>
              </div>
            ))}
          </div>

          {/* Desktop (and print): grid table; scrolls horizontally inside its own container only. */}
          <div className="hidden min-w-0 lg:block print:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 min-w-52 bg-muted">Employee</TableHead>
                  {days.map((date) => (
                    <TableHead key={date} className="px-1 text-center" title={dayLabel(date)}>
                      {view === 'week' ? dayLabel(date) : fromDateKey(date).getDate()}
                    </TableHead>
                  ))}
                  {TOTALS.map((k) => (
                    <TableHead key={k} className="px-2 text-center" title={CODES[k].label}>
                      {CODES[k].code}
                    </TableHead>
                  ))}
                  <TableHead className="whitespace-nowrap">Late cycle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ employee, cells, totals, cycle }) => (
                  <TableRow key={employee.id}>
                    <TableCell className="sticky left-0 z-10 bg-card">
                      <p className="whitespace-nowrap font-medium">{name(employee)}</p>
                      <p className="text-xs text-muted-foreground">{employee.employeeNumber}</p>
                    </TableCell>
                    {cells.map(({ date, code, wfh }) => (
                      <TableCell key={date} className="px-1 py-2 text-center">
                        <Cell code={code} wfh={wfh} title={`${dayLabel(date)}: ${CODES[code].label}`} />
                      </TableCell>
                    ))}
                    {TOTALS.map((k) => (
                      <TableCell key={k} className="px-2 text-center font-semibold">
                        {totals[k]}
                      </TableCell>
                    ))}
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{cycleNote(cycle)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
