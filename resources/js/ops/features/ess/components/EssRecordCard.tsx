import type { ReactNode } from 'react'
import { cn } from '@ops/lib/utils/cn'

/** Phone/tablet stand-in for an ESS table: render a list of `EssRecordCard`s inside, and keep the table in `EssTableView`. */
export function EssCardList({ children }: { children: ReactNode }) {
  return <div className="grid gap-2.5 sm:grid-cols-2 lg:hidden">{children}</div>
}

/** The desktop table — hidden below `lg`, always shown when printing. */
export function EssTableView({ children }: { children: ReactNode }) {
  return <div className="hidden lg:block print:block">{children}</div>
}

export function EssRecordCard({
  title,
  subtitle,
  badge,
  stats,
  actions,
  id,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
  stats?: { label: string; value: ReactNode }[]
  actions?: ReactNode
  id?: string
  className?: string
}) {
  return (
    <div data-highlight-id={id} className={cn('space-y-3 rounded-xl border border-border bg-card p-3.5 shadow-soft', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      {stats && stats.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
          {stats.map((s) => (
            <div key={s.label} className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</dt>
              <dd className="mt-0.5 break-words text-sm font-medium tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {actions && <div className="flex flex-wrap justify-end gap-2">{actions}</div>}
    </div>
  )
}
