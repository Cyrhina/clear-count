import type { ReactNode } from 'react'

/** Title, description and primary action of a Benefits / Loans / Deductions section — stacked on phones, side by side from tablet up. */
export function SectionIntro({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-base font-semibold sm:text-sm sm:font-medium">{title}</p>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action && <div className="shrink-0 max-sm:[&>button]:w-full">{action}</div>}
    </div>
  )
}
