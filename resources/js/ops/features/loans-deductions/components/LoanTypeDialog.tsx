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
import { createLoanType, updateLoanType } from '@ops/lib/services/loanApiService'
import type { LoanTypeConfig } from '@ops/types/domain'

const PROVIDER_OPTIONS = [
  { value: 'Company', label: 'Company' },
  { value: 'SSS', label: 'SSS' },
  { value: 'Pag-IBIG', label: 'Pag-IBIG' },
  { value: 'Other', label: 'Other' },
]

const schema = z.object({
  label: z.string().trim().min(1, 'Required'),
  provider: z.enum(['SSS', 'Pag-IBIG', 'Company', 'Other']),
  description: z.string().trim().min(1, 'Required'),
  typicalTerm: z.string().trim().min(1, 'Required'),
  typicalAmount: z.string().trim().min(1, 'Required'),
  amountType: z.enum(['fixed', 'custom']),
  fixedPrincipal: z.string(),
  fixedMonthlyDeduction: z.string(),
}).superRefine((v, ctx) => {
  if (v.amountType !== 'fixed') return
  const principal = Number(v.fixedPrincipal)
  const monthly = Number(v.fixedMonthlyDeduction)
  if (!(principal > 0)) ctx.addIssue({ code: 'custom', path: ['fixedPrincipal'], message: 'Enter an amount greater than 0' })
  if (!(monthly > 0)) ctx.addIssue({ code: 'custom', path: ['fixedMonthlyDeduction'], message: 'Enter an amount greater than 0' })
  else if (principal > 0 && monthly > principal) ctx.addIssue({ code: 'custom', path: ['fixedMonthlyDeduction'], message: 'Can’t be more than the principal' })
})

const AMOUNT_TYPE_OPTIONS = [
  { value: 'custom', label: 'Customizable — principal and deduction set per employee' },
  { value: 'fixed', label: 'Fixed terms — the same for every employee' },
]

type FormValues = z.infer<typeof schema>

function toFormValues(type?: LoanTypeConfig): FormValues {
  return {
    label: type?.label ?? '',
    provider: type?.provider ?? 'Company',
    description: type?.description ?? '',
    typicalTerm: type?.typicalTerm ?? '',
    typicalAmount: type?.typicalAmount ?? '',
    amountType: type?.amountType ?? 'custom',
    fixedPrincipal: type?.fixedPrincipal ? String(type.fixedPrincipal) : '',
    fixedMonthlyDeduction: type?.fixedMonthlyDeduction ? String(type.fixedMonthlyDeduction) : '',
  }
}

export function LoanTypeDialog({ type, existing, onSaved, trigger }: { type?: LoanTypeConfig; existing: LoanTypeConfig[]; onSaved: () => void; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [duplicate, setDuplicate] = useState(false)
  const { notify } = useToast()
  const isEdit = Boolean(type)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(type) })
  const amountType = watch('amountType')

  useEffect(() => {
    if (open) {
      reset(toFormValues(type))
      setDuplicate(false)
    }
  }, [open, type, reset])

  async function onSubmit(values: FormValues) {
    const taken = existing.some((t) => t.id !== type?.id && t.label.trim().toLowerCase() === values.label.toLowerCase())
    if (taken) {
      setDuplicate(true)
      return
    }
    const { fixedPrincipal, fixedMonthlyDeduction, ...rest } = values
    const fixed = values.amountType === 'fixed'
    const payload = { ...rest, fixedPrincipal: fixed ? Number(fixedPrincipal) : undefined, fixedMonthlyDeduction: fixed ? Number(fixedMonthlyDeduction) : undefined }
    if (type) {
      await updateLoanType(type.id, payload)
      notify({ title: 'Loan type updated', tone: 'success' })
    } else {
      await createLoanType(payload)
      notify({ title: `${values.label} added`, description: 'It’s now available when adding an employee loan.', tone: 'success' })
    }
    setOpen(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" icon={<Plus className="size-4" />}>
            Add Loan Type
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogTitle>{isEdit ? 'Edit loan type' : 'Add loan type'}</DialogTitle>
        <DialogDescription>
          {type?.builtIn
            ? 'Built-in types keep their provider and payroll setting; you can change how they’re described.'
            : 'Custom loan types are collected through payroll like a Company Loan, following that entry in Company & Payroll Settings → Deductions.'}
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid grid-cols-2 gap-4">
          <FormField label="Loan type name" required error={errors.label?.message ?? (duplicate ? 'A loan type with this name already exists' : undefined)} className="col-span-2">
            <Input {...register('label', { onChange: () => setDuplicate(false) })} placeholder="e.g. Salary Advance" />
          </FormField>
          <FormField label="Provider" className="col-span-2">
            <Controller control={control} name="provider" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={PROVIDER_OPTIONS} disabled={type?.builtIn} />} />
          </FormField>
          <FormField label="Description" required error={errors.description?.message} className="col-span-2">
            <Textarea {...register('description')} />
          </FormField>
          <FormField
            label="Amount type"
            className="col-span-2"
            hint={amountType === 'fixed' ? 'Applies to loans added from now on; existing loans keep their own terms.' : 'The principal and monthly deduction are entered for each employee when you add them to this loan type.'}
          >
            <Controller control={control} name="amountType" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={AMOUNT_TYPE_OPTIONS} aria-label="Amount type" />} />
          </FormField>
          {amountType === 'fixed' && (
            <>
              <FormField label="Principal (PHP)" required error={errors.fixedPrincipal?.message}>
                <Input type="number" step="0.01" {...register('fixedPrincipal')} />
              </FormField>
              <FormField label="Monthly deduction (PHP)" required error={errors.fixedMonthlyDeduction?.message}>
                <Input type="number" step="0.01" {...register('fixedMonthlyDeduction')} />
              </FormField>
            </>
          )}
          <FormField label="Typical term" required error={errors.typicalTerm?.message}>
            <Input {...register('typicalTerm')} placeholder="e.g. 6 months" />
          </FormField>
          <FormField label="Typical amount" required error={errors.typicalAmount?.message}>
            <Input {...register('typicalAmount')} placeholder="e.g. Up to 1 month of basic pay" />
          </FormField>

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? 'Save Changes' : 'Add Loan Type'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
