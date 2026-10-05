import { Pencil } from 'lucide-react'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { ScheduleDialog } from '@ops/features/company-settings/components/payroll/ScheduleDialog'
import { todayKey, shiftRangeLabel } from '@ops/features/schedules/dateUtil'
import { useRoster } from '@ops/features/schedules/hooks/useRoster'
import { SHIFT_COLOR_CLASSES, colorFor } from '@ops/features/schedules/shiftColors'
import { usePermission } from '@ops/hooks/usePermission'
import { cn } from '@ops/lib/utils/cn'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** The shift templates the roster draws from — the same work schedules managed under Company & Payroll Settings. */
export function ShiftTemplatesTab() {
  const roster = useRoster(todayKey(), todayKey())
  const canManage = usePermission('schedules.manage')

  if (roster.isLoading) return <Skeleton className="h-48 w-full" />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Reusable shifts you can assign on the roster. Overnight shifts (end time before start time) are supported.</p>
        {canManage && <ScheduleDialog onSaved={roster.refetch} />}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roster.templates.map((t, i) => {
          const color = colorFor(t, i)
          const rest = DAY_LABELS.filter((_, d) => !t.daysOfWeek.includes(d))
          return (
            <Card key={t.id} watermark={null} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    <span className={cn('size-2.5 shrink-0 rounded-full', SHIFT_COLOR_CLASSES[color].dot)} />
                    <span className="truncate">{t.name}</span>
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {t.startTime}–{t.endTime}
                  </p>
                  <p className="text-xs text-muted-foreground">{shiftRangeLabel(t)}</p>
                </div>
                {canManage && (
                  <ScheduleDialog
                    schedule={t}
                    onSaved={roster.refetch}
                    trigger={
                      <Button type="button" size="sm" variant="ghost" aria-label={`Edit ${t.name}`}>
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                )}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <dt className="text-muted-foreground">Works</dt>
                <dd className="font-medium">{t.daysOfWeek.map((d) => DAY_LABELS[d]).join(', ')}</dd>
                <dt className="text-muted-foreground">Rest days</dt>
                <dd className="font-medium">{rest.length ? rest.join(', ') : 'None'}</dd>
                <dt className="text-muted-foreground">Break</dt>
                <dd className="font-medium">{t.breakMinutes ?? 0} min</dd>
                <dt className="text-muted-foreground">Grace period</dt>
                <dd className="font-medium">{t.gracePeriodMinutes ?? 0} min</dd>
              </dl>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.shiftType && <Badge tone="brand" className="capitalize">{t.shiftType}</Badge>}
                {t.endTime <= t.startTime && <Badge tone="warning">Overnight</Badge>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
