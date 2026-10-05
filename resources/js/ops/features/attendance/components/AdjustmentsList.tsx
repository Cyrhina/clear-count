import { Check, X } from 'lucide-react'
import { useMemo } from 'react'
import { StatusBadge } from '@ops/components/ui/Badge'
import { BulkActionBar } from '@ops/components/ui/BulkActionBar'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { RowCheckbox, SelectAllCheckbox } from '@ops/components/ui/SelectCheckboxes'
import { useToast } from '@ops/components/ui/Toast'
import { usePermission } from '@ops/hooks/usePermission'
import { useRowSelection } from '@ops/hooks/useRowSelection'
import { useSession } from '@ops/hooks/useSession'
import { decideAttendanceAdjustment, decideAttendanceAdjustments } from '@ops/lib/services/attendanceService'
import { cn } from '@ops/lib/utils/cn'
import { formatDate } from '@ops/lib/utils/format'
import type { AttendanceAdjustment, Employee } from '@ops/types/domain'

export function AdjustmentsList({
  adjustments,
  employees,
  onDecided,
  highlightId,
}: {
  adjustments: AttendanceAdjustment[]
  employees: Employee[]
  onDecided: () => void
  highlightId?: string
}) {
  const canApprove = usePermission('attendance.approve')
  const { user } = useSession()
  const { notify } = useToast()
  const employeeById = new Map(employees.map((e) => [e.id, e]))

  async function decide(id: string, decision: 'approved' | 'rejected') {
    await decideAttendanceAdjustment(user, id, decision)
    notify({ title: `Adjustment ${decision}`, tone: decision === 'approved' ? 'success' : 'default' })
    onDecided()
  }

  const pendingIds = useMemo(() => (canApprove ? adjustments.filter((r) => r.status === 'pending').map((r) => r.id) : []), [adjustments, canApprove])
  const selection = useRowSelection(pendingIds)

  async function decideSelected(decision: 'approved' | 'rejected') {
    const n = await decideAttendanceAdjustments(user, [...selection.selected], decision)
    notify({ title: `${n} adjustment${n === 1 ? '' : 's'} ${decision}`, tone: decision === 'approved' ? 'success' : 'default' })
    selection.clear()
    onDecided()
  }

  if (adjustments.length === 0) {
    return <EmptyState title="No adjustment requests" description="Requests from HR will show up here for approval." />
  }

  return (
    <div className="space-y-3">
      {pendingIds.length > 0 && (
        <label className="flex w-fit cursor-pointer items-center gap-2 px-1 text-xs text-muted-foreground">
          <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} label="Select all pending adjustments" />
          Select all pending ({pendingIds.length})
        </label>
      )}
      {adjustments.map((adjustment) => {
        const employee = employeeById.get(adjustment.employeeId)
        return (
          <Card key={adjustment.id} id={`row-${adjustment.id}`} className={cn('p-4', adjustment.id === highlightId && 'highlight-target')}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              {canApprove && adjustment.status === 'pending' && (
                <RowCheckbox checked={selection.selected.has(adjustment.id)} onChange={(c) => selection.toggle(adjustment.id, c)} label={employee ? `${employee.personal.firstName} ${employee.personal.lastName}` : 'adjustment'} />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {employee ? `${employee.personal.firstName} ${employee.personal.lastName}` : 'Unknown employee'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Requested {formatDate(adjustment.requestedAt)} &middot; New time: {adjustment.requestedTimeIn ?? '—'}
                  {' – '}
                  {adjustment.requestedTimeOut ?? '—'}
                </p>
                <p className="mt-2 text-sm text-foreground">{adjustment.reason}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={adjustment.status} />
                {canApprove && adjustment.status === 'pending' && (
                  <>
                    <Button size="sm" variant="secondary" icon={<X className="size-3.5" />} onClick={() => decide(adjustment.id, 'rejected')}>
                      Reject
                    </Button>
                    <Button size="sm" icon={<Check className="size-3.5" />} onClick={() => decide(adjustment.id, 'approved')}>
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        )
      })}

      <BulkActionBar count={selection.selected.size} noun={selection.selected.size === 1 ? 'adjustment selected' : 'adjustments selected'} onClear={selection.clear}>
        <Button size="sm" variant="secondary" icon={<X className="size-3.5" />} onClick={() => decideSelected('rejected')}>
          Reject Selected
        </Button>
        <Button size="sm" icon={<Check className="size-3.5" />} onClick={() => decideSelected('approved')}>
          Approve Selected
        </Button>
      </BulkActionBar>
    </div>
  )
}
