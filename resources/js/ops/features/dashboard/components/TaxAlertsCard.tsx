import { AlertTriangle, CheckCircle2, ChevronRight, CircleAlert, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@ops/components/ui/Card'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useTaxAlerts } from '@ops/features/dashboard/hooks/useDashboardData'
import type { TaxAlertLevel } from '@ops/lib/services/taxComplianceService'
import { cn } from '@ops/lib/utils/cn'

const LEVEL: Record<TaxAlertLevel, { icon: typeof CircleAlert; tile: string; box: string; text: string }> = {
  review: { icon: CircleAlert, tile: 'bg-danger/10 text-danger', box: 'border-danger/30 bg-danger/5', text: 'text-danger' },
  approaching: { icon: AlertTriangle, tile: 'bg-warning/10 text-warning', box: 'border-warning/30 bg-warning/5', text: 'text-warning' },
  within: { icon: CheckCircle2, tile: 'bg-success/10 text-success', box: 'border-success/30 bg-success/5', text: 'text-success' },
}

/** Most alerts of each kind shown on the dashboard — the rest are one click away in the Tax Monitoring report. */
const MAX_PER_LEVEL = 3

export function TaxAlertsCard() {
  const { alerts, isLoading } = useTaxAlerts()

  const shown = alerts
    ? (['review', 'approaching', 'within'] as const).flatMap((level) => alerts.alerts.filter((a) => a.level === level).slice(0, MAX_PER_LEVEL))
    : []
  const hidden = alerts ? alerts.counts.review + alerts.counts.approaching - shown.filter((a) => a.level !== 'within').length : 0

  return (
    <Card data-tint="peach" watermark={ReceiptText} className="relative overflow-hidden">
      <Card.Header className="relative items-center">
        <div>
          <Card.Title>Tax Alerts</Card.Title>
          <Card.Description>13th Month & other benefits and de minimis ceilings, projected for {alerts?.year ?? new Date().getFullYear()}.</Card.Description>
        </div>
        <Link to="/reports/tax-monitoring?tab=basic" className="text-xs font-medium text-primary hover:underline">
          Tax Monitoring
        </Link>
      </Card.Header>
      <Card.Body className="relative space-y-2.5 pt-2">
        {isLoading || !alerts ? (
          <>
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </>
        ) : shown.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">No tax alerts right now.</p>
        ) : (
          <>
            {shown.map((alert) => {
              const level = LEVEL[alert.level]
              return (
                <Link
                  key={alert.id}
                  to="/reports/tax-monitoring?tab=basic"
                  className={cn('flex items-start gap-3 rounded-xl border p-3.5 transition-colors hover:bg-card', level.box)}
                >
                  <span aria-hidden="true" className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', level.tile)}>
                    <level.icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-semibold', level.text)}>{alert.title}</p>
                    <p className="mt-0.5 text-sm text-foreground/80">{alert.message}</p>
                  </div>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                </Link>
              )
            })}
            {hidden > 0 && (
              <Link to="/reports/tax-monitoring?tab=basic" className="block text-center text-xs font-medium text-primary hover:underline">
                +{hidden} more to review in Tax Monitoring
              </Link>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  )
}
