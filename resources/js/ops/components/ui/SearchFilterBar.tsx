import { Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@ops/components/ui/Button'
import { FiltersPopover } from '@ops/components/ui/FiltersPopover'
import { Input } from '@ops/components/ui/Input'
import { cn } from '@ops/lib/utils/cn'

export interface SearchFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder: string
  /** Filter fields for the "Filters" panel (use `FilterField` / `SortControl`). Omit for a search-only bar. */
  filters?: ReactNode
  /** How many filters are on — shown as a badge on the Filters button. */
  activeCount?: number
  /** Adds a "Clear Filters" action to the panel (it also clears the search, so pass your own reset). */
  onClear?: () => void
  /** Right-aligned note, e.g. "12 of 40 records". */
  trailing?: ReactNode
  className?: string
}

/** The app's standard list toolbar: a search box with the "Filters" popover beside it. */
export function SearchFilterBar({ search, onSearchChange, placeholder, filters, activeCount = 0, onClear, trailing, className }: SearchFilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 print:hidden', className)}>
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="pl-9" />
      </div>
      {filters && (
        <FiltersPopover
          activeCount={activeCount}
          footer={
            onClear &&
            (activeCount > 0 || search.trim() !== '') && (
              <Button size="sm" variant="ghost" icon={<X className="size-3.5" />} onClick={onClear}>
                Clear Filters
              </Button>
            )
          }
        >
          {filters}
        </FiltersPopover>
      )}
      {trailing && <div className="ml-auto self-center text-sm text-muted-foreground">{trailing}</div>}
    </div>
  )
}
