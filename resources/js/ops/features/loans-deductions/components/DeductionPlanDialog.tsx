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
import { useSession } from '@ops/hooks/useSession'
import { createDeductionPlan, updateDeductionPlan } from '@ops/lib/services/benefitsService'
import type { DeductionPlan } from '@ops/types/domain'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  amountType: z.enum(['fixed', 'custom']),
  amount: z.number({ error: 'Enter an amount' }).positive('Must be greater than 0'),
  reason: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const AMOUNT_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed amount — the same for every employee' },
  { value: 'custom', label: 'Customizable — set the amount per employee' },
]

const toFormValues = (plan?: DeductionPlan): FormValues => ({ name: plan?.name ?? '', amountType: plan?.amountType ?? 'fixed', amount: plan?.amount ?? 0, reason: plan?.reason ?? '' })

/** Create or edit a recurring-deduction plan. Editing carries the change to everyone still enrolled, from the next payroll run. */
export function DeductionPlanDialog({ plan, enrolledCount = 0, onSaved, trigger }: { plan?: DeductionPlan; enrolledCount?: number; onSaved: () => void; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { user } = useSession()
  const { notify } = useToast()
  const isEdit = Boolean(plan)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(plan) })
  const amountType = watch('amountType')

  useEffect(() => {
    if (open) reset(toFormValues(plan))
  }, [open, plan, reset])

  async function onSubmit(values: FormValues) {
    const payload = { name: values.name, amountType: values.amountType, amount: values.amount, reason: values.reason?.trim() || undefined }
    const result = plan ? await updateDeductionPlan(user, plan.id, payload) : await createDeductionPlan(user, payload)
    if (!result.ok) return setError('name', { message: result.error })
    notify({
      title: isEdit ? 'Deduction updated' : 'Deduction added',
      description: isEdit
        ? enrolledCount > 0
          ? `Applied to ${enrolledCount} enrolled employee${enrolledCount === 1 ? '' : 's'} from the next payroll run.`
          : undefined
        : `${payload.name} is ready — add employees to it from its card.`,
      tone: 'success',
    })
    setOpen(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" icon={<Plus className="size-4" />}>
            Add Recurring Deduction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogTitle>{isEdit ? 'Edit recurring deduction' : 'Add recurring deduction'}</DialogTitle>
        <DialogDescription>
          {isEdit && enrolledCount > 0
            ? `Changes apply to the ${enrolledCount} employee${enrolledCount === 1 ? '' : 's'} enrolled (active or paused).`
            : 'A monthly amount split across the month’s pay runs. Create it here, then add employees to it from its card.'}
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid grid-cols-2 gap-4">
          <FormField label="Name" required error={errors.name?.message} className="col-span-2">
            <Input {...register('name')} placeholder="e.g. Cooperative Savings" />
          </FormField>
          <FormField
            label="Amount type"
            className="col-span-2"
            hint={
              amountType === 'custom'
                ? 'Each employee’s amount is entered when you add them (and can be edited later). The amount below is only the default.'
                : isEdit && plan?.amountType === 'custom'
                  ? 'Switching to a fixed amount sets everyone enrolled to the amount below.'
                  : 'Everyone enrolled is deducted the amount below; changing it updates all of them.'
            }
          >
            <Controller control={control} name="amountType" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={AMOUNT_TYPE_OPTIONS} aria-label="Amount type" />} />
          </FormField>
          <FormField label={amountType === 'custom' ? 'Default amount per month (PHP)' : 'Amount per month (PHP)'} required error={errors.amount?.message} className="col-span-2">
            <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
          </FormField>
          <FormField label="Reason / notes" className="col-span-2">
            <Textarea {...register('reason')} />
          </FormField>

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? 'Save Changes' : 'Add Deduction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
