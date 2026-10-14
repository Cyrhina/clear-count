import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { usePayrollGroups } from '@ops/features/company-settings/hooks/usePayrollGroups'
import { WorkLogsRangePreview } from '@ops/features/payroll/components/WorkLogsSummaryCard'
import { createPayrollPeriod, fetchNextPayrollNumber } from '@ops/lib/services/payrollApiService'

const schema = z.object({
  label: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  payDate: z.string().min(1, 'Required'),
  payrollGroupId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function CreatePeriodDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const { notify } = useToast()
  const { groups } = usePayrollGroups()

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { payrollGroupId: 'all' } })
  const [startDate, endDate, selectedGroupId, payDate] = watch(['startDate', 'endDate', 'payrollGroupId', 'payDate'])
  const [nextNumber, setNextNumber] = useState<string | null>(null)

  // The number follows the pay date's year — PR001 again when the year changes.
  useEffect(() => {
    if (!open || !payDate) return setNextNumber(null)
    void fetchNextPayrollNumber(payDate).then(setNextNumber)
  }, [open, payDate])

  const groupOptions = [
    { value: 'all', label: 'All Employees (no Payroll Group filter)' },
    ...groups.filter((g) => g.status === 'active').map((g) => ({ value: g.id, label: g.name })),
  ]

  async function onSubmit(values: FormValues) {
    await createPayrollPeriod({ ...values, payrollGroupId: values.payrollGroupId === 'all' ? undefined : values.payrollGroupId })
    notify({ title: 'Payroll period created', tone: 'success' })
    reset()
    setOpen(false)
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button icon={<Plus className="size-4" />}>New Payroll Period</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>New Payroll Period</DialogTitle>
        <DialogDescription>Define the period before running payroll calculations.</DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid grid-cols-2 gap-4">
          <FormField label="Payroll Group" hint="'All Employees' runs every active employee on their own Payroll Group's frequency — e.g. a Sep 1–30 run covers both semi-monthly cutoffs. Pick a group to run one cutoff at a time (Sep 1–15, Sep 16–30)." className="col-span-2">
            <Controller
              control={control}
              name="payrollGroupId"
              render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={groupOptions} />}
            />
          </FormField>
          <FormField label="Label" required error={errors.label?.message} className="col-span-2">
            <Input {...register('label')} placeholder="Sep 16 – 30, 2026" />
          </FormField>
          <FormField label="Start date" required error={errors.startDate?.message}>
            <Input type="date" {...register('startDate')} />
          </FormField>
          <FormField label="End date" required error={errors.endDate?.message}>
            <Input type="date" {...register('endDate')} />
          </FormField>
          <FormField label="Pay date" required error={errors.payDate?.message}>
            <Input type="date" {...register('payDate')} />
          </FormField>
          <FormField label="Payroll No." hint="Assigned when the period is created. Restarts at PR001 each year, based on the pay date.">
            <Input value={nextNumber ?? 'Set the pay date'} readOnly disabled className="tabular-nums" />
          </FormField>

          <div className="col-span-2">
            <WorkLogsRangePreview
              startDate={startDate}
              endDate={endDate}
              payrollGroupId={selectedGroupId === 'all' ? undefined : selectedGroupId}
            />
          </div>

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Period
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
