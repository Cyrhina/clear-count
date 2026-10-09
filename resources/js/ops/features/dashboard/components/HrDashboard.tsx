import { CalendarClock, Clock3, Plane, Users, Wallet } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@ops/components/ui/Card'
import { MetricCard } from '@ops/components/ui/MetricCard'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { PayrollCalendarCard, RemindersCard, ViewAllLink } from '@ops/features/dashboard/components/DashboardSections'
import { PendingRequestsCard } from '@ops/features/dashboard/components/PendingRequestsCard'
import { useAdminDashboardOverview, useWorkforceCharts } from '@ops/features/dashboard/hooks/useDashboardData'

function timeOfDayGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const TOOLTIP_STYLE = { borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-card)', fontSize: 12 }
const AXIS = { tickLine: false, axisLine: false, fontSize: 11, stroke: 'var(--color-muted-foreground)' } as const

/** HR Admin's home: workforce numbers first, then what needs action (pendings), compliance reminders and the payroll calendar. */
export function HrDashboard() {
  const { overview, isLoading } = useAdminDashboardOverview()
  const { charts, isLoading: chartsLoading } = useWorkforceCharts()

  if (isLoading || !overview) {
    return (
      <div className="dashboard-elevated grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5 [&>:last-child:nth-child(odd)]:col-span-2 lg:[&>:last-child:nth-child(odd)]:col-span-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    )
  }

  const { metrics, payrollCalendar, reminders } = overview
  const today = new Date()
  const headcountHeight = Math.max(256, (charts?.headcount.length ?? 0) * 34 + 56)

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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5 [&>:last-child:nth-child(odd)]:col-span-2 lg:[&>:last-child:nth-child(odd)]:col-span-1">
        <MetricCard
          compact
          label="Total Employees"
          value={String(metrics.totalEmployees)}
          hint={`Active: ${metrics.activeEmployees} | Inactive: ${metrics.inactiveEmployees}`}
          icon={Users}
          tone="primary"
          footer={{ label: 'View Employees', to: '/employees' }}
        />
        <MetricCard
          compact
          label="Present Today"
          value={String(metrics.presentToday)}
          hint={`${metrics.attendanceRate}% attendance rate`}
          icon={CalendarClock}
          tone="success"
          footer={{ label: 'View Attendance', to: '/attendance' }}
        />
        <MetricCard
          compact
          label="On Leave Today"
          value={String(metrics.onLeaveToday)}
          hint={`${metrics.leaveApproved} approved | ${metrics.leavePending} pending`}
          icon={Plane}
          tone="warning"
          footer={{ label: 'View Leave', to: '/leave' }}
        />
        <MetricCard
          compact
          label="Overtime / Night Differential"
          value={`${metrics.overtimeHours} hrs`}
          hint={`${metrics.overtimeEmployees} employees with approved OT/ND today`}
          icon={Clock3}
          tone="accent"
          footer={{ label: 'View Overtime', to: '/overtime' }}
        />
        <MetricCard
          compact
          label="Payroll Status"
          value={metrics.payrollStatusLabel}
          hint={`Next cut-off: ${metrics.nextCutoffLabel}`}
          icon={Wallet}
          tone="primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card data-tint="lavender" watermark={Clock3} className="relative overflow-hidden">
          <Card.Header className="relative items-center">
            <div>
              <Card.Title>Attendance</Card.Title>
              <Card.Description>Daily outcomes, last 7 working days</Card.Description>
            </div>
            <ViewAllLink to="/attendance" />
          </Card.Header>
          <Card.Body className="relative h-64 pt-2">
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
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }} />
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

        <Card data-tint="sage" watermark={Users} className="relative overflow-hidden">
          <Card.Header className="relative items-center">
            <div>
              <Card.Title>Headcount</Card.Title>
              <Card.Description>Employees per department</Card.Description>
            </div>
            <ViewAllLink to="/employees" />
          </Card.Header>
          <Card.Body className="relative pt-2" style={{ height: headcountHeight }}>
            {chartsLoading || !charts ? (
              <Skeleton className="h-full w-full" />
            ) : charts.headcount.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No employees yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.headcount} layout="vertical" margin={{ left: 8, right: 16, top: 4 }}>
                  <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                  <XAxis type="number" allowDecimals={false} {...AXIS} />
                  <YAxis type="category" dataKey="department" width={120} {...AXIS} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="active" name="Active" stackId="h" fill="var(--color-brand-600)" />
                  <Bar dataKey="inactive" name="Inactive" stackId="h" fill="var(--color-brand-200)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>
      </div>

      <PendingRequestsCard />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RemindersCard reminders={reminders} />
        <PayrollCalendarCard events={payrollCalendar} />
      </div>
    </div>
  )
}
