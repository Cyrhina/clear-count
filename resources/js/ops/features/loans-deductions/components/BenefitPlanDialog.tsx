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
import { createBenefitPlan, updateBenefitPlan } from '@ops/lib/services/benefitsService'
import { BENEFIT_CATEGORY_META } from '@ops/features/loans-deductions/loanUtils'
import type { BenefitCategory, BenefitPlan } from '@ops/types/domain'

const NAME_PLACEHOLDER: Record<BenefitCategory, string> = { hmo: 'HMO Plan B', allowance: 'Transportation Allowance', insurance: 'Group Life Insurance', other: 'Wellness Program' }
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

const schema = z.object({
  name: z.string().min(1, 'Required'),
  provider: z.string().optional(),
  coverage: z.string().optional(),
  monthlyValue: z.number({ error: 'Enter an amount' }).positive('Must be greater than 0'),
  employeeShare: z.number({ error: 'Enter 0 or more' }).min(0, 'Enter 0 or more'),
  amountType: z.enum(['fixed', 'custom']),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const toFormValues = (plan?: BenefitPlan): FormValues => ({
  name: plan?.name ?? '',
  provider: plan?.provider ?? '',
  coverage: plan?.coverage ?? '',
  monthlyValue: plan?.monthlyValue ?? 0,
  employeeShare: plan?.employeeShare ?? 0,
  amountType: plan?.amountType ?? 'fixed',
  notes: plan?.notes ?? '',
})

const AMOUNT_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed amount — the same for every employee' },
  { value: 'custom', label: 'Customizable — set the amount per employee' },
]

/** Create or edit a plan (HMO plan, allowance, insurance policy or other benefit). Editing carries the change to everyone still enrolled, from the next payroll run. */
export function BenefitPlanDialog({
  category,
  plan,
  enrolledCount = 0,
  onSaved,
  trigger,
}: {
  category: BenefitCategory
  plan?: BenefitPlan
  enrolledCount?: number
  onSaved: () => void
  trigger?: React.ReactNode
}) {
  const noun = BENEFIT_CATEGORY_META[category].singular
  const isAllowance = category === 'allowance'
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
    const payload = {
      name: values.name,
      provider: isAllowance ? undefined : values.provider?.trim() || undefined,
      coverage: isAllowance ? undefined : values.coverage?.trim() || undefined,
      monthlyValue: values.monthlyValue,
      employeeShare: isAllowance ? 0 : values.employeeShare,
      amountType: isAllowance ? values.amountType : undefined,
      notes: values.notes?.trim() || undefined,
    }
    const result = plan ? await updateBenefitPlan(user, plan.id, payload) : await createBenefitPlan(user, { category, ...payload })
    if (!result.ok) return setError('name', { message: result.error })
    notify({
      title: isEdit ? `${cap(noun)} updated` : `${cap(noun)} added`,
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
            Add {cap(noun)}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogTitle>{isEdit ? `Edit ${noun}` : `Add ${noun}`}</DialogTitle>
        <DialogDescription>
          {isEdit && enrolledCount > 0
            ? `Changes apply to the ${enrolledCount} employee${enrolledCount === 1 ? '' : 's'} enrolled (active or paused), replacing any per-employee adjustments.`
            : `Create the ${noun} here, then add employees to it from its card.`}
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid grid-cols-2 gap-4">
          <FormField label="Name" required error={errors.name?.message} className={isAllowance ? 'col-span-2' : undefined}>
            <Input {...register('name')} placeholder={NAME_PLACEHOLDER[category]} />
          </FormField>
          {isAllowance && (
            <FormField
              label="Amount type"
              className="col-span-2"
              hint={
                amountType === 'custom'
                  ? 'Each employee’s amount is entered when you add them (and can be edited later). The amount below is only the default.'
                  : isEdit && plan?.amountType === 'custom'
                    ? 'Switching to a fixed amount sets everyone enrolled to the amount below.'
                    : 'Everyone enrolled receives the amount below; changing it updates all of them.'
              }
            >
              <Controller control={control} name="amountType" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={AMOUNT_TYPE_OPTIONS} aria-label="Amount type" />} />
            </FormField>
          )}
          {!isAllowance && (
            <FormField label="Provider">
              <Input {...register('provider')} placeholder="e.g. Maxicare" />
            </FormField>
          )}
          {!isAllowance && (
            <FormField label="Coverage" className="col-span-2">
              <Input {...register('coverage')} placeholder="e.g. Employee only · inpatient, outpatient and emergency" />
            </FormField>
          )}
          <FormField label={isAllowance ? (amountType === 'custom' ? 'Default amount per month (PHP)' : 'Monthly amount (PHP)') : 'Company-paid cost per month (PHP)'} required error={errors.monthlyValue?.message} className={isAllowance ? 'col-span-2' : undefined}>
            <Input type="number" step="0.01" {...register('monthlyValue', { valueAsNumber: true })} />
          </FormField>
          {!isAllowance && (
            <FormField label="Employee share per month (PHP)" error={errors.employeeShare?.message} hint="Deducted from pay. Leave 0 if the company covers it fully.">
              <Input type="number" step="0.01" {...register('employeeShare', { valueAsNumber: true })} />
            </FormField>
          )}
          <FormField label="Notes" className="col-span-2">
            <Textarea {...register('notes')} />
          </FormField>

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? 'Save Changes' : 'Add Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
