import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Button } from '@ops/components/ui/Button'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FilterField, FiltersPopover, SortControl, type SortDirection } from '@ops/components/ui/FiltersPopover'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { AddBonusDialog, BonusFormDialog } from '@ops/features/bonuses/components/AddBonusDialog'
import { BonusDetailsDialog } from '@ops/features/bonuses/components/BonusDetailsDialog'
import { useBonuses } from '@ops/features/bonuses/hooks/useBonuses'
import { useAllEmployees } from '@ops/features/employees/hooks/useAllEmployees'
import { usePermission } from '@ops/hooks/usePermission'
import { bonusPayoutMode, resolveBonusRecipients } from '@ops/lib/payroll/bonusMatching'
import { MONTH_NAMES } from '@ops/lib/payroll/complianceDeadlines'
import { formatCurrency } from '@ops/lib/utils/format'
import type { BonusIncentive } from '@ops/types/domain'

const BONUS_TYPE_LABEL: Record<BonusIncentive['bonusType'], string> = {
  fixed_amount: 'Fixed Amount',
  percentage: 'Percentage',
  performance_based: 'Performance-Based',
  output_based: 'Output-Based',
}

const TYPE_OPTIONS = [{ value: 'all', label: 'All Types' }, ...Object.entries(BONUS_TYPE_LABEL).map(([value, label]) => ({ value, label }))]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'name', label: 'Bonus Name' },
  { value: 'amount', label: 'Amount' },
]

/** The month/year a bonus belongs to: parsed from its payroll period label ("December 2026"), else the day it was created. */
function bonusMonthYear(bonus: BonusIncentive): { year: string; month: string } {
  const label = bonus.periodLabel.toLowerCase()
  const monthIndex = MONTH_NAMES.findIndex((name) => label.includes(name.toLowerCase()))
  const year = /\b(19|20)\d{2}\b/.exec(label)?.[0]
  if (monthIndex >= 0 && year) return { year, month: String(monthIndex + 1).padStart(2, '0') }
  return { year: bonus.createdAt.slice(0, 4), month: bonus.createdAt.slice(5, 7) }
}

export function BonusesPage() {
  const { bonuses, isLoading, refetch } = useBonuses()
  const { employees } = useAllEmployees()
  const canManage = usePermission('bonuses.manage')
  const departments = useMemo(() => [...new Set(employees.map((e) => e.employment.department))].sort(), [employees])
  const [selectedBonus, setSelectedBonus] = useState<BonusIncentive | null>(null)
  const [editingBonus, setEditingBonus] = useState<BonusIncentive | null>(null)

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [year, setYear] = useState('all')
  const [month, setMonth] = useState('all')

  const yearOptions = useMemo(
    () => [{ value: 'all', label: 'All Years' }, ...[...new Set(bonuses.map((b) => bonusMonthYear(b).year))].sort().reverse().map((y) => ({ value: y, label: y }))],
    [bonuses],
  )
  const monthOptions = [{ value: 'all', label: 'All Months' }, ...MONTH_NAMES.map((name, i) => ({ value: String(i + 1).padStart(2, '0'), label: name }))]

  const activeFilterCount = [type !== 'all', status !== 'all', year !== 'all', month !== 'all'].filter(Boolean).length
  const hasActiveFilters = search.trim() !== '' || activeFilterCount > 0

  function clearFilters() {
    setSearch('')
    setType('all')
    setStatus('all')
    setYear('all')
    setMonth('all')
  }

  const filteredBonuses = bonuses
    .filter((bonus) => {
      if (type !== 'all' && bonus.bonusType !== type) return false
      if (status !== 'all' && bonus.status !== status) return false
      const period = bonusMonthYear(bonus)
      if (year !== 'all' && period.year !== year) return false
      if (month !== 'all' && period.month !== month) return false
      const query = search.trim().toLowerCase()
      if (query && !`${bonus.name} ${bonus.periodLabel}`.toLowerCase().includes(query)) return false
      return true
    })
    .sort((a, b) => {
      let result = 0
      if (sortBy === 'amount') result = a.amount - b.amount
      else if (sortBy === 'name') result = a.name.localeCompare(b.name)
      else result = a.createdAt.localeCompare(b.createdAt)
      return sortDirection === 'asc' ? result : -result
    })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bonuses & Incentives"
        description="Configure, manage, and approve non-regular earnings before they flow into a payroll run."
        actions={canManage && <AddBonusDialog employees={employees} departments={departments} onCreated={refetch} />}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bonus name or period…" className="pl-9" />
        </div>
        <FiltersPopover
          activeCount={activeFilterCount}
          footer={
            hasActiveFilters && (
              <Button size="sm" variant="ghost" icon={<X className="size-3.5" />} onClick={clearFilters}>
                Clear Filters
              </Button>
            )
          }
        >
          <FilterField label="Year">
            <Select value={year} onValueChange={setYear} options={yearOptions} />
          </FilterField>
          <FilterField label="Month">
            <Select value={month} onValueChange={setMonth} options={monthOptions} />
          </FilterField>
          <FilterField label="Bonus Type">
            <Select value={type} onValueChange={setType} options={TYPE_OPTIONS} />
          </FilterField>
          <FilterField label="Approval Status">
            <Select value={status} onValueChange={setStatus} options={STATUS_OPTIONS} />
          </FilterField>
          <SortControl value={sortBy} onValueChange={setSortBy} options={SORT_OPTIONS} direction={sortDirection} onDirectionChange={setSortDirection} />
        </FiltersPopover>
        <p className="ml-auto self-center text-sm text-muted-foreground">
          {filteredBonuses.length} of {bonuses.length} records
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-72" />
      ) : filteredBonuses.length === 0 ? (
        <EmptyState title="No bonus/incentive entries match these filters" description="Try clearing a filter or create a new bonus/incentive." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBonuses.map((bonus) => {
            const recipients = resolveBonusRecipients(bonus, employees)
            return (
              <Card key={bonus.id} className="cursor-pointer p-5 transition-shadow hover:shadow-soft-lg" onClick={() => setSelectedBonus(bonus)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{bonus.name}</p>
                    <p className="text-xs text-muted-foreground">{BONUS_TYPE_LABEL[bonus.bonusType]}</p>
                  </div>
                  <StatusBadge status={bonus.status} />
                </div>
                <p className="mt-3 font-display text-lg font-semibold">
                  {bonus.bonusType === 'percentage' ? `${bonus.amount}%` : formatCurrency(bonus.amount)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">each</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {bonus.targetType === 'employee'
                    ? recipients[0]
                      ? `${recipients[0].personal.firstName} ${recipients[0].personal.lastName}`
                      : 'Unassigned employee'
                    : `${recipients.length} employee${recipients.length === 1 ? '' : 's'}`}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Payroll Period: {bonus.periodLabel}</p>
                  <Badge tone={bonusPayoutMode(bonus) === 'separate_payslip' ? 'brand' : 'neutral'}>
                    {bonusPayoutMode(bonus) === 'separate_payslip' ? 'Separate Payslip' : 'Regular Payroll'}
                  </Badge>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <BonusDetailsDialog
        bonus={selectedBonus}
        employees={employees}
        canManage={canManage}
        onClose={() => setSelectedBonus(null)}
        onChanged={refetch}
        onEdit={(bonus) => {
          setSelectedBonus(null)
          setEditingBonus(bonus)
        }}
      />
      {editingBonus && (
        <BonusFormDialog
          bonus={editingBonus}
          open
          onOpenChange={(open) => !open && setEditingBonus(null)}
          employees={employees}
          departments={departments}
          onSaved={refetch}
        />
      )}
    </div>
  )
}
