import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@ops/components/ui/Button'

/** Floating bar shown while rows are selected: "N selected", Clear, and the bulk actions. Sits bottom-centre so it never covers the bottom-right toasts. */
export function BulkActionBar({ count, noun = 'selected', onClear, children }: { count: number; noun?: string; onClear: () => void; children: ReactNode }) {
  if (count === 0) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 print:hidden">
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-soft-lg">
        <p className="text-sm font-semibold tabular-nums">
          {count} {noun}
        </p>
        <Button size="sm" variant="ghost" icon={<X className="size-3.5" />} onClick={onClear}>
          Clear
        </Button>
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
        {children}
      </div>
    </div>
  )
}
