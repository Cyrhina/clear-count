import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarPlus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FormField } from '@ops/components/ui/FormField'
import { LeavePreview } from '@ops/features/leave/components/LeavePreview'
import { LeaveDurationField } from '@ops/features/leave/components/LeaveDurationField'
import { Input, Textarea } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useToast } from '@ops/components/ui/Toast'
import { useSelfEmployee } from '@ops/features/ess/hooks/useSelfEmployee'
import { useLeaveBalances, useLeaveRequestList, useLeaveTypeList } from '@ops/features/leave/hooks/useLeaveData'
import { apiErrorMessage } from '@ops/lib/api/http'
import { fileLeave } from '@ops/lib/services/leaveApiService'
import { portionSuffix } from '@ops/lib/leave/leaveDays'
import { formatDate } from '@ops/lib/utils/format'

const schema = z.object({
  leaveTypeId: z.string().min(1, 'Select a leave type'),
  dateFrom: z.string().min(1, 'Required'),
  dateTo: z.string().optional(),
  dayPortion: z.enum(['full', 'half_am', 'half_pm']),
  reason: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function RequestLeaveDialog({ employeeId, onCreated }: { employeeId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const { notify } = useToast()
  const { leaveTypes } = useLeaveTypeList()

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { dayPortion: 'full' } })
  const dayPortion = watch('dayPortion')
  const isHalf = dayPortion !== 'full'
  const [leaveTypeId, dateFrom, dateTo] = watch(['leaveTypeId', 'dateFrom', 'dateTo'])

  async function onSubmit(values: FormValues) {
    const dateTo = isHalf ? values.dateFrom : values.dateTo
    if (!dateTo) return setError('dateTo', { message: 'Required' })
    if (dateTo < values.dateFrom) return setError('dateTo', { message: 'Must be on or after the start date' })
    try {
      await fileLeave({ ...values, employeeId, dateTo })
    } catch (error) {
      return notify({ title: "Couldn't file the request", description: apiErrorMessage(error), tone: 'danger' })
    }
    notify({ title: 'Leave request submitted', description: 'Your manager will review it shortly.', tone: 'success' })
    reset({ dayPortion: 'full' })
    setOpen(false)
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button icon={<CalendarPlus className="size-4" />}>Request Leave</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Request Leave</DialogTitle>
        <DialogDescription>Submit a leave request for your manager to approve.</DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid grid-cols-2 gap-4">
          <FormField label="Leave type" required error={errors.leaveTypeId?.message} className="col-span-2">
            <Controller
              control={control}
              name="leaveTypeId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select leave type"
                  options={leaveTypes.map((lt) => ({ value: lt.id, label: lt.name }))}
                />
              )}
            />
          </FormField>
          <Controller control={control} name="dayPortion" render={({ field }) => <LeaveDurationField value={field.value} onChange={field.onChange} />} />
          <FormField label={isHalf ? 'Date' : 'From'} required error={errors.dateFrom?.message} className={isHalf ? 'col-span-2' : undefined}>
            <Input type="date" {...register('dateFrom')} />
          </FormField>
          {!isHalf && (
            <FormField label="To" required error={errors.dateTo?.message}>
              <Input type="date" {...register('dateTo')} />
            </FormField>
          )}

          <LeavePreview employeeId={employeeId} leaveTypeId={leaveTypeId} dateFrom={dateFrom} dateTo={dateTo} dayPortion={dayPortion} />
          <FormField label="Reason" className="col-span-2">
            <Textarea {...register('reason')} placeholder="Optional context for your manager." />
          </FormField>

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EssLeavePage() {
  const { employee, isLoading: isLoadingEmployee } = useSelfEmployee()
  const { requests, isLoading: isLoadingRequests, refetch } = useLeaveRequestList()
  const { leaveTypes } = useLeaveTypeList()
  const { balances } = useLeaveBalances()

  if (isLoadingEmployee || isLoadingRequests) return <Skeleton className="h-72" />
  if (!employee) return <p className="text-sm text-muted-foreground">No employee record linked to this account.</p>

  const myRequests = requests.filter((r) => r.employeeId === employee.id)
  const leaveTypeById = new Map(leaveTypes.map((lt) => [lt.id, lt]))
  // Only the leave types that are limited by credits have a balance to show.
  const myBalances = balances.filter((b) => b.employeeId === employee.id && b.available !== null)

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Leave"
        description="Your leave balance and request history."
        actions={<RequestLeaveDialog employeeId={employee.id} onCreated={refetch} />}
      />

      <Card className="p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Leave Balance</p>
        <div className="flex flex-wrap gap-2">
          {myBalances.map((b) => (
            <Badge key={b.leaveTypeId} tone="brand">
              {leaveTypeById.get(b.leaveTypeId)?.name}: {b.remaining} days{b.pending > 0 && ` (${b.pending} pending)`}
            </Badge>
          ))}
        </div>
      </Card>

      {myRequests.length === 0 ? (
        <EmptyState title="No leave requests yet" description="File a request above to see it here." />
      ) : (
        <div className="space-y-3">
          {myRequests.map((request) => (
            <Card key={request.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{leaveTypeById.get(request.leaveTypeId)?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.dayPortion && request.dayPortion !== 'full' ? formatDate(request.dateFrom) : <>{formatDate(request.dateFrom)} &ndash; {formatDate(request.dateTo)}</>}
                    {portionSuffix(request) && <span className="ml-2 rounded-md bg-brand-100 px-1.5 py-0.5 font-medium text-brand-800">{portionSuffix(request)}</span>}
                  </p>
                  {request.reason && <p className="mt-2 text-sm text-foreground">{request.reason}</p>}
                </div>
                <StatusBadge status={request.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
