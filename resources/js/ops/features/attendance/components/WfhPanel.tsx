import { ChevronDown, ChevronRight, Home } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import { ApplyWfhDialog, WEEKDAYS } from '@ops/features/attendance/components/ApplyWfhDialog'
import { useWfh } from '@ops/features/attendance/hooks/useWfh'
import { useAllEmployees } from '@ops/features/employees/hooks/useAllEmployees'
import { usePermission } from '@ops/hooks/usePermission'
import { apiErrorMessage } from '@ops/lib/api/http'
import { cancelWfh, decideWfh, endWfh, setWfhMonthlyLimit } from '@ops/lib/services/wfhArrangementService'
import { todayKey } from '@ops/lib/services/wfhService'
import type { WfhArrangement } from '@ops/types/domain'

const TIMES_LABEL = { default: 'Schedule times', custom: 'Fixed times', self_log: 'Self-logged' } as const

interface Group {
  key: string
  items: WfhArrangement[]
  first: WfhArrangement
  state: 'pending' | 'active' | 'ended'
}

function stateOf(a: WfhArrangement): Group['state'] {
  if (a.status === 'pending') return 'pending'
  if (a.status === 'approved' && (!a.dateTo || a.dateTo >= todayKey())) return 'active'
  return 'ended'
}

const span = (a: WfhArrangement) => (a.dateTo ? (a.dateTo === a.dateFrom ? a.dateFrom : `${a.dateFrom} to ${a.dateTo}`) : `From ${a.dateFrom}`)
const weekdays = (a: WfhArrangement) => (a.daysOfWeek.length ? a.daysOfWeek.map((d) => WEEKDAYS[d]).join(', ') : 'All working days')

export function WfhPanel() {
  const { notify } = useToast()
  const { employees } = useAllEmployees()
  const canAdjust = usePermission('attendance.adjust')
  const canSetLimit = usePermission('attendance.approve')
  const { arrangements: list, monthlyLimit, refetch } = useWfh()
  const [limitDraft, setLimitDraft] = useState(String(monthlyLimit))
  useEffect(() => setLimitDraft(String(monthlyLimit)), [monthlyLimit])
  const [filter, setFilter] = useState('active')
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [action, setAction] = useState<{ type: 'cancel' | 'end'; ids: string[] } | null>(null)
  const [lastDay, setLastDay] = useState(todayKey())
  const [busy, setBusy] = useState(false)

  async function saveLimit() {
    const next = Math.max(0, Math.floor(Number(limitDraft)) || 0)
    if (next === monthlyLimit) return setLimitDraft(String(next))
    try {
      await setWfhMonthlyLimit(next)
    } catch (error) {
      notify({ title: "Couldn't save the limit", description: apiErrorMessage(error), tone: 'danger' })
    }
    refetch()
  }

  const nameOf = useMemo(() => {
    const m = new Map(employees.map((e) => [e.id, `${e.personal.firstName} ${e.personal.lastName}`]))
    return (id: string) => m.get(id) ?? id
  }, [employees])

  const groups = useMemo<Group[]>(() => {
    const by = new Map<string, WfhArrangement[]>()
    for (const a of list ?? []) by.set(a.batchId ?? a.id, [...(by.get(a.batchId ?? a.id) ?? []), a])
    return [...by].map(([key, items]) => {
      const states = items.map(stateOf)
      const state = states.includes('pending') ? 'pending' : states.includes('active') ? 'active' : 'ended'
      return { key, items, first: items[0], state }
    })
  }, [list])

  const pending = (list ?? []).filter((a) => a.status === 'pending')
  const shown = groups.filter((g) => g.state === filter)

  async function decide(id: string, decision: 'approved' | 'rejected') {
    try {
      await decideWfh([id], decision)
      notify({ title: decision === 'approved' ? 'WFH approved' : 'WFH rejected', tone: 'success' })
    } catch (error) {
      notify({ title: "Couldn't decide the request", description: apiErrorMessage(error), tone: 'danger' })
    }
    refetch()
  }

  async function confirm() {
    if (!action) return
    setBusy(true)
    try {
      const n = action.type === 'cancel' ? await cancelWfh(action.ids) : await endWfh(action.ids, lastDay)
      notify({ title: `${n} arrangement${n === 1 ? '' : 's'} ${action.type === 'cancel' ? 'cancelled' : 'ended'}`, tone: 'success' })
    } catch (error) {
      notify({ title: "Couldn't update the arrangements", description: apiErrorMessage(error), tone: 'danger' })
    }
    setBusy(false)
    setAction(null)
    refetch()
  }

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (!next.delete(key)) next.add(key)
      return next
    })

  const label = (g: Group) => (g.items.length > 1 ? `${g.items.length} employees` : nameOf(g.first.employeeId))
  const statusBadge = (g: Group) => (g.state === 'ended' && g.first.status === 'approved' ? <Badge>Ended</Badge> : <StatusBadge status={g.state === 'active' ? 'active' : g.state === 'pending' ? 'pending' : g.first.status} />)

  function actions(g: Group) {
    if (!canAdjust) return null
    const cancellable = g.items.filter((a) => a.status === 'pending' || a.status === 'approved').map((a) => a.id)
    const endable = g.items.filter((a) => a.status === 'approved' && (!a.dateTo || a.dateTo >= todayKey())).map((a) => a.id)
    return (
      <div className="flex flex-wrap gap-2">
        {endable.length > 0 && (
          <Button size="sm" variant="secondary" onClick={() => (setLastDay(todayKey()), setAction({ type: 'end', ids: endable }))}>
            End after…
          </Button>
        )}
        {cancellable.length > 0 && (
          <Button size="sm" variant="secondary" onClick={() => setAction({ type: 'cancel', ids: cancellable })}>
            Cancel
          </Button>
        )}
      </div>
    )
  }

  const members = (g: Group) => (
    <ul className="space-y-1 text-xs text-muted-foreground">
      {g.items.map((a) => (
        <li key={a.id}>{nameOf(a.employeeId)}</li>
      ))}
    </ul>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <ApplyWfhDialog onApplied={refetch} />
        <FormField label="Monthly WFH limit per employee (0 = no limit)" className="w-full sm:w-72">
          <Input type="number" min={0} max={31} value={limitDraft} disabled={!canSetLimit} onChange={(e) => setLimitDraft(e.target.value)} onBlur={saveLimit} />
        </FormField>
      </div>

      {pending.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-display text-sm font-semibold tracking-tight">Pending requests ({pending.length})</h3>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {pending.map((a) => (
              <div key={a.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-sm">
                  <p className="font-medium">{nameOf(a.employeeId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {span(a)} · {weekdays(a)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.reason} — requested by {a.requestedBy}
                  </p>
                </div>
                {canAdjust && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => decide(a.id, 'approved')}>
                      Approve
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => decide(a.id, 'rejected')}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-sm font-semibold tracking-tight">Arrangements</h3>
          <Select
            className="w-40"
            value={filter}
            onValueChange={setFilter}
            aria-label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
              { value: 'ended', label: 'Ended' },
            ]}
          />
        </div>

        {list === null ? (
          <Skeleton className="h-48" />
        ) : shown.length === 0 ? (
          <EmptyState icon={Home} title="No WFH arrangements" description="Nothing matches this status." />
        ) : (
          <>
            <div className="hidden lg:block print:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Who</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Weekdays</TableHead>
                    <TableHead>Times</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created by</TableHead>
                    <TableHead className="print:hidden" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shown.map((g) => (
                    <TableRow key={g.key} className="align-top">
                      <TableCell>
                        {g.items.length > 1 ? (
                          <button type="button" className="flex items-center gap-1 font-medium" onClick={() => toggle(g.key)} aria-expanded={open.has(g.key)}>
                            {open.has(g.key) ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                            {label(g)}
                          </button>
                        ) : (
                          <span className="font-medium">{label(g)}</span>
                        )}
                        {open.has(g.key) && <div className="mt-2 pl-5">{members(g)}</div>}
                      </TableCell>
                      <TableCell className="capitalize">{g.first.kind}</TableCell>
                      <TableCell>{span(g.first)}</TableCell>
                      <TableCell>{weekdays(g.first)}</TableCell>
                      <TableCell>{TIMES_LABEL[g.first.times]}</TableCell>
                      <TableCell className="max-w-56">{g.first.reason}</TableCell>
                      <TableCell>{statusBadge(g)}</TableCell>
                      <TableCell>{g.first.requestedBy}</TableCell>
                      <TableCell className="print:hidden">{actions(g)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:hidden print:hidden">
              {shown.map((g) => (
                <div key={g.key} className="space-y-2 rounded-2xl border border-border bg-card p-4 text-sm shadow-soft">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{label(g)}</p>
                    {statusBadge(g)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="capitalize">{g.first.kind}</span> · {span(g.first)} · {weekdays(g.first)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {TIMES_LABEL[g.first.times]} · {g.first.reason} · by {g.first.requestedBy}
                  </p>
                  {g.items.length > 1 && (
                    <>
                      <button type="button" className="text-xs text-primary hover:underline" onClick={() => toggle(g.key)}>
                        {open.has(g.key) ? 'Hide employees' : 'Show employees'}
                      </button>
                      {open.has(g.key) && members(g)}
                    </>
                  )}
                  {actions(g)}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <Dialog open={!!action} onOpenChange={(v) => !v && setAction(null)}>
        <DialogContent>
          <DialogTitle>{action?.type === 'cancel' ? 'Cancel WFH?' : 'End WFH after a date'}</DialogTitle>
          <DialogDescription>
            {action?.type === 'cancel'
              ? `This cancels ${action.ids.length} arrangement${action.ids.length === 1 ? '' : 's'}. Auto-recorded WFH days are removed; real punches stay.`
              : 'WFH stays up to and including this day. Auto-recorded days after it are removed; real punches stay.'}
          </DialogDescription>
          {action?.type === 'end' && (
            <FormField label="Last WFH day" className="mt-4">
              <Input type="date" value={lastDay} onChange={(e) => setLastDay(e.target.value)} />
            </FormField>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAction(null)}>
              Keep
            </Button>
            <Button variant={action?.type === 'cancel' ? 'destructive' : 'primary'} onClick={confirm} isLoading={busy} disabled={action?.type === 'end' && !lastDay}>
              {action?.type === 'cancel' ? 'Cancel WFH' : 'End WFH'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
