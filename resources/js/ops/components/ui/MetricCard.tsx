import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@ops/components/ui/Card'
import { cn } from '@ops/lib/utils/cn'

export type MetricCardTone = 'primary' | 'success' | 'warning' | 'accent' | 'default'

export interface MetricCardProps {
  label: string
  value: string
  hint?: string
  /** Low-opacity background watermark only — never rendered as a small inline icon next to the label/value. */
  icon?: LucideIcon
  tone?: MetricCardTone
  footer?: { label: string; to?: string }
  className?: string
  /** Tighter padding and type on phones — for pages that show four cards in a 2×2 grid. */
  compact?: boolean
}

const TONE_CLASSES: Record<MetricCardTone, { watermark: string; footerText: string; accentBorder: string; tint: string }> = {
  primary: { watermark: 'text-primary/10', footerText: 'text-primary', accentBorder: 'border-t-primary/60', tint: 'bg-primary/[0.04]' },
  success: { watermark: 'text-success/10', footerText: 'text-success', accentBorder: 'border-t-success/60', tint: 'bg-success/[0.04]' },
  warning: { watermark: 'text-warning/10', footerText: 'text-warning', accentBorder: 'border-t-warning/60', tint: 'bg-warning/[0.04]' },
  accent: { watermark: 'text-accent/10', footerText: 'text-accent', accentBorder: 'border-t-accent/60', tint: 'bg-accent/[0.04]' },
  default: { watermark: 'text-muted-foreground/10', footerText: 'text-foreground', accentBorder: 'border-t-border', tint: 'bg-muted/30' },
}

export function MetricCard({ label, value, hint, icon: Icon, tone = 'default', footer, className, compact }: MetricCardProps) {
  const t = TONE_CLASSES[tone]
  return (
    <Card data-slot="metric-card" data-tone={tone} watermark={null} className={cn('relative flex h-full flex-col overflow-hidden border-t-2 p-0', t.accentBorder, t.tint, className)}>
      {Icon && <Icon className={cn('pointer-events-none absolute -right-3 -top-3 size-20', t.watermark)} aria-hidden="true" />}
      <div className={cn('relative flex flex-1 flex-col gap-2 p-5', compact && 'max-sm:gap-1.5 max-sm:p-3.5')}>
        <p className={cn('text-xs font-medium uppercase tracking-wide text-muted-foreground', compact && 'max-sm:text-[11px]')}>{label}</p>
        <p className="break-words font-display text-lg font-semibold leading-tight tracking-tight sm:text-xl lg:text-2xl">{value}</p>
        {hint && <p className="line-clamp-2 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {footer &&
        (footer.to ? (
          <Link
            to={footer.to}
            data-slot="metric-card-footer"
            className={cn('flex items-center justify-between border-t border-border bg-muted/50 px-5 py-2.5 text-xs font-medium', compact && 'max-sm:px-3.5 max-sm:py-2', ' transition-colors hover:bg-muted')}
          >
            <span className={t.footerText}>{footer.label}</span>
            <ArrowRight className={cn('size-3.5 shrink-0', t.footerText)} />
          </Link>
        ) : (
          <div data-slot="metric-card-footer" className={cn('flex items-center justify-between border-t border-border bg-muted/50 px-5 py-2.5 text-xs font-medium', compact && 'max-sm:px-3.5 max-sm:py-2', ' text-muted-foreground')}>
            <span>{footer.label}</span>
            <ArrowRight className="size-3.5 shrink-0 opacity-40" />
          </div>
        ))}
    </Card>
  )
}
