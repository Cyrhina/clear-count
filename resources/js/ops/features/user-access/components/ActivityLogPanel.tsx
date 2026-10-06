import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ArrowUpDown, BarChart3, CalendarCheck2, CalendarDays, ChevronLeft, ChevronRight, Database, Download, FileText, ListFilter, ShieldCheck, Users, X, type LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Avatar } from '@ops/components/ui/Avatar'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import { useActivityLog } from '@ops/features/user-access/hooks/useUsers'
import { cn } from '@ops/lib/utils/cn'
import { formatDate } from '@ops/lib/utils/format'
import type { ActivityLogEntry, Role } from '@ops/types/domain'

const PAGE_SIZE = 10

const ROLE_LABEL: Record<Role, string> = {
  super_admin: 'Super Admin',
  company_admin: 'Company Admin',
  hr_admin: 'HR Admin',
  payroll_admin: 'Payroll Admin',
  manager: 'Manager',
  employee: 'Employee',
}

type Module = NonNullable<ActivityLogEntry['module']>

const MODULES: Record<Module, { icon: LucideIcon; tile: string }> = {
  Payroll: { icon: FileText, tile: 'bg-success/10 text-success' },
  Employees: { icon: Users, tile: 'bg-chart-blue/10 text-chart-blue' },
  Attendance: { icon: CalendarCheck2, tile: 'bg-success/10 text-success' },
  Leave: { icon: CalendarDays, tile: 'bg-success/10 text-success' },
  Reports: { icon: BarChart3, tile: 'bg-chart-violet/10 text-chart-violet' },
  'Loans & Deductions': { icon: Database, tile: 'bg-accent/10 text-accent' },
  'User Access': { icon: ShieldCheck, tile: 'bg-primary/10 text-primary' },
}

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
  Deactivated: 'bg-danger/10 text-danger',
  Viewed: 'bg-muted text-muted-foreground',
}

const DATE_RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
]

type SortKey = 'timestamp' | 'actor' | 'module' | 'kind'

const moduleOf = (e: ActivityLogEntry): Module => e.module ?? 'User Access'
const kindOf = (e: ActivityLogEntry) => e.kind ?? 'Updated'
const titleOf = (e: ActivityLogEntry) => e.title ?? e.action
const subtitleOf = (e: ActivityLogEntry) => e.subtitle ?? e.details ?? ''
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })

function KindPill({ kind, className }: { kind: string; className?: string }) {
  return <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', KIND_TONE[kind] ?? 'bg-muted text-muted-foreground', className)}>{kind}</span>
}

function ModuleTile({ module, size = 'md' }: { module: Module; size?: 'md' | 'lg' }) {
  const { icon: Icon, tile } = MODULES[module]
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-lg', tile, size === 'lg' ? 'size-11' : 'size-8')}>
      <Icon className={size === 'lg' ? 'size-5' : 'size-4'} />
    </span>
  )
}

function SortHead({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn('inline-flex items-center gap-1 font-semibold', active && 'text-foreground')}>
      {label}
      <ArrowUpDown className="size-3 opacity-60" />
    </button>
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

function DetailsPanel({ entry, filters, onClose }: { entry: ActivityLogEntry; filters: { label: string; value: string }[]; onClose: () => void }) {
  const { notify } = useToast()
  const module = moduleOf(entry)
  return (
    <Card className="h-fit p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold tracking-tight">Activity Details</h3>
        <button type="button" onClick={onClose} aria-label="Close details" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex items-start gap-3 border-b border-border pb-4">
        <ModuleTile module={module} size="lg" />
        <div className="min-w-0">
          <p className="font-display text-base font-semibold leading-tight">{kindOf(entry)}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{titleOf(entry)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDate(entry.timestamp)} • {timeOf(entry.timestamp)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4 text-sm">
        <DetailRow label="User">
          <div className="flex items-center gap-2.5">
            <Avatar name={entry.actor} size="sm" />
            <div>
              <p className="text-sm font-semibold leading-tight">{entry.actor}</p>
              {entry.actorRole && <p className="text-xs text-muted-foreground">{ROLE_LABEL[entry.actorRole]}</p>}
            </div>
          </div>
        </DetailRow>
        <DetailRow label="Module">
          <div className="flex items-center gap-2.5">
            <ModuleTile module={module} />
            <p className="font-semibold">{module}</p>
          </div>
        </DetailRow>
        <DetailRow label="Action">
          <KindPill kind={kindOf(entry)} />
        </DetailRow>
        {entry.file && (
          <DetailRow label="File Details">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <FileText className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">{entry.file.name}</p>
                <p className="text-xs text-muted-foreground">{entry.file.size}</p>
              </div>
            </div>
          </DetailRow>
        )}
        <DetailRow label="Description">
          <p className="leading-relaxed">{entry.action}</p>
          {subtitleOf(entry) && subtitleOf(entry) !== entry.action && <p className="text-xs text-muted-foreground">{subtitleOf(entry)}</p>}
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

      {entry.file && (
        <Button className="mt-4 w-full" icon={<Download className="size-4" />} onClick={() => notify({ title: 'Download not available', description: 'The original file isn’t kept in this demo.', tone: 'default' })}>
          Download File
        </Button>
      )}
    </Card>
  )
}

/** Audit trail of account and system activity: filter by date, module, user and action; click a row for its details. */
export function ActivityLogPanel() {
  const log = useActivityLog()
  const [range, setRange] = useState('30')
  const [module, setModule] = useState('all')
  const [actor, setActor] = useState('all')
  const [action, setAction] = useState('all')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('timestamp')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const customRange = from !== '' || to !== ''
  const actors = useMemo(() => [...new Set(log.map((e) => e.actor))].sort(), [log])
  const kinds = useMemo(() => [...new Set(log.map(kindOf))].sort(), [log])
  const modules = useMemo(() => [...new Set(log.map(moduleOf))].sort(), [log])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const cutoff = range === 'all' ? null : new Date(Date.now() - Number(range) * 86_400_000).toISOString()
    const rows = log.filter((e) => {
      if (customRange) {
        const day = e.timestamp.slice(0, 10)
        if ((from && day < from) || (to && day > to)) return false
      } else if (cutoff && e.timestamp < cutoff) return false
      if (module !== 'all' && moduleOf(e) !== module) return false
      if (actor !== 'all' && e.actor !== actor) return false
      if (action !== 'all' && kindOf(e) !== action) return false
      if (q && !`${titleOf(e)} ${subtitleOf(e)} ${e.action} ${e.actor}`.toLowerCase().includes(q)) return false
      return true
    })
    const value = (e: ActivityLogEntry) => (sortKey === 'timestamp' ? e.timestamp : sortKey === 'actor' ? e.actor : sortKey === 'module' ? moduleOf(e) : kindOf(e))
    return rows.sort((a, b) => (sortDir === 'asc' ? 1 : -1) * value(a).localeCompare(value(b)))
  }, [log, range, customRange, from, to, module, actor, action, search, sortKey, sortDir])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const selected = filtered.find((e) => e.id === selectedId) ?? null
  const extraFilters = [action !== 'all', search.trim() !== '', customRange].filter(Boolean).length

  const resetPage = () => setPage(1)
  const sortBy = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'timestamp' ? 'desc' : 'asc')
    }
  }

  const rangeLabel = customRange ? `${from ? formatDate(from) : 'Start'} – ${to ? formatDate(to) : 'Today'}` : (DATE_RANGES.find((r) => r.value === range)?.label ?? '')
  const relatedFilters = [
    { label: 'Date Range', value: rangeLabel },
    { label: 'Module', value: module === 'all' ? 'All Modules' : module },
    { label: 'User', value: actor === 'all' ? 'All Users' : actor },
    { label: 'Action', value: action === 'all' ? 'All Actions' : action },
  ]

  if (log.length === 0) {
    return <EmptyState icon={ShieldCheck} title="No activity yet" description="Role changes, exports and other account activity will be logged here." />
  }

  return (
    <div className={cn('grid gap-4', selected && 'lg:grid-cols-[minmax(0,1fr)_21rem]')}>
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-48">
            <Select
              value={customRange ? 'custom' : range}
              onValueChange={(v) => {
                setRange(v)
                setFrom('')
                setTo('')
                resetPage()
              }}
              aria-label="Date range"
              options={customRange ? [{ value: 'custom', label: rangeLabel }, ...DATE_RANGES] : DATE_RANGES}
            />
          </div>
          <div className="w-44">
            <Select
              value={module}
              onValueChange={(v) => {
                setModule(v)
                resetPage()
              }}
              aria-label="Module"
              options={[{ value: 'all', label: 'All Modules' }, ...modules.map((m) => ({ value: m, label: m }))]}
            />
          </div>
          <div className="w-44">
            <Select
              value={actor}
              onValueChange={(v) => {
                setActor(v)
                resetPage()
              }}
              aria-label="User"
              options={[{ value: 'all', label: 'All Users' }, ...actors.map((a) => ({ value: a, label: a }))]}
            />
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
                      resetPage()
                    }}
                    placeholder="Details, file or user…"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground">Action</label>
                  <Select
                    value={action}
                    onValueChange={(v) => {
                      setAction(v)
                      resetPage()
                    }}
                    aria-label="Action"
                    options={[{ value: 'all', label: 'All Actions' }, ...kinds.map((k) => ({ value: k, label: k }))]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground">From</label>
                    <Input type="date" value={from} max={to || undefined} onChange={(e) => (setFrom(e.target.value), resetPage())} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground">To</label>
                    <Input type="date" value={to} min={from || undefined} onChange={(e) => (setTo(e.target.value), resetPage())} />
                  </div>
                </div>
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
                        resetPage()
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

        {filtered.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={ShieldCheck} title="No activity matches these filters" description="Try a wider date range or clear a filter." />
          </div>
        ) : (
          <>
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortHead label="Date & Time" active={sortKey === 'timestamp'} onClick={() => sortBy('timestamp')} />
                    </TableHead>
                    <TableHead>
                      <SortHead label="User" active={sortKey === 'actor'} onClick={() => sortBy('actor')} />
                    </TableHead>
                    <TableHead>
                      <SortHead label="Module" active={sortKey === 'module'} onClick={() => sortBy('module')} />
                    </TableHead>
                    <TableHead>
                      <SortHead label="Action" active={sortKey === 'kind'} onClick={() => sortBy('kind')} />
                    </TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((entry) => {
                    const m = moduleOf(entry)
                    return (
                      <TableRow
                        key={entry.id}
                        className={cn('cursor-pointer', entry.id === selected?.id && 'bg-primary/5')}
                        onClick={() => setSelectedId(entry.id === selected?.id ? null : entry.id)}
                      >
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm font-medium leading-tight">{formatDate(entry.timestamp)}</p>
                          <p className="text-xs text-muted-foreground">{timeOf(entry.timestamp)}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={entry.actor} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium leading-tight">{entry.actor}</p>
                              {entry.actorRole && <p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[entry.actorRole]}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ModuleTile module={m} />
                            <span className="whitespace-nowrap text-sm">{m}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <KindPill kind={kindOf(entry)} />
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium leading-tight">{titleOf(entry)}</p>
                          {subtitleOf(entry) && subtitleOf(entry) !== titleOf(entry) && <p className="text-xs text-muted-foreground">{subtitleOf(entry)}</p>}
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length} activities
              </p>
              <nav className="flex items-center gap-1" aria-label="Pagination">
                <button type="button" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40">
                  <ChevronLeft className="size-4" />
                </button>
                {pageList(current, pages).map((p, i) =>
                  p === '…' ? (
                    <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-current={p === current ? 'page' : undefined}
                      className={cn('size-8 rounded-full text-xs font-medium', p === current ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button type="button" aria-label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40">
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
