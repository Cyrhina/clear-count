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
import type { CompensationType, GroupFrequency, PayrollGroup, PayrollGroupInput, PayrollRules, Schedule } from '@ops/features/company-settings/types'
import { apiErrorMessage, fieldErrors } from '@ops/lib/api/http'
import { DEDUCTION_SCHEDULE_HELP, deductionScheduleOptions, resolveDeductionSchedule } from '@ops/lib/payroll/deductionSchedule'
import { createPayrollGroup, updatePayrollGroup } from '@ops/lib/services/payrollGroupService'
import type { DeductionSchedule, PayrollFrequency } from '@ops/types/domain'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  frequency: z.enum(['monthly', 'semi_monthly', 'weekly', 'bi_weekly']),
  effectiveDate: z.string().min(1, 'Required'),
  // Cutoff
  firstPeriodEndDay: z.string(), // semi-monthly: the day period 1 ends (period 2 runs from the next day to month end)
  monthStartDay: z.string(), // monthly: the day the pay month starts
  startWeekday: z.string(), // weekly and bi-weekly
  anchorDate: z.string(), // bi-weekly
  // Pay dates
  payDateType: z.enum(['fixed_days', 'last_working_day', 'weekday_after_cutoff']),
  payDay1: z.string(),
  payDay2: z.string(),
  payWeekday: z.string(),
  weeksAfter: z.string(),
  weekendRule: z.enum(['previous', 'next', 'none']),
  // Other
  deductionSchedule: z.enum(['DIVIDED', 'FIRST_PERIOD', 'LAST_PERIOD', 'SECOND_AND_LAST_PERIOD', 'CUSTOM_SPLIT', 'FULL_MONTHLY']),
  compensationTypeId: z.string(),
  workScheduleId: z.string(),
})

type FormValues = z.infer<typeof schema>

const FREQUENCY_OPTIONS: { value: GroupFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'semi_monthly', label: 'Semi-monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-weekly' },
]

const WEEKDAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((label, i) => ({ value: String(i + 1), label }))

const WEEKEND_RULE_OPTIONS = [
  { value: 'previous', label: 'Pay on the Friday before' },
  { value: 'next', label: 'Pay on the Monday after' },
  { value: 'none', label: 'Pay on the date as is' },
]

const dayOptions = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => ({ value: String(from + i), label: String(from + i) }))

/** The deduction-schedule helper is keyed by the shared frequency names, where bi-weekly is spelled without the underscore. */
const toSharedFrequency = (f: GroupFrequency): PayrollFrequency => (f === 'bi_weekly' ? 'biweekly' : f)

type DeductionDefaults = Partial<Record<PayrollFrequency, DeductionSchedule>>

/** The pay-date kinds a frequency allows (the server rejects the others). */
function payDateTypes(frequency: GroupFrequency): { value: FormValues['payDateType']; label: string }[] {
  if (frequency === 'monthly') return [{ value: 'fixed_days', label: 'A fixed day of the month' }, { value: 'last_working_day', label: 'Last working day of the month' }]
  if (frequency === 'semi_monthly') return [{ value: 'fixed_days', label: 'Two fixed days of the month' }]
  return [{ value: 'weekday_after_cutoff', label: 'A weekday after the cutoff ends' }]
}

const iso = (d: Date) => d.toISOString().slice(0, 10)

function toFormValues(group: PayrollGroup | undefined, deductionDefaults: DeductionDefaults | undefined): FormValues {
  const frequency: GroupFrequency = group?.frequencyKey ?? 'semi_monthly'
  const cutoff = group?.cutoffConfig
  const pay = group?.payDateConfig
  return {
    name: group?.name ?? '',
    description: group?.description ?? '',
    frequency,
    effectiveDate: group?.effectiveDate ?? iso(new Date()),
    firstPeriodEndDay: String(cutoff?.periods?.[0]?.endDay ?? 15),
    monthStartDay: String(cutoff?.startDay ?? 1),
    startWeekday: String(cutoff?.startWeekday ?? 1),
    anchorDate: cutoff?.anchorDate ?? '',
    payDateType: pay?.type ?? payDateTypes(frequency)[0].value,
    payDay1: String(pay?.days?.[0] ?? 15),
    payDay2: String(pay?.days?.[1] ?? 30),
    payWeekday: String(pay?.weekday ?? 5),
    weeksAfter: String(pay?.weeksAfter ?? 1),
    weekendRule: pay?.weekendRule ?? 'previous',
    deductionSchedule: resolveDeductionSchedule(toSharedFrequency(frequency), group?.deductionSchedule, deductionDefaults),
    compensationTypeId: group?.compensationTypeId ?? '',
    workScheduleId: group?.workScheduleId ?? '',
  }
}

/** ISO weekday (1 = Monday ... 7 = Sunday) of a YYYY-MM-DD date. */
function isoWeekday(date: string): number {
  const day = new Date(`${date}T00:00:00`).getDay()
  return day === 0 ? 7 : day
}

/** Turns the flat form into the cutoff and pay-date rules the API stores. Throws a message when a rule cannot be built. */
function buildInput(values: FormValues): PayrollGroupInput {
  const frequency = values.frequency
  const periodic = frequency === 'monthly' || frequency === 'semi_monthly'

  let cutoffConfig: PayrollGroupInput['cutoffConfig']
  if (frequency === 'semi_monthly') {
    const end = Number(values.firstPeriodEndDay)
    cutoffConfig = { periods: [{ startDay: 1, endDay: end }, { startDay: end + 1, endDay: 'end' }] }
  } else if (frequency === 'monthly') {
    cutoffConfig = { startDay: Number(values.monthStartDay) }
  } else if (frequency === 'weekly') {
    cutoffConfig = { startWeekday: Number(values.startWeekday) }
  } else {
    if (!values.anchorDate || isoWeekday(values.anchorDate) !== Number(values.startWeekday)) {
      throw new Error('The first period start must be a date that falls on the chosen start weekday.')
    }
    cutoffConfig = { startWeekday: Number(values.startWeekday), anchorDate: values.anchorDate }
  }

  let payDateConfig: PayrollGroupInput['payDateConfig']
  if (periodic && values.payDateType === 'last_working_day') payDateConfig = { type: 'last_working_day' }
  else if (periodic) payDateConfig = { type: 'fixed_days', days: frequency === 'monthly' ? [Number(values.payDay1)] : [Number(values.payDay1), Number(values.payDay2)], weekendRule: values.weekendRule }
  else payDateConfig = { type: 'weekday_after_cutoff', weekday: Number(values.payWeekday), weeksAfter: Number(values.weeksAfter), weekendRule: values.weekendRule }

  return {
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    status: 'active',
    frequencyKey: frequency,
    effectiveDate: values.effectiveDate,
    cutoffConfig,
    payDateConfig,
    deductionSchedule: values.deductionSchedule,
    compensationTypeId: values.compensationTypeId || undefined,
    workScheduleId: values.workScheduleId || undefined,
  }
}

export function PayrollGroupDialog({
  group,
  compensationTypes,
  schedules,
  deductionDefaults,
  onSaved,
  trigger,
}: {
  group?: PayrollGroup
  compensationTypes: CompensationType[]
  schedules: Schedule[]
  /** Company default Deduction Application Schedule per frequency (Payroll Rules). */
  deductionDefaults?: PayrollRules['defaultDeductionSchedules']
  onSaved: () => void
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { notify } = useToast()
  const isEdit = Boolean(group)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(group, deductionDefaults) })

  useEffect(() => {
    if (open) {
      reset(toFormValues(group, deductionDefaults))
      setFormError(null)
    }
  }, [open, group, deductionDefaults, reset])

  const frequency = watch('frequency')
  const payDateType = watch('payDateType')
  const deductionOptions = deductionScheduleOptions(toSharedFrequency(frequency))
  const selectedDeduction = deductionOptions.find((o) => o.value === watch('deductionSchedule'))
  const periodic = frequency === 'monthly' || frequency === 'semi_monthly'

  function handleFrequencyChange(value: GroupFrequency) {
    setValue('frequency', value)
    setValue('payDateType', payDateTypes(value)[0].value)
    // Options differ per frequency — keep the current choice if still valid, else use the company default.
    setValue('deductionSchedule', resolveDeductionSchedule(toSharedFrequency(value), watch('deductionSchedule'), deductionDefaults))
  }

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      const input = buildInput(values)
      if (isEdit && group) await updatePayrollGroup(group.id, { ...input, status: group.status })
      else await createPayrollGroup(input)
    } catch (error) {
      const fields = fieldErrors(error)
      if (fields.name) setError('name', { message: fields.name })
      if (fields.effective_date) setError('effectiveDate', { message: fields.effective_date })
      setFormError(fields.cutoff_config ?? fields.pay_date_config ?? fields.deduction_schedule ?? (fields.name || fields.effective_date ? null : apiErrorMessage(error)))
      return
    }
    notify({ title: isEdit ? 'Payroll group updated' : 'Payroll group created', tone: 'success' })
    setOpen(false)
    onSaved()
  }

  const compensationOptions = [{ value: '', label: 'None' }, ...compensationTypes.filter((c) => c.isActive || c.id === group?.compensationTypeId).map((c) => ({ value: c.id, label: c.name }))]
  const scheduleOptions = [{ value: '', label: 'None' }, ...schedules.map((s) => ({ value: s.id, label: s.name }))]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" icon={<Plus className="size-4" />}>
            Add Payroll Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogTitle>{isEdit ? 'Edit Payroll Group' : 'Add Payroll Group'}</DialogTitle>
        <DialogDescription>Defines how and when this group of employees is processed for payroll.</DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid grid-cols-2 gap-4">
          <FormField label="Group name" required error={errors.name?.message} className="col-span-2">
            <Input {...register('name')} placeholder="Monthly Admin Payroll" />
          </FormField>
          <FormField label="Description" className="col-span-2">
            <Textarea {...register('description')} />
          </FormField>
          <FormField label="Payroll frequency" required>
            <Controller
              control={control}
              name="frequency"
              render={({ field }) => <Select value={field.value} onValueChange={(v) => handleFrequencyChange(v as GroupFrequency)} options={FREQUENCY_OPTIONS} />}
            />
          </FormField>
          <FormField label="Effective date" required error={errors.effectiveDate?.message}>
            <Input type="date" {...register('effectiveDate')} />
          </FormField>

          <p className="col-span-2 -mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cutoff</p>
          {frequency === 'semi_monthly' && (
            <FormField label="Period 1 ends on day" hint="Period 1 starts on the 1st. Period 2 runs from the next day to the end of the month.">
              <Controller control={control} name="firstPeriodEndDay" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={dayOptions(1, 27)} />} />
            </FormField>
          )}
          {frequency === 'monthly' && (
            <FormField label="Pay month starts on day" hint="1 means the 1st to the end of the month; 26 means the 26th of last month to the 25th.">
              <Controller control={control} name="monthStartDay" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={dayOptions(1, 28)} />} />
            </FormField>
          )}
          {(frequency === 'weekly' || frequency === 'bi_weekly') && (
            <FormField label="Pay week starts on">
              <Controller control={control} name="startWeekday" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={WEEKDAY_OPTIONS} />} />
            </FormField>
          )}
          {frequency === 'bi_weekly' && (
            <FormField label="First period starts on" hint="Any real period start; every 14 days from it. It must fall on the weekday chosen.">
              <Input type="date" {...register('anchorDate')} />
            </FormField>
          )}

          <p className="col-span-2 -mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pay dates</p>
          <FormField label="Paid on" className={periodic && payDateType === 'last_working_day' ? 'col-span-2' : ''}>
            <Controller control={control} name="payDateType" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={payDateTypes(frequency)} disabled={payDateTypes(frequency).length === 1} />} />
          </FormField>
          {periodic && payDateType === 'fixed_days' && (
            <FormField label={frequency === 'monthly' ? 'Pay day' : 'Pay days'} hint="A day past the end of a short month means its last day.">
              <div className="flex gap-2">
                <Controller control={control} name="payDay1" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={dayOptions(1, 31)} />} />
                {frequency === 'semi_monthly' && <Controller control={control} name="payDay2" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={dayOptions(1, 31)} />} />}
              </div>
            </FormField>
          )}
          {!periodic && (
            <>
              <FormField label="Pay weekday">
                <Controller control={control} name="payWeekday" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={WEEKDAY_OPTIONS} />} />
              </FormField>
              <FormField label="Weeks after the cutoff ends">
                <Controller control={control} name="weeksAfter" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={dayOptions(1, 4)} />} />
              </FormField>
            </>
          )}
          {payDateType !== 'last_working_day' && (
            <FormField label="If the pay date is on a weekend" className="col-span-2">
              <Controller control={control} name="weekendRule" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={WEEKEND_RULE_OPTIONS} />} />
            </FormField>
          )}

          <FormField label="Deduction application schedule" required hint={`${selectedDeduction?.description ?? ''} ${DEDUCTION_SCHEDULE_HELP}`} className="col-span-2">
            <Controller
              control={control}
              name="deductionSchedule"
              render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={deductionOptions.map((o) => ({ value: o.value, label: o.label }))} disabled={deductionOptions.length === 1} />}
            />
          </FormField>
          <FormField label="Default compensation type">
            <Controller control={control} name="compensationTypeId" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={compensationOptions} />} />
          </FormField>
          <FormField label="Work schedule">
            <Controller control={control} name="workScheduleId" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={scheduleOptions} />} />
          </FormField>

          {formError && (
            <p role="alert" className="col-span-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}

          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? 'Save Changes' : 'Add Payroll Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
