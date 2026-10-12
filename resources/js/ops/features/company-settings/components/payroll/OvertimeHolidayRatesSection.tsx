import { Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Switch } from '@ops/components/ui/Switch'
import { useToast } from '@ops/components/ui/Toast'
import { DEFAULT_HOLIDAY_RATES, DEFAULT_OT_RATES } from '@ops/features/company-settings/payrollRatesStore'
import type { PayrollRules, RateRow } from '@ops/features/company-settings/types'
import { apiErrorMessage } from '@ops/lib/api/http'
import { createOvertimeRate, deleteOvertimeRate, updatePayrollRules, updateRate, type PayrollRates } from '@ops/lib/services/payrollConfigService'

/** Local draft copy so edits only take effect once "Save Settings" is clicked. */
function toPctDraft(rates: RateRow[]): Record<string, string> {
  return Object.fromEntries(rates.map((r) => [r.id, String(Math.round(r.multiplier * 1000) / 10)]))
}

const toLabelDraft = (rates: RateRow[]) => Object.fromEntries(rates.map((r) => [r.id, r.label]))

const DEFAULT_MULTIPLIER = Object.fromEntries([...DEFAULT_OT_RATES, ...DEFAULT_HOLIDAY_RATES].map((r) => [r.id, r.multiplier]))

/** All overtime configuration — the OT approval policy, OT / night differential rates, and holiday pay rates. */
export function OvertimeHolidayRatesSection({ rules, rates, canEdit = true, onRefetch }: { rules?: PayrollRules; rates?: PayrollRates; canEdit?: boolean; onRefetch: () => void }) {
  const { notify } = useToast()
  const otRates = rates?.overtime ?? []
  const holidayRates = rates?.holiday ?? []

  const [otDraft, setOtDraft] = useState<Record<string, string>>(() => toPctDraft(otRates))
  const [holidayDraft, setHolidayDraft] = useState<Record<string, string>>(() => toPctDraft(holidayRates))
  const [otLabelDraft, setOtLabelDraft] = useState<Record<string, string>>(() => toLabelDraft(otRates))
  const [newRateLabel, setNewRateLabel] = useState('')
  const [newRatePct, setNewRatePct] = useState('')
  // Unsaved toggle; falls back to the saved company rule.
  const [preApprovalDraft, setPreApprovalRequired] = useState<boolean | undefined>(undefined)
  const preApprovalRequired = preApprovalDraft ?? rules?.overtimePreApprovalRequired ?? true
  const [saving, setSaving] = useState(false)

  // New rates from the server (after a save, an add or a delete) replace the drafts.
  useEffect(() => {
    setOtDraft(toPctDraft(rates?.overtime ?? []))
    setHolidayDraft(toPctDraft(rates?.holiday ?? []))
    setOtLabelDraft(toLabelDraft(rates?.overtime ?? []))
  }, [rates])

  async function run(action: () => Promise<void>, success: { title: string; description?: string }) {
    setSaving(true)
    try {
      await action()
      notify({ ...success, tone: 'success' })
      onRefetch()
    } catch (error) {
      notify({ title: 'Could not save the rates', description: apiErrorMessage(error), tone: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  function handleAddCustomRate() {
    const pct = Number(newRatePct)
    if (!newRateLabel.trim() || !(pct > 0)) return
    void run(async () => {
      await createOvertimeRate({ label: newRateLabel.trim(), multiplier: pct / 100 })
      setNewRateLabel('')
      setNewRatePct('')
    }, { title: 'Custom rate added' })
  }

  function handleReset() {
    void run(
      async () => {
        for (const rate of [...otRates, ...holidayRates].filter((r) => !r.isCustom && DEFAULT_MULTIPLIER[r.key] !== undefined && DEFAULT_MULTIPLIER[r.key] !== r.multiplier)) {
          await updateRate(rate.id, { multiplier: DEFAULT_MULTIPLIER[rate.key] })
        }
      },
      { title: 'Rates reset to statutory defaults' },
    )
  }

  function handleSave() {
    void run(
      async () => {
        if (canEdit && rules && preApprovalRequired !== rules.overtimePreApprovalRequired) await updatePayrollRules({ overtimePreApprovalRequired: preApprovalRequired })
        setPreApprovalRequired(undefined)
        for (const rate of otRates) {
          const pct = Number(otDraft[rate.id])
          const label = otLabelDraft[rate.id]?.trim() || rate.label
          if (pct > 0 && (pct / 100 !== rate.multiplier || label !== rate.label)) await updateRate(rate.id, { multiplier: pct / 100, label })
        }
        for (const rate of holidayRates) {
          const pct = Number(holidayDraft[rate.id])
          if (pct > 0 && pct / 100 !== rate.multiplier) await updateRate(rate.id, { multiplier: pct / 100 })
        }
      },
      { title: 'Payroll rate settings saved', description: 'Overtime policy, Night Differential, and Holiday Pay rates updated.' },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Overtime, Night Differential &amp; Holiday Pay Rates</p>
        {canEdit && (
          <Button type="button" variant="secondary" size="sm" icon={<RotateCcw className="size-3.5" />} onClick={handleReset} disabled={saving}>
            Reset to Statutory Defaults
          </Button>
        )}
      </div>

      <Card className="p-5">
        <Card.Title>Overtime Policy</Card.Title>
        <label className="mt-4 flex items-center justify-between gap-4 text-sm">
          <span>
            <span className="font-medium">Pre-approval required</span>
            <span className="block text-xs text-muted-foreground">Overtime must be filed and approved before it is rendered to be paid in payroll.</span>
          </span>
          <Switch checked={preApprovalRequired} onCheckedChange={setPreApprovalRequired} disabled={!canEdit} />
        </label>
      </Card>

      <Card className="p-5">
        <Card.Title>Overtime (OT) &amp; Night Differential Rates</Card.Title>
        <Card.Description>Percentage multipliers applied on top of the employee&apos;s hourly rate.</Card.Description>

        <div className="mt-4 space-y-3">
          {otRates.map((rate) => (
            <OtRateRow
              key={rate.id}
              rate={rate}
              canEdit={canEdit}
              labelValue={otLabelDraft[rate.id] ?? rate.label}
              pctValue={otDraft[rate.id] ?? toPctDraft([rate])[rate.id]}
              onLabelChange={(v) => setOtLabelDraft((d) => ({ ...d, [rate.id]: v }))}
              onPctChange={(v) => setOtDraft((d) => ({ ...d, [rate.id]: v }))}
              onRemove={rate.isCustom && canEdit ? () => void run(() => deleteOvertimeRate(rate.id), { title: 'Custom rate removed' }) : undefined}
            />
          ))}
        </div>

        {canEdit && (
          <div className="mt-4 flex items-end gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-3">
            <FormField label="Custom Rate Type Name" className="flex-1">
              <Input value={newRateLabel} onChange={(e) => setNewRateLabel(e.target.value)} placeholder="e.g. Special Project Night OT" />
            </FormField>
            <FormField label="Rate %" className="w-28">
              <div className="relative">
                <Input value={newRatePct} onChange={(e) => setNewRatePct(e.target.value)} type="number" step="0.1" placeholder="150" />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
              </div>
            </FormField>
            <Button type="button" variant="secondary" icon={<Plus className="size-3.5" />} onClick={handleAddCustomRate} disabled={saving}>
              Add Custom Rate Type
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <Card.Title>Holiday Pay Rates</Card.Title>
        <Card.Description>Percentage multipliers applied to the employee&apos;s daily rate for holiday work.</Card.Description>

        <div className="mt-4 space-y-3">
          {holidayRates.map((rate) => (
            <HolidayRateRow
              key={rate.id}
              rate={rate}
              canEdit={canEdit}
              pctValue={holidayDraft[rate.id] ?? toPctDraft([rate])[rate.id]}
              onPctChange={(v) => setHolidayDraft((d) => ({ ...d, [rate.id]: v }))}
            />
          ))}
        </div>
      </Card>

      {canEdit && (
        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} isLoading={saving}>
            Save Settings
          </Button>
        </div>
      )}
    </div>
  )
}

function PctInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div className="relative w-28">
      <Input value={value} onChange={(e) => onChange(e.target.value)} type="number" step="0.1" className="pr-7" disabled={disabled} />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
    </div>
  )
}

function OtRateRow({
  rate,
  canEdit,
  labelValue,
  pctValue,
  onLabelChange,
  onPctChange,
  onRemove,
}: {
  rate: RateRow
  canEdit: boolean
  labelValue: string
  pctValue: string
  onLabelChange: (v: string) => void
  onPctChange: (v: string) => void
  onRemove?: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
      <Input
        value={labelValue}
        onChange={(e) => onLabelChange(e.target.value)}
        disabled={!rate.isCustom || !canEdit}
        className="flex-1 border-none bg-transparent px-0 font-medium shadow-none focus-visible:ring-0 disabled:opacity-100"
      />
      <PctInput value={pctValue} onChange={onPctChange} disabled={!canEdit} />
      {onRemove ? (
        <Button type="button" variant="ghost" size="sm" icon={<Trash2 className="size-3.5" />} onClick={onRemove} aria-label={`Remove ${rate.label}`} />
      ) : (
        <span className="w-8" />
      )}
    </div>
  )
}

function HolidayRateRow({ rate, canEdit, pctValue, onPctChange }: { rate: RateRow; canEdit: boolean; pctValue: string; onPctChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
      <p className="text-sm font-medium">{rate.label}</p>
      <PctInput value={pctValue} onChange={onPctChange} disabled={!canEdit} />
    </div>
  )
}
