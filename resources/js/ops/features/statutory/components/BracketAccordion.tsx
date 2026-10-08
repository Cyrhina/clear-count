import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Input } from '@ops/components/ui/Input'
import { cn } from '@ops/lib/utils/cn'

/** ₱ with no trailing zeros — compact enough for a bracket range on a phone ("₱0 – ₱5,250"). */
export function formatPeso(amount: number) {
  return `₱${(Number.isFinite(amount) ? amount : 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`
}

/** Single-open accordion state for a field array; a freshly added row opens itself. */
export function useAccordionRows(rowIds: string[]) {
  const [openId, setOpenId] = useState<string | null>(null)
  const previousCount = useRef(rowIds.length)
  const justAdded = useRef(false)

  useEffect(() => {
    if (justAdded.current && rowIds.length > previousCount.current) {
      setOpenId(rowIds[rowIds.length - 1])
      justAdded.current = false
    }
    previousCount.current = rowIds.length
  }, [rowIds])

  return {
    openId,
    toggle: (id: string) => setOpenId((current) => (current === id ? null : id)),
    markAdded: () => {
      justAdded.current = true
    },
  }
}

/** Phones and tablets: one collapsible row per bracket. The header shows the range and the key amount. */
export function BracketRow({
  index,
  title,
  subtitle,
  amount,
  open,
  onToggle,
  children,
}: {
  index: number
  title: string
  subtitle: string
  amount: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className={cn('rounded-xl border bg-card transition-colors', open ? 'border-primary/60' : 'border-border')}>
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full items-center gap-3 px-3 py-3 text-left">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">{index}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium tabular-nums">{title}</span>
          <span className="block truncate text-xs tabular-nums text-muted-foreground">{subtitle}</span>
        </span>
        <span className="shrink-0 text-sm font-semibold tabular-nums">{amount}</span>
        <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="space-y-3 border-t border-border p-3">{children}</div>}
    </div>
  )
}

/** A labelled number input driven by `setValue` (the table view owns the `register`ed inputs for the same fields). */
export function NumberField({
  label,
  value,
  onChange,
  step = '1',
  nullable,
  placeholder,
}: {
  label: string
  value: number | null | undefined
  onChange: (value: number | null) => void
  step?: string
  /** An empty input means "no limit" (null) instead of NaN. */
  nullable?: boolean
  placeholder?: string
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-tight">{label}</span>
      <Input
        type="number"
        inputMode="decimal"
        step={step}
        placeholder={placeholder}
        value={value == null || Number.isNaN(value) ? '' : value}
        onChange={(e) => onChange(e.target.value === '' ? (nullable ? null : Number.NaN) : Number(e.target.value))}
      />
    </label>
  )
}

/** The highlighted summary box at the bottom of an expanded row, with its Remove action. */
export function BracketSummary({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-primary/10 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-semibold tabular-nums text-primary">{value}</p>
      </div>
      <Button type="button" variant="secondary" size="sm" className="shrink-0 text-danger" icon={<Trash2 className="size-3.5" />} onClick={onRemove}>
        Remove
      </Button>
    </div>
  )
}

/** Read-only label/value pair for viewers who cannot edit. */
export function BracketReadout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

/** Full-width add button for phones and tablets (the desktop button lives in the card header). */
export function AddBracketButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Plus className="size-4" />
      Add Bracket Row
    </button>
  )
}

/** Discard / Save pinned to the bottom of the card on phones and tablets. */
export function BracketSaveBar({ isDirty, isSubmitting, onDiscard }: { isDirty: boolean; isSubmitting: boolean; onDiscard: () => void }) {
  return (
    <div className="sticky bottom-[calc(env(safe-area-inset-bottom)-3.06rem)] z-10 -mx-4 -mb-4 mt-4 flex gap-3 rounded-b-2xl border-t border-border bg-card px-4 py-3 sm:-mx-6 sm:-mb-6 sm:px-6 md:-bottom-6 lg:hidden">
      <Button type="button" variant="secondary" className="flex-1" disabled={!isDirty} onClick={onDiscard}>
        Discard
      </Button>
      <Button type="submit" className="flex-1" isLoading={isSubmitting} disabled={!isDirty}>
        Save changes
      </Button>
    </div>
  )
}
