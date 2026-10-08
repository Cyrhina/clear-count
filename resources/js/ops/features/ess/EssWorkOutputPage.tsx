import { Hourglass, Plus, Wallet, X, CheckCircle2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FormField } from '@ops/components/ui/FormField'
import { Input, Textarea } from '@ops/components/ui/Input'
import { MetricCard } from '@ops/components/ui/MetricCard'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import { EssCardList, EssRecordCard, EssTableView } from '@ops/features/ess/components/EssRecordCard'
import { useSelfEmployee } from '@ops/features/ess/hooks/useSelfEmployee'
import { useSession } from '@ops/hooks/useSession'
import { getCompensationApprovals, submitWorkLog, withdrawWorkLog } from '@ops/lib/services/compensationApprovalService'
import { cn } from '@ops/lib/utils/cn'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { CompensationApproval } from '@ops/types/domain'

const STATUS_TONE = { pending: 'warning', approved: 'success', rejected: 'danger' } as const
const todayKey = () => new Date().toISOString().slice(0, 10)

/** Employees log the hours they worked (or output they produced) here; the manager approves them under Work & Output Approvals. */
export function EssWorkOutputPage() {
  const { user } = useSession()
  const { notify } = useToast()
  const { employee, isLoading } = useSelfEmployee()
  const [logs, setLogs] = useState<CompensationApproval[] | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ workDate: todayKey(), quantity: '', description: '' })

  const load = useCallback(() => {
    if (!employee) return
    getCompensationApprovals(user).then((all) => setLogs(all.filter((a) => a.employeeId === employee.id)))
  }, [user, employee])
  useEffect(load, [load])

  if (isLoading || (employee && logs === null)) return <Skeleton className="h-72" />
  if (!employee) return <p className="text-sm text-muted-foreground">No employee record linked to this account.</p>

  const isOutput = employee.compensation.payType === 'output_based'
  // Only hourly and output-based employees are paid from approved entries, so pay figures mean nothing for anyone else.
  const paidByEntries = isOutput || employee.compensation.payType === 'hourly'
  const unit = isOutput ? (employee.compensation.outputUnit ?? 'Per Unit') : 'hrs'
  const noun = isOutput ? 'output' : 'hours'
  const rows = logs ?? []
  const quantity = Number(form.quantity)
  const valid = form.workDate && quantity > 0 && (isOutput || quantity <= 24)
  const pending = rows.filter((r) => r.status === 'pending')
  const approved = rows.filter((r) => r.status === 'approved')

  async function submit() {
    if (!employee || !valid) return
    await submitWorkLog(user, { employeeId: employee.id, workDate: form.workDate, quantity, description: form.description.trim() || (isOutput ? 'Output completed' : 'Hours worked') })
    notify({ title: 'Submitted for approval', description: 'Your manager will review this entry.', tone: 'success' })
    setOpen(false)
    setForm({ workDate: todayKey(), quantity: '', description: '' })
    load()
  }

  async function withdraw(id: string) {
    await withdrawWorkLog(user, id)
    notify({ title: 'Entry withdrawn' })
    load()
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Work & Output"
        description={`Log the ${noun} you worked so your manager can approve them for payroll.`}
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>
            Log {isOutput ? 'Output' : 'Hours'}
          </Button>
        }
      />

      <div className={cn('grid grid-cols-2 gap-3 sm:gap-4 [&>:last-child:nth-child(odd)]:col-span-2', paidByEntries ? 'sm:grid-cols-3 sm:[&>:last-child:nth-child(odd)]:col-span-1' : 'sm:[&>:last-child:nth-child(odd)]:col-span-1')}>
        <MetricCard compact label="Pending Approval" value={String(pending.length)} hint={`${pending.reduce((s, r) => s + r.quantity, 0)} ${unit} waiting`} icon={Hourglass} tone="warning" />
        <MetricCard compact label="Approved" value={String(approved.length)} hint={`${approved.reduce((s, r) => s + r.quantity, 0)} ${unit} in total`} icon={CheckCircle2} tone="success" />
        {paidByEntries && <MetricCard compact label="Pending + Approved Pay" value={formatCurrency(rows.filter((r) => r.status !== 'rejected').reduce((s, r) => s + r.amount, 0))} hint={`Rate ${formatCurrency(employee.compensation.basicPay)} / ${isOutput ? unit : 'hr'}`} icon={Wallet} tone="primary" />}
      </div>

      <Card>
        <Card.Header>
          <div>
            <Card.Title>My Entries</Card.Title>
            <Card.Description>Pending entries can be withdrawn until your manager decides on them.</Card.Description>
          </div>
        </Card.Header>
        <Card.Body className="pt-2">
          {rows.length === 0 ? (
            <EmptyState title="No entries yet" description={`Log your first ${noun} entry using the button above.`} />
          ) : (
            <>
            <EssCardList>
              {rows.map((r) => (
                <EssRecordCard
                  key={r.id}
                  title={formatDate(r.workDate)}
                  subtitle={r.decidedBy ? `Decided by ${r.decidedBy}` : undefined}
                  badge={
                    <Badge tone={STATUS_TONE[r.status]} className="capitalize">
                      {r.status}
                    </Badge>
                  }
                  stats={[
                    { label: isOutput ? 'Output' : 'Hours', value: `${r.quantity} ${r.unitLabel}` },
                    ...(paidByEntries ? [{ label: 'Amount', value: formatCurrency(r.amount) }] : []),
                    ...(r.description ? [{ label: 'Notes', value: <span className="line-clamp-2">{r.description}</span> }] : []),
                  ]}
                  actions={
                    r.status === 'pending' ? (
                      <Button size="sm" variant="secondary" icon={<X className="size-3.5" />} onClick={() => withdraw(r.id)}>
                        Withdraw
                      </Button>
                    ) : undefined
                  }
                />
              ))}
            </EssCardList>
            <EssTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work Date</TableHead>
                  <TableHead>{isOutput ? 'Output' : 'Hours'}</TableHead>
                  {paidByEntries && <TableHead>Amount</TableHead>}
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDate(r.workDate)}</TableCell>
                    <TableCell>
                      {r.quantity} {r.unitLabel}
                    </TableCell>
                    {paidByEntries && <TableCell>{formatCurrency(r.amount)}</TableCell>}
                    <TableCell className="max-w-xs truncate" title={r.description}>
                      {r.description}
                    </TableCell>
                    <TableCell>
                      <Badge tone={STATUS_TONE[r.status]} className="capitalize">
                        {r.status}
                      </Badge>
                      {r.decidedBy && <p className="mt-0.5 text-[11px] text-muted-foreground">by {r.decidedBy}</p>}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === 'pending' && (
                        <Button size="sm" variant="secondary" icon={<X className="size-3.5" />} onClick={() => withdraw(r.id)}>
                          Withdraw
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </EssTableView>
            </>
          )}
        </Card.Body>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Log {isOutput ? 'Output' : 'Hours'}</DialogTitle>
          <DialogDescription>This is sent to your manager as pending approval. Only approved entries are paid.</DialogDescription>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <FormField label="Work Date" required>
              <Input type="date" max={todayKey()} value={form.workDate} onChange={(e) => setForm((f) => ({ ...f, workDate: e.target.value }))} />
            </FormField>
            <FormField label={isOutput ? `Output (${unit})` : 'Hours Worked'} required hint={isOutput ? undefined : 'Up to 24 hours'}>
              <Input type="number" min="0" step={isOutput ? '1' : '0.25'} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
            </FormField>
            <FormField label="Notes" className="col-span-2">
              <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder={isOutput ? 'What did you complete?' : 'What did you work on?'} />
            </FormField>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!valid} onClick={submit}>
              Submit for approval
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
