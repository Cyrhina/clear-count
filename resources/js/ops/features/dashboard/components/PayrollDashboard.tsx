import { AlertTriangle, CalendarClock, CheckCircle2, Landmark, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '@ops/components/ui/Badge'
import { Card } from '@ops/components/ui/Card'
import { MetricCard } from '@ops/components/ui/MetricCard'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { PayrollCalendarCard, RemindersCard, ViewAllLink } from '@ops/features/dashboard/components/DashboardSections'
import { useAdminDashboardOverview, usePayrollDashboard } from '@ops/features/dashboard/hooks/useDashboardData'
import { cn } from '@ops/lib/utils/cn'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'

function timeOfDayGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const STATUS_LABEL = { draft: 'Draft', review: 'In review', approved: 'Approved', finalized: 'Finalized' } as const
const NO_RUN_HINT = 'No payroll run yet'
const TOOLTIP_STYLE = { borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-card)', fontSize: 12 }
const AXIS = { tickLine: false, axisLine: false, fontSize: 11, stroke: 'var(--color-muted-foreground)' } as const
const DONUT_COLORS = ['var(--color-brand-700)', 'var(--color-brand-500)', 'var(--color-brand-300)', 'var(--color-warning)', 'var(--color-danger)', 'var(--color-brand-900)']
const PIPELINE_COLORS = ['var(--color-brand-300)', 'var(--color-warning)', 'var(--color-brand-500)', 'var(--color-brand-800)']
const CURSOR = { fill: 'var(--color-muted)', opacity: 0.4 }

/** "₱1.2M" / "₱350K" axis labels. */
function compactPeso(value: number) {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `₱${Math.round(value / 1_000)}K`
  return `₱${value}`
}

/** Payroll Admin's home: the run in progress, what it costs and where it goes, what is waiting, what looks wrong, and upcoming deadlines. */
export function PayrollDashboard() {
  const { data, isLoading } = usePayrollDashboard()
  const { overview } = useAdminDashboardOverview()

  if (isLoading || !data || !overview) {
    return (
      <div className="dashboard-elevated grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    )
  }

  const today = new Date()
  const { current, totals, counts, pendingRecords, exceptions } = data
  const pendingRecordsTotal = pendingRecords.workLogs + pendingRecords.overtime + pendingRecords.leave + pendingRecords.adjustments
  const pendingChart = [
    { name: 'Hourly / output', count: pendingRecords.workLogs },
    { name: 'OT / night diff', count: pendingRecords.overtime },
    { name: 'Leave', count: pendingRecords.leave },
    { name: 'Attendance fixes', count: pendingRecords.adjustments },
  ]

  return (
    <div className="dashboard-elevated space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {timeOfDayGreeting()}, {overview.greetingName}!
        </h1>
        <p className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
          {today.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })} | {today.toLocaleDateString('en-PH', { weekday: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <MetricCard
          compact
          label="Current Payroll"
          value={current ? current.payrollNumber : '—'}
          hint={current ? `${current.label} · ${STATUS_LABEL[current.status]} · ${current.employees} employees` : NO_RUN_HINT}
          icon={Wallet}
          tone="primary"
          footer={{ label: 'View Payroll Runs', to: current ? `/payroll/${current.id}` : '/payroll' }}
        />
        <MetricCard
          compact
          label="Upcoming Payroll"
          value={overview.metrics.payrollStatusLabel}
          hint={`${overview.metrics.payrollPeriodLabel} · cut-off ${overview.metrics.nextCutoffLabel}`}
          icon={CalendarClock}
          tone="accent"
          footer={{ label: 'Create Payroll Run', to: '/payroll' }}
        />
        <MetricCard
          compact
          label="Total Payroll Cost"
          value={current ? formatCurrency(totals.payrollCost) : '—'}
          hint={current ? `Gross ${formatCurrency(totals.grossPay)} + employer share ${formatCurrency(totals.employerContributions)}` : NO_RUN_HINT}
          icon={Landmark}
          tone="primary"
          footer={current ? { label: 'View Computation', to: `/payroll/${current.id}` } : undefined}
        />
        <MetricCard
          compact
          label="Net Payroll"
          value={current ? formatCurrency(totals.netPay) : '—'}
          hint={current ? `Pay date ${formatDate(current.payDate)} · deductions ${formatCurrency(totals.totalDeductions)}` : NO_RUN_HINT}
          icon={CheckCircle2}
          tone="success"
          footer={{ label: 'View Payslips', to: '/payslips' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card data-tint="lavender" watermark={Wallet} className="relative overflow-hidden lg:col-span-2">
          <Card.Header className="relative items-center">
            <div>
              <Card.Title>Payroll Cost by Run</Card.Title>
              <Card.Description>Gross pay, deductions and net pay — latest runs</Card.Description>
            </div>
            <ViewAllLink to="/payroll" />
          </Card.Header>
          <Card.Body className="relative h-64 pt-2">
            {data.trend.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">{NO_RUN_HINT}.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trend} margin={{ left: 4, right: 8, top: 8 }} barGap={4}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="run" {...AXIS} />
                  <YAxis {...AXIS} width={52} tickFormatter={compactPeso} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={TOOLTIP_STYLE} cursor={CURSOR} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="grossPay" name="Gross pay" fill="var(--color-brand-400)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deductions" name="Deductions" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netPay" name="Net pay" fill="var(--color-brand-700)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>

        <Card data-tint="sage" watermark={Landmark} className="relative overflow-hidden">
          <Card.Header className="relative items-center">
            <div>
              <Card.Title>Deductions</Card.Title>
              <Card.Description>{current ? `${formatCurrency(totals.totalDeductions)} in ${current.payrollNumber}` : NO_RUN_HINT}</Card.Description>
            </div>
            <ViewAllLink to="/loans-deductions" />
          </Card.Header>
          <Card.Body className="relative h-64 pt-2">
            {data.deductionBreakdown.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">No deductions yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.deductionBreakdown} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2} stroke="none">
                    {data.deductionBreakdown.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card data-tint="lavender" watermark={CheckCircle2} className="relative overflow-hidden">
          <Card.Header className="relative items-center">
            <div>
              <Card.Title>Payroll Run Status</Card.Title>
              <Card.Description>
                {counts.pendingRuns} pending · {counts.awaitingApproval} awaiting approval · {counts.approvedNotFinalized} approved, not finalized
              </Card.Description>
            </div>
            <ViewAllLink to="/payroll" />
          </Card.Header>
          <Card.Body className="relative h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.pipeline} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="stage" {...AXIS} />
                <YAxis allowDecimals={false} {...AXIS} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={CURSOR} />
                <Bar dataKey="runs" name="Runs" radius={[4, 4, 0, 0]}>
                  {data.pipeline.map((_, i) => (
                    <Cell key={i} fill={PIPELINE_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        <Card data-tint="peach" watermark={CalendarClock} className="relative overflow-hidden">
          <Card.Header className="relative items-center">
            <div>
              <Card.Title>Pending Time / Output Records</Card.Title>
              <Card.Description>{pendingRecordsTotal} waiting on HR or managers — not paid until approved</Card.Description>
            </div>
            <ViewAllLink to="/payroll-inputs" />
          </Card.Header>
          <Card.Body className="relative h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pendingChart} layout="vertical" margin={{ left: 8, right: 16, top: 4 }}>
                <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                <XAxis type="number" allowDecimals={false} {...AXIS} />
                <YAxis type="category" dataKey="name" width={110} {...AXIS} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={CURSOR} />
                <Bar dataKey="count" name="Pending" fill="var(--color-brand-600)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </div>

      <Card data-tint="peach" watermark={AlertTriangle} className="relative overflow-hidden">
        <Card.Header className="relative items-center">
          <div>
            <Card.Title>Payroll Exceptions</Card.Title>
            <Card.Description>Things to fix before this run is approved.</Card.Description>
          </div>
          <Badge tone={exceptions.length ? 'warning' : 'success'}>{exceptions.length ? `${exceptions.length} to review` : 'All clear'}</Badge>
        </Card.Header>
        <Card.Body className="relative space-y-2 pt-2">
          {exceptions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">No payroll exceptions right now.</p>
          ) : (
            exceptions.map((item) => (
              <Link key={item.id} to={item.to} className="flex items-start gap-2.5 rounded-lg bg-card/70 p-3 transition-colors hover:bg-card">
                <AlertTriangle className={cn('mt-0.5 size-4 shrink-0', item.tone === 'danger' ? 'text-danger' : 'text-warning')} />
                <p className="text-sm leading-snug">{item.message}</p>
              </Link>
            ))
          )}
        </Card.Body>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RemindersCard reminders={overview.reminders} />
        <PayrollCalendarCard events={overview.payrollCalendar} />
      </div>
    </div>
  )
}
