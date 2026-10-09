import * as PopoverPrimitive from '@radix-ui/react-popover'
import { BarChart3, Building2, CalendarCheck2, CalendarDays, ChevronLeft, ChevronRight, Database, FileText, ListFilter, ShieldCheck, Users, X, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Avatar } from '@ops/components/ui/Avatar'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { apiErrorMessage } from '@ops/lib/api/http'
import { getActivityFilterOptions, listActivity, type ActivityFilterOptions, type ActivityItem, type ActivityPage } from '@ops/lib/services/userAccessService'
import { cn } from '@ops/lib/utils/cn'
import { formatDate } from '@ops/lib/utils/format'

const PAGE_SIZE = 10

const MODULES: Record<string, { icon: LucideIcon; tile: string }> = {
  Payroll: { icon: FileText, tile: 'bg-success/10 text-success' },
  Employees: { icon: Users, tile: 'bg-chart-blue/10 text-chart-blue' },
  Attendance: { icon: CalendarCheck2, tile: 'bg-success/10 text-success' },
  Leave: { icon: CalendarDays, tile: 'bg-success/10 text-success' },
  Reports: { icon: BarChart3, tile: 'bg-chart-violet/10 text-chart-violet' },
  'Loans & Deductions': { icon: Database, tile: 'bg-accent/10 text-accent' },
  'User Access': { icon: ShieldCheck, tile: 'bg-primary/10 text-primary' },
  'Company Settings': { icon: Building2, tile: 'bg-chart-blue/10 text-chart-blue' },
}
const DEFAULT_MODULE = { icon: Database, tile: 'bg-muted text-muted-foreground' }

const KIND_TONE: Record<string, string> = {
  Exported: 'bg-success/10 text-success',
  Processed: 'bg-success/10 text-success',
  Approved: 'bg-success/10 text-success',
  Finalized: 'bg-success/10 text-success',
  Added: 'bg-success/10 text-success',
  Reactivated: 'bg-success/10 text-success',
  Updated: 'bg-chart-violet/10 text-chart-violet',
  Generated: 'bg-chart-violet/10 text-chart-violet',
  Invited: 'bg-primary/10 text-primary',
  Sent: 'bg-primary/10 text-primary',
  Deactivated: 'bg-danger/10 text-danger',
  Deleted: 'bg-danger/10 text-danger',
  Viewed: 'bg-muted text-muted-foreground',
}

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: '7_days', label: 'Last 7 days' },
  { value: '30_days', label: 'Last 30 days' },
]

type Range = 'today' | '7_days' | '30_days'

function KindPill({ kind, className }: { kind: string; className?: string }) {
  return <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', KIND_TONE[kind] ?? 'bg-muted text-muted-foreground', className)}>{kind}</span>
}

function ModuleTile({ module, size = 'md' }: { module: string | null; size?: 'md' | 'lg' }) {
  const { icon: Icon, tile } = (module && MODULES[module]) || DEFAULT_MODULE
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-lg', tile, size === 'lg' ? 'size-11' : 'size-8')}>
      <Icon className={size === 'lg' ? 'size-5' : 'size-4'} />
    </span>
  )
}

/** Page numbers with ellipses: 1 2 3 4 5 … 25 */
function pageList(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, 2, total, total - 1, page, page - 1, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: (number | '…')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…')
    out.push(p)
  })
  return out
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

function DetailsPanel({ entry, filters, onClose }: { entry: ActivityItem; filters: { label: string; value: string }[]; onClose: () => void }) {
  return (
    <Card className="h-fit p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold tracking-tight">Activity Details</h3>
        <button type="button" onClick={onClose} aria-label="Close details" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex items-start gap-3 border-b border-border pb-4">
        <ModuleTile module={entry.module} size="lg" />
        <div className="min-w-0">
          <p className="font-display text-base font-semibold leading-tight">{entry.action}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{entry.title}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {entry.formattedDate} • {entry.formattedTime}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4 text-sm">
        <DetailRow label="User">
          <div className="flex items-center gap-2.5">
            <Avatar name={entry.user.name} size="sm" />
            <div>
              <p className="text-sm font-semibold leading-tight">{entry.user.name}</p>
              {entry.user.role && <p className="text-xs text-muted-foreground">{entry.user.role}</p>}
            </div>
          </div>
        </DetailRow>
        <DetailRow label="Module">
          <div className="flex items-center gap-2.5">
            <ModuleTile module={entry.module} />
            <p className="font-semibold">{entry.module ?? '—'}</p>
          </div>
        </DetailRow>
        <DetailRow label="Action">
          <KindPill kind={entry.action} />
        </DetailRow>
        <DetailRow label="Description">
          <p className="leading-relaxed">{entry.description || entry.title}</p>
        </DetailRow>
      </div>

      <div className="mt-5 rounded-xl bg-muted/60 p-4">
        <p className="mb-2 text-xs font-semibold">Related Filters</p>
        <dl className="space-y-1.5 text-xs">
          {filters.map((f) => (
            <div key={f.label} className="grid grid-cols-[6.5rem_1fr] gap-2 border-b border-border/60 pb-1.5 last:border-0 last:pb-0">
              <dt className="text-muted-foreground">{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  )
}

/** Audit trail of account and system activity, read from the API: filter by date, module, user and action; click a row for its details. */
export function ActivityLogPanel() {
  const [options, setOptions] = useState<ActivityFilterOptions>({ modules: [], actions: [], users: [] })
  const [range, setRange] = useState<Range>('30_days')
  const [module, setModule] = useState('all')
  const [userId, setUserId] = useState('all')
  const [action, setAction] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<ActivityPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // A custom range needs both ends; with only one set the preset range stays in force.
  const customRange = from !== '' && to !== ''

  useEffect(() => {
    getActivityFilterOptions().then(setOptions).catch(() => undefined)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let cancelled = false
    listActivity({
      dateRange: customRange ? 'custom' : range,
      startDate: from,
      endDate: to,
      module: module === 'all' ? undefined : module,
      action: action === 'all' ? undefined : action,
      userId: userId === 'all' ? undefined : Number(userId),
      search: debouncedSearch,
      page,
      perPage: PAGE_SIZE,
    })
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(null)
      })
      .catch((e) => {
        if (cancelled) return
        setData(null)
        setError(apiErrorMessage(e))
      })
    return () => {
      cancelled = true
    }
  }, [customRange, range, from, to, module, action, userId, debouncedSearch, page])

  const selected = data?.items.find((e) => e.id === selectedId) ?? null
  const extraFilters = [action !== 'all', search.trim() !== '', customRange].filter(Boolean).length
  const anyFilter = module !== 'all' || userId !== 'all' || extraFilters > 0 || range !== '30_days'

  const filter = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPage(1)
  }

  const rangeLabel = customRange ? `${formatDate(from)} – ${formatDate(to)}` : (DATE_RANGES.find((r) => r.value === range)?.label ?? '')
  const relatedFilters = useMemo(
    () => [
      { label: 'Date Range', value: rangeLabel },
      { label: 'Module', value: module === 'all' ? 'All Modules' : module },
      { label: 'User', value: userId === 'all' ? 'All Users' : (options.users.find((u) => String(u.id) === userId)?.name ?? userId) },
      { label: 'Action', value: action === 'all' ? 'All Actions' : action },
    ],
    [rangeLabel, module, userId, action, options.users],
  )

  if (error) return <EmptyState icon={ShieldCheck} title="Could not load the activity log" description={error} />
  if (data === null) return <Skeleton className="h-72" />

  const noActivityAtAll = data.total === 0 && !anyFilter

  return (
    <div className={cn('grid gap-4', selected && 'lg:grid-cols-[minmax(0,1fr)_21rem]')}>
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-48">
            <Select
              value={customRange ? 'custom' : range}
              onValueChange={(v) => {
                setRange(v as Range)
                setFrom('')
                setTo('')
                setPage(1)
              }}
              aria-label="Date range"
              options={customRange ? [{ value: 'custom', label: rangeLabel }, ...DATE_RANGES] : DATE_RANGES}
            />
          </div>
          <div className="w-44">
            <Select value={module} onValueChange={filter(setModule)} aria-label="Module" options={[{ value: 'all', label: 'All Modules' }, ...options.modules.map((m) => ({ value: m, label: m }))]} />
          </div>
          <div className="w-44">
            <Select value={userId} onValueChange={filter(setUserId)} aria-label="User" options={[{ value: 'all', label: 'All Users' }, ...options.users.map((u) => ({ value: String(u.id), label: u.name }))]} />
          </div>
          <PopoverPrimitive.Root>
            <PopoverPrimitive.Trigger asChild>
              <Button variant="secondary" icon={<ListFilter className="size-4" />} className={cn(extraFilters > 0 && 'border-primary/40 text-primary')}>
                More Filters{extraFilters > 0 ? ` (${extraFilters})` : ''}
              </Button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content align="end" sideOffset={8} className="z-50 w-80 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft-lg">
                <p className="font-display text-sm font-semibold tracking-tight">More filters</p>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground">Search</label>
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    placeholder="Details or user…"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground">Action</label>
                  <Select value={action} onValueChange={filter(setAction)} aria-label="Action" options={[{ value: 'all', label: 'All Actions' }, ...options.actions.map((k) => ({ value: k, label: k }))]} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground">From</label>
                    <Input type="date" value={from} max={to || undefined} onChange={(e) => (setFrom(e.target.value), setPage(1))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground">To</label>
                    <Input type="date" value={to} min={from || undefined} onChange={(e) => (setTo(e.target.value), setPage(1))} />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">A custom range applies once both dates are set.</p>
                {extraFilters > 0 && (
                  <div className="flex justify-end border-t border-border pt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<X className="size-3.5" />}
                      onClick={() => {
                        setAction('all')
                        setSearch('')
                        setFrom('')
                        setTo('')
                        setPage(1)
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        </div>

        {noActivityAtAll ? (
          <div className="mt-4">
            <EmptyState icon={ShieldCheck} title="No activity yet" description="Role changes, invites and other account activity will be logged here." />
          </div>
        ) : data.total === 0 ? (
          <div className="mt-4">
            <EmptyState icon={ShieldCheck} title="No activity matches these filters" description="Try a wider date range or clear a filter." />
          </div>
        ) : (
          <>
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((entry) => (
                    <TableRow key={entry.id} className={cn('cursor-pointer', entry.id === selected?.id && 'bg-primary/5')} onClick={() => setSelectedId(entry.id === selected?.id ? null : entry.id)}>
                      <TableCell className="whitespace-nowrap">
                        <p className="text-sm font-medium leading-tight">{entry.formattedDate}</p>
                        <p className="text-xs text-muted-foreground">{entry.formattedTime}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={entry.user.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium leading-tight">{entry.user.name}</p>
                            {entry.user.role && <p className="truncate text-xs text-muted-foreground">{entry.user.role}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ModuleTile module={entry.module} />
                          <span className="whitespace-nowrap text-sm">{entry.module ?? '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <KindPill kind={entry.action} />
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium leading-tight">{entry.title}</p>
                        {entry.description && entry.description !== entry.title && <p className="text-xs text-muted-foreground">{entry.description}</p>}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Showing {data.from}–{data.to} of {data.total} activities
              </p>
              <nav className="flex items-center gap-1" aria-label="Pagination">
                <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40">
                  <ChevronLeft className="size-4" />
                </button>
                {pageList(page, data.lastPage).map((p, i) =>
                  p === '…' ? (
                    <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-current={p === page ? 'page' : undefined}
                      className={cn('size-8 rounded-full text-xs font-medium', p === page ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button type="button" aria-label="Next page" disabled={page === data.lastPage} onClick={() => setPage(page + 1)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40">
                  <ChevronRight className="size-4" />
                </button>
              </nav>
            </div>
          </>
        )}
      </Card>

      {selected && <DetailsPanel entry={selected} filters={relatedFilters} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
