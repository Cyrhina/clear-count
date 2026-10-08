import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@ops/components/ui/Button'
import { Checkbox, RadioGroup, RadioGroupItem } from '@ops/components/ui/Checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { EmployeePickerPanel } from '@ops/components/ui/EmployeePickerPanel'
import { FormField } from '@ops/components/ui/FormField'
import { Input, Textarea } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { useSession } from '@ops/hooks/useSession'
import { BONUS_PAYOUT_MODE_LABEL, bonusPayoutMode } from '@ops/lib/payroll/bonusMatching'
import { createBonus, updateBonus, type CreateBonusInput } from '@ops/lib/services/bonusService'
import { cn } from '@ops/lib/utils/cn'
import type { BonusIncentive, BonusPayoutMode, Employee } from '@ops/types/domain'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  bonusType: z.enum(['fixed_amount', 'percentage', 'performance_based', 'output_based']),
  targetType: z.enum(['employee', 'employees', 'department', 'company']),
  targetEmployeeId: z.string().optional(),
  targetEmployeeIds: z.array(z.string()).optional(),
  targetDepartment: z.string().optional(),
  amount: z.number().positive('Must be greater than 0'),
  periodLabel: z.string().min(1, 'Required'),
  taxable: z.enum(['taxable', 'non_taxable']),
  frequency: z.enum(['one_time', 'recurring']),
  payoutMode: z.enum(['regular_payroll', 'separate_payslip']),
  notes: z.string().optional(),
  saveAsDraft: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const BONUS_TYPE_OPTIONS = [
  { value: 'fixed_amount', label: 'Fixed Amount (₱)' },
  { value: 'percentage', label: 'Percentage (%) of monthly basic pay' },
  { value: 'performance_based', label: 'Performance-Based' },
  { value: 'output_based', label: 'Output-Based' },
]

const TARGET_TYPE_OPTIONS = [
  { value: 'company', label: 'All Employees (Company-wide)' },
  { value: 'department', label: 'Employee Group / Department' },
  { value: 'employee', label: 'Individual Employee' },
  { value: 'employees', label: 'Selected Employees' },
]

const TAXABLE_OPTIONS = [
  { value: 'non_taxable', label: 'Non-Taxable' },
  { value: 'taxable', label: 'Taxable' },
]

const FREQUENCY_OPTIONS = [
  { value: 'one_time', label: 'One-time' },
  { value: 'recurring', label: 'Recurring' },
]

const PAYOUT_MODE_OPTIONS: { value: BonusPayoutMode; description: string }[] = [
  { value: 'regular_payroll', description: 'Added as an earning on the standard payroll payslip for the effective payroll period.' },
  { value: 'separate_payslip', description: 'Paid on its own standalone payslip showing only the bonus/incentive amount and its tax.' },
]

const DEFAULT_VALUES: Partial<FormValues> = {
  bonusType: 'fixed_amount',
  targetType: 'company',
  taxable: 'non_taxable',
  frequency: 'one_time',
  payoutMode: 'regular_payroll',
  saveAsDraft: false,
  targetEmployeeIds: [],
}

function valuesFromBonus(bonus: BonusIncentive): Partial<FormValues> {
  return {
    name: bonus.name,
    bonusType: bonus.bonusType,
    targetType: bonus.targetType,
    targetEmployeeId: bonus.targetEmployeeId,
    targetEmployeeIds: bonus.targetEmployeeIds ?? [],
    targetDepartment: bonus.targetDepartment,
    amount: bonus.amount,
    periodLabel: bonus.periodLabel,
    taxable: bonus.taxable ? 'taxable' : 'non_taxable',
    frequency: bonus.frequency,
    payoutMode: bonusPayoutMode(bonus),
    notes: bonus.notes,
    saveAsDraft: bonus.status === 'draft',
  }
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

/** Create or edit a bonus/incentive. Editing is offered while a bonus is still Draft or Pending Approval. */
export function BonusFormDialog({
  bonus,
  open,
  onOpenChange,
  employees,
  departments,
  onSaved,
}: {
  /** The bonus being edited; omit to create a new one. */
  bonus?: BonusIncentive
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: Employee[]
  departments: string[]
  onSaved: () => void
}) {
  const { user } = useSession()
  const { notify } = useToast()
  const isEdit = !!bonus

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: bonus ? valuesFromBonus(bonus) : DEFAULT_VALUES,
  })
  const targetType = watch('targetType')

  // Re-seed the form each time it opens, so an edit always starts from the bonus's saved values.
  useEffect(() => {
    if (open) reset(bonus ? valuesFromBonus(bonus) : DEFAULT_VALUES)
  }, [open, bonus, reset])

  async function onSubmit(values: FormValues) {
    if (values.targetType === 'employees' && !values.targetEmployeeIds?.length) {
      notify({ title: 'Pick at least one employee', tone: 'danger' })
      return
    }
    const input: CreateBonusInput = {
      name: values.name,
      bonusType: values.bonusType,
      targetType: values.targetType,
      targetEmployeeId: values.targetType === 'employee' ? values.targetEmployeeId : undefined,
      targetEmployeeIds: values.targetType === 'employees' ? values.targetEmployeeIds : undefined,
      targetDepartment: values.targetType === 'department' ? values.targetDepartment : undefined,
      amount: values.amount,
      periodLabel: values.periodLabel,
      taxable: values.taxable === 'taxable',
      frequency: values.frequency,
      payoutMode: values.payoutMode,
      notes: values.notes,
      status: values.saveAsDraft ? 'draft' : 'pending',
    }
    if (bonus) {
      await updateBonus(user, bonus.id, input)
      notify({ title: 'Bonus/Incentive updated', tone: 'success' })
    } else {
      await createBonus(user, input)
      notify({ title: `Bonus/Incentive ${values.saveAsDraft ? 'saved as draft' : 'submitted for approval'}`, tone: 'success' })
    }
    onOpenChange(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="pr-8">{isEdit ? 'Edit Bonus / Incentive' : 'New Bonus / Incentive'}</DialogTitle>
        <DialogDescription>Configure a non-regular earning before it's routed for approval and payroll integration.</DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-6">
          <FormSection title="Bonus details">
            <FormField label="Bonus Name" required error={errors.name?.message} className="sm:col-span-2">
              <Input {...register('name')} placeholder="Christmas Bonus" />
            </FormField>
            <FormField label="Bonus Type" required>
              <Controller control={control} name="bonusType" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={BONUS_TYPE_OPTIONS} />} />
            </FormField>
            <FormField label={watch('bonusType') === 'percentage' ? 'Rate (%)' : 'Amount (₱)'} required error={errors.amount?.message}>
              <Input type="number" step="0.01" inputMode="decimal" {...register('amount', { valueAsNumber: true })} />
            </FormField>
          </FormSection>

          <FormSection title="Recipients">
            <FormField label="Target Recipient" required className="sm:col-span-2">
              <Controller control={control} name="targetType" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={TARGET_TYPE_OPTIONS} />} />
            </FormField>

            {targetType === 'department' && (
              <FormField label="Department" required error={errors.targetDepartment?.message} className="sm:col-span-2">
                <Controller
                  control={control}
                  name="targetDepartment"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} placeholder="Select department" options={departments.map((d) => ({ value: d, label: d }))} />
                  )}
                />
              </FormField>
            )}

            {targetType === 'employee' && (
              <FormField label="Employee" required error={errors.targetEmployeeId?.message} className="sm:col-span-2">
                <Controller
                  control={control}
                  name="targetEmployeeId"
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
            )}

            {targetType === 'employees' && (
              <div className="sm:col-span-2">
                <Controller
                  control={control}
                  name="targetEmployeeIds"
                  render={({ field }) => (
                    <EmployeePickerPanel employees={employees.filter((e) => e.employment.status === 'active')} value={field.value ?? []} onChange={field.onChange} maxHeightClass="max-h-44" />
                  )}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="Payroll settings">
            <FormField label="Effective Payroll Period" required error={errors.periodLabel?.message}>
              <Input {...register('periodLabel')} placeholder="December 2026" />
            </FormField>
            <FormField label="Frequency" required>
              <Controller control={control} name="frequency" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={FREQUENCY_OPTIONS} />} />
            </FormField>
            <FormField label="Taxability Classification" required className="sm:col-span-2">
              <Controller control={control} name="taxable" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={TAXABLE_OPTIONS} />} />
            </FormField>
            {watch('taxable') === 'non_taxable' && (
              <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs leading-snug text-warning sm:col-span-2">
                Under BIR rules, non-taxable bonuses/13th-month-type pay beyond ₱90,000 combined per year become taxable on the excess. Verify against company policy.
              </p>
            )}
            <FormField label="Payslip Generation" required className="sm:col-span-2">
              <Controller
                control={control}
                name="payoutMode"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-2 sm:grid-cols-2" aria-label="Payslip Generation">
                    {PAYOUT_MODE_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          'flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors',
                          field.value === option.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
                        )}
                      >
                        <RadioGroupItem value={option.value} className="mt-0.5 shrink-0" />
                        <span>
                          <span className="block text-sm font-medium">{BONUS_PAYOUT_MODE_LABEL[option.value]}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{option.description}</span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </FormField>
          </FormSection>

          <FormSection title="Notes">
            <FormField label="Notes / Justification" className="sm:col-span-2">
              <Textarea {...register('notes')} placeholder="Reason for this bonus/incentive…" />
            </FormField>
          </FormSection>

          {/* Sticky so Save/Cancel stay reachable while a long form scrolls inside the dialog. */}
          <div className="sticky -bottom-4 z-10 -mx-4 -mb-4 flex flex-col gap-3 border-t border-border bg-card px-4 py-3 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Controller control={control} name="saveAsDraft" render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} />
              Save as Draft
            </label>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting}>
                {isEdit ? 'Save Changes' : watch('saveAsDraft') ? 'Save as Draft' : 'Submit for Approval'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AddBonusDialog({ employees, departments, onCreated }: { employees: Employee[]; departments: string[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>
        New Bonus/Incentive
      </Button>
      <BonusFormDialog open={open} onOpenChange={setOpen} employees={employees} departments={departments} onSaved={onCreated} />
    </>
  )
}
