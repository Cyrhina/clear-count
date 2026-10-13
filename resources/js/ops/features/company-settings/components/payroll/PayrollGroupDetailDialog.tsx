import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import { COMPANY_SETTINGS_KEY } from '@ops/features/company-settings/hooks/useCompanySettings'
import type { PayrollGroup } from '@ops/features/company-settings/types'
import { usePermission } from '@ops/hooks/usePermission'
import { apiErrorMessage } from '@ops/lib/api/http'
import { assignPayrollGroupEmployees, getPayrollGroup } from '@ops/lib/services/payrollGroupService'
import { formatDate } from '@ops/lib/utils/format'

/** A group and its members. People with payroll settings access can take a member out of the group (adding is the Assign dialog). */
export function PayrollGroupDetailDialog({ group, trigger }: { group: PayrollGroup; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  // Members come with the single-group endpoint; the list endpoint only carries their count.
  const detail = useQuery({ queryKey: [COMPANY_SETTINGS_KEY, 'group', group.id], queryFn: () => getPayrollGroup(group.id), enabled: open })
  const members = detail.data?.employees ?? []
  const canEdit = usePermission('settings.payroll.edit')
  const queryClient = useQueryClient()
  const { notify } = useToast()

  async function remove(employeeId: string, name: string) {
    try {
      await assignPayrollGroupEmployees(group.id, [employeeId], 'unassign')
    } catch (error) {
      return notify({ title: "Couldn't remove the employee", description: apiErrorMessage(error), tone: 'danger' })
    }
    notify({ title: `${name} removed from ${group.name}`, tone: 'success' })
    void queryClient.invalidateQueries({ queryKey: [COMPANY_SETTINGS_KEY] })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button size="sm">View Details</Button>}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogTitle>{group.name}</DialogTitle>
        <DialogDescription>{group.description}</DialogDescription>

        <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Payroll Frequency</p>
            <p className="mt-0.5 text-sm font-medium">{group.frequency}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cutoff Schedule</p>
            <p className="mt-0.5 text-sm font-medium">{group.cutoffDisplay}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pay Date(s)</p>
            <p className="mt-0.5 text-sm font-medium">{group.payDatesDisplay}</p>
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <p className="text-xs text-muted-foreground">Deduction Application Schedule</p>
            <p className="mt-0.5 text-sm font-medium">{group.deductionScheduleDisplay}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Compensation Type</p>
            <p className="mt-0.5 text-sm font-medium">{group.compensation ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Number of Employees</p>
            <p className="mt-0.5 text-sm font-medium">{group.employeesCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge tone={group.status === 'active' ? 'success' : 'neutral'} className="mt-0.5 capitalize">
              {group.status}
            </Badge>
          </div>
          {group.workScheduleName && (
            <div>
              <p className="text-xs text-muted-foreground">Work Schedule</p>
              <p className="mt-0.5 text-sm font-medium">{group.workScheduleName}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Effective Date</p>
            <p className="mt-0.5 text-sm font-medium">{formatDate(group.effectiveDate)}</p>
          </div>
        </div>

        <p className="mt-5 text-sm font-medium">Assigned Employees</p>
        <div className="mt-3">
          {detail.isPending ? (
            <Skeleton className="h-24" />
          ) : members.length === 0 ? (
            <EmptyState title="No employees assigned yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  {canEdit && <TableHead className="text-right">Manage</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.employeeNumber}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{employee.department ?? '—'}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{employee.status}</TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => remove(employee.id, employee.name)}>
                          Remove
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
