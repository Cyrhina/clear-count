import { Pencil } from 'lucide-react'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { GrantLeaveCreditsDialog } from '@ops/features/leave/components/GrantLeaveCreditsDialog'
import { LeaveTypeDialog } from '@ops/features/leave/components/LeaveTypeDialog'
import { HIERARCHY_LABEL, HIERARCHY_LEVELS } from '@ops/features/leave/hierarchyUtil'
import { usePermission } from '@ops/hooks/usePermission'
import { useLeaveBalances } from '@ops/features/leave/hooks/useLeaveData'
import type { Employee, LeaveType } from '@ops/types/domain'

export function LeaveTypesPanel({
  leaveTypes,
  employees,
  onChanged,
  onCreditsGranted,
}: {
  leaveTypes: LeaveType[]
  employees: Employee[]
  onChanged: () => void
  onCreditsGranted: () => void
}) {
  const canManageTypes = usePermission('leave.manage_types')
  const { balances } = useLeaveBalances()

  return (
    <div className="space-y-6">
      {canManageTypes && (
        <div className="flex justify-end gap-2">
          <GrantLeaveCreditsDialog employees={employees} leaveTypes={leaveTypes} onGranted={onCreditsGranted} />
          <LeaveTypeDialog onSaved={onChanged} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {leaveTypes.map((leaveType) => {
          const mine = balances.filter((b) => b.leaveTypeId === leaveType.id)
          const totalCredits = mine.reduce((sum, b) => sum + b.credits, 0)
          const totalUsed = mine.reduce((sum, b) => sum + b.used, 0)

          return (
            <Card key={leaveType.id}>
              <Card.Header>
                <div>
                  <Card.Title>{leaveType.name}</Card.Title>
                  {leaveType.description && <Card.Description className="mt-1">{leaveType.description}</Card.Description>}
                </div>
                {canManageTypes && (
                  <LeaveTypeDialog
                    leaveType={leaveType}
                    onSaved={onChanged}
                    trigger={
                      <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />}>
                        Edit
                      </Button>
                    }
                  />
                )}
              </Card.Header>
              <Card.Body className="space-y-2 pt-2 text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={leaveType.isPaid === false ? 'neutral' : 'success'}>{leaveType.isPaid === false ? 'Unpaid' : 'Paid'}</Badge>
                  <Badge tone="neutral">{leaveType.maxCarryOver ? `Up to ${leaveType.maxCarryOver}d carry-over` : 'No carry-over'}</Badge>
                </div>
                <p>{leaveType.defaultCredits} days credited per employee by default</p>
                <p>
                  {totalUsed} of {totalCredits} total company days used this year
                </p>
              </Card.Body>
            </Card>
          )
        })}
      </div>

      <Card>
        <Card.Header>
          <div>
            <Card.Title>Credits by Hierarchy Tier</Card.Title>
            <Card.Description>Annual allowance per leave type, mapped to each employee hierarchy level.</Card.Description>
          </div>
        </Card.Header>
        <Card.Body className="pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                {HIERARCHY_LEVELS.map((level) => (
                  <TableHead key={level}>{HIERARCHY_LABEL[level]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveTypes.map((leaveType) => (
                <TableRow key={leaveType.id}>
                  <TableCell className="font-medium">{leaveType.name}</TableCell>
                  {HIERARCHY_LEVELS.map((level) => (
                    <TableCell key={level}>{leaveType.tierCredits ? `${leaveType.tierCredits[level]} days` : '—'}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  )
}
