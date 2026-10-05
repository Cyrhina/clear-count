export type RosterView = 'week' | 'month' | 'year'

const pad2 = (n: number) => String(n).padStart(2, '0')

export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
export const fromDateKey = (key: string) => new Date(`${key}T00:00:00`)
export const todayKey = () => toDateKey(new Date())

export function addDays(key: string, days: number): string {
  const d = fromDateKey(key)
  d.setDate(d.getDate() + days)
  return toDateKey(d)
}

/** Monday of the week containing the date. */
export function startOfWeek(key: string): string {
  const d = fromDateKey(key)
  return addDays(key, -((d.getDay() + 6) % 7))
}

export function weekDays(anchor: string): string[] {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function monthDays(anchor: string): string[] {
  const d = fromDateKey(anchor)
  const count = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  return Array.from({ length: count }, (_, i) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(i + 1)}`)
}

/** Previous/next window for the current view. */
export function shiftAnchor(anchor: string, view: RosterView, direction: -1 | 1): string {
  const d = fromDateKey(anchor)
  if (view === 'week') return addDays(anchor, direction * 7)
  if (view === 'month') return toDateKey(new Date(d.getFullYear(), d.getMonth() + direction, 1))
  return toDateKey(new Date(d.getFullYear() + direction, 0, 1))
}

/** The date range the roster has to load for a view. */
export function viewRange(anchor: string, view: RosterView): { from: string; to: string } {
  if (view === 'week') {
    const days = weekDays(anchor)
    return { from: days[0], to: days[6] }
  }
  const d = fromDateKey(anchor)
  if (view === 'month') {
    const days = monthDays(anchor)
    return { from: days[0], to: days[days.length - 1] }
  }
  return { from: `${d.getFullYear()}-01-01`, to: `${d.getFullYear()}-12-31` }
}

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', opts).format(d)

export function rangeLabel(anchor: string, view: RosterView): string {
  if (view === 'year') return String(fromDateKey(anchor).getFullYear())
  if (view === 'month') return fmt(fromDateKey(anchor), { month: 'long', year: 'numeric' })
  const days = weekDays(anchor)
  return `${fmt(fromDateKey(days[0]), { month: 'short', day: 'numeric' })} – ${fmt(fromDateKey(days[6]), { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export const dayShort = (key: string) => fmt(fromDateKey(key), { weekday: 'short' })
export const dayMonth = (key: string) => fmt(fromDateKey(key), { month: 'short', day: 'numeric' })

/** "09:00" → "9a", "18:00" → "6p", "12:30" → "12:30p" — the compact form used inside roster cells. */
export function shortTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'p' : 'a'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour}${suffix}` : `${hour}:${pad2(m)}${suffix}`
}

export const shiftRangeLabel = (s: { startTime: string; endTime: string }) => `${shortTime(s.startTime)}–${shortTime(s.endTime)}`
