import { BellRing, CalendarDays, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@ops/components/ui/Badge'
import { Card } from '@ops/components/ui/Card'
import type { AdminDashboardOverview } from '@ops/lib/services/dashboardService'
import { cn } from '@ops/lib/utils/cn'

/** "Due today", "Tomorrow", "In 5 days", "Overdue by 2 days" — plus a badge tone that gets louder as the date nears. */
function dueStatus(daysLeft: number, remindDaysBefore: number): { text: string; tone: 'danger' | 'warning' | 'neutral' } {
  if (daysLeft < 0) return { text: `Overdue by ${-daysLeft} day${daysLeft === -1 ? '' : 's'}`, tone: 'danger' }
  if (daysLeft === 0) return { text: 'Due today', tone: 'danger' }
  if (daysLeft === 1) return { text: 'Tomorrow', tone: 'danger' }
  return { text: `In ${daysLeft} days`, tone: daysLeft <= remindDaysBefore ? 'warning' : 'neutral' }
}

export function ViewAllLink({ to }: { to: string }) {
  return (
    <Link to={to} className="text-xs font-medium text-primary hover:underline">
      View all
    </Link>
  )
}

/** Upcoming payroll and statutory deadlines — shared by the Company Admin and HR Admin dashboards. */
export function RemindersCard({ reminders, className }: { reminders: AdminDashboardOverview['reminders']; className?: string }) {
  return (
    <Card data-tint="peach" watermark={BellRing} className={cn('relative overflow-hidden', className)}>
      <Card.Header className="relative">
        <Card.Title>Reminders</Card.Title>
      </Card.Header>
      <Card.Body className="relative space-y-3 pt-2">
        {reminders.map((reminder) => {
          const status = dueStatus(reminder.daysLeft, reminder.remindDaysBefore)
          return (
            <Link key={reminder.id} to={reminder.to} className="flex items-start gap-2.5 rounded-lg bg-card/70 p-3 transition-colors hover:bg-card">
              <BellRing className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-medium leading-snug">{reminder.title}</p>
                  <Badge tone="brand">{reminder.category}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{reminder.summary}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                  <span className="text-muted-foreground/80">Due {reminder.dueLabel}</span>
                  <Badge tone={status.tone}>{status.text}</Badge>
                </div>
              </div>
            </Link>
          )
        })}
      </Card.Body>
    </Card>
  )
}

/** The pay cycle in progress as a timeline: cut-off, processing, release, next cut-off. */
export function PayrollCalendarCard({ events, className }: { events: AdminDashboardOverview['payrollCalendar']; className?: string }) {
  return (
    <Card data-tint="sage" watermark={CalendarDays} className={cn('relative overflow-hidden', className)}>
      <Card.Header className="relative">
        <Card.Title>Upcoming Payroll Calendar</Card.Title>
      </Card.Header>
      <Card.Body className="relative pt-2">
        <ol className="relative space-y-5 border-l border-border pl-5">
          {events.map((event) => (
            <li key={event.id} className={cn('relative', event.state === 'done' && 'opacity-70')}>
              <span
                className={cn(
                  'absolute -left-[27px] top-0.5 flex size-4 items-center justify-center rounded-full',
                  event.state === 'done' ? 'bg-success text-white' : event.state === 'current' ? 'bg-primary ring-4 ring-primary/25' : 'border-2 border-primary bg-card',
                )}
              >
                {event.state === 'done' && <CheckCircle2 className="size-3" />}
              </span>
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <Badge tone={event.state === 'done' ? 'success' : 'brand'}>{event.dateLabel}</Badge>
                {event.state === 'done' && <span className="text-[11px] font-medium text-success">Done</span>}
                {event.state === 'current' && <span className="text-[11px] font-medium text-primary">Today</span>}
              </div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.description}</p>
            </li>
          ))}
        </ol>
      </Card.Body>
    </Card>
  )
}
