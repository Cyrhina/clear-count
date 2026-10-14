import { PlanGate } from '@ops/components/ui/PlanGate'
import { useActivePlanTier } from '@ops/hooks/useActivePlanTier'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { RequestWfhDialog } from '@ops/features/ess/components/RequestWfhDialog'
import { WfhArrangementCards } from '@ops/features/ess/components/WfhArrangementCards'
import { useWfh } from '@ops/features/attendance/hooks/useWfh'
import { apiErrorMessage } from '@ops/lib/api/http'
import { cancelWfh } from '@ops/lib/services/wfhArrangementService'
import type { Employee } from '@ops/types/domain'
import { useToast } from '@ops/components/ui/Toast'
import { useSelfEmployee } from '@ops/features/ess/hooks/useSelfEmployee'
import { dayMonth, dayShort, fromDateKey, monthDays, rangeLabel, shiftAnchor, shiftRangeLabel, todayKey, viewRange, weekDays, type RosterView } from '@ops/features/schedules/dateUtil'
import { useRoster, type DayState } from '@ops/features/schedules/hooks/useRoster'
import { SHIFT_COLOR_CLASSES, colorFor } from '@ops/features/schedules/shiftColors'
import { cn } from '@ops/lib/utils/cn'

const VIEWS: { value: RosterView; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** The signed-in employee's own roster — shifts, rest days and approved leave — by week, month or year. */
export function EssSchedulePage() {
  const { tier } = useActivePlanTier()
  return (
    <PlanGate feature="schedules" planTier={tier}>
      <EssScheduleContent />
    </PlanGate>
  )
}

function EssScheduleContent() {
  const { employee, isLoading } = useSelfEmployee()
  if (isLoading) return <Skeleton className="h-72" />
  if (!employee) return <p className="text-sm text-muted-foreground">No employee record linked to this account.</p>
  return <EssScheduleView employee={employee} />
}

function EssScheduleView({ employee }: { employee: Employee }) {
  const [view, setView] = useState<RosterView>('week')
  const [anchor, setAnchor] = useState(todayKey())
  const range = viewRange(anchor, view)
  const roster = useRoster(range.from, range.to, employee)
  const today = todayKey()
  const { notify } = useToast()
  const { arrangements, refetch: loadWfh } = useWfh()
  const wfh = (arrangements ?? []).filter((a) => a.employeeId === employee.id)

  if (roster.isLoading) return <Skeleton className="h-72" />

  const stateFor = (date: string) => roster.stateFor(employee.id, date)
  const colorIndex = new Map(roster.templates.map((t, i) => [t.id, i]))
  const chip = (state: DayState) => {
    if (state.kind === 'shift') {
      const color = colorFor(state.schedule, colorIndex.get(state.schedule.id) ?? 0)
      return { label: shiftRangeLabel(state.schedule), title: state.schedule.name, cls: SHIFT_COLOR_CLASSES[color].cell }
    }
    if (state.kind === 'rest') return { label: 'Rest day', title: 'Rest day', cls: 'border-dashed border-border bg-muted/30 text-muted-foreground' }
    if (state.kind === 'leave') return { label: 'Leave', title: state.label, cls: 'border-danger/30 bg-danger/10 text-danger' }
    return { label: 'Not scheduled', title: 'No schedule yet', cls: 'border-dashed border-border text-muted-foreground' }
  }

  const days = weekDays(anchor)
  const monthList = monthDays(anchor)
  const leading = (fromDateKey(monthList[0]).getDay() + 6) % 7
  const year = fromDateKey(anchor).getFullYear()

  const summary = (dates: string[]) => {
    let working = 0
    let rest = 0
    let leave = 0
    for (const d of dates) {
      const kind = stateFor(d).kind
      if (kind === 'shift') working++
      else if (kind === 'rest') rest++
      else if (kind === 'leave') leave++
    }
    return { working, rest, leave }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="My Schedule" description="Your shifts, rest days and approved leave. Your manager or HR sets your schedule." actions={<RequestWfhDialog onRequested={loadWfh} />} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-lg border border-border bg-card">
          <Button type="button" variant="ghost" size="sm" aria-label="Previous" onClick={() => setAnchor(shiftAnchor(anchor, view, -1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-40 px-2 text-center text-sm font-medium tabular-nums">{rangeLabel(anchor, view)}</span>
          <Button type="button" variant="ghost" size="sm" aria-label="Next" onClick={() => setAnchor(shiftAnchor(anchor, view, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => setAnchor(today)}>
          Today
        </Button>
        <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 text-xs font-medium" role="group" aria-label="Schedule view">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setView(v.value)}
              className={cn('rounded-md px-3 py-1.5 transition-colors', view === v.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {roster.templates.map((t, i) => (
          <span key={t.id} className={cn('rounded-md border px-2 py-1 font-medium', SHIFT_COLOR_CLASSES[colorFor(t, i)].cell)}>
            {t.name} {shiftRangeLabel(t)}
          </span>
        ))}
        <span className="rounded-md border border-border bg-muted/40 px-2 py-1 font-medium text-muted-foreground">Rest day</span>
        <span className="rounded-md border border-danger/30 bg-danger/10 px-2 py-1 font-medium text-danger">On leave</span>
      </div>

      {view === 'week' && (
        <div className="grid gap-2 sm:grid-cols-7">
          {days.map((d) => {
            const state = stateFor(d)
            const c = chip(state)
            return (
              <div key={d} className={cn('rounded-xl border border-border bg-card p-3', d === today && 'ring-1 ring-primary/40')}>
                <p className={cn('text-xs font-medium', d === today ? 'text-primary' : 'text-muted-foreground')}>{dayShort(d)}</p>
                <p className="text-sm font-semibold">{dayMonth(d)}</p>
                <p title={c.title} className={cn('mt-2 rounded-md border px-2 py-1.5 text-center text-xs font-medium', c.cls)}>
                  {c.label}
                </p>
                {state.kind === 'shift' && <p className="mt-1 text-center text-[11px] text-muted-foreground">{c.title}</p>}
              </div>
            )
          })}
        </div>
      )}

      {view === 'month' && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card p-3">
          <div className="grid min-w-[640px] grid-cols-7 gap-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {Array.from({ length: leading }, (_, i) => (
              <div key={`b${i}`} />
            ))}
            {monthList.map((d) => {
              const c = chip(stateFor(d))
              return (
                <div key={d} className={cn('rounded-lg border border-border/60 p-2', d === today && 'bg-muted/60 ring-1 ring-primary/30')}>
                  <p className="text-xs font-semibold">{fromDateKey(d).getDate()}</p>
                  <p title={c.title} className={cn('mt-1 truncate rounded border px-1.5 py-1 text-center text-[11px] font-medium', c.cls)}>
                    {c.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === 'year' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 12 }, (_, m) => `${year}-${String(m + 1).padStart(2, '0')}-01`).map((m) => {
            const { working, rest, leave } = summary(monthDays(m))
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setView('month')
                  setAnchor(m)
                }}
                className="flex flex-col rounded-xl border border-border bg-card p-4 text-left shadow-soft transition-colors hover:bg-muted/40"
              >
                <span className="text-sm font-semibold">{new Intl.DateTimeFormat('en-US', { month: 'long' }).format(fromDateKey(m))}</span>
                <span className="mt-3 font-display text-3xl font-semibold tabular-nums">{working}</span>
                <span className="text-xs text-muted-foreground">working day{working === 1 ? '' : 's'}</span>
                <span className="mt-2 text-xs text-muted-foreground">
                  {rest} rest{leave > 0 && ` · ${leave} leave`}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <Card className="p-5">
        <Card.Title>My WFH</Card.Title>
        <div className="mt-3">
          {wfh.length === 0 ? (
            <p className="text-sm text-muted-foreground">No WFH requests yet.</p>
          ) : (
            <WfhArrangementCards items={wfh} onWithdraw={(a) => cancelWfh([a.id]).then(loadWfh, (error) => notify({ title: "Couldn't withdraw the request", description: apiErrorMessage(error), tone: 'danger' }))} />
          )}
        </div>
      </Card>
    </div>
  )
}
