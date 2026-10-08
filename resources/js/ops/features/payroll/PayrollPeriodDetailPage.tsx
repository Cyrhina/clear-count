import { ArrowLeft, Calculator, Download, Lock, PauseCircle, PlayCircle, ShieldCheck, Undo2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { BulkActionBar } from '@ops/components/ui/BulkActionBar'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FilterField } from '@ops/components/ui/FiltersPopover'
import { SearchFilterBar } from '@ops/components/ui/SearchFilterBar'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import { usePayrollGroups } from '@ops/features/company-settings/hooks/usePayrollGroups'
import { useEmployees } from '@ops/features/employees/hooks/useEmployees'
import { EmployeeComputationDrawer } from '@ops/features/payroll/components/EmployeeComputationDrawer'
import { WorkLogsSummaryCard } from '@ops/features/payroll/components/WorkLogsSummaryCard'
import { BulkEmailToolbar, RowCheckbox, SelectAllCheckbox } from '@ops/features/payslips/components/email/BulkEmailPayslips'
import { EmailStatusBadge } from '@ops/features/payslips/components/email/EmailStatusBadge'
import { PayslipEmailActions } from '@ops/features/payslips/components/email/PayslipEmailActions'
import { PayslipCard } from '@ops/features/payslips/components/PayslipCard'
import { usePayslipEmails } from '@ops/features/payslips/hooks/usePayslipEmails'
import { usePayslipSelection } from '@ops/features/payslips/hooks/usePayslipSelection'
import { usePayrollLines, usePayrollPeriods } from '@ops/features/payroll/hooks/usePayroll'
import { usePermission } from '@ops/hooks/usePermission'
import { useSession } from '@ops/hooks/useSession'
import { useTenant } from '@ops/hooks/useTenant'
import { bonusAppliesToEmployee, includedInRegularPayroll } from '@ops/lib/payroll/bonusMatching'
import { findEmployeePayrollGroup } from '@ops/lib/payroll/groupAssignment'
import { PAY_RATE_TYPE_LABEL, formatBaseRateShort } from '@ops/lib/payroll/payRate'
import { buildPayslipEmail } from '@ops/lib/payroll/payslipEmail'
import { basicPayFor } from '@ops/lib/payroll/rateBasis'
import { getAttendanceRecords } from '@ops/lib/services/attendanceService'
import { getBonuses } from '@ops/lib/services/bonusService'
import { getCompensationApprovals } from '@ops/lib/services/compensationApprovalService'
import { getLoans } from '@ops/lib/services/loanService'
import { getOvertimeRecords } from '@ops/lib/services/overtimeService'
import { companyHeaderFor, downloadReportWorkbook } from '@ops/features/reports/reportExport'
import { approvePayroll, finalizePayroll, getStatutoryConfig, holdEmployeesInPeriod, releaseEmployeesInPeriod, runPayroll } from '@ops/lib/services/payrollService'
import { getDeductionConfigs } from '@ops/lib/services/payrollSettingsService'
import { getThirteenthMonthLines, getThirteenthMonthRuns } from '@ops/lib/services/thirteenthMonthService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type {
  AttendanceRecord,
  BonusIncentive,
  CompensationApproval,
  DeductionConfig,
  LoanRecord,
  OvertimeRecord,
  StatutoryConfig,
  ThirteenthMonthLine,
} from '@ops/types/domain'

export function PayrollPeriodDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSession()
  const { notify } = useToast()
  const { periods, refetch: refetchPeriods } = usePayrollPeriods()
  const { lines, isLoading: isLoadingLines, refetch: refetchLines } = usePayrollLines(id)
  const { employees } = useEmployees()
  const { groups, compensationTypes } = usePayrollGroups()
  const { branches, company } = useTenant()
  const canRun = usePermission('payroll.run')
  const canApprove = usePermission('payroll.approve')
  const canFinalize = usePermission('payroll.finalize')
  const [busy, setBusy] = useState(false)
  const [confirmFinalize, setConfirmFinalize] = useState(false)
  const [deductionConfigs, setDeductionConfigs] = useState<DeductionConfig[]>([])
  const [loans, setLoans] = useState<LoanRecord[]>([])
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [statutoryConfig, setStatutoryConfig] = useState<StatutoryConfig | undefined>(undefined)
  const [bonuses, setBonuses] = useState<BonusIncentive[]>([])
  const [thirteenthMonthLines, setThirteenthMonthLines] = useState<ThirteenthMonthLine[]>([])
  const [compensationApprovals, setCompensationApprovals] = useState<CompensationApproval[]>([])

  const period = periods.find((p) => p.id === id)
  const periodLabel = period?.label
  const periodStatus = period?.status

  // Re-read after each status change — running payroll locks approved entries to this period.
  useEffect(() => {
    getCompensationApprovals(user).then(setCompensationApprovals)
  }, [user, periodStatus])

  useEffect(() => {
    getDeductionConfigs(user).then(setDeductionConfigs)
    getLoans(user).then(setLoans)
    getOvertimeRecords(user).then(setOvertimeRecords)
    getAttendanceRecords(user).then(setAttendanceRecords)
    getStatutoryConfig(user).then(setStatutoryConfig)
    getBonuses(user).then(setBonuses)
    getThirteenthMonthRuns(user).then((runs) => {
      const finalizedRun = runs.find((r) => r.status === 'finalized' && r.payoutPeriodLabel.trim().toLowerCase() === (periodLabel ?? '').trim().toLowerCase())
      if (finalizedRun) getThirteenthMonthLines(user, finalizedRun.id).then(setThirteenthMonthLines)
      else setThirteenthMonthLines([])
    })
  }, [user, periodLabel])
  const employeeById = new Map(employees.map((e) => [e.id, e]))
  const payrollGroup = period?.payrollGroupId ? groups.find((g) => g.id === period.payrollGroupId) : undefined
  const emails = usePayslipEmails('payroll', id)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const filteredLines = useMemo(() => {
    const q = search.trim().toLowerCase()
    return lines.filter((line) => {
      const e = employeeById.get(line.employeeId)
      if (!e) return !q && department === 'all' && branchFilter === 'all'
      const text = `${e.personal.firstName} ${e.personal.lastName} ${e.employeeNumber} ${e.employment.position ?? ''}`.toLowerCase()
      return (!q || text.includes(q)) && (department === 'all' || e.employment.department === department) && (branchFilter === 'all' || e.branchId === branchFilter)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, employees, search, department, branchFilter])
  const departmentOptions = useMemo(() => [...new Set(employees.map((e) => e.employment.department).filter(Boolean))].sort(), [employees])
  const lineFilterCount = [department !== 'all', branchFilter !== 'all'].filter(Boolean).length
  const clearLineFilters = () => {
    setSearch('')
    setDepartment('all')
    setBranchFilter('all')
  }
  const selection = usePayslipSelection(filteredLines.map((l) => l.employeeId))

  if (!period) return <Skeleton className="h-96" />

  // Payslips are only issued (and so only emailed) once the run is finalized; previews are always available.
  const canEmail = period.status === 'finalized' && (canRun || canFinalize)
  const emailDisabledReason = period.status === 'finalized' ? 'You do not have permission to send payslips.' : 'Payslips can be emailed once this payroll run is finalized.'
  const employeeName = (employeeId: string) => {
    const e = employeeById.get(employeeId)
    return e ? `${e.personal.firstName} ${e.personal.lastName}` : 'Unknown'
  }
  const emailFor = (employeeId: string) => {
    const employee = employeeById.get(employeeId)
    const line = lines.find((l) => l.employeeId === employeeId)
    return employee && line ? buildPayslipEmail({
          kind: 'payroll',
          company,
          employee,
          label: period.label,
          periodStart: period.startDate,
          periodEnd: period.endDate,
          payDate: period.payDate,
          ctaPath: `/ess/payslips/${line.id}`,
        }) : undefined
  }
  const sendEmails = (employeeIds: string[]) =>
    emails.send(
      employeeIds.flatMap((employeeId) => {
        const email = emailFor(employeeId)
        return email ? [{ employeeId, employeeName: employeeName(employeeId), subject: email.subject }] : []
      }),
    )

  async function handleRun() {
    if (!id) return
    setBusy(true)
    const generatedLines = await runPayroll(user, id)
    setBusy(false)
    notify({ title: 'Payroll calculated', description: `${generatedLines.length} employee lines generated.`, tone: 'success' })
    refetchPeriods()
    refetchLines()
  }

  const canHold = canRun && (period.status === 'review' || period.status === 'draft')
  const heldIds = period.excludedEmployeeIds ?? []

  async function handleHold() {
    if (!id) return
    const n = await holdEmployeesInPeriod(user, id, [...selection.selected])
    notify({ title: `${n} employee${n === 1 ? '' : 's'} held out of this run`, description: 'Their lines were removed. Release them from the Held list to add them back.', tone: n ? 'success' : 'default' })
    selection.clear()
    refetchPeriods()
    refetchLines()
  }

  async function handleRelease(ids: string[]) {
    if (!id) return
    const n = await releaseEmployeesInPeriod(user, id, ids)
    notify({ title: `${n} employee${n === 1 ? '' : 's'} released back into this run`, tone: n ? 'success' : 'default' })
    refetchPeriods()
    refetchLines()
  }

  const exportSelected = () => {
    const chosen = lines.filter((l) => selection.selected.has(l.employeeId))
    const header = ['Employee', 'Position', 'Gross Pay', 'Total Deductions', 'Net Pay']
    const rows = chosen.map((l) => [employeeName(l.employeeId), employeeById.get(l.employeeId)?.employment.position ?? '', l.grossPay, l.totalDeductions, l.netPay])
    void downloadReportWorkbook({
      company: companyHeaderFor(company),
      title: `Payroll ${period.payrollNumber} — selected employees`,
      meta: [{ label: 'Payroll Period', value: period.label }, { label: 'Employees', value: String(chosen.length) }],
      generatedBy: user.name,
      data: { filename: `payroll-${period.payrollNumber.toLowerCase()}-selected`, rows: [header, ...rows] },
    })
  }

  async function handleApprove() {
    if (!id) return
    await approvePayroll(user, id)
    notify({ title: 'Payroll approved', tone: 'success' })
    refetchPeriods()
  }

  async function handleFinalize() {
    if (!id) return
    await finalizePayroll(user, id)
    notify({ title: 'Payroll finalized', description: 'Payslips are now available and loan balances were updated.', tone: 'success' })
    setConfirmFinalize(false)
    refetchPeriods()
  }

  const totals = lines.reduce(
    (acc, line) => ({
      gross: acc.gross + line.grossPay,
      deductions: acc.deductions + line.totalDeductions,
      net: acc.net + line.netPay,
    }),
    { gross: 0, deductions: 0, net: 0 },
  )

  const activePeriod = period

  function rowData(line: (typeof lines)[number]) {
    const period = activePeriod
    const employee = employeeById.get(line.employeeId)
    const employeeGroup = employee ? findEmployeePayrollGroup(groups, employee.id) : undefined
    const compensationType = compensationTypes.find((c) => c.id === employeeGroup?.compensationTypeId)
    const branch = branches.find((b) => b.id === employee?.branchId)
    const basicPayResult = employee ? basicPayFor(employee, period, attendanceRecords, compensationApprovals, line.periodsPerMonth ?? 2) : undefined
    const employeeApprovedBonuses = employee
      ? bonuses.filter(
          (b) =>
            b.status === 'approved' &&
            includedInRegularPayroll(b) &&
            b.periodLabel.trim().toLowerCase() === period.label.trim().toLowerCase() &&
            bonusAppliesToEmployee(b, employee),
        )
      : []
    const employeeThirteenthMonthLine = employee ? thirteenthMonthLines.find((l) => l.employeeId === employee.id) : undefined
    const email = emailFor(line.employeeId)
    return { employee, employeeGroup, compensationType, branch, basicPayResult, employeeApprovedBonuses, employeeThirteenthMonthLine, email }
  }

  /** View Computation, View Payslip and the email preview/send buttons — the same set in the table row and the phone/tablet card. */
  function renderActions(line: (typeof lines)[number], d: ReturnType<typeof rowData>) {
    const period = activePeriod
    const { employee, employeeGroup, compensationType, branch, employeeApprovedBonuses, employeeThirteenthMonthLine, email } = d
    return (
      <>
                        {employee && (
                          <EmployeeComputationDrawer
                            employee={employee}
                            line={line}
                            period={period}
                            payrollGroup={employeeGroup}
                            compensationType={compensationType}
                            branch={branch}
                            deductionConfigs={deductionConfigs}
                            loans={loans.filter((l) => l.employeeId === employee.id)}
                            overtimeRecords={overtimeRecords}
                            attendanceRecords={attendanceRecords}
                            compensationApprovals={compensationApprovals}
                            statutoryConfig={statutoryConfig}
                            approvedBonuses={employeeApprovedBonuses}
                            thirteenthMonthLine={employeeThirteenthMonthLine}
                            trigger={
                              <Button size="sm" variant="ghost" icon={<Calculator className="size-3.5" />}>
                                View Computation
                              </Button>
                            }
                          />
                        )}
                        {period.status === 'finalized' && (
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/payslips/${line.id}`)}>
                            View Payslip
                          </Button>
                        )}
                        {employee && email && (
                          <PayslipEmailActions
                            compact
                            email={email}
                            status={emails.statusFor(employee.id)}
                            record={emails.records[employee.id]}
                            canSend={canEmail}
                            disabledReason={emailDisabledReason}
                            onSend={() => sendEmails([employee.id])}
                            renderPayslip={() => (
                              <PayslipCard
                                company={company}
                                employee={employee}
                                period={period}
                                payrollGroup={employeeGroup}
                                line={line}
                                deductionConfigs={deductionConfigs}
                                loans={loans.filter((l) => l.employeeId === employee.id)}
                              />
                            )}
                          />
                        )}
      </>
    )
  }

  return (
    <div className="space-y-5">
      <Link to="/payroll" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Back to payroll runs
      </Link>

      <PageHeader
        title={period.label}
        description={`${period.payrollNumber} · ${formatDate(period.startDate)} – ${formatDate(period.endDate)} · Pay date ${formatDate(period.payDate)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {payrollGroup ? <Badge tone="brand">{payrollGroup.name}</Badge> : <Badge tone="neutral">All Employees</Badge>}
            <StatusBadge status={period.status} />
            {period.status === 'draft' && canRun && (
              <Button size="sm" icon={<PlayCircle className="size-4" />} isLoading={busy} onClick={handleRun}>
                Run Payroll
              </Button>
            )}
            {period.status === 'review' && canApprove && (
              <Button size="sm" icon={<ShieldCheck className="size-4" />} onClick={handleApprove}>
                Approve
              </Button>
            )}
            {period.status === 'approved' && canFinalize && (
              <Button size="sm" variant="destructive" icon={<Lock className="size-4" />} onClick={() => setConfirmFinalize(true)}>
                Finalize
              </Button>
            )}
          </div>
        }
      />

      <WorkLogsSummaryCard period={period} />

      {heldIds.length > 0 && (
        <Card className="border-warning/30 bg-warning/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Held out of this run ({heldIds.length})</p>
              <p className="text-xs text-muted-foreground">No payroll line or payslip is created for them while held.</p>
            </div>
            {canHold && (
              <Button size="sm" variant="secondary" icon={<Undo2 className="size-3.5" />} onClick={() => handleRelease(heldIds)}>
                Release All
              </Button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {heldIds.map((employeeId) => (
              <span key={employeeId} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs">
                {employeeName(employeeId)}
                {canHold && (
                  <button type="button" className="text-primary hover:underline" onClick={() => handleRelease([employeeId])}>
                    Release
                  </button>
                )}
              </span>
            ))}
          </div>
        </Card>
      )}

      {isLoadingLines ? (
        <Skeleton className="h-72" />
      ) : lines.length === 0 ? (
        <EmptyState
          title="Payroll not yet calculated"
          description={canRun ? 'Run payroll to calculate earnings, deductions, and net pay for every active employee.' : 'Waiting for a payroll admin to run this period.'}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Gross Pay</p>
              <p className="mt-1 font-display text-xl font-semibold">{formatCurrency(totals.gross)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Deductions</p>
              <p className="mt-1 font-display text-xl font-semibold">{formatCurrency(totals.deductions)}</p>
            </Card>
            <Card className="col-span-2 p-4 sm:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Net Pay</p>
              <p className="mt-1 font-display text-xl font-semibold">{formatCurrency(totals.net)}</p>
            </Card>
          </div>

          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search employee, ID, or position…"
            activeCount={lineFilterCount}
            onClear={clearLineFilters}
            trailing={`${filteredLines.length} of ${lines.length} employees`}
            filters={
              <>
                <FilterField label="Department">
                  <Select value={department} onValueChange={setDepartment} options={[{ value: 'all', label: 'All departments' }, ...departmentOptions.map((d) => ({ value: d, label: d }))]} />
                </FilterField>
                <FilterField label="Branch">
                  <Select value={branchFilter} onValueChange={setBranchFilter} options={[{ value: 'all', label: 'All branches' }, ...branches.map((b) => ({ value: b.id, label: b.name }))]} />
                </FilterField>
              </>
            }
          />

          <BulkEmailToolbar
            candidates={filteredLines.map((l) => ({
              employeeId: l.employeeId,
              employeeName: employeeName(l.employeeId),
              hasEmail: !!employeeById.get(l.employeeId)?.personal.personalEmail,
              status: emails.statusFor(l.employeeId),
            }))}
            selectedIds={selection.selected}
            canSend={canEmail}
            disabledReason={emailDisabledReason}
            isSending={emails.isSending}
            onSend={sendEmails}
            onSent={selection.clear}
          />

          {/* Phones and tablets: one card per employee (two columns on tablet). */}
          <div className="space-y-3 lg:hidden">
            {filteredLines.length > 0 && (
              <label className="flex items-center gap-2.5 px-1 text-sm text-muted-foreground">
                <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} />
                Select all ({filteredLines.length})
              </label>
            )}
            {filteredLines.length === 0 && <p className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">No employees match these filters.</p>}
            <div className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-2">
              {filteredLines.map((line) => {
                const d = rowData(line)
                const { employee, employeeGroup, basicPayResult } = d
                return (
                  <Card key={line.id} watermark={null} className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <span className="pt-0.5">
                        <RowCheckbox checked={selection.selected.has(line.employeeId)} onChange={(c) => selection.toggle(line.employeeId, c)} label={employeeName(line.employeeId)} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold leading-tight">{employeeName(line.employeeId)}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {employee?.employment.position}
                          {employeeGroup ? ` · ${employeeGroup.name}` : ' · Unassigned'}
                        </p>
                      </div>
                      <EmailStatusBadge status={emails.statusFor(line.employeeId)} record={emails.records[line.employeeId]} />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {employee ? formatBaseRateShort(employee.compensation.payType, employee.compensation.basicPay, employee.compensation.outputUnit) : '—'} · {employee ? PAY_RATE_TYPE_LABEL[employee.compensation.payType] : '—'} · {basicPayResult?.basis ? `${basicPayResult.basis.quantity} ${basicPayResult.basis.unit}` : '1 payroll period'}
                    </p>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-lg bg-muted/40 p-3 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Basic pay</dt>
                        <dd className="mt-0.5 font-medium tabular-nums">{formatCurrency(basicPayResult?.amount ?? line.earnings[0]?.amount ?? 0)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Gross pay</dt>
                        <dd className="mt-0.5 font-medium tabular-nums">{formatCurrency(line.grossPay)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Deductions</dt>
                        <dd className="mt-0.5 font-medium tabular-nums">{formatCurrency(line.totalDeductions)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Net pay</dt>
                        <dd className="mt-0.5 font-display text-sm font-semibold tabular-nums">{formatCurrency(line.netPay)}</dd>
                      </div>
                    </dl>

                    <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">{renderActions(line, d)}</div>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <SelectAllCheckbox state={selection.headerState} onChange={selection.toggleAll} />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Payroll Group</TableHead>
                <TableHead>Pay Rate</TableHead>
                <TableHead>Rate Type</TableHead>
                <TableHead>Work/Input Basis</TableHead>
                <TableHead>Basic Pay</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLines.length === 0 && (
                <TableRow>
                  <TableCell colSpan={14} className="py-10 text-center text-sm text-muted-foreground">
                    No employees match these filters.
                  </TableCell>
                </TableRow>
              )}
              {filteredLines.map((line) => {
                const d = rowData(line)
                const { employee, employeeGroup, basicPayResult } = d
                return (
                  <TableRow key={line.id}>
                    <TableCell>
                      <RowCheckbox checked={selection.selected.has(line.employeeId)} onChange={(c) => selection.toggle(line.employeeId, c)} label={employeeName(line.employeeId)} />
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {employee ? `${employee.personal.firstName} ${employee.personal.lastName}` : 'Unknown'}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{employee?.employment.position}</TableCell>
                    <TableCell className="text-muted-foreground">{employeeGroup?.name ?? 'Unassigned'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {employee ? formatBaseRateShort(employee.compensation.payType, employee.compensation.basicPay, employee.compensation.outputUnit) : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{employee ? PAY_RATE_TYPE_LABEL[employee.compensation.payType] : '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {basicPayResult?.basis ? `${basicPayResult.basis.quantity} ${basicPayResult.basis.unit}` : '1 payroll period'}
                    </TableCell>
                    <TableCell>{formatCurrency(basicPayResult?.amount ?? line.earnings[0]?.amount ?? 0)}</TableCell>
                    <TableCell>{formatCurrency(line.grossPay)}</TableCell>
                    <TableCell>{formatCurrency(line.totalDeductions)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(line.netPay)}</TableCell>
                    <TableCell>
                      <StatusBadge status={period.status} />
                    </TableCell>
                    <TableCell>
                      <EmailStatusBadge status={emails.statusFor(line.employeeId)} record={emails.records[line.employeeId]} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {renderActions(line, d)}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          </div>

          <BulkActionBar count={selection.selected.size} noun={selection.selected.size === 1 ? 'employee selected' : 'employees selected'} onClear={selection.clear}>
            <Button size="sm" variant="secondary" icon={<Download className="size-3.5" />} onClick={exportSelected}>
              Export
            </Button>
            {canHold && (
              <Button size="sm" icon={<PauseCircle className="size-3.5" />} onClick={handleHold}>
                Hold from Run
              </Button>
            )}
          </BulkActionBar>
        </>
      )}

      <Dialog open={confirmFinalize} onOpenChange={setConfirmFinalize}>
        <DialogContent>
          <DialogTitle>Finalize {period.label}?</DialogTitle>
          <DialogDescription>
            Finalizing locks this payroll period from further changes, makes payslips available to employees, and deducts
            this period&apos;s installment from every active loan balance. This cannot be undone.
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmFinalize(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleFinalize}>
              Finalize Payroll
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
