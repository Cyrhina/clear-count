import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Building2, CalendarClock, ChevronDown, Download, Gift, GitBranch, Layers, MinusCircle, UserMinus, Users, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BulkActionBar } from '@ops/components/ui/BulkActionBar'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { downloadReportWorkbook } from '@ops/features/reports/reportExport'
import { useBenefitPlans, useDeductionPlans } from '@ops/features/loans-deductions/hooks/useBenefitsDeductions'
import { usePayrollGroups } from '@ops/features/company-settings/hooks/usePayrollGroups'
import { usePermission } from '@ops/hooks/usePermission'
import { useSession } from '@ops/hooks/useSession'
import { useTenant } from '@ops/hooks/useTenant'
import { enrollEmployeesInDeductionPlan, enrollEmployeesInPlan } from '@ops/lib/services/benefitsService'
import { assignEmployeesToBranch } from '@ops/lib/services/branchService'
import { addEmployeesToSchedule, getSchedules } from '@ops/lib/services/companyService'
import { bulkUpdateEmployeeDepartment, bulkUpdateEmployeeStatus } from '@ops/lib/services/employeeService'
import { bulkSetEmployeePayrollGroup } from '@ops/lib/services/payrollSettingsService'
import { formatBaseRateShort } from '@ops/lib/payroll/payRate'
import type { BenefitCategory, Employee, Schedule } from '@ops/types/domain'

type BulkKind = 'department' | 'branch' | 'payroll_group' | 'schedule' | 'benefit' | 'deduction' | 'deactivate'

const today = () => new Date().toISOString().slice(0, 10)
const CATEGORY_OPTIONS: { value: BenefitCategory; label: string }[] = [
  { value: 'hmo', label: 'HMO' },
  { value: 'allowance', label: 'Allowance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other benefit' },
]

/** Floating bar over the Employees list: assign / move the selected employees in bulk, deactivate them, or export them. */
export function BulkEmployeeActions({ selected, employees, departments, onClear, onDone }: { selected: string[]; employees: Employee[]; departments: string[]; onClear: () => void; onDone: () => void }) {
  const { user } = useSession()
  const { company } = useTenant()
  const canEdit = usePermission('employees.edit')
  const canPayrollGroup = usePermission('settings.payroll.edit')
  const [kind, setKind] = useState<BulkKind | null>(null)
  const chosen = employees.filter((e) => selected.includes(e.id))

  function exportSelected() {
    const header = ['Employee ID', 'Employee Name', 'Department', 'Position', 'Branch ID', 'Employment Type', 'Base Rate', 'Status']
    const rows = chosen.map((e) => [
      e.employeeNumber,
      `${e.personal.firstName} ${e.personal.lastName}`,
      e.employment.department,
      e.employment.position,
      e.branchId,
      e.employment.employmentType,
      formatBaseRateShort(e.compensation.payType, e.compensation.basicPay, e.compensation.outputUnit),
      e.employment.status,
    ])
    downloadReportWorkbook({
      companyName: company?.name ?? 'Frontline Business Solutions',
      title: 'Selected Employees',
      meta: [{ label: 'Employees', value: String(chosen.length) }],
      generatedBy: user.name,
      data: { filename: 'selected-employees', rows: [header, ...rows] },
    })
  }

  const item = 'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-muted'
  const entries: { kind: BulkKind; label: string; icon: typeof Users; show: boolean }[] = [
    { kind: 'department', label: 'Change Department', icon: Layers, show: canEdit },
    { kind: 'branch', label: 'Change Branch', icon: GitBranch, show: canEdit },
    { kind: 'payroll_group', label: 'Assign Payroll Group', icon: Wallet, show: canPayrollGroup },
    { kind: 'schedule', label: 'Assign Work Schedule', icon: CalendarClock, show: canEdit },
    { kind: 'benefit', label: 'Add to Benefit Plan', icon: Gift, show: canEdit },
    { kind: 'deduction', label: 'Add to Recurring Deduction', icon: MinusCircle, show: canEdit },
  ]
  const available = entries.filter((e) => e.show)

  return (
    <>
      <BulkActionBar count={selected.length} noun={selected.length === 1 ? 'employee selected' : 'employees selected'} onClear={onClear}>
        {available.length > 0 && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button size="sm" icon={<Users className="size-3.5" />}>
                Assign / Move
                <ChevronDown className="size-3.5 opacity-70" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content side="top" align="start" sideOffset={8} className="z-50 w-60 rounded-xl border border-border bg-card p-1 shadow-soft-lg">
                {available.map((e) => (
                  <DropdownMenu.Item key={e.kind} onSelect={() => setKind(e.kind)} className={item}>
                    <e.icon className="size-3.5 text-muted-foreground" />
                    {e.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
        <Button size="sm" variant="secondary" icon={<Download className="size-3.5" />} onClick={exportSelected}>
          Export
        </Button>
        {canEdit && (
          <Button size="sm" variant="secondary" icon={<UserMinus className="size-3.5" />} onClick={() => setKind('deactivate')}>
            Deactivate
          </Button>
        )}
      </BulkActionBar>

      {kind && (
        <BulkDialog
          kind={kind}
          ids={selected}
          employees={chosen}
          departments={departments}
          onClose={() => setKind(null)}
          onDone={() => {
            setKind(null)
            onClear()
            onDone()
          }}
        />
      )}
    </>
  )
}

const TITLES: Record<BulkKind, string> = {
  department: 'Change department',
  branch: 'Change branch',
  payroll_group: 'Assign payroll group',
  schedule: 'Assign work schedule',
  benefit: 'Add to a benefit plan',
  deduction: 'Add to a recurring deduction',
  deactivate: 'Deactivate employees',
}

function BulkDialog({ kind, ids, departments, onClose, onDone }: { kind: BulkKind; ids: string[]; employees: Employee[]; departments: string[]; onClose: () => void; onDone: () => void }) {
  const { user } = useSession()
  const { notify } = useToast()
  const { branches } = useTenant()
  const { groups } = usePayrollGroups()
  const [saving, setSaving] = useState(false)

  const [department, setDepartment] = useState('')
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '')
  const [groupId, setGroupId] = useState('none')
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [scheduleId, setScheduleId] = useState('')
  const [category, setCategory] = useState<BenefitCategory>('hmo')
  const { plans: benefitPlans } = useBenefitPlans(category)
  const { plans: deductionPlans } = useDeductionPlans()
  const [planId, setPlanId] = useState('')
  const [startDate, setStartDate] = useState(today())

  useEffect(() => {
    if (kind === 'schedule') getSchedules(user).then((s) => (setSchedules(s), setScheduleId((id) => id || s[0]?.id || '')))
  }, [kind, user])

  const activeBenefitPlans = benefitPlans.filter((p) => p.status === 'active')
  const activeDeductionPlans = deductionPlans.filter((p) => p.status === 'active')
  const plans = kind === 'benefit' ? activeBenefitPlans : activeDeductionPlans
  const effectivePlanId = plans.some((p) => p.id === planId) ? planId : (plans[0]?.id ?? '')
  const selectedPlan = plans.find((p) => p.id === effectivePlanId)
  const customPlan = !!selectedPlan && 'amountType' in selectedPlan && selectedPlan.amountType === 'custom'

  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

  const canSave =
    kind === 'department' ? department.trim() !== '' : kind === 'branch' ? !!branchId : kind === 'schedule' ? !!scheduleId : kind === 'benefit' || kind === 'deduction' ? !!effectivePlanId && !!startDate : true

  async function save() {
    setSaving(true)
    try {
      if (kind === 'department') {
        const n = await bulkUpdateEmployeeDepartment(user, ids, department.trim())
        notify({ title: `${plural(n, 'employee')} moved to ${department.trim()}`, description: n < ids.length ? `${ids.length - n} already in it.` : undefined, tone: n ? 'success' : 'default' })
      } else if (kind === 'branch') {
        const n = await assignEmployeesToBranch(user, ids, branchId)
        notify({ title: `${plural(n, 'employee')} moved to ${branches.find((b) => b.id === branchId)?.name}`, tone: n ? 'success' : 'default' })
      } else if (kind === 'payroll_group') {
        const n = await bulkSetEmployeePayrollGroup(user, ids, groupId === 'none' ? null : groupId)
        notify({ title: groupId === 'none' ? `${plural(n, 'employee')} removed from their payroll group` : `${plural(n, 'employee')} assigned to ${groups.find((g) => g.id === groupId)?.name}`, tone: 'success' })
      } else if (kind === 'schedule') {
        const n = await addEmployeesToSchedule(user, scheduleId, ids)
        notify({ title: `${plural(n, 'employee')} assigned to ${schedules.find((s) => s.id === scheduleId)?.name}`, description: n < ids.length ? `${ids.length - n} were already on it.` : undefined, tone: n ? 'success' : 'default' })
      } else if (kind === 'benefit' || kind === 'deduction') {
        const result = kind === 'benefit' ? await enrollEmployeesInPlan(user, effectivePlanId, ids, startDate) : await enrollEmployeesInDeductionPlan(user, effectivePlanId, ids, startDate)
        notify({
          title: `${plural(result.added, 'employee')} added to ${selectedPlan?.name}`,
          description: result.skipped ? `${result.skipped} skipped — already enrolled${kind === 'benefit' && category === 'hmo' ? ' or in another HMO plan' : ''}.` : undefined,
          tone: result.added ? 'success' : 'default',
        })
      } else {
        const n = await bulkUpdateEmployeeStatus(user, ids, 'inactive')
        notify({ title: `${plural(n, 'employee')} deactivated`, tone: n ? 'success' : 'default' })
      }
    } finally {
      setSaving(false)
    }
    onDone()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogTitle>{TITLES[kind]}</DialogTitle>
        <DialogDescription>
          Applies to {plural(ids.length, 'selected employee')}.
          {kind === 'deactivate' && ' They stay on the roster as inactive and are left out of new payroll runs; reactivate any time from their profile.'}
        </DialogDescription>

        <div className="mt-5 space-y-4">
          {kind === 'department' && (
            <FormField label="Department" hint="Pick an existing department or type a new one.">
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} list="bulk-departments" placeholder="e.g. Operations" />
              <datalist id="bulk-departments">
                {departments.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </FormField>
          )}
          {kind === 'branch' && (
            <FormField label="Move to branch" hint="Branch managers moving out of their branch are released from managing it.">
              <Select value={branchId} onValueChange={setBranchId} aria-label="Branch" options={branches.map((b) => ({ value: b.id, label: b.name }))} />
            </FormField>
          )}
          {kind === 'payroll_group' && (
            <FormField label="Payroll group" hint="An employee belongs to one payroll group — this replaces their current one.">
              <Select value={groupId} onValueChange={setGroupId} aria-label="Payroll group" options={[{ value: 'none', label: 'No payroll group' }, ...groups.map((g) => ({ value: g.id, label: g.name }))]} />
            </FormField>
          )}
          {kind === 'schedule' && (
            <FormField label="Work schedule" hint="An employee has one work schedule — this replaces their current one.">
              <Select value={scheduleId} onValueChange={setScheduleId} aria-label="Work schedule" options={schedules.map((s) => ({ value: s.id, label: `${s.name} · ${s.startTime}–${s.endTime}` }))} />
            </FormField>
          )}
          {(kind === 'benefit' || kind === 'deduction') && (
            <>
              {kind === 'benefit' && (
                <FormField label="Benefit type">
                  <Select value={category} onValueChange={(v) => setCategory(v as BenefitCategory)} aria-label="Benefit type" options={CATEGORY_OPTIONS} />
                </FormField>
              )}
              <FormField label="Plan" hint={customPlan ? 'Customizable plan: everyone starts at its default amount — adjust individuals from the plan afterwards.' : undefined}>
                <Select
                  value={effectivePlanId}
                  onValueChange={setPlanId}
                  aria-label="Plan"
                  options={plans.map((p) => ({ value: p.id, label: p.name }))}
                />
              </FormField>
              <FormField label="Start date">
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </FormField>
              {plans.length === 0 && <p className="text-xs text-muted-foreground">There is no active plan to add to.</p>}
            </>
          )}
          {kind === 'deactivate' && (
            <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs">Employees who resigned or were terminated should be separated from their profile instead, so their last day and benefits end correctly.</p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" icon={kind === 'deactivate' ? <UserMinus className="size-4" /> : <Building2 className="size-4" />} onClick={save} isLoading={saving} disabled={!canSave}>
            {kind === 'deactivate' ? 'Deactivate' : 'Apply'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
