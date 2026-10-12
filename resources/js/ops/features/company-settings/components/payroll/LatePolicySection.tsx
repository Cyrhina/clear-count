import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { RadioGroup, RadioGroupItem } from '@ops/components/ui/Checkbox'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Switch } from '@ops/components/ui/Switch'
import { useToast } from '@ops/components/ui/Toast'
import { useSession } from '@ops/hooks/useSession'
import { updatePayrollRules } from '@ops/lib/services/payrollSettingsService'
import { cn } from '@ops/lib/utils/cn'
import type { LateCountingPeriod, PayrollRules } from '@ops/types/domain'

type FormValues = Pick<
  PayrollRules,
  'lateGracePeriodMinutes' | 'lateDeductionEnabled' | 'lateDeductionMethod' | 'latePerMinuteDeduction' | 'lateCountingPeriod' | 'lateCustomStartMonth' | 'lateCustomStartDay'
>

const DEDUCTION_METHOD_OPTIONS = [
  { value: 'per_minute', label: 'Per-Minute Deduction' },
  { value: 'fixed', label: 'Fixed Deduction' },
]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_OPTIONS = MONTHS.map((label, i) => ({ value: String(i + 1), label }))

const PERIODS: { value: LateCountingPeriod; label: string; badge?: string; description: string; example: string }[] = [
  {
    value: 'calendar_year',
    label: 'Calendar Year',
    badge: 'Recommended',
    description: 'Resets every January 1. Best when disciplinary policies follow the calendar year.',
    example: 'Every late from Jan 1 to Dec 31, 2026 counts toward the 2026 record; the count resets on Jan 1, 2027.',
  },
  {
    value: 'rolling',
    label: 'Rolling Period',
    description: "Resets based on each employee's first late. Best for monitoring lateness over a rolling year instead of a shared cycle.",
    example: 'First late on Apr 28, 2026 stays in the count until Apr 28, 2027; the next period starts on the first late after that.',
  },
  {
    value: 'anniversary',
    label: 'Employment Anniversary Year',
    description: "Resets on each employee's work anniversary. Best when attendance monitoring follows length of service.",
    example: 'Hired Jun 15, 2025: the counting year runs Jun 15, 2026 to Jun 14, 2027.',
  },
  {
    value: 'custom',
    label: 'Custom Fixed Period',
    description: 'Resets on a yearly date you choose, such as a fiscal year or a performance review cycle.',
    example: 'Start Jul 1: the period runs Jul 1 to Jun 30 every year.',
  },
  {
    value: 'monthly',
    label: 'Monthly Reset',
    description: 'Counts each month separately. Use only if that matches your policy; it is not recommended for disciplinary tracking.',
    example: 'Lates in March and April are counted on their own, each starting again from #1.',
  },
]

function toFormValues(rules?: PayrollRules): FormValues {
  return {
    lateGracePeriodMinutes: rules?.lateGracePeriodMinutes ?? 10,
    lateDeductionEnabled: rules?.lateDeductionEnabled ?? true,
    lateDeductionMethod: rules?.lateDeductionMethod ?? 'per_minute',
    latePerMinuteDeduction: rules?.latePerMinuteDeduction ?? 0,
    lateCountingPeriod: rules?.lateCountingPeriod ?? 'calendar_year',
    lateCustomStartMonth: rules?.lateCustomStartMonth ?? 1,
    lateCustomStartDay: rules?.lateCustomStartDay ?? 1,
  }
}

/** Everything about tardiness in one place: grace period, deduction, and how the per-employee late count resets. */
export function LatePolicySection({ rules, canEdit, onRefetch }: { rules?: PayrollRules; canEdit: boolean; onRefetch: () => void }) {
  const { user } = useSession()
  const { notify } = useToast()
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({ defaultValues: toFormValues(rules) })

  useEffect(() => {
    reset(toFormValues(rules))
  }, [rules, reset])

  const period = watch('lateCountingPeriod')
  const deductionOn = watch('lateDeductionEnabled')

  async function onSubmit(values: FormValues) {
    await updatePayrollRules(user, {
      ...values,
      lateGracePeriodMinutes: Number(values.lateGracePeriodMinutes),
      latePerMinuteDeduction: Number(values.latePerMinuteDeduction),
      lateCustomStartMonth: Number(values.lateCustomStartMonth),
      lateCustomStartDay: Number(values.lateCustomStartDay),
    })
    notify({ title: 'Late policy updated', tone: 'success' })
    onRefetch()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm font-medium">Late Policy</p>

      <Card className="p-5">
        <Card.Title>Grace Period & Deduction</Card.Title>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <FormField label="Grace period (minutes)" className="sm:col-span-3 sm:max-w-xs">
            <Input type="number" min={0} disabled={!canEdit} {...register('lateGracePeriodMinutes')} />
          </FormField>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm sm:col-span-3">
            <span>
              Deduct pay for late
              <span className="block text-xs text-muted-foreground">Turn off if your company does not deduct for lateness. Lates are still counted.</span>
            </span>
            <Controller control={control} name="lateDeductionEnabled" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!canEdit} />} />
          </label>
          {deductionOn && (
            <>
              <FormField label="Deduction method" className="sm:col-span-2">
                <Controller control={control} name="lateDeductionMethod" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={DEDUCTION_METHOD_OPTIONS} disabled={!canEdit} />} />
              </FormField>
              <FormField label="Per-minute deduction (PHP)">
                <Input type="number" step="0.01" min={0} disabled={!canEdit} {...register('latePerMinuteDeduction')} />
              </FormField>
            </>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <Card.Title>Late Counting Period</Card.Title>
        <Card.Description>Decides when an employee's late count (Late #1, #2, …) starts again. It applies to Daily Attendance, biometrics import and the Late & Absence report.</Card.Description>
        <Controller
          control={control}
          name="lateCountingPeriod"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} disabled={!canEdit} className="mt-4 grid gap-3">
              {PERIODS.map((p) => (
                <label
                  key={p.value}
                  className={cn('flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4', field.value === p.value && 'border-primary bg-primary/5', !canEdit && 'cursor-default')}
                >
                  <RadioGroupItem value={p.value} className="mt-0.5" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {p.label}
                      {p.badge && <Badge tone="success">{p.badge}</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                    <p className="text-xs text-muted-foreground">Example: {p.example}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          )}
        />

        {period === 'custom' && (
          <div className="mt-4 grid max-w-md grid-cols-2 gap-3">
            <FormField label="Period starts in">
              <Controller
                control={control}
                name="lateCustomStartMonth"
                render={({ field }) => <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))} options={MONTH_OPTIONS} disabled={!canEdit} />}
              />
            </FormField>
            <FormField label="On day" hint="Short months use their last day.">
              <Input type="number" min={1} max={31} disabled={!canEdit} {...register('lateCustomStartDay', { valueAsNumber: true })} />
            </FormField>
          </div>
        )}

        {period === 'anniversary' && <p className="mt-4 text-xs text-muted-foreground">Uses each employee's date hired. Employees without one are counted by calendar year.</p>}
      </Card>

      {canEdit && (
        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
            Save Changes
          </Button>
        </div>
      )}
    </form>
  )
}
