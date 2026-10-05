import type { ShiftColor } from '@ops/types/domain'

/** Tailwind classes per shift colour: filled roster cell, and the legend chip. Both stay readable in light and dark. */
export const SHIFT_COLOR_CLASSES: Record<ShiftColor, { cell: string; dot: string }> = {
  teal: { cell: 'border-teal-500/30 bg-teal-500/10 text-teal-800 dark:text-teal-200', dot: 'bg-teal-500' },
  amber: { cell: 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200', dot: 'bg-amber-500' },
  violet: { cell: 'border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-200', dot: 'bg-violet-500' },
  emerald: { cell: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200', dot: 'bg-emerald-500' },
  sky: { cell: 'border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-200', dot: 'bg-sky-500' },
  rose: { cell: 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200', dot: 'bg-rose-500' },
}

export const SHIFT_COLOR_ORDER: ShiftColor[] = ['teal', 'amber', 'violet', 'emerald', 'sky', 'rose']

/** Templates without an explicit colour (created in Company Settings) get one by position, so every shift is distinguishable. */
export function colorFor(schedule: { color?: ShiftColor }, index: number): ShiftColor {
  return schedule.color ?? SHIFT_COLOR_ORDER[index % SHIFT_COLOR_ORDER.length]
}
