import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import {
  AddBracketButton,
  BracketReadout,
  BracketRow,
  BracketSaveBar,
  BracketSummary,
  NumberField,
  formatPeso,
  useAccordionRows,
} from '@ops/features/statutory/components/BracketAccordion'
import { useSession } from '@ops/hooks/useSession'
import { updateStatutoryConfig } from '@ops/lib/services/payrollService'
import { TAX_FREQUENCIES, taxBracketsFor, taxFrequencyLabel, type TaxFrequency } from '@ops/lib/payroll/withholdingTax'
import { cn } from '@ops/lib/utils/cn'
import { formatCurrency } from '@ops/lib/utils/format'
import type { StatutoryConfig, TaxBracket } from '@ops/types/domain'

interface FormValues {
  taxBrackets: TaxBracket[]
}

export function WithholdingTaxCard({
  config,
  canEdit,
  onSaved,
}: {
  config: StatutoryConfig
  canEdit: boolean
  onSaved: () => void
}) {
  const { user } = useSession()
  const { notify } = useToast()
  const [frequency, setFrequency] = useState<TaxFrequency>('monthly')
  const brackets = taxBracketsFor(config, frequency) ?? []

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({ defaultValues: { taxBrackets: brackets } })

  const { fields, append, remove } = useFieldArray({ control, name: 'taxBrackets' })
  const accordion = useAccordionRows(fields.map((f) => f.id))
  const rows = watch('taxBrackets')

  function addRow() {
    accordion.markAdded()
    append({ min: 0, max: null, rate: 0, baseTax: 0 })
  }

  useEffect(() => {
    reset({ taxBrackets: taxBracketsFor(config, frequency) ?? [] })
  }, [config, frequency, reset])

  async function onSubmit(values: FormValues) {
    if (frequency === 'monthly') await updateStatutoryConfig(user, { taxBrackets: values.taxBrackets })
    else await updateStatutoryConfig(user, { taxBracketTables: { ...config.taxBracketTables, [frequency]: values.taxBrackets } })
    notify({ title: `${taxFrequencyLabel(frequency)} withholding tax brackets updated`, tone: 'success' })
    onSaved()
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Card.Title>Withholding Tax Brackets ({taxFrequencyLabel(frequency)})</Card.Title>
          <p className="text-xs text-muted-foreground lg:hidden">{fields.length} tax brackets</p>
        </div>
        {canEdit && (
          <Button type="button" variant="secondary" size="sm" className="hidden lg:inline-flex" icon={<Plus className="size-3.5" />} onClick={addRow}>
            Add Bracket Row
          </Button>
        )}
      </div>

      <div className="mb-4 space-y-2">
        {/* Phones and tablets: a dropdown instead of a wrapped row of buttons. */}
        <Select
          className="lg:hidden"
          value={frequency}
          onValueChange={(v) => setFrequency(v as TaxFrequency)}
          aria-label="Pay frequency"
          options={TAX_FREQUENCIES.map((t) => ({ value: t.value, label: t.label }))}
        />
        <div className="hidden flex-wrap rounded-lg border border-border bg-muted/50 p-0.5 text-xs font-medium lg:inline-flex" role="group" aria-label="Pay frequency">
          {TAX_FREQUENCIES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setFrequency(t.value)}
              className={cn('rounded-md px-3 py-1.5 transition-colors', frequency === t.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Brackets apply to the taxable income of one {TAX_FREQUENCIES.find((t) => t.value === frequency)?.unit}. Payroll uses the table of each employee's pay frequency on the pay date (daily, weekly, semi-monthly or monthly); the annual table is used for once-a-year payouts such as the 13th Month Pay. Bi-weekly pay uses the semi-monthly table, and custom pay periods use the table closest to their length.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Phones and tablets: one collapsible row per bracket. */}
        <div className="space-y-2 lg:hidden">
          {canEdit && <AddBracketButton onClick={addRow} />}
          {fields.map((field, index) => {
            const row = rows?.[index] ?? field
            const set = (key: keyof TaxBracket, value: number | null) => setValue(`taxBrackets.${index}.${key}`, value as number, { shouldDirty: true })
            const ratePercent = `${+((Number(row.rate) || 0) * 100).toFixed(2)}%`
            return (
              <BracketRow
                key={field.id}
                index={index + 1}
                title={`${formatPeso(Number(row.min))} – ${row.max ? formatPeso(Number(row.max)) : 'and up'}`}
                subtitle={`Base tax ${formatPeso(Number(row.baseTax))}`}
                amount={ratePercent}
                open={accordion.openId === field.id}
                onToggle={() => accordion.toggle(field.id)}
              >
                {canEdit ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField label="Min. taxable income" value={row.min} onChange={(v) => set('min', v)} />
                      <NumberField label="Max. taxable income" value={row.max} nullable placeholder="No limit" onChange={(v) => set('max', v)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField label="Base tax" step="0.01" value={row.baseTax} onChange={(v) => set('baseTax', v)} />
                      <NumberField label="Rate on excess (0–1)" step="0.01" value={row.rate} onChange={(v) => set('rate', v)} />
                    </div>
                    <BracketSummary label="Rate on excess" value={ratePercent} onRemove={() => remove(index)} />
                  </>
                ) : (
                  <div className="space-y-2">
                    <BracketReadout label="Min. taxable income" value={formatCurrency(field.min)} />
                    <BracketReadout label="Max. taxable income" value={field.max ? formatCurrency(field.max) : 'and up'} />
                    <BracketReadout label="Base tax" value={formatCurrency(field.baseTax)} />
                    <BracketReadout label="Rate on excess" value={`${(field.rate * 100).toFixed(0)}%`} />
                  </div>
                )}
              </BracketRow>
            )
          })}
        </div>

        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Min. Taxable Income</TableHead>
                <TableHead>Max. Taxable Income</TableHead>
                <TableHead>Base Tax</TableHead>
                <TableHead>Rate on Excess</TableHead>
                {canEdit && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) =>
                canEdit ? (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input type="number" step="1" {...register(`taxBrackets.${index}.min`, { valueAsNumber: true })} />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="1"
                        placeholder="No limit"
                        {...register(`taxBrackets.${index}.max`, {
                          setValueAs: (v) => (v === '' ? null : Number(v)),
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" {...register(`taxBrackets.${index}.baseTax`, { valueAsNumber: true })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" min="0" max="1" {...register(`taxBrackets.${index}.rate`, { valueAsNumber: true })} />
                    </TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="sm" icon={<Trash2 className="size-3.5" />} onClick={() => remove(index)} aria-label="Remove bracket" />
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={field.id}>
                    <TableCell>
                      {formatCurrency(field.min)} {field.max ? `– ${formatCurrency(field.max)}` : 'and up'}
                    </TableCell>
                    <TableCell />
                    <TableCell>{formatCurrency(field.baseTax)}</TableCell>
                    <TableCell>{(field.rate * 100).toFixed(0)}%</TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>

        {canEdit && (
          <>
            <div className="mt-4 hidden justify-end lg:flex">
              <Button type="submit" size="sm" isLoading={isSubmitting} disabled={!isDirty}>
                Save Changes
              </Button>
            </div>
            <BracketSaveBar isDirty={isDirty} isSubmitting={isSubmitting} onDiscard={() => reset({ taxBrackets: taxBracketsFor(config, frequency) ?? [] })} />
          </>
        )}
      </form>
    </Card>
  )
}
