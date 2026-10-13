import { CalendarClock, Eye, Landmark, Pencil, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Avatar } from '@ops/components/ui/Avatar'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FilterField } from '@ops/components/ui/FiltersPopover'
import { SearchFilterBar } from '@ops/components/ui/SearchFilterBar'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useToast } from '@ops/components/ui/Toast'
import { usePayrollGroups } from '@ops/features/company-settings/hooks/usePayrollGroups'
import { useAllEmployees } from '@ops/features/employees/hooks/useAllEmployees'
import { AddEmployeesToLoanTypeDialog } from '@ops/features/loans-deductions/components/AddEmployeesToLoanTypeDialog'
import { AddLoanDialog } from '@ops/features/loans-deductions/components/AddLoanDialog'
import { LoanDetailsDialog } from '@ops/features/loans-deductions/components/LoanDetailsDialog'
import { LoanTypeDetailsDialog, isLive } from '@ops/features/loans-deductions/components/LoanTypeDetailsDialog'
import { RecordCard } from '@ops/features/loans-deductions/components/RecordCard'
import { useLoanTypes } from '@ops/features/loans-deductions/hooks/useBenefitsDeductions'
import { useLoans } from '@ops/features/loans-deductions/hooks/useLoans'
import { fullName, nextDeduction, projectInstallments } from '@ops/features/loans-deductions/loanUtils'
import { usePayrollPeriods } from '@ops/features/payroll/hooks/usePayroll'
import { usePermission } from '@ops/hooks/usePermission'
import { setLoanStatus } from '@ops/lib/services/loanApiService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { LoanRecord, LoanTypeConfig } from '@ops/types/domain'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'suspended', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
]

/** The repayment schedule on a loan card: when it's next deducted, and how many installments are left. */
function ScheduleLine({ loan, next }: { loan: LoanRecord; next: ReturnType<typeof nextDeduction> }) {
  if (loan.status === 'completed') {
    return <p className="font-medium text-foreground">Fully paid</p>
  }
  if (loan.status === 'cancelled') {
    return <p className="font-medium text-foreground">Cancelled — no further deductions</p>
  }
  if (loan.status === 'suspended') {
    return (
      <div>
        <p className="font-medium text-foreground">Deductions paused</p>
        <p className="text-muted-foreground">Resumes when you resume the loan.</p>
      </div>
    )
  }
  const installments = projectInstallments(loan)
  const last = installments[installments.length - 1]
  return (
    <div>
      <p className="font-medium text-foreground">Next deduction: {next?.when ?? '—'}</p>
      <p className="text-muted-foreground">
        {next?.detail ? `${next.detail} run · ` : ''}
        {installments.length} installment{installments.length === 1 ? '' : 's'} left{last ? ` · final payment ${last.month}` : ''}
      </p>
    </div>
  )
}

/**
 * Employee loans by loan type: a card per type listing the employees who have that loan, with View Details and Add Employees.
 * Each loan's own actions (view, edit, pause/resume, cancel) are in the type's details.
 */
export function EmployeeLoansView() {
  const { loans, isLoading, refetch } = useLoans()
  const { employees } = useAllEmployees()
  const { types, labelFor, refetch: refetchTypes } = useLoanTypes()
  const { periods } = usePayrollPeriods()
  const { groups } = usePayrollGroups()
  const canManage = usePermission('loans.manage')
  const { notify } = useToast()
  const employeeById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null)
  const [viewingKey, setViewingKey] = useState<string | null>(null)
  const [addingKey, setAddingKey] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const filtersActive = search.trim() !== '' || status !== 'all'

  const refreshAll = () => {
    refetch()
    refetchTypes()
  }

  async function changeStatus(loan: LoanRecord, next: LoanRecord['status'], message: string) {
    await setLoanStatus(loan.id, next)
    notify({ title: `${labelFor(loan.type, loan.label)} ${message}`, tone: 'success' })
    refetch()
  }

  const matches = (loan: LoanRecord) => {
    if (status !== 'all' && loan.status !== status) return false
    const query = search.trim().toLowerCase()
    if (!query) return true
    const employee = employeeById.get(loan.employeeId)
    return `${fullName(employee)} ${employee?.employeeNumber ?? ''} ${labelFor(loan.type, loan.label)}`.toLowerCase().includes(query)
  }

  const loansOf = (type: LoanTypeConfig) => loans.filter((l) => l.type === type.key)
  // Inactive types stay visible only while loans still use them.
  const visibleTypes = types.filter((t) => t.isActive || loansOf(t).length > 0)
  const shownTypes = visibleTypes.filter((t) => !filtersActive || loansOf(t).some(matches))
  const typeKeys = new Set(types.map((t) => t.key))
  const unlisted = loans.filter((l) => !typeKeys.has(l.type) && matches(l))

  const viewing = types.find((t) => t.key === viewingKey)
  const adding = types.find((t) => t.key === addingKey)

  /** One employee's loan: View / Edit / Pause·Resume / Cancel, with its repayment schedule. */
  function renderLoanCard(loan: LoanRecord) {
    const employee = employeeById.get(loan.employeeId)
    const progress = Math.round(((loan.principal - loan.balance) / loan.principal) * 100)
    const typeLabel = labelFor(loan.type, loan.label)
    const fixedType = types.find((t) => t.key === loan.type)?.amountType === 'fixed'
    return (
      <RecordCard
        key={loan.id}
        compactActions
        title={employee ? fullName(employee) : 'Unknown'}
        subtitle={typeLabel}
        status={loan.status}
        headline={formatCurrency(loan.balance)}
        headlineHint={`of ${formatCurrency(loan.principal)} remaining`}
        progress={progress}
        lines={[`${formatCurrency(loan.monthlyDeduction)}/month · started ${formatDate(loan.startDate)}`]}
        note={<ScheduleLine loan={loan} next={nextDeduction(loan, periods, groups)} />}
        noteIcon={<CalendarClock className="mt-0.5 size-3.5 shrink-0 text-primary" />}
        onView={() => setSelectedLoan(loan)}
        edit={
          <AddLoanDialog
            employees={employees}
            loan={loan}
            amountLocked={fixedType}
            onCreated={refetch}
            trigger={
              <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} iconOnlyOnMobile disabled={!canManage || loan.status === 'completed' || loan.status === 'cancelled'} title={loan.status === 'completed' || loan.status === 'cancelled' ? `This loan is ${loan.status}.` : undefined}>
                Edit
              </Button>
            }
          />
        }
        onPause={() => changeStatus(loan, 'suspended', 'paused — no deductions until resumed')}
        onResume={() => changeStatus(loan, 'active', 'resumed')}
        onCancel={() => changeStatus(loan, 'cancelled', 'cancelled')}
        cancelName={typeLabel}
        cancelConsequence={`${employee ? employee.personal.firstName : 'The employee'}'s ${typeLabel} (${formatCurrency(loan.balance)} remaining) will stop being deducted in payroll.`}
        canManage={canManage}
        dimmed={loan.status === 'cancelled' || loan.status === 'completed'}
      />
    )
  }

  return (
    <div className="space-y-5">
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search employee, ID, or type…"
        activeCount={status !== 'all' ? 1 : 0}
        onClear={() => {
          setSearch('')
          setStatus('all')
        }}
        trailing={
          <>
            {loans.filter(matches).length} of {loans.length} loans
          </>
        }
        filters={
          <FilterField label="Status">
            <Select value={status} onValueChange={setStatus} options={STATUS_OPTIONS} />
          </FilterField>
        }
      />

      {isLoading ? (
        <Skeleton className="h-72" />
      ) : shownTypes.length === 0 && unlisted.length === 0 ? (
        <EmptyState title="No loan types found" description={filtersActive ? 'Try clearing the search or status filter.' : 'Add a loan type under Loan Types, then add employees to it from its card.'} />
      ) : (
        <div className="space-y-4 md:block md:columns-2 md:gap-4 md:space-y-0 2xl:columns-3">
          {shownTypes.map((type) => {
            const all = loansOf(type)
            const live = all.filter(isLive)
            const outstanding = live.filter((l) => l.status === 'active').reduce((sum, l) => sum + l.balance, 0)
            const list = all.filter(matches).sort((a, b) => Number(!isLive(a)) - Number(!isLive(b)) || fullName(employeeById.get(a.employeeId)).localeCompare(fullName(employeeById.get(b.employeeId))))
            return (
              <Card key={type.id} className="flex flex-col md:mb-4 md:break-inside-avoid">
                <Card.Header className="items-start">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Landmark className="size-4 shrink-0 text-muted-foreground" />
                      <Card.Title className="truncate">{type.label}</Card.Title>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {type.provider} · {type.typicalTerm}
                    </p>
                  </div>
                  {!type.isActive && <Badge tone="neutral">Inactive</Badge>}
                </Card.Header>

                <Card.Body className="flex flex-1 flex-col gap-3 pt-3">
                  <div className="flex flex-col gap-1 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
                    <span className="text-muted-foreground">
                      {type.amountType === 'fixed' ? (
                        <>
                          <span className="font-semibold text-foreground">{formatCurrency(type.fixedPrincipal ?? 0)}</span> · {formatCurrency(type.fixedMonthlyDeduction ?? 0)}/month · fixed
                        </>
                      ) : (
                        <span className="font-semibold text-foreground">Terms set per employee</span>
                      )}
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{live.length}</span> borrower{live.length === 1 ? '' : 's'} · {formatCurrency(outstanding)} outstanding
                    </span>
                  </div>

                  <div className={`overflow-hidden rounded-xl border border-border${list.length > 0 ? " flex-1" : ""}`}>
                    {list.length === 0 ? (
                      <p className="px-3 py-6 text-center text-xs text-muted-foreground">{all.length === 0 ? 'No employees have this loan yet.' : 'No loans match the filters.'}</p>
                    ) : (
                      <ul className="max-h-60 divide-y divide-border overflow-y-auto">
                        {list.map((loan) => {
                          const employee = employeeById.get(loan.employeeId)
                          return (
                            <li key={loan.id} className="flex items-center gap-2.5 px-3 py-2">
                              <Avatar name={fullName(employee)} size="sm" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{fullName(employee)}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {formatCurrency(loan.balance)} of {formatCurrency(loan.principal)} · {formatCurrency(loan.monthlyDeduction)}/month
                                </p>
                              </div>
                              <StatusBadge status={loan.status === 'suspended' ? 'paused' : loan.status} />
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button size="sm" variant="ghost" icon={<Eye className="size-3.5" />} className="flex-1 whitespace-nowrap sm:flex-none" onClick={() => setViewingKey(type.key)}>
                      View Details
                    </Button>
                    {canManage && type.isActive && (
                      <Button size="sm" variant="secondary" icon={<UserPlus className="size-3.5" />} className="flex-1 whitespace-nowrap sm:flex-none" onClick={() => setAddingKey(type.key)}>
                        Add Employees
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            )
          })}
        </div>
      )}

      {unlisted.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Loans with a type that no longer exists ({unlisted.length})</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{unlisted.map((loan) => renderLoanCard(loan))}</div>
        </div>
      )}

      {viewing && (
        <LoanTypeDetailsDialog
          type={viewing}
          allTypes={types}
          loans={loansOf(viewing)}
          employeeById={employeeById}
          canManage={canManage}
          renderLoanCard={renderLoanCard}
          onAdd={() => setAddingKey(viewing.key)}
          onClose={() => setViewingKey(null)}
          onChanged={refreshAll}
        />
      )}

      {adding && <AddEmployeesToLoanTypeDialog type={adding} employees={employees} loans={loans} onClose={() => setAddingKey(null)} onAdded={refreshAll} />}

      <LoanDetailsDialog loan={selectedLoan} employee={selectedLoan ? employeeById.get(selectedLoan.employeeId) : undefined} onClose={() => setSelectedLoan(null)} />
    </div>
  )
}
