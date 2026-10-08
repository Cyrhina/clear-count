import { CalendarClock, Pencil } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@ops/components/ui/Button'
import { FilterField } from '@ops/components/ui/FiltersPopover'
import { SearchFilterBar } from '@ops/components/ui/SearchFilterBar'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useToast } from '@ops/components/ui/Toast'
import { BenefitDialog } from '@ops/features/loans-deductions/components/BenefitDialog'
import { BenefitPlanDialog } from '@ops/features/loans-deductions/components/BenefitPlanDialog'
import { BenefitPlansView } from '@ops/features/loans-deductions/components/BenefitPlansView'
import { RecordCard } from '@ops/features/loans-deductions/components/RecordCard'
import { SectionIntro } from '@ops/features/loans-deductions/components/SectionIntro'
import { RecordDetailsDialog } from '@ops/features/loans-deductions/components/RecordDetailsDialog'
import { useBenefitPlans, useEmployeeBenefits } from '@ops/features/loans-deductions/hooks/useBenefitsDeductions'
import { BENEFIT_CATEGORY_META, fullName } from '@ops/features/loans-deductions/loanUtils'
import { StatTile } from '@ops/features/reports/components/shared'
import { useSession } from '@ops/hooks/useSession'
import { updateEmployeeBenefit } from '@ops/lib/services/benefitsService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { BenefitCategory, Employee, EmployeeBenefit } from '@ops/types/domain'

const DESCRIPTION: Record<BenefitCategory, string> = {
  hmo: 'Health coverage provided to employees, organised by plan. Add employees to a plan from its card. Employee shares (e.g. dependents) are deducted in payroll; the rest is paid by the company and shown on the payslip.',
  allowance: 'Cash allowances paid through payroll and added to earnings on the payslip, organised by allowance. Add employees to an allowance from its card.',
  insurance: 'Company-provided insurance, organised by policy. Add employees to a policy from its card. Shown on the payslip as an employer-paid benefit.',
  other: 'Other company-paid perks and programs, organised by benefit. Add employees to a benefit from its card. Shown on the payslip as employer-paid benefits.',
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_ORDER = { active: 0, paused: 1, cancelled: 2 } as const

export interface Row {
  key: string
  employee: Employee
  name: string
  provider?: string
  coverage?: string
  monthlyValue: number
  employeeShare: number
  startDate?: string
  endDate?: string
  status: EmployeeBenefit['status']
  notes?: string
  /** The stored record; absent for allowances that come from the employee profile. */
  benefit?: EmployeeBenefit
}

const today = () => new Date().toISOString().slice(0, 10)

export function BenefitsView({ category, employees, canManage }: { category: BenefitCategory; employees: Employee[]; canManage: boolean }) {
  const { benefits, isLoading, refetch } = useEmployeeBenefits()
  const { plans, refetch: refetchPlans } = useBenefitPlans(category)
  const refreshAll = () => {
    refetch()
    refetchPlans()
  }
  const { user } = useSession()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [viewing, setViewing] = useState<Row | null>(null)
  const meta = BENEFIT_CATEGORY_META[category]
  const isAllowance = category === 'allowance'

  const rows = useMemo<Row[]>(() => {
    const employeeById = new Map(employees.map((e) => [e.id, e]))
    const managed: Row[] = benefits
      .filter((b) => b.category === category && employeeById.has(b.employeeId))
      .map((b) => ({
        key: b.id,
        employee: employeeById.get(b.employeeId)!,
        name: b.name,
        provider: b.provider,
        coverage: b.coverage,
        monthlyValue: b.monthlyValue,
        employeeShare: b.employeeShare,
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status,
        notes: b.notes,
        benefit: b,
      }))
    return managed.sort(
      (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || fullName(a.employee).localeCompare(fullName(b.employee)) || a.name.localeCompare(b.name),
    )
  }, [benefits, employees, category])

  const filtered = rows.filter((row) => {
    if (status !== 'all' && row.status !== status) return false
    const query = search.trim().toLowerCase()
    return !query || `${fullName(row.employee)} ${row.employee.employeeNumber} ${row.name} ${row.provider ?? ''} ${row.coverage ?? ''}`.toLowerCase().includes(query)
  })

  const active = rows.filter((r) => r.status === 'active')
  const enrolled = new Set(active.map((r) => r.employee.id)).size
  const employerCost = active.reduce((sum, r) => sum + r.monthlyValue, 0)
  const employeeContributions = active.reduce((sum, r) => sum + r.employeeShare, 0)

  async function change(row: Row, updates: Partial<EmployeeBenefit>, message: string) {
    if (!row.benefit) return
    await updateEmployeeBenefit(user, row.benefit.id, updates)
    notify({ title: `${row.name} ${message}`, tone: 'success' })
    refetch()
  }

  function noteFor(row: Row): string {
    if (row.status === 'paused') return 'Paused — left out of payroll until resumed.'
    if (row.status === 'cancelled') return `Cancelled${row.endDate ? ` on ${formatDate(row.endDate)}` : ''} — no longer included in payroll.`
    const parts = [isAllowance ? 'Added to earnings every pay run.' : 'Shown on the payslip as an employer-paid benefit.']
    if (row.employeeShare > 0) parts.push(`Employee share ${formatCurrency(row.employeeShare)}/month is deducted.`)
    return parts.join(' ')
  }

  /** The per-employee card: View / Edit / Pause·Resume / Cancel. Shown inside each plan's details. */
  function renderRecordCard(row: Row, extraActions?: React.ReactNode) {
    return (
    <RecordCard
      key={row.key}
      compactActions
      title={fullName(row.employee)}
      subtitle={[row.name, row.provider].filter(Boolean).join(' · ')}
      status={row.benefit ? row.status : 'active'}
      headline={formatCurrency(row.monthlyValue)}
      headlineHint={isAllowance ? 'per month, added to earnings' : 'company-paid per month'}
      lines={[row.coverage, row.employeeShare > 0 ? `Employee share ${formatCurrency(row.employeeShare)}/month` : undefined, row.startDate ? `Since ${formatDate(row.startDate)}${row.endDate ? ` · until ${formatDate(row.endDate)}` : ''}` : 'Set on employee profile'].filter(Boolean)}
      note={<p className="text-muted-foreground">{noteFor(row)}</p>}
      noteIcon={<CalendarClock className="mt-0.5 size-3.5 shrink-0 text-primary" />}
      onView={() => setViewing(row)}
      edit={
        <>
        {row.benefit ? (
          <BenefitDialog
            category={category}
            employees={employees}
            benefit={row.benefit}
            amountLocked={isAllowance && plans.find((p) => p.id === row.benefit?.planId)?.amountType !== 'custom'}
            onSaved={refetch}
            trigger={
              <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} iconOnlyOnMobile disabled={!canManage || row.status === 'cancelled'} title={row.status === 'cancelled' ? 'This record is cancelled.' : undefined}>
                Edit
              </Button>
            }
          />
        ) : (
          <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} iconOnlyOnMobile disabled={!canManage} title="Set on the employee profile" onClick={() => navigate(`/employees/${row.employee.id}`)}>
            Edit
          </Button>
        )}
        {extraActions}
        </>
      }
      onPause={() => change(row, { status: 'paused' }, 'paused — left out of payroll until resumed')}
      onResume={() => change(row, { status: 'active' }, 'resumed')}
      onCancel={() => change(row, { status: 'cancelled', endDate: row.endDate ?? today() }, 'cancelled')}
      lockedReason={row.benefit ? undefined : 'Managed on the employee profile'}
      cancelName={row.name}
      cancelConsequence={`${row.name} for ${fullName(row.employee)} will stop being included in payroll and on payslips.`}
      canManage={canManage}
      dimmed={row.status === 'cancelled'}
    />
    )
  }

  return (
    <div className="space-y-4">
      <SectionIntro title={meta.title} description={DESCRIPTION[category]} action={canManage && <BenefitPlanDialog category={category} onSaved={refreshAll} />} />

      <div className={isAllowance ? 'grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4' : 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4'}>
        <StatTile className="p-3 sm:p-4" label="Employees covered" value={String(enrolled)} />
        <StatTile className="p-3 sm:p-4" label={isAllowance ? 'Paid monthly' : 'Company cost / month'} value={formatCurrency(employerCost)} />
        {!isAllowance && <StatTile className="col-span-2 p-3 sm:col-span-1 sm:p-4" label="Employee contributions / month" value={formatCurrency(employeeContributions)} />}
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search employee or benefit…"
        activeCount={status !== 'all' ? 1 : 0}
        onClear={() => {
          setSearch('')
          setStatus('all')
        }}
        trailing={
          <>
            {filtered.length} of {rows.length} records
          </>
        }
        filters={
          <FilterField label="Status">
            <Select value={status} onValueChange={setStatus} options={STATUS_OPTIONS} />
          </FilterField>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <BenefitPlansView
          category={category}
          plans={plans}
          rows={rows}
          filteredRows={filtered}
          filtersActive={search.trim() !== '' || status !== 'all'}
          employees={employees}
          benefits={benefits}
          canManage={canManage}
          renderRecordCard={renderRecordCard}
          onChanged={refreshAll}
        />
      )}

      <RecordDetailsDialog
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing ? viewing.name : ''}
        subtitle={viewing ? `${fullName(viewing.employee)} · ${viewing.employee.employeeNumber} · ${viewing.employee.employment.department}` : undefined}
        status={viewing?.benefit ? viewing.status : 'active'}
        notes={viewing?.notes}
        fields={
          viewing
            ? [
                { label: 'Category', value: meta.title },
                { label: 'Provider', value: viewing.provider || '—' },
                ...(isAllowance ? [] : [{ label: 'Plan / coverage', value: viewing.coverage || '—', wide: true }]),
                { label: isAllowance ? 'Monthly amount' : 'Company-paid / month', value: formatCurrency(viewing.monthlyValue) },
                ...(isAllowance ? [] : [{ label: 'Employee share / month', value: viewing.employeeShare > 0 ? formatCurrency(viewing.employeeShare) : '—' }]),
                { label: 'Start date', value: viewing.startDate ? formatDate(viewing.startDate) : '—' },
                { label: 'End date', value: viewing.endDate ? formatDate(viewing.endDate) : 'Open-ended' },
              ]
            : []
        }
      />
    </div>
  )
}
