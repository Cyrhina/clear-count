import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useQuery } from '@tanstack/react-query'
import { Building2, ChevronDown, Download, GitBranch, Layers, UserMinus, Users, Wallet } from 'lucide-react'
import { useState } from 'react'
import { BulkActionBar } from '@ops/components/ui/BulkActionBar'
import { Button } from '@ops/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { useBranches } from '@ops/features/branches/hooks/useBranches'
import { companyHeaderFor, downloadReportWorkbook } from '@ops/features/reports/reportExport'
import { usePermission } from '@ops/hooks/usePermission'
import { useSession } from '@ops/hooks/useSession'
import { useTenant } from '@ops/hooks/useTenant'
import { apiErrorMessage } from '@ops/lib/api/http'
import { formatBaseRateShort } from '@ops/lib/payroll/payRate'
import { bulkSetBranch, bulkSetDepartment, bulkSetStatus } from '@ops/lib/services/employeeService'
import { assignPayrollGroupEmployees, getPayrollGroups } from '@ops/lib/services/payrollGroupService'
import type { Employee } from '@ops/types/domain'

type BulkKind = 'department' | 'branch' | 'payroll_group' | 'deactivate'

const TITLES: Record<BulkKind, string> = {
  department: 'Change department',
  branch: 'Change branch',
  payroll_group: 'Assign payroll group',
  deactivate: 'Deactivate employees',
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/**
 * Floating bar over the Employees list: move the selected employees in bulk, deactivate them, or export them.
 * Adding them to a work schedule, benefit plan or recurring deduction comes back with those modules (P4, P9).
 */
export function BulkEmployeeActions({ selected, employees, departments, onClear, onDone }: { selected: string[]; employees: Employee[]; departments: string[]; onClear: () => void; onDone: () => void }) {
  const { user } = useSession()
  const { company } = useTenant()
  const { branches } = useBranches()
  const canEdit = usePermission('employees.edit')
  const canSeparate = usePermission('employees.separate')
  const canPayrollGroup = usePermission('settings.payroll.edit')
  const [kind, setKind] = useState<BulkKind | null>(null)
  const chosen = employees.filter((e) => selected.includes(e.id))

  function exportSelected() {
    const header = ['Employee ID', 'Employee Name', 'Department', 'Position', 'Branch', 'Employment Type', 'Base Rate', 'Status']
    const rows = chosen.map((e) => [
      e.employeeNumber,
      `${e.personal.firstName} ${e.personal.lastName}`,
      e.employment.department,
      e.employment.position,
      branches.find((b) => b.id === e.branchId)?.name ?? '',
      e.employment.employmentType,
      formatBaseRateShort(e.compensation.payType, e.compensation.basicPay, e.compensation.outputUnit),
      e.employment.status,
    ])
    void downloadReportWorkbook({
      company: companyHeaderFor(company),
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
        {canSeparate && (
          <Button size="sm" variant="secondary" icon={<UserMinus className="size-3.5" />} onClick={() => setKind('deactivate')}>
            Deactivate
          </Button>
        )}
      </BulkActionBar>

      {kind && (
        <BulkDialog
          kind={kind}
          ids={selected}
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

function BulkDialog({ kind, ids, departments, onClose, onDone }: { kind: BulkKind; ids: string[]; departments: string[]; onClose: () => void; onDone: () => void }) {
  const { notify } = useToast()
  const { branches } = useBranches()
  const groups = useQuery({ queryKey: ['employees', 'payroll-groups'], queryFn: getPayrollGroups, enabled: kind === 'payroll_group' }).data ?? []
  const [saving, setSaving] = useState(false)
  const [department, setDepartment] = useState('')
  const [branchId, setBranchId] = useState('')
  const [groupId, setGroupId] = useState('')

  const effectiveBranch = branchId || branches[0]?.id || ''
  const activeGroups = groups.filter((g) => g.status === 'active')
  const effectiveGroup = groupId || activeGroups[0]?.id || ''
  const canSave = kind === 'department' ? department.trim() !== '' : kind === 'branch' ? !!effectiveBranch : kind === 'payroll_group' ? !!effectiveGroup : true

  async function save() {
    setSaving(true)
    try {
      if (kind === 'department') {
        const n = await bulkSetDepartment(ids, department.trim())
        notify({ title: `${plural(n, 'employee')} moved to ${department.trim()}`, description: n < ids.length ? `${ids.length - n} already in it.` : undefined, tone: n ? 'success' : 'default' })
      } else if (kind === 'branch') {
        const n = await bulkSetBranch(ids, effectiveBranch)
        notify({ title: `${plural(n, 'employee')} moved to ${branches.find((b) => b.id === effectiveBranch)?.name}`, tone: n ? 'success' : 'default' })
      } else if (kind === 'payroll_group') {
        const n = await assignPayrollGroupEmployees(effectiveGroup, ids)
        notify({ title: `${plural(n, 'employee')} assigned to ${groups.find((g) => g.id === effectiveGroup)?.name}`, tone: 'success' })
      } else {
        const n = await bulkSetStatus(ids, 'inactive')
        notify({ title: `${plural(n, 'employee')} deactivated`, tone: n ? 'success' : 'default' })
      }
    } catch (error) {
      setSaving(false)
      return notify({ title: "Couldn't apply the change", description: apiErrorMessage(error), tone: 'danger' })
    }
    setSaving(false)
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
            <FormField label="Department" hint="Pick an existing department or type a new one. It is created in each employee's branch if it is missing.">
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} list="bulk-departments" placeholder="e.g. Operations" />
              <datalist id="bulk-departments">
                {departments.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </FormField>
          )}
          {kind === 'branch' && (
            <FormField label="Move to branch" hint="Their department is created in the new branch if it is missing, and they stop supervising a department they left.">
              <Select value={effectiveBranch} onValueChange={setBranchId} aria-label="Branch" options={branches.map((b) => ({ value: b.id, label: b.name }))} />
            </FormField>
          )}
          {kind === 'payroll_group' && (
            <FormField label="Payroll group" hint="An employee belongs to one payroll group — this replaces their current one.">
              <Select value={effectiveGroup} onValueChange={setGroupId} aria-label="Payroll group" options={activeGroups.map((g) => ({ value: g.id, label: g.name }))} />
            </FormField>
          )}
          {kind === 'deactivate' && (
            <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs">Employees who resigned or were terminated should be separated from their profile instead, so their last day is recorded.</p>
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
