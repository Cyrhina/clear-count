import { ChevronDown, ChevronRight } from 'lucide-react'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { Avatar } from '@ops/components/ui/Avatar'
import { Card } from '@ops/components/ui/Card'
import { RowCheckbox, SelectAllCheckbox } from '@ops/components/ui/SelectCheckboxes'
import { cn } from '@ops/lib/utils/cn'

interface CardSelection {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

/** Lets a row wrapper hand a selection checkbox to the `ReportRecordCard` inside it (export selection on phones). */
export const CardSelectionContext = createContext<CardSelection | null>(null)

/**
 * Phones and tablets show a report's rows as cards (one column on phones, two from `sm`); `lg` and up show the table.
 * The cards are hidden when printing, and the table is always shown for print / PDF.
 */
export function ReportCardList({
  count,
  noun,
  note,
  selectAll,
  children,
}: {
  count: number
  noun: string
  note?: string
  /** Adds a select-all checkbox before the count, for reports whose rows can be ticked for export. */
  selectAll?: { state: boolean | 'indeterminate'; onChange: (checked: boolean) => void }
  children: ReactNode
}) {
  return (
    <div className="space-y-2.5 lg:hidden print:hidden">
      <div className="flex items-center justify-between gap-3 px-0.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          {selectAll && <SelectAllCheckbox state={selectAll.state} onChange={selectAll.onChange} label="Select all rows" />}
          <span>
            {count} {noun}
          </span>
        </span>
        {note && <span>{note}</span>}
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">{children}</div>
    </div>
  )
}

/** The desktop table of a report that also has a card list. */
export function ReportTableView({ children }: { children: ReactNode }) {
  return <div className="hidden lg:block print:block">{children}</div>
}

/** A labelled value inside a card's stat grid. */
export function CardStat({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <div className="text-sm font-medium tabular-nums">{children}</div>
    </div>
  )
}


/**
 * One report row as a card: an avatar (people) or none (periods, accounts), a title with a status badge,
 * up to two supporting lines and an optional stat grid. It can open something (`onClick`, chevron right) or
 * unfold the row's details in place (`details`, chevron down) — the report itself holds all the information.
 */
export function ReportRecordCard({
  title,
  badge,
  subtitle,
  meta,
  avatar,
  onClick,
  details,
  children,
}: {
  title: string
  badge?: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  /** Name to show as an initials avatar; omit for non-person rows. */
  avatar?: string
  /** Makes the card clickable and shows a right chevron. */
  onClick?: () => void
  /** Makes the card expandable: a down chevron that unfolds these details (use `CardStat`). */
  details?: ReactNode
  /** Stat grid always shown under the header (use `CardStat`). */
  children?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const selection = useContext(CardSelectionContext)
  const toggle = details ? () => setOpen((v) => !v) : onClick
  const interactive = !!toggle

  return (
    <Card watermark={null} className={cn('p-3.5', interactive && 'transition-colors hover:bg-muted/30')}>
      <div
        className={cn('flex items-center gap-3', interactive && 'cursor-pointer')}
        onClick={toggle}
        role={interactive ? (details ? 'button' : 'link') : undefined}
        aria-expanded={details ? open : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={toggle ? (e) => (e.key === 'Enter' || e.key === ' ' ? (e.preventDefault(), toggle()) : undefined) : undefined}
      >
        {selection && (
          <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <RowCheckbox checked={selection.checked} onChange={selection.onChange} label={selection.label} />
          </div>
        )}
        {avatar && <Avatar name={avatar} size="md" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-tight">{title}</p>
            {badge}
          </div>
          {subtitle && <p className="mt-0.5 text-xs">{subtitle}</p>}
          {meta && <p className="text-[11px] text-muted-foreground">{meta}</p>}
        </div>
        {details ? (
          <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
        ) : (
          onClick && <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
      </div>
      {children && <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-border pt-3">{children}</div>}
      {details && open && <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-border pt-3">{details}</div>}
    </Card>
  )
}
