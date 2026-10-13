import { ChevronLeft, ChevronRight, Coffee, Copy, Plane, Plus, Search, UserCheck, UserX } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { MetricCard } from '@ops/components/ui/MetricCard'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useToast } from '@ops/components/ui/Toast'
import { AssignShiftDialog, type AssignPreset } from '@ops/features/schedules/components/AssignShiftDialog'
import {
  addDays,
  dayMonth,
  dayShort,
  fromDateKey,
  monthDays,
  rangeLabel,
  shiftAnchor,
  shiftRangeLabel,
  startOfWeek,
  todayKey,
  viewRange,
  weekDays,
  type RosterView,
} from '@ops/features/schedules/dateUtil'
import { useRoster, type DayState } from '@ops/features/schedules/hooks/useRoster'
import { SHIFT_COLOR_CLASSES, colorFor } from '@ops/features/schedules/shiftColors'
import { useSession } from '@ops/hooks/useSession'
import { usePermission } from '@ops/hooks/usePermission'
import { useBranches } from '@ops/features/branches/hooks/useBranches'
import { copyWeek } from '@ops/lib/services/scheduleService'
import { cn } from '@ops/lib/utils/cn'
import type { Employee } from '@ops/types/domain'

const VIEWS: { value: RosterView; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

const fullName = (e: Employee) => `${e.personal.firstName} ${e.personal.lastName}`
const initials = (e: Employee) => `${e.personal.firstName[0] ?? ''}${e.personal.lastName[0] ?? ''}`.toUpperCase()

export function RosterTab() {
  const { user } = useSession()
  const { notify } = useToast()
  const { branches: companyBranches } = useBranches()
  // Branch-scoped users (managers) only ever see their own branch.
  const branches = useMemo(() => (user.branchId ? companyBranches.filter((b) => b.id === user.branchId) : companyBranches), [companyBranches, user.branchId])
  const canManage = usePermission('schedules.manage')

  const [view, setView] = useState<RosterView>('week')
  // "Today" is its own mode: a list of who is on duty right now, not a window on the grid.
  const [todayMode, setTodayMode] = useState(false)
  const [anchor, setAnchor] = useState(todayKey())
  const [branchId, setBranchId] = useState('all')
  const [department, setDepartment] = useState('all')
  const [search, setSearch] = useState('')
  const [mobileDay, setMobileDay] = useState(todayKey())
  const [dialog, setDialog] = useState<{ open: boolean; preset: AssignPreset }>({ open: false, preset: { employeeIds: [], from: todayKey(), to: todayKey() } })

  const range = todayMode ? { from: todayKey(), to: todayKey() } : viewRange(anchor, view)
  const roster = useRoster(range.from, range.to)
  const today = todayKey()
  // Summary cards always describe today, whatever window is on screen.
  const todayRoster = useRoster(today, today)

  const active = useMemo(() => roster.employees.filter((e) => e.employment.status === 'active'), [roster.employees])
  const departments = useMemo(() => [...new Set(active.map((e) => e.employment.department))].sort(), [active])
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return active.filter(
      (e) =>
        (branchId === 'all' || e.branchId === branchId) &&
        (department === 'all' || e.employment.department === department) &&
        (!q || `${fullName(e)} ${e.employeeNumber}`.toLowerCase().includes(q)),
    )
  }, [active, branchId, department, search])

  const groups = useMemo(() => {
    const byDept = new Map<string, Employee[]>()
    for (const e of filtered) byDept.set(e.employment.department, [...(byDept.get(e.employment.department) ?? []), e])
    return [...byDept].sort(([a], [b]) => a.localeCompare(b)).map(([name, members]) => ({ name, members: members.sort((a, b) => fullName(a).localeCompare(fullName(b))) }))
  }, [filtered])

  const counts = useMemo(() => {
    const c = { working: 0, rest: 0, unscheduled: 0, leave: 0 }
    for (const e of filtered) {
      const state = todayRoster.stateFor(e.id, today)
      if (state.kind === 'shift') c.working++
      else if (state.kind === 'rest') c.rest++
      else if (state.kind === 'leave') c.leave++
      else c.unscheduled++
    }
    return c
  }, [filtered, todayRoster, today])

  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? '—'
  const supervisorLabel = (dept: string) => {
    const teams = roster.departments.filter((t) => t.name === dept && (branchId === 'all' || t.branchId === branchId))
    const names = new Set(teams.map((t) => t.supervisorEmployeeId))
    if (teams.length === 0 || names.size === 0) return 'No supervisor assigned'
    if (names.size > 1) return 'Supervisor: Varies by branch'
    const supervisor = roster.employees.find((e) => e.id === [...names][0])
    return supervisor ? `Supervisor: ${fullName(supervisor)}` : 'No supervisor assigned'
  }

  const days = view === 'week' ? weekDays(anchor) : []
  // Phones show one day at a time: the picked day if it is in this week, else today, else Monday.
  const activeDay = days.includes(mobileDay) ? mobileDay : days.includes(today) ? today : days[0]
  const colorIndex = new Map(roster.templates.map((t, i) => [t.id, i]))

  function openAssign(preset: AssignPreset) {
    if (canManage) setDialog({ open: true, preset })
  }

  async function handleCopyLastWeek() {
    const toStart = startOfWeek(anchor)
    const copied = await copyWeek({ employeeIds: filtered.map((e) => e.id), fromStart: addDays(toStart, -7), toStart })
    notify({
      title: copied > 0 ? 'Last week copied' : 'Nothing to copy',
      description: copied > 0 ? `${copied} roster day${copied === 1 ? '' : 's'} copied onto this week.` : 'The previous week has no roster for these employees.',
      tone: copied > 0 ? 'success' : 'default',
    })
    roster.refetch()
    todayRoster.refetch()
  }

  function refetchAll() {
    roster.refetch()
    todayRoster.refetch()
  }

  function renderCell(employee: Employee, date: string, state: DayState) {
    const base = cn('flex h-8 w-full items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors', canManage ? 'cursor-pointer hover:brightness-95' : 'cursor-default')
    const onClick = () =>
      openAssign({
        employeeIds: [employee.id],
        from: date,
        to: date,
        lockEmployees: true,
        scheduleId: state.kind === 'shift' ? state.schedule.id : state.kind === 'rest' ? null : undefined,
      })
    if (state.kind === 'shift') {
      const color = colorFor(state.schedule, colorIndex.get(state.schedule.id) ?? 0)
      return (
        <button type="button" onClick={onClick} title={`${state.schedule.name} · ${shiftRangeLabel(state.schedule)}`} className={cn(base, SHIFT_COLOR_CLASSES[color].cell)}>
          {shiftRangeLabel(state.schedule)}
        </button>
      )
    }
    if (state.kind === 'rest')
      return (
        <button type="button" onClick={onClick} className={cn(base, 'border-dashed border-border bg-muted/30 text-muted-foreground')}>
          Rest
        </button>
      )
    if (state.kind === 'leave')
      return (
        <span title={state.label} className={cn(base, 'cursor-default border-danger/30 bg-danger/10 text-danger')}>
          Leave
        </span>
      )
    return (
      <button type="button" onClick={onClick} disabled={!canManage} className={cn(base, 'border-dashed border-border text-muted-foreground', canManage && 'hover:bg-muted/60')}>
        {canManage ? '+ Add' : '—'}
      </button>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {todayMode ? (
            <span className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-3 text-sm font-medium">
              Today · {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(fromDateKey(todayKey()))}
            </span>
          ) : (
            <div className="inline-flex items-center rounded-lg border border-border bg-card">
              <Button type="button" variant="ghost" size="sm" aria-label="Previous" onClick={() => setAnchor(shiftAnchor(anchor, view, -1))}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-32 px-1 text-center sm:min-w-40 sm:px-2 text-sm font-medium tabular-nums">{rangeLabel(anchor, view)}</span>
              <Button type="button" variant="ghost" size="sm" aria-label="Next" onClick={() => setAnchor(shiftAnchor(anchor, view, 1))}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
          <Button
            type="button"
            variant={todayMode ? undefined : 'secondary'}
            size="sm"
            aria-pressed={todayMode}
            onClick={() => {
              setTodayMode(true)
              setAnchor(todayKey())
            }}
          >
            Today
          </Button>
          <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 text-xs font-medium" role="group" aria-label="Roster view">
            {VIEWS.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => {
                  setTodayMode(false)
                  setView(v.value)
                }}
                className={cn('rounded-md px-3 py-1.5 transition-colors', !todayMode && view === v.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            {view === 'week' && !todayMode && (
              <Button type="button" variant="secondary" size="sm" icon={<Copy className="size-4" />} onClick={handleCopyLastWeek} disabled={filtered.length === 0}>
                Copy last week
              </Button>
            )}
            <Button type="button" size="sm" icon={<Plus className="size-4" />} onClick={() => openAssign({ employeeIds: [], from: view === 'week' ? weekDays(anchor)[0] : range.from, to: view === 'week' ? weekDays(anchor)[6] : range.from })}>
              Assign shift
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <Select
          className="sm:w-48"
          value={branchId}
          onValueChange={setBranchId}
          aria-label="Branch"
          options={[{ value: 'all', label: 'All branches' }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
        />
        <Select className="sm:w-48" value={department} onValueChange={setDepartment} aria-label="Department" options={[{ value: 'all', label: 'All departments' }, ...departments.map((d) => ({ value: d, label: d }))]} />
        <div className="relative col-span-2 min-w-52 flex-1 sm:col-span-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee…"
            aria-label="Search employee"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <p className="col-span-2 text-xs text-muted-foreground sm:ml-auto sm:text-sm">{filtered.length} employees</p>
      </div>

      {/* Phones: one slim strip instead of four tall cards. */}
      <div className="grid grid-cols-4 gap-1.5 sm:hidden">
        {[
          { label: 'Working', value: counts.working, className: '' },
          { label: 'Rest', value: counts.rest, className: '' },
          { label: 'Unsched.', value: counts.unscheduled, className: 'text-warning' },
          { label: 'Leave', value: counts.leave, className: 'text-danger' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5 rounded-xl border border-border bg-card px-2.5 py-2">
            <span className={cn('text-lg font-semibold leading-none tabular-nums', s.className)}>{s.value}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 md:grid-cols-4">
        <MetricCard label="Working today" value={String(counts.working)} icon={UserCheck} tone="success" />
        <MetricCard label="On rest day today" value={String(counts.rest)} icon={Coffee} tone="default" />
        <MetricCard label="Not yet scheduled" value={String(counts.unscheduled)} icon={UserX} tone="warning" />
        <MetricCard label="On leave today" value={String(counts.leave)} icon={Plane} tone="primary" />
      </div>

      <div className="hidden flex-wrap items-center gap-2 text-xs sm:flex">
        {roster.templates.map((t, i) => (
          <span key={t.id} className={cn('rounded-md border px-2 py-1 font-medium', SHIFT_COLOR_CLASSES[colorFor(t, i)].cell)}>
            {t.name} {shiftRangeLabel(t)}
          </span>
        ))}
        <span className="rounded-md border border-border bg-muted/40 px-2 py-1 font-medium text-muted-foreground">Rest day</span>
        <span className="rounded-md border border-danger/30 bg-danger/10 px-2 py-1 font-medium text-danger">On leave</span>
      </div>

      {todayMode && !roster.isLoading ? (
        <TodayList employees={filtered} allEmployees={roster.employees} stateFor={roster.stateFor} date={today} departments={roster.departments} branches={branches} colorIndex={colorIndex} />
      ) : roster.isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : groups.length === 0 ? (
        <p className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">No employees match these filters.</p>
      ) : view === 'year' ? (
        <YearGrid
          employees={filtered}
          stateFor={roster.stateFor}
          year={fromDateKey(anchor).getFullYear()}
          onPickMonth={(date) => {
            setView('month')
            setAnchor(date)
          }}
        />
      ) : view === 'month' ? (
        <MonthCalendar
          anchor={anchor}
          employees={filtered}
          stateFor={roster.stateFor}
          today={today}
          onPickDay={(date) => {
            setView('week')
            setAnchor(date)
          }}
        />
      ) : (
        <>
        {/* Phones: one day at a time, each employee a card showing that day's shift. */}
        <div className="space-y-3 sm:hidden">
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setMobileDay(d)}
                aria-pressed={d === activeDay}
                aria-label={`${dayShort(d)}, ${dayMonth(d)}`}
                className={cn(
                  'flex flex-col items-center rounded-xl border py-1.5 transition-colors',
                  d === activeDay ? 'border-foreground bg-foreground text-background' : 'border-border bg-card',
                  d === today && d !== activeDay && 'text-primary',
                )}
              >
                <span className={cn('text-[10px] font-semibold uppercase', d === activeDay ? 'text-background/70' : 'text-muted-foreground')}>{dayShort(d)}</span>
                <span className="text-[15px] font-semibold tabular-nums">{fromDateKey(d).getDate()}</span>
              </button>
            ))}
          </div>
          {groups.map((group) => (
            <section key={group.name}>
              <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.name} · {group.members.length}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">{supervisorLabel(group.name)}</span>
              </div>
              <div className="space-y-2">
                {group.members.map((e) => (
                  <Card key={e.id} watermark={null} className="flex items-center gap-3 p-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{initials(e)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{fullName(e)}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{branchName(e.branchId)}</p>
                    </div>
                    <div className="w-24 shrink-0">{renderCell(e, activeDay, roster.stateFor(e.id, activeDay))}</div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="hidden overflow-x-auto rounded-xl border border-border bg-card sm:block">
          <table className="w-full min-w-[900px] border-collapse text-sm md:min-w-0">
            <thead>
              <tr className="bg-muted/30">
                <th className="sticky left-0 z-10 w-44 min-w-44 bg-muted/30 px-3 py-2 text-left text-xs font-medium text-muted-foreground lg:w-56 lg:min-w-56">Employee</th>
                {days.map((d) => (
                  <th key={d} className={cn('px-1 py-2 text-center text-xs font-medium', d === today ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}>
                    <div>{dayShort(d)}</div>
                    <div className="font-normal">{dayMonth(d)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <Fragment key={group.name}>
                  <tr className="border-t border-border bg-muted/20">
                    <td colSpan={days.length + 1} className="px-3 py-2">
                      <div className="sticky left-3 flex w-[min(100%,calc(100vw-22rem))] items-center justify-between gap-3">
                        <span className="text-sm font-semibold">
                          {group.name} <span className="font-normal text-muted-foreground">({group.members.length})</span>
                        </span>
                        <span className="text-xs text-muted-foreground">{supervisorLabel(group.name)}</span>
                      </div>
                    </td>
                  </tr>
                  {group.members.map((e) => (
                    <tr key={e.id} className="border-t border-border/60">
                      <td className="sticky left-0 z-10 bg-card px-3 py-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{initials(e)}</span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{fullName(e)}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{branchName(e.branchId)}</p>
                          </div>
                        </div>
                      </td>
                      {days.map((d) => (
                        <td key={d} className={cn('px-1 py-1', d === today && 'bg-primary/5')}>
                          {renderCell(e, d, roster.stateFor(e.id, d))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      <AssignShiftDialog open={dialog.open} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} employees={active} templates={roster.templates} preset={dialog.preset} onSaved={refetchAll} />
    </div>
  )
}

/** Month view: a calendar with each day's headcount — working, resting (including not yet scheduled) and on leave. Click a day to open its week. */
function MonthCalendar({
  anchor,
  employees,
  stateFor,
  today,
  onPickDay,
}: {
  anchor: string
  employees: Employee[]
  stateFor: (employeeId: string, date: string) => DayState
  today: string
  onPickDay: (date: string) => void
}) {
  const days = monthDays(anchor)
  // Monday-first calendar: blank cells before the 1st line the dates up under their weekday.
  const leading = (fromDateKey(days[0]).getDay() + 6) % 7
  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const countsFor = (date: string) => {
    let working = 0
    let leave = 0
    for (const e of employees) {
      const state = stateFor(e.id, date)
      if (state.kind === 'shift') working++
      else if (state.kind === 'leave') leave++
    }
    return { working, leave, rest: employees.length - working - leave }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card p-3">
      <div className="grid min-w-[720px] grid-cols-7 gap-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {Array.from({ length: leading }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((date) => {
          const { working, leave, rest } = countsFor(date)
          return (
            <button
              key={date}
              type="button"
              onClick={() => onPickDay(date)}
              aria-label={`${date}: ${working} working, ${rest} rest, ${leave} on leave`}
              className={cn('flex flex-col rounded-lg border border-border/60 px-2.5 py-2 text-left transition-colors hover:bg-muted/50', date === today && 'bg-muted/60 ring-1 ring-primary/30')}
            >
              <span className="text-xs font-semibold">{fromDateKey(date).getDate()}</span>
              <span className="mt-1 text-xs font-medium">{working} working</span>
              <span className="text-[11px] text-muted-foreground">
                {rest} rest{leave > 0 && ` · ${leave} leave`}
              </span>
              <span className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${employees.length ? (working / employees.length) * 100 : 0}%` }} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const SENIORITY = /manager|supervisor|lead/i

/** Paid hours of a shift: its length (overnight aware) minus the unpaid break. */
function shiftHours(s: { startTime: string; endTime: string; breakMinutes?: number }): number {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
  let length = toMin(s.endTime) - toMin(s.startTime)
  if (length <= 0) length += 1440
  return Math.max(0, length - (s.breakMinutes ?? 0)) / 60
}

/**
 * Today view: everyone on duty right now, soonest shift first, with the shift's paid hours and their supervisor.
 * The supervisor is the team's supervisor; when the team has no senior member, the branch manager (marked "(branch)").
 */
function TodayList({
  employees,
  allEmployees,
  stateFor,
  date,
  departments,
  branches,
  colorIndex,
}: {
  employees: Employee[]
  allEmployees: Employee[]
  stateFor: (employeeId: string, date: string) => DayState
  date: string
  departments: { name: string; branchId: string; supervisorEmployeeId?: string | null }[]
  branches: { id: string; name: string; managerEmployeeId?: string }[]
  colorIndex: Map<string, number>
}) {
  const byId = new Map(allEmployees.map((e) => [e.id, e]))
  const supervisorOf = (e: Employee): string => {
    const team = departments.find((t) => t.name === e.employment.department && t.branchId === e.branchId)
    const lead = team?.supervisorEmployeeId ? byId.get(team.supervisorEmployeeId) : undefined
    if (lead && SENIORITY.test(lead.employment.position)) return fullName(lead)
    const manager = byId.get(branches.find((b) => b.id === e.branchId)?.managerEmployeeId ?? '')
    if (manager) return `${fullName(manager)} (branch)`
    return lead ? fullName(lead) : '—'
  }
  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? '—'

  const onDuty = employees
    .map((e) => ({ employee: e, state: stateFor(e.id, date) }))
    .flatMap((r) => (r.state.kind === 'shift' ? [{ employee: r.employee, schedule: r.state.schedule }] : []))
    .sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime) || fullName(a.employee).localeCompare(fullName(b.employee)))
  const others = employees.length - onDuty.length

  return (
    <div className="space-y-2">
      <p className="text-sm">
        <span className="font-medium">{onDuty.length} on duty today</span>
        <span className="text-muted-foreground"> · {others} resting, on leave or not yet scheduled</span>
      </p>
      {/* Phones and tablets: cards (two columns on tablet). */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:hidden">
        {onDuty.map(({ employee: e, schedule }) => (
          <Card key={e.id} watermark={null} className="space-y-2 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{fullName(e)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {e.employment.department} · {branchName(e.branchId)}
                </p>
              </div>
              <span className={cn('shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium', SHIFT_COLOR_CLASSES[colorFor(schedule, colorIndex.get(schedule.id) ?? 0)].cell)}>{shiftRangeLabel(schedule)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {schedule.name} · {shiftHours(schedule)}h · Sup: {supervisorOf(e)}
            </p>
          </Card>
        ))}
        {onDuty.length === 0 && <p className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground sm:col-span-2">Nobody is rostered to work today.</p>}
      </div>
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card lg:block">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-muted/30 text-left text-xs font-medium text-muted-foreground">
              <th className="px-3 py-2">Employee</th>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2">Shift</th>
              <th className="px-3 py-2">Hours</th>
              <th className="px-3 py-2">Supervisor</th>
            </tr>
          </thead>
          <tbody>
            {onDuty.map(({ employee: e, schedule }) => (
              <tr key={e.id} className="border-t border-border/60">
                <td className="px-3 py-2">
                  <p className="font-medium">{fullName(e)}</p>
                  <p className="text-xs text-muted-foreground">{e.employment.position}</p>
                </td>
                <td className="px-3 py-2">
                  <p>{e.employment.department}</p>
                  <p className="text-xs text-muted-foreground">{branchName(e.branchId)}</p>
                </td>
                <td className="px-3 py-2">
                  <span className={cn('inline-block rounded-md border px-2 py-0.5 text-xs font-medium', SHIFT_COLOR_CLASSES[colorFor(schedule, colorIndex.get(schedule.id) ?? 0)].cell)}>
                    {schedule.name} · {schedule.startTime}–{schedule.endTime}
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums">{shiftHours(schedule)}h</td>
                <td className="px-3 py-2 text-muted-foreground">{supervisorOf(e)}</td>
              </tr>
            ))}
            {onDuty.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Nobody is rostered to work today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Year view: one card per month — average and peak headcount working per day, and who has no roster that month. Click a card to open the month. */
function YearGrid({
  employees,
  stateFor,
  year,
  onPickMonth,
}: {
  employees: Employee[]
  stateFor: (employeeId: string, date: string) => DayState
  year: number
  onPickMonth: (date: string) => void
}) {
  const months = Array.from({ length: 12 }, (_, m) => `${year}-${String(m + 1).padStart(2, '0')}-01`)
  const summary = (monthStart: string) => {
    const days = monthDays(monthStart)
    let workingTotal = 0
    let peak = 0
    for (const date of days) {
      let working = 0
      for (const e of employees) if (stateFor(e.id, date).kind === 'shift') working++
      workingTotal += working
      peak = Math.max(peak, working)
    }
    // "Not yet scheduled": nobody has put a shift or rest day on the roster for them this month.
    const unscheduled = employees.filter((e) => !days.some((d) => ['shift', 'rest'].includes(stateFor(e.id, d).kind))).length
    return { average: workingTotal / days.length, peak, unscheduled }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {months.map((m) => {
        const { average, peak, unscheduled } = summary(m)
        return (
          <button key={m} type="button" onClick={() => onPickMonth(m)} className="flex flex-col rounded-xl border border-border bg-card p-4 text-left shadow-soft transition-colors hover:bg-muted/40">
            <span className="text-sm font-semibold">{new Intl.DateTimeFormat('en-US', { month: 'long' }).format(fromDateKey(m))}</span>
            <span className="mt-3 font-display text-3xl font-semibold tabular-nums">{average.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">avg working per day · peak {peak}</span>
            <span className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${employees.length ? Math.min(100, (average / employees.length) * 100) : 0}%` }} />
            </span>
            <span className={cn('mt-3 text-xs', unscheduled > 0 ? 'text-warning' : 'text-muted-foreground')}>{unscheduled > 0 ? `${unscheduled} not yet scheduled` : 'Everyone scheduled'}</span>
          </button>
        )
      })}
    </div>
  )
}
