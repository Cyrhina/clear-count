import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Plane, UserX, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '@ops/components/ui/Badge'
import { Card } from '@ops/components/ui/Card'
import { MetricCard } from '@ops/components/ui/MetricCard'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { ViewAllLink } from '@ops/features/dashboard/components/DashboardSections'
import { useManagerDashboard, useWorkforceCharts } from '@ops/features/dashboard/hooks/useDashboardData'
import { cn } from '@ops/lib/utils/cn'
import { formatDate } from '@ops/lib/utils/format'

function timeOfDayGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const TOOLTIP_STYLE = { borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-card)', fontSize: 12 }
const AXIS = { tickLine: false, axisLine: false, fontSize: 11, stroke: 'var(--color-muted-foreground)' } as const
const CURSOR = { fill: 'var(--color-muted)', opacity: 0.4 }
const STATUS_TONE = { absent: 'danger', late: 'warning', undertime: 'neutral' } as const

const TODAY_COLORS = {
  'On time': 'var(--color-brand-600)',
  Late: 'var(--color-warning)',
  Undertime: 'var(--color-brand-300)',
  Absent: 'var(--color-danger)',
  'On leave': 'var(--color-brand-800)',
} as const

/** Manager's home — answers "what needs my attention today?" for their team, mostly at a glance in charts. */
export function ManagerDashboard({ greetingName }: { greetingName: string }) {
  const { data, isLoading } = useManagerDashboard()
  const { charts, isLoading: chartsLoading } = useWorkforceCharts()

  if (isLoading || !data) {
    return (
      <div className="dashboard-elevated space-y-6">
        <Skeleton className="h-16" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  const today = new Date()
  const { pending } = data
  // Leave, overtime and time corrections are HR's to approve — they stay visible in Pending Requests but don't count as waiting on the manager.
  const pendingTotal = pending.hours + pending.output
  const asOf = data.attendanceDate === today.toISOString().slice(0, 10) ? 'today' : formatDate(data.attendanceDate)
  const rate = data.headcount ? Math.round((data.present / data.headcount) * 100) : 0

  const todayChart = [
    { name: 'On time', value: Math.max(0, data.present - data.late - data.undertime) },
    { name: 'Late', value: data.late },
    { name: 'Undertime', value: data.undertime },
    { name: 'Absent', value: data.absent },
    { name: 'On leave', value: data.onLeaveToday },
  ].filter((d) => d.value > 0)
  const todayTotal = todayChart.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="dashboard-elevated space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{data.teamName}</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {timeOfDayGreeting()}, {greetingName}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pendingTotal > 0 ? (
              <>
                <span className="font-semibold text-foreground">{pendingTotal}</span> request{pendingTotal === 1 ? '' : 's'} waiting for your decision.
              </>
            ) : (
              'Nothing is waiting for your decision.'
            )}
          </p>
        </div>
        <p className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
          {today.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })} | {today.toLocaleDateString('en-PH', { weekday: 'long' })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="My Team" value={String(data.headcount)} hint={`${data.departments} department${data.departments === 1 ? '' : 's'}`} icon={Users} tone="primary" footer={{ label: 'View My Team', to: '/employees' }} />
        <MetricCard label="Attendance Rate" value={`${rate}%`} hint={`${data.present} of ${data.headcount} present ${asOf}`} icon={CheckCircle2} tone="success" footer={{ label: 'View Attendance', to: '/attendance' }} />
        <MetricCard label="On Leave Today" value={String(data.onLeaveToday)} hint={`${pending.leave} leave request${pending.leave === 1 ? '' : 's'} pending`} icon={Plane} tone="warning" footer={{ label: 'View Leave', to: '/leave' }} />
        <MetricCard label="Late" value={String(data.late)} hint={`${data.absent} absent · ${data.undertime} undertime ${asOf}`} icon={Clock3} tone="accent" footer={{ label: 'View Attendance', to: '/attendance' }} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <Card.Header className="items-center">
            <div>
              <Card.Title>Team Today</Card.Title>
              <Card.Description>Attendance {asOf}</Card.Description>
            </div>
            <ViewAllLink to="/attendance" />
          </Card.Header>
          <Card.Body className="pt-2">
            {todayTotal === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No attendance records yet.</p>
            ) : (
              <>
                <div className="relative mx-auto h-44 w-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={todayChart} dataKey="value" nameKey="name" innerRadius={56} outerRadius={80} paddingAngle={2} stroke="none">
                        {todayChart.map((d) => (
                          <Cell key={d.name} fill={TODAY_COLORS[d.name as keyof typeof TODAY_COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="font-display text-3xl font-semibold tabular-nums">{rate}%</p>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">present</p>
                  </div>
                </div>
                <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {todayChart.map((d) => (
                    <li key={d.name} className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: TODAY_COLORS[d.name as keyof typeof TODAY_COLORS] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="ml-auto font-medium tabular-nums">{d.value}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card.Body>
        </Card>

        <Card className="lg:col-span-2">
          <Card.Header className="items-center">
            <div>
              <Card.Title>Team Attendance Summary</Card.Title>
              <Card.Description>Daily outcomes for your team, last 7 working days</Card.Description>
            </div>
            <ViewAllLink to="/attendance" />
          </Card.Header>
          <Card.Body className="h-72 pt-2">
            {chartsLoading || !charts ? (
              <Skeleton className="h-full w-full" />
            ) : charts.attendance.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No attendance records yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.attendance} margin={{ left: -16, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="day" {...AXIS} />
                  <YAxis allowDecimals={false} {...AXIS} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={CURSOR} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="present" name="Present" stackId="a" fill="var(--color-brand-600)" />
                  <Bar dataKey="late" name="Late" stackId="a" fill="var(--color-warning)" />
                  <Bar dataKey="undertime" name="Undertime" stackId="a" fill="var(--color-brand-300)" />
                  <Bar dataKey="onLeave" name="On leave" stackId="a" fill="var(--color-brand-800)" />
                  <Bar dataKey="absent" name="Absent" stackId="a" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>

      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card data-tint="peach" watermark={AlertTriangle} className="relative overflow-hidden">
            <Card.Header className="relative items-center">
              <div>
                <Card.Title>Needs Attention</Card.Title>
                <Card.Description>Late or absent {asOf}</Card.Description>
              </div>
              <Badge tone={data.attention.length ? 'warning' : 'success'}>{data.attention.length ? `${data.attention.length}` : 'All clear'}</Badge>
            </Card.Header>
            <Card.Body className="relative space-y-1.5 pt-2">
              {data.attention.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">Everyone is accounted for.</p>
              ) : (
                data.attention.slice(0, 5).map((item) => (
                  <Link key={item.id} to="/attendance" className="flex items-center gap-2.5 rounded-lg bg-card/70 p-2.5 transition-colors hover:bg-card">
                    <UserX className={cn('size-4 shrink-0', item.status === 'absent' ? 'text-danger' : 'text-warning')} />
                    <p className="flex-1 truncate text-sm font-medium">{item.employee}</p>
                    <Badge tone={STATUS_TONE[item.status]} className="capitalize">
                      {item.status}
                    </Badge>
                  </Link>
                ))
              )}
            </Card.Body>
          </Card>

          <Card data-tint="sage" watermark={CalendarDays} className="relative overflow-hidden">
            <Card.Header className="relative items-center">
              <div>
                <Card.Title>Upcoming Leave</Card.Title>
                <Card.Description>Next 14 days</Card.Description>
              </div>
              <ViewAllLink to="/leave" />
            </Card.Header>
            <Card.Body className="relative space-y-1.5 pt-2">
              {data.upcomingLeave.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">No approved leave coming up.</p>
              ) : (
                data.upcomingLeave.slice(0, 4).map((l) => (
                  <div key={l.id} className="flex items-center gap-2.5 rounded-lg bg-card/70 p-2.5">
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{l.employee}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.leaveType} · {formatDate(l.dateFrom)}
                        {l.dateTo !== l.dateFrom && ` – ${formatDate(l.dateTo)}`}
                      </p>
                    </div>
                    <Badge tone="brand">
                      {l.days} day{l.days === 1 ? '' : 's'}
                    </Badge>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
      </div>
    </div>
  )
}
