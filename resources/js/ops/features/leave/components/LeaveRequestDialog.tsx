import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarPlus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { LeavePreview } from '@ops/features/leave/components/LeavePreview'
import { LeaveDurationField } from '@ops/features/leave/components/LeaveDurationField'
import { Input, Textarea } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { useSession } from '@ops/hooks/useSession'
import { submitLeaveRequest } from '@ops/lib/services/leaveService'
import type { Employee, LeaveType } from '@ops/types/domain'

const schema = z.object({
  employeeId: z.string().min(1, 'Select an employee'),
  leaveTypeId: z.string().min(1, 'Select a leave type'),
  dateFrom: z.string().min(1, 'Required'),
  dateTo: z.string().optional(),
  dayPortion: z.enum(['full', 'half_am', 'half_pm']),
  reason: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function LeaveRequestDialog({
  employees,
  leaveTypes,
  onCreated,
}: {
  employees: Employee[]
  leaveTypes: LeaveType[]
  onCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const { user } = useSession()
  const { notify } = useToast()

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
  const [employeeId, leaveTypeId, dateFrom, dateTo] = watch(['employeeId', 'leaveTypeId', 'dateFrom', 'dateTo'])

  async function onSubmit(values: FormValues) {
    const dateTo = isHalf ? values.dateFrom : values.dateTo
    if (!dateTo) return setError('dateTo', { message: 'Required' })
    if (dateTo < values.dateFrom) return setError('dateTo', { message: 'Must be on or after the start date' })
    const result = await submitLeaveRequest(user, { ...values, dateTo })
    if (!result.ok) return // the live preview above already shows why
    notify({ title: 'Leave request submitted', tone: 'success' })
    reset({ dayPortion: 'full' })
    setOpen(false)
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button icon={<CalendarPlus className="size-4" />}>File Leave Request</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>File Leave Request</DialogTitle>
        <DialogDescription>Submit a leave request on behalf of an employee for manager approval.</DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid grid-cols-2 gap-4">
          <FormField label="Employee" required error={errors.employeeId?.message} className="col-span-2">
            <Controller
              control={control}
              name="employeeId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select employee"
                  options={employees.map((e) => ({ value: e.id, label: `${e.personal.firstName} ${e.personal.lastName}` }))}
                />
              )}
            />
          </FormField>
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
            <Textarea {...register('reason')} placeholder="Optional context for the approver." />
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
