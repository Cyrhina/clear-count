import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input, Textarea } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { apiErrorMessage } from '@ops/lib/api/http'
import { fetchAttendanceRange, requestAdjustment } from '@ops/lib/services/attendanceService'
import type { Employee } from '@ops/types/domain'

const schema = z.object({
  employeeId: z.string().min(1, 'Select an employee'),
  date: z.string().min(1, 'Required'),
  requestedTimeIn: z.string().min(1, 'Required'),
  requestedTimeOut: z.string().min(1, 'Required'),
  reasonCategory: z.string().min(1, 'Select a reason category'),
  remarks: z.string().min(10, 'Give a bit more detail (10+ characters)'),
})

type FormValues = z.infer<typeof schema>

const REASON_CATEGORY_OPTIONS = [
  { value: 'Missed Time In/Out', label: 'Missed Time In/Out' },
  { value: 'System/Biometric Error', label: 'System/Biometric Error' },
  { value: 'Approved Overtime Not Reflected', label: 'Approved Overtime Not Reflected' },
  { value: 'Field Work / Official Business', label: 'Field Work / Official Business' },
  { value: 'Other', label: 'Other' },
]

export function FileAdjustmentDialog({ employees, onCreated }: { employees: Employee[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const { notify } = useToast()
  const [originalLog, setOriginalLog] = useState<{ timeIn: string | null; timeOut: string | null } | 'none' | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), reasonCategory: 'Missed Time In/Out' },
  })

  const employeeId = watch('employeeId')
  const date = watch('date')

  useEffect(() => {
    if (!employeeId || !date) {
      setOriginalLog(null)
      return
    }
    let cancelled = false
    fetchAttendanceRange(date, date, employeeId).then(([record]) => {
      if (cancelled) return
      setOriginalLog(record ? { timeIn: record.timeIn, timeOut: record.timeOut } : 'none')
    })
    return () => {
      cancelled = true
    }
  }, [employeeId, date])

  async function onSubmit(values: FormValues) {
    try {
      await requestAdjustment({ employeeId: values.employeeId, date: values.date, requestedTimeIn: values.requestedTimeIn, requestedTimeOut: values.requestedTimeOut, reason: values.remarks, reasonCategory: values.reasonCategory })
    } catch (error) {
      return notify({ title: "Couldn't file the adjustment", description: apiErrorMessage(error), tone: 'danger' })
    }
    notify({ title: 'Adjustment filed', description: 'Sent for approval.', tone: 'success' })
    reset({ employeeId: '', date: new Date().toISOString().slice(0, 10), requestedTimeIn: '', requestedTimeOut: '', reasonCategory: 'Missed Time In/Out', remarks: '' })
    setOpen(false)
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button icon={<Plus className="size-4" />}>File Adjustment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>File Attendance Adjustment</DialogTitle>
        <DialogDescription>Manually log a correction for any employee and date. This will be sent for approval.</DialogDescription>

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
                  options={employees.map((e) => ({
                    value: e.id,
                    label: `${e.personal.firstName} ${e.personal.lastName} (${e.employeeNumber})`,
                  }))}
                />
              )}
            />
          </FormField>

          <FormField label="Date of adjustment" required error={errors.date?.message} className="col-span-2">
            <Input type="date" {...register('date')} />
          </FormField>

          <FormField label="Original clock in" hint={originalLog === 'none' ? 'No record on file for this date' : undefined}>
            <Input value={originalLog && originalLog !== 'none' ? (originalLog.timeIn ?? '—') : '—'} disabled />
          </FormField>
          <FormField label="Original clock out" hint={originalLog === 'none' ? 'No record on file for this date' : undefined}>
            <Input value={originalLog && originalLog !== 'none' ? (originalLog.timeOut ?? '—') : '—'} disabled />
          </FormField>

          <FormField label="Corrected clock in" required error={errors.requestedTimeIn?.message}>
            <Input type="time" {...register('requestedTimeIn')} />
          </FormField>
          <FormField label="Corrected clock out" required error={errors.requestedTimeOut?.message}>
            <Input type="time" {...register('requestedTimeOut')} />
          </FormField>

          <FormField label="Reason category" required className="col-span-2">
            <Controller
              control={control}
              name="reasonCategory"
              render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={REASON_CATEGORY_OPTIONS} />}
            />
          </FormField>

          <FormField label="Remarks / Notes" required error={errors.remarks?.message} className="col-span-2">
            <Textarea {...register('remarks')} placeholder="Explain what happened and why the record needs correcting." />
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
