import { Eye, Hourglass, Timer, Wallet, X } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { MetricCard } from '@ops/components/ui/MetricCard'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import { OvertimeApplicationDialog } from '@ops/features/ess/components/OvertimeApplicationDialog'
import { useOvertimeRates, useOvertimeRecords } from '@ops/features/overtime/hooks/useOvertime'
import { EssCardList, EssRecordCard, EssTableView } from '@ops/features/ess/components/EssRecordCard'
import { useSelfEmployee } from '@ops/features/ess/hooks/useSelfEmployee'
import { apiErrorMessage } from '@ops/lib/api/http'
import { withdrawOvertime } from '@ops/lib/services/overtimeApiService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { OvertimeRecord } from '@ops/types/domain'

const OT_STATUS_TONE: Record<OvertimeRecord['status'], 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function ApplicationDetailsDialog({ application, typeLabel, onOpenChange }: { application: OvertimeRecord | null; typeLabel: (type: string) => string; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={!!application} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Application Details</DialogTitle>
        <DialogDescription>{application && `Filed ${formatDate(application.requestedAt.slice(0, 10))}`}</DialogDescription>
        {application && (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Application Type</span>
              <Badge tone="brand">{typeLabel(application.type)}</Badge>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Date of Rendering</span>
              <span className="font-medium">{formatDate(application.date)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Shift / Time Window</span>
              <span className="font-medium">
                {application.startTime} – {application.endTime}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Total Hours</span>
              <span className="font-medium">{application.hours.toFixed(1)} hrs</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Status</span>
              <Badge tone={OT_STATUS_TONE[application.status]} className="capitalize">
                {application.status}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Reason / Justification</p>
              <p className="mt-1 font-medium">{application.reason ?? '—'}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function EssOvertimePage() {
  const { employee, isLoading } = useSelfEmployee()
  const { records, isLoading: isLoadingRecords, refetch } = useOvertimeRecords()
  const { rates } = useOvertimeRates()
  const { notify } = useToast()
  const [viewing, setViewing] = useState<OvertimeRecord | null>(null)

  if (isLoading || isLoadingRecords) return <Skeleton className="h-72" />
  if (!employee) return <p className="text-sm text-muted-foreground">No employee record linked to this account.</p>

  const applications = records.filter((r) => r.employeeId === employee.id)
  const otTypeLabel = (type: string) => rates.find((r) => r.key === type)?.label ?? type

  const thisMonth = todayKey().slice(0, 7)
  const approvedThisMonth = applications.filter((a) => a.status === 'approved' && a.date.slice(0, 7) === thisMonth)
  const totalApprovedHours = approvedThisMonth.reduce((sum, a) => sum + a.hours, 0)
  const pendingCount = applications.filter((a) => a.status === 'pending').length

  const hourlyRate = (employee.compensation.basicPay > 0 ? employee.compensation.basicPay : 30000) / (22 * 8)
  const estimatedPay = applications
    .filter((a) => a.status !== 'rejected')
    .reduce((sum, a) => sum + a.hours * hourlyRate * a.multiplier, 0)

  async function handleCancel(application: OvertimeRecord) {
    try {
      await withdrawOvertime(application.id)
    } catch (error) {
      return notify({ title: "Couldn't withdraw the application", description: apiErrorMessage(error), tone: 'danger' })
    }
    notify({ title: 'Application withdrawn', description: 'Your pending request has been cancelled.' })
    refetch()
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Overtime & Night Differential"
        description="Submit and track your overtime and night differential render requests."
        actions={<OvertimeApplicationDialog employeeId={employee.id} onSubmitted={refetch} />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1">
        <MetricCard
          compact
          label="Total OT Hours Approved"
          value={`${totalApprovedHours.toFixed(1)} hrs`}
          hint="This month"
          icon={Timer}
          tone="primary"
        />
        <MetricCard
          compact
          label="Pending Applications"
          value={`${pendingCount} ${pendingCount === 1 ? 'Request' : 'Requests'}`}
          hint="Awaiting manager approval"
          icon={Hourglass}
          tone="warning"
        />
        <MetricCard
          compact
          label="Estimated OT / Night Diff Pay"
          value={formatCurrency(estimatedPay)}
          hint="Pending + approved, this history"
          icon={Wallet}
          tone="accent"
        />
      </div>

      <Card>
        <Card.Header>
          <div>
            <Card.Title>Application History</Card.Title>
            <Card.Description>All your overtime and night differential requests.</Card.Description>
          </div>
        </Card.Header>
        <Card.Body className="pt-2">
          {applications.length === 0 ? (
            <EmptyState title="No applications yet" description="File your first OT / Night Diff request using the button above." />
          ) : (
            <>
            <EssCardList>
              {applications.map((app) => (
                <EssRecordCard
                  key={app.id}
                  title={formatDate(app.date)}
                  subtitle={`${app.startTime} – ${app.endTime}`}
                  badge={
                    <Badge tone={OT_STATUS_TONE[app.status]} className="capitalize">
                      {app.status}
                    </Badge>
                  }
                  stats={[
                    { label: 'Type', value: otTypeLabel(app.type) },
                    { label: 'Total Hours', value: `${app.hours.toFixed(1)} hrs` },
                    { label: 'Reason', value: <span className="line-clamp-2">{app.reason}</span> },
                  ]}
                  actions={
                    <>
                      <Button size="sm" variant="secondary" icon={<Eye className="size-3.5" />} onClick={() => setViewing(app)}>
                        View
                      </Button>
                      {app.status === 'pending' && (
                        <Button size="sm" variant="secondary" icon={<X className="size-3.5" />} onClick={() => handleCancel(app)}>
                          Cancel
                        </Button>
                      )}
                    </>
                  }
                />
              ))}
            </EssCardList>
            <EssTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Rendered / Applied</TableHead>
                  <TableHead>Application Type</TableHead>
                  <TableHead>Shift / Time Window</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{formatDate(app.date)}</TableCell>
                    <TableCell>
                      <Badge tone="brand">{otTypeLabel(app.type)}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {app.startTime} – {app.endTime}
                    </TableCell>
                    <TableCell>{app.hours.toFixed(1)} hrs</TableCell>
                    <TableCell className="max-w-xs truncate" title={app.reason}>
                      {app.reason}
                    </TableCell>
                    <TableCell>
                      <Badge tone={OT_STATUS_TONE[app.status]} className="capitalize">
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" icon={<Eye className="size-3.5" />} onClick={() => setViewing(app)}>
                          View
                        </Button>
                        {app.status === 'pending' && (
                          <Button size="sm" variant="secondary" icon={<X className="size-3.5" />} onClick={() => handleCancel(app)}>
                            Cancel
                          </Button>
                        )}
                      </div>
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

      <ApplicationDetailsDialog application={viewing} typeLabel={otTypeLabel} onOpenChange={(open) => !open && setViewing(null)} />
    </div>
  )
}
