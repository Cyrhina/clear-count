import { Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Input } from '@ops/components/ui/Input'
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
import { formatCurrency } from '@ops/lib/utils/format'
import type { SssBracket, StatutoryConfig } from '@ops/types/domain'

interface FormValues {
  sssBrackets: SssBracket[]
}

const NEW_BRACKET: SssBracket = { minSalary: 0, maxSalary: null, msc: 0, employeeShare: 0, employerShare: 0 }

export function SssBracketCard({
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

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({ defaultValues: { sssBrackets: config.sssBrackets } })

  const { fields, append, remove } = useFieldArray({ control, name: 'sssBrackets' })
  const accordion = useAccordionRows(fields.map((f) => f.id))

  useEffect(() => {
    reset({ sssBrackets: config.sssBrackets })
  }, [config, reset])

  const rows = watch('sssBrackets')

  function addRow() {
    accordion.markAdded()
    append(NEW_BRACKET)
  }

  async function onSubmit(values: FormValues) {
    await updateStatutoryConfig(user, { sssBrackets: values.sssBrackets })
    notify({ title: 'SSS contribution table updated', tone: 'success' })
    onSaved()
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Card.Title>SSS Contribution</Card.Title>
          <p className="text-xs text-muted-foreground lg:hidden">{fields.length} salary brackets</p>
        </div>
        {canEdit && (
          <Button type="button" variant="secondary" size="sm" className="hidden lg:inline-flex" icon={<Plus className="size-3.5" />} onClick={addRow}>
            Add Bracket Row
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Phones and tablets: one collapsible row per bracket. */}
        <div className="space-y-2 lg:hidden">
          {canEdit && <AddBracketButton onClick={addRow} />}
          {fields.map((field, index) => {
            const row = rows?.[index] ?? field
            const total = (Number(row.employeeShare) || 0) + (Number(row.employerShare) || 0)
            const set = (key: keyof SssBracket, value: number | null) => setValue(`sssBrackets.${index}.${key}`, value as number, { shouldDirty: true })
            return (
              <BracketRow
                key={field.id}
                index={index + 1}
                title={`${formatPeso(Number(row.minSalary))} – ${row.maxSalary ? formatPeso(Number(row.maxSalary)) : 'and up'}`}
                subtitle={`MSC ${formatPeso(Number(row.msc))}`}
                amount={formatCurrency(total)}
                open={accordion.openId === field.id}
                onToggle={() => accordion.toggle(field.id)}
              >
                {canEdit ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField label="Min. basic pay" value={row.minSalary} onChange={(v) => set('minSalary', v)} />
                      <NumberField label="Max. basic pay" value={row.maxSalary} nullable placeholder="No limit" onChange={(v) => set('maxSalary', v)} />
                    </div>
                    <NumberField label="Monthly salary credit" value={row.msc} onChange={(v) => set('msc', v)} />
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField label="Employee share" step="0.01" value={row.employeeShare} onChange={(v) => set('employeeShare', v)} />
                      <NumberField label="Employer share" step="0.01" value={row.employerShare} onChange={(v) => set('employerShare', v)} />
                    </div>
                    <BracketSummary label="Total contribution" value={formatCurrency(total)} onRemove={() => remove(index)} />
                  </>
                ) : (
                  <div className="space-y-2">
                    <BracketReadout label="Min. basic pay" value={formatCurrency(field.minSalary)} />
                    <BracketReadout label="Max. basic pay" value={field.maxSalary ? formatCurrency(field.maxSalary) : 'and up'} />
                    <BracketReadout label="Monthly salary credit" value={formatCurrency(field.msc)} />
                    <BracketReadout label="Employee share" value={formatCurrency(field.employeeShare)} />
                    <BracketReadout label="Employer share" value={formatCurrency(field.employerShare)} />
                    <BracketReadout label="Total contribution" value={formatCurrency(field.employeeShare + field.employerShare)} />
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
                <TableHead>Min. Basic Pay</TableHead>
                <TableHead>Max. Basic Pay</TableHead>
                <TableHead>Monthly Salary Credit</TableHead>
                <TableHead>Employee Share</TableHead>
                <TableHead>Employer Share</TableHead>
                <TableHead>Total Contribution</TableHead>
                {canEdit && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const row = rows?.[index]
                const total = (Number(row?.employeeShare) || 0) + (Number(row?.employerShare) || 0)
                return (
                  <TableRow key={field.id}>
                    {canEdit ? (
                      <>
                        <TableCell>
                          <Input type="number" step="1" {...register(`sssBrackets.${index}.minSalary`, { valueAsNumber: true })} />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="1"
                            placeholder="No limit"
                            {...register(`sssBrackets.${index}.maxSalary`, {
                              setValueAs: (v) => (v === '' ? null : Number(v)),
                            })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="1" {...register(`sssBrackets.${index}.msc`, { valueAsNumber: true })} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" {...register(`sssBrackets.${index}.employeeShare`, { valueAsNumber: true })} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" {...register(`sssBrackets.${index}.employerShare`, { valueAsNumber: true })} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium">{formatCurrency(total)}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" icon={<Trash2 className="size-3.5" />} onClick={() => remove(index)} aria-label="Remove bracket" />
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{formatCurrency(field.minSalary)}</TableCell>
                        <TableCell>{field.maxSalary ? formatCurrency(field.maxSalary) : 'and up'}</TableCell>
                        <TableCell>{formatCurrency(field.msc)}</TableCell>
                        <TableCell>{formatCurrency(field.employeeShare)}</TableCell>
                        <TableCell>{formatCurrency(field.employerShare)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(field.employeeShare + field.employerShare)}</TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}
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
            <BracketSaveBar isDirty={isDirty} isSubmitting={isSubmitting} onDiscard={() => reset({ sssBrackets: config.sssBrackets })} />
          </>
        )}
      </form>
    </Card>
  )
}
