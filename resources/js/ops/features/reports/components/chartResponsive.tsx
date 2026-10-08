import { useEffect, useState } from 'react'
import type { ReportViewMode } from '@ops/features/reports/components/shared'
import { useMediaQuery } from '@ops/hooks/useMediaQuery'
import { cn } from '@ops/lib/utils/cn'
import { formatCurrency } from '@ops/lib/utils/format'

/** Below this width (phones and tablets) charts get a lighter treatment: fewer points, shorter labels, no Split view. */
const COMPACT_QUERY = '(max-width: 1023px)'

/** True on phones and tablets — but never while printing, so PDF / print always carries the full chart. */
export function useCompactCharts(): boolean {
  const narrow = useMediaQuery(COMPACT_QUERY)
  const [printing, setPrinting] = useState(false)
  useEffect(() => {
    const on = () => setPrinting(true)
    const off = () => setPrinting(false)
    window.addEventListener('beforeprint', on)
    window.addEventListener('afterprint', off)
    return () => {
      window.removeEventListener('beforeprint', on)
      window.removeEventListener('afterprint', off)
    }
  }, [])
  return narrow && !printing
}

/** The Graph / Table / Split choice. Split view is desktop-only, so a phone or tablet falls back to Graph. */
export function useViewMode(): [ReportViewMode, (mode: ReportViewMode) => void] {
  const compact = useCompactCharts()
  const [mode, setMode] = useState<ReportViewMode>('split')
  return [compact && mode === 'split' ? 'graph' : mode, setMode]
}

/** How much of a chart's data a phone or tablet shows by default, and whether the viewer has asked for all of it. */
export function useChartLimit(total: number, limit: number) {
  const compact = useCompactCharts()
  const [showAll, setShowAll] = useState(false)
  return {
    compact,
    limit,
    total,
    showAll,
    limited: compact && !showAll && total > limit,
    /** Whether the "Show all" control is worth offering. */
    canToggle: compact && total > limit,
    toggle: () => setShowAll((v) => !v),
  }
}

/** The latest `n` points of a time-ordered series (or all of them when not limited). */
export function latest<T>(items: T[], n: number, limited: boolean): T[] {
  return limited ? items.slice(-n) : items
}

/** The `n` biggest entries by `valueOf`, with the remainder folded into a single "Others" entry (or all entries when not limited). */
export function topWithOthers<T>(entries: [string, T][], n: number, valueOf: (t: T) => number, merge: (rest: T[]) => T, limited: boolean): [string, T][] {
  if (!limited) return entries
  const sorted = [...entries].sort((a, b) => valueOf(b[1]) - valueOf(a[1]))
  const top = sorted.slice(0, n)
  const rest = sorted.slice(n)
  return rest.length > 0 ? [...top, ['Others', merge(rest.map(([, t]) => t))]] : top
}

/** ₱500K / ₱1.2M — keeps a currency axis narrow enough for a phone. Tooltips and tables keep the full amount. */
export function compactCurrency(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  const trim = (n: number) => String(Math.round(n * 10) / 10)
  if (abs >= 1_000_000) return `${sign}₱${trim(abs / 1_000_000)}M`
  if (abs >= 1_000) return `${sign}₱${trim(abs / 1_000)}K`
  return `${sign}₱${Math.round(abs)}`
}

/** The axis formatter for a currency value: short on phones/tablets, the full amount on desktop. */
export function currencyAxis(compact: boolean): (value: number) => string {
  return compact ? compactCurrency : formatCurrency
}

/** "Jul 2026" → "Jul" when every label is in the same year, otherwise "Jul ’26". Leaves other labels as they are. */
export function shortMonthFormatter(labels: string[]): (label: string) => string {
  const years = new Set(labels.map((l) => /\b(\d{4})$/.exec(l)?.[1]).filter(Boolean))
  return (label) => {
    const match = /^([A-Za-z]{3,})\s+(\d{4})$/.exec(label)
    if (!match) return label
    return years.size <= 1 ? match[1] : `${match[1]} ’${match[2].slice(2)}`
  }
}

/** "Sep 28 – Oct 4, 2026" → "Sep 28": the start of a payroll period is enough to place it on a narrow axis. */
export function shortPeriodLabel(label: string): string {
  return label.split(/\s[–-]\s/)[0]
}

/** Tells a phone/tablet viewer the chart is showing part of the data, with a way to see all of it. */
export function ChartLimitNote({
  limit,
  noun,
  kind,
  detail,
  hidden,
}: {
  limit: ReturnType<typeof useChartLimit>
  /** What the points are, plural: "months", "departments". */
  noun: string
  /** `latest` for time series, `top` for ranked categories. */
  kind: 'latest' | 'top'
  /** Overrides the default explanation after the count, e.g. why these rows were picked. */
  detail?: string
  /** Hide it while the report is in Table mode. */
  hidden?: boolean
}) {
  if (!limit.canToggle || hidden) return null
  return (
    <div className={cn('flex items-center justify-between gap-3 text-xs text-muted-foreground print:hidden')}>
      <span>
        {limit.showAll ? `Showing all ${limit.total} ${noun}` : `Showing ${kind === 'latest' ? 'latest' : 'top'} ${limit.limit} of ${limit.total} ${noun}${detail ? ` · ${detail}` : kind === 'top' ? ' · rest grouped as Others' : ''}`}
      </span>
      <button type="button" onClick={limit.toggle} className="shrink-0 font-medium text-primary hover:underline">
        {limit.showAll ? 'Show fewer' : 'Show all'}
      </button>
    </div>
  )
}
