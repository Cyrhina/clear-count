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
import { decideLeaveRequest, decideLeaveRequests } from '@ops/lib/services/leaveService'
import { cn } from '@ops/lib/utils/cn'
import { formatDate } from '@ops/lib/utils/format'
import type { Employee, LeaveRequest, LeaveType } from '@ops/types/domain'

export function LeaveRequestsList({
  requests,
  employees,
  leaveTypes,
  onDecided,
  highlightId,
}: {
  requests: LeaveRequest[]
  employees: Employee[]
  leaveTypes: LeaveType[]
  onDecided: () => void
  highlightId?: string
}) {
  const canApprove = usePermission('leave.approve')
  const { user } = useSession()
  const { notify } = useToast()
  const employeeById = new Map(employees.map((e) => [e.id, e]))
  const leaveTypeById = new Map(leaveTypes.map((lt) => [lt.id, lt]))

  async function decide(id: string, decision: 'approved' | 'rejected') {
    await decideLeaveRequest(user, id, decision)
    notify({ title: `Leave request ${decision}`, tone: decision === 'approved' ? 'success' : 'default' })
    onDecided()
  }

  const pendingIds = useMemo(() => (canApprove ? requests.filter((r) => r.status === 'pending').map((r) => r.id) : []), [requests, canApprove])
  const selection = useRowSelection(pendingIds)

  async function decideSelected(decision: 'approved' | 'rejected') {
    const n = await decideLeaveRequests(user, [...selection.selected], decision)
    notify({ title: `${n} request${n === 1 ? '' : 's'} ${decision}`, tone: decision === 'approved' ? 'success' : 'default' })
    selection.clear()
    onDecided()
  }

  if (requests.length === 0) {
    return <EmptyState title="No leave requests yet" description="Requests filed for employees will appear here." />
  }

  return (
    <div className="space-y-3">
      {pendingIds.length > 0 && (
        <label className="flex w-fit cursor-pointer items-center gap-2 px-1 text-xs text-muted-foreground">
          <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} label="Select all pending requests" />
          Select all pending ({pendingIds.length})
        </label>
      )}
      {requests.map((request) => {
        const employee = employeeById.get(request.employeeId)
        const leaveType = leaveTypeById.get(request.leaveTypeId)
        return (
          <Card key={request.id} id={`row-${request.id}`} className={cn('p-4', request.id === highlightId && 'highlight-target')}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              {canApprove && request.status === 'pending' && (
                <RowCheckbox checked={selection.selected.has(request.id)} onChange={(c) => selection.toggle(request.id, c)} label={employee ? `${employee.personal.firstName} ${employee.personal.lastName}` : 'request'} />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {employee ? `${employee.personal.firstName} ${employee.personal.lastName}` : 'Unknown employee'}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">{leaveType?.name}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(request.dateFrom)} &ndash; {formatDate(request.dateTo)}
                </p>
                {request.reason && <p className="mt-2 text-sm text-foreground">{request.reason}</p>}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={request.status} />
                {canApprove && request.status === 'pending' && (
                  <>
                    <Button size="sm" variant="secondary" icon={<X className="size-3.5" />} onClick={() => decide(request.id, 'rejected')}>
                      Reject
                    </Button>
                    <Button size="sm" icon={<Check className="size-3.5" />} onClick={() => decide(request.id, 'approved')}>
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        )
      })}

      <BulkActionBar count={selection.selected.size} noun={selection.selected.size === 1 ? 'request selected' : 'requests selected'} onClear={selection.clear}>
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
