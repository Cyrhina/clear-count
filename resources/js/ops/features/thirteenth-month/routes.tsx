import { Calculator, FileText, Info, Lock, PlayCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { EmployeePickerPanel } from '@ops/components/ui/EmployeePickerPanel'
import { EmployeeCombobox } from '@ops/components/ui/EmployeeCombobox'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import { usePayrollGroups } from '@ops/features/company-settings/hooks/usePayrollGroups'
import { usePayrollEmployees } from '@ops/features/payroll/hooks/usePayroll'
import { BulkEmailToolbar, RowCheckbox, SelectAllCheckbox } from '@ops/features/payslips/components/email/BulkEmailPayslips'
import { EmailStatusBadge } from '@ops/features/payslips/components/email/EmailStatusBadge'
import { PayslipEmailActions } from '@ops/features/payslips/components/email/PayslipEmailActions'
import { usePayslipEmails } from '@ops/features/payslips/hooks/usePayslipEmails'
import { usePayslipSelection } from '@ops/features/payslips/hooks/usePayslipSelection'
import { ComputationDrawer } from '@ops/features/thirteenth-month/components/ComputationDrawer'
import { useThirteenthMonthLines, useThirteenthMonthRuns } from '@ops/features/thirteenth-month/hooks/useThirteenthMonth'
import { ThirteenthMonthPayslipDocument } from '@ops/features/thirteenth-month/ThirteenthMonthPayslipPage'
import { usePermission } from '@ops/hooks/usePermission'
import { useTenant } from '@ops/hooks/useTenant'
import { buildPayslipEmail } from '@ops/lib/payroll/payslipEmail'
import { apiErrorMessage } from '@ops/lib/api/http'
import {
  finalizeThirteenthMonthRun,
  generateThirteenthMonthRun,
  isSeparated,
  previewThirteenthMonthBatch,
  type ThirteenthMonthPreview,
} from '@ops/lib/services/thirteenthMonthApiService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { Employee, PayrollGroup, ThirteenthMonthLine, ThirteenthMonthRun, ThirteenthMonthSelection, ThirteenthMonthSelectionMode } from '@ops/types/domain'

const YEAR_OPTIONS = [2024, 2025, 2026, 2027].map((y) => ({ value: String(y), label: String(y) }))
const DEFAULT_YEAR = 2026

const MODE_OPTIONS: { value: ThirteenthMonthSelectionMode; label: string }[] = [
  { value: 'all', label: 'All Eligible Employees' },
  { value: 'employees', label: 'Specific Employee(s)' },
  { value: 'payroll_group', label: 'Payroll Group' },
  { value: 'department', label: 'Department' },
  { value: 'separated', label: 'Separated / Resigned Employees' },
]

function fullName(e: Employee) {
  return `${e.personal.firstName} ${e.personal.lastName}`
}

function selectionLabel(selection: ThirteenthMonthSelection | undefined, groups: PayrollGroup[]): string {
  if (!selection || selection.mode === 'all') return 'All Eligible Employees'
  if (selection.mode === 'employees') return `${selection.employeeIds?.length ?? 0} selected employee(s)`
  if (selection.mode === 'payroll_group') return `Payroll Group: ${groups.find((g) => g.id === selection.payrollGroupId)?.name ?? '—'}`
  if (selection.mode === 'separated') return selection.employeeIds?.length ? `Separated: ${selection.employeeIds.length} selected` : 'Separated / Resigned Employees'
  return `Department: ${selection.department ?? '—'}`
}

export function ThirteenthMonthPage() {
  const { company } = useTenant()
  const { notify } = useToast()
  const { employees, isLoading: employeesLoading } = usePayrollEmployees()
  const { groups } = usePayrollGroups()
  const { runs, isLoading: runsLoading, refetch: refetchRuns } = useThirteenthMonthRuns()
  const canManage = usePermission('thirteenth_month.manage')

  const [year, setYear] = useState(DEFAULT_YEAR)
  const [generationDate, setGenerationDate] = useState(`${DEFAULT_YEAR}-12-15`)
  const [payoutPeriodLabel, setPayoutPeriodLabel] = useState(`December ${DEFAULT_YEAR}`)
  const [mode, setMode] = useState<ThirteenthMonthSelectionMode>('all')
  const [employeeIds, setEmployeeIds] = useState<string[]>([])
  const [payrollGroupId, setPayrollGroupId] = useState<string | undefined>(undefined)
  const [department, setDepartment] = useState<string | undefined>(undefined)
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>(undefined)
  const [preview, setPreview] = useState<ThirteenthMonthPreview | null>(null)
  const [busy, setBusy] = useState(false)

  const selection: ThirteenthMonthSelection = useMemo(
    () => ({
      mode,
      employeeIds: mode === 'employees' || mode === 'separated' ? employeeIds : undefined,
      payrollGroupId: mode === 'payroll_group' ? payrollGroupId : undefined,
      department: mode === 'department' ? department : undefined,
    }),
    [mode, employeeIds, payrollGroupId, department],
  )
  const selectionComplete =
    mode === 'all' || mode === 'separated' || (mode === 'employees' && employeeIds.length > 0) || (mode === 'payroll_group' && !!payrollGroupId) || (mode === 'department' && !!department)

  // Live preview of who the selection covers (eligibility depends on year + cutoff date).
  useEffect(() => {
    if (!selectionComplete) {
      setPreview(null)
      return
    }
    let cancelled = false
    previewThirteenthMonthBatch({ year, selection }, employees).then(
      (p) => {
        if (!cancelled) setPreview(p)
      },
      () => undefined,
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, selection, selectionComplete, employees, runs])

  const eligible = useMemo(() => preview?.eligible ?? [], [preview])
  // Regular batches cover active employees only; separated/resigned employees have their own batch.
  const activeEligible = useMemo(() => eligible.filter((e) => !isSeparated(e)), [eligible])
  const separatedEligible = useMemo(() => eligible.filter(isSeparated), [eligible])
  const departmentOptions = useMemo(
    () => [...new Set(activeEligible.map((e) => e.employment.department))].sort().map((d) => ({ value: d, label: d })),
    [activeEligible],
  )
  const groupOptions = groups.map((g) => ({ value: g.id, label: `${g.name} (${g.employeeIds.length})` }))

  const runsForYear = useMemo(() => runs.filter((r) => r.year === year).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [runs, year])
  const activeRun = runsForYear.find((r) => r.id === selectedRunId) ?? runsForYear[0]
  const { lines, isLoading: linesLoading, refetch: refetchLines } = useThirteenthMonthLines(activeRun?.id)
  const employeeById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])
  const emails = usePayslipEmails('thirteenth_month', activeRun?.id)
  const payslipSelection = usePayslipSelection(lines.map((l) => l.employeeId))

  // 13th Month payslips are issued (and so emailed) once the batch is finalized; previews are always available.
  const canEmail = activeRun?.status === 'finalized' && canManage
  const emailDisabledReason = activeRun?.status === 'finalized' ? 'You do not have permission to send payslips.' : 'Payslips can be emailed once this batch is finalized.'
  const emailFor = (employeeId: string) => {
    const employee = employeeById.get(employeeId)
    const line = lines.find((l) => l.employeeId === employeeId)
    if (!employee || !line || !activeRun) return undefined
    return buildPayslipEmail({
      kind: 'thirteenth_month',
      company,
      employee,
      label: activeRun.payoutPeriodLabel,
      periodStart: line.activeFrom ?? `${activeRun.year}-01-01`,
      periodEnd: line.activeTo ?? `${activeRun.year}-12-31`,
      payDate: activeRun.generationDate,
      ctaPath: '/ess/payslips',
      pdfPath: activeRun.status === 'finalized' ? `/api/thirteenth-month/lines/${line.id}/pdf` : undefined,
    })
  }
  const sendEmails = (employeeIds: string[]) =>
    emails.send(
      employeeIds.flatMap((employeeId) => {
        const email = emailFor(employeeId)
        const employee = employeeById.get(employeeId)
        return email && employee ? [{ employeeId, employeeName: fullName(employee), subject: email.subject }] : []
      }),
    )

  const totals = lines.reduce(
    (acc, l) => ({
      payout: acc.payout + l.thirteenthMonthPay,
      deductions: acc.deductions + (l.undertimeDeduction ?? 0) + (l.absenceDeduction ?? 0),
      separated: acc.separated + (l.separated ? 1 : 0),
    }),
    { payout: 0, deductions: 0, separated: 0 },
  )

  async function handleGenerate() {
    setBusy(true)
    try {
      const { run, skippedAlreadyPaid } = await generateThirteenthMonthRun({ year, generationDate, payoutPeriodLabel, selection })
      setSelectedRunId(run.id)
      notify({
        title: '13th Month Pay batch generated',
        description: `${preview?.included.length ?? 0} standalone payslip(s) prepared${skippedAlreadyPaid ? ` · ${skippedAlreadyPaid} already paid this year, skipped` : ''}.`,
        tone: 'success',
      })
    } catch (error) {
      notify({ title: 'The batch was not generated', description: apiErrorMessage(error), tone: 'danger' })
    } finally {
      setBusy(false)
      refetchRuns()
      refetchLines()
    }
  }

  async function handleFinalize() {
    if (!activeRun) return
    try {
      await finalizeThirteenthMonthRun(activeRun.id)
      notify({ title: '13th Month Pay finalized', description: `${lines.length} separate 13th Month payslip(s) issued for "${activeRun.payoutPeriodLabel}".`, tone: 'success' })
    } catch (error) {
      notify({ title: 'The batch was not finalized', description: apiErrorMessage(error), tone: 'danger' })
    } finally {
      refetchRuns()
    }
  }

  // Row actions shared by the card and table views: icon-only on phones, with text labels from `sm`.
  const renderActions = (line: ThirteenthMonthLine, employee: Employee, run: ThirteenthMonthRun) => {
    const email = emailFor(line.employeeId)
    return (
      <>
        <ComputationDrawer
          employee={employee}
          line={line}
          run={run}
          trigger={
            <Button size="sm" variant="ghost" icon={<Calculator className="size-3.5" />} aria-label="Computation" title="Computation">
              <span className="hidden sm:inline">Computation</span>
            </Button>
          }
        />
        <Button asChild size="sm" variant="ghost">
          <Link to={`/thirteenth-month-pay/${run.id}/payslips/${employee.id}`} aria-label="Payslip" title="Payslip">
            <FileText className="size-3.5" />
            <span className="hidden sm:inline">Payslip</span>
          </Link>
        </Button>
        {email && (
          <PayslipEmailActions
            compact
            email={email}
            status={emails.statusFor(employee.id)}
            record={emails.records[employee.id]}
            canSend={canEmail}
            disabledReason={emailDisabledReason}
            onSend={() => sendEmails([employee.id])}
            renderPayslip={() => <ThirteenthMonthPayslipDocument company={company} run={run} line={line} employee={employee} />}
          />
        )}
      </>
    )
  }

  const generateButton = canManage && (
    <Button className="w-full sm:w-auto" icon={<PlayCircle className="size-4" />} isLoading={busy} disabled={!selectionComplete || !preview?.included.length} onClick={handleGenerate}>
      Generate 13th Month Pay
    </Button>
  )

  return (
    <div className="space-y-5">
      <PageHeader title="13th Month Pay" description="Philippine-compliant 13th Month Pay batch generation, preview, and approval." />

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
        <p>
          13th Month Pay is always issued on its own <span className="font-medium text-foreground">separate payslip</span> — it's never merged into a regular payroll run.
          Pay = (Total Basic Salary Earned in the covered months − undertime − unpaid absences) ÷ 12, pro-rated by active days for mid-year hires.
          Resigned/separated employees are generated in their own batch (&ldquo;Separated / Resigned Employees&rdquo;), pro-rated to their last day.
        </p>
      </div>

      {/* Phones/tablets: titled sections in a grid. Desktop (lg): the original compact inline rows. */}
      <Card className="p-4 sm:p-5 lg:space-y-4">
        <div className="space-y-5 lg:space-y-4">
          <section className="space-y-3 lg:space-y-0">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:hidden">Batch settings</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end lg:[&_label]:font-medium lg:[&_label]:text-muted-foreground">
              <FormField label="Year" className="lg:w-32">
                <Select
                  value={String(year)}
                  onValueChange={(v) => {
                    const y = Number(v)
                    setYear(y)
                    setGenerationDate(`${y}-12-15`)
                    setPayoutPeriodLabel(`December ${y}`)
                    setSelectedRunId(undefined)
                  }}
                  options={YEAR_OPTIONS}
                />
              </FormField>
              <FormField label="Cutoff / Generation Date" className="lg:w-44">
                <Input type="date" value={generationDate} onChange={(e) => setGenerationDate(e.target.value)} />
              </FormField>
              <FormField label="Payout Label" className="sm:col-span-2 lg:w-52">
                <Input value={payoutPeriodLabel} onChange={(e) => setPayoutPeriodLabel(e.target.value)} placeholder="December 2026" />
              </FormField>
            </div>
          </section>

          <section className="space-y-3 border-t border-border pt-5 lg:space-y-0 lg:pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:hidden">Recipients</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end lg:[&_label]:font-medium lg:[&_label]:text-muted-foreground">
              <FormField label="Generate For" className="lg:w-72">
                <Select
                  value={mode}
                  onValueChange={(v) => {
                    setMode(v as ThirteenthMonthSelectionMode)
                    setEmployeeIds([])
                  }}
                  options={MODE_OPTIONS}
                />
              </FormField>
              {mode === 'payroll_group' && (
                <FormField label="Payroll Group" className="lg:w-64">
                  <Select value={payrollGroupId} onValueChange={setPayrollGroupId} options={groupOptions} placeholder="Select payroll group" />
                </FormField>
              )}
              {mode === 'department' && (
                <FormField label="Department" className="lg:w-56">
                  <Select value={department} onValueChange={setDepartment} options={departmentOptions} placeholder="Select department" />
                </FormField>
              )}
              {mode === 'employees' && (
                <div className="sm:col-span-2 lg:w-full lg:max-w-xl">
                  <EmployeePickerPanel employees={activeEligible} value={employeeIds} onChange={setEmployeeIds} maxHeightClass="max-h-56" />
                </div>
              )}
              {mode === 'separated' && (
                <FormField label="Separated employees" hint="Leave empty to include all." className="sm:col-span-2 lg:w-full lg:max-w-md">
                  <EmployeeCombobox
                    multiple
                    employees={separatedEligible.map((e) => ({
                      id: e.id,
                      name: e.employment.dateSeparated ? `${fullName(e)} (separated ${formatDate(e.employment.dateSeparated)})` : fullName(e),
                      employeeNumber: e.employeeNumber,
                      department: e.employment.department,
                    }))}
                    value={employeeIds}
                    onChange={setEmployeeIds}
                    placeholder={`All separated employees (${separatedEligible.length})`}
                  />
                </FormField>
              )}
              {/* Desktop: the button sits at the end of this row. */}
              {generateButton && <div className="hidden lg:block">{generateButton}</div>}
            </div>
          </section>

          {preview && (
            <p className="rounded-lg bg-muted/40 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground lg:rounded-none lg:bg-transparent lg:p-0">
              Covers {formatDate(preview.coverage.start)} – {formatDate(preview.coverage.end)} ·{' '}
              {selectionComplete ? (
                <>
                  <span className="font-medium text-foreground">{preview.included.length}</span>{' '}
                  {mode === 'separated' ? 'separated employee(s) will be included, pro-rated to their last day' : 'active employee(s) will be included'}
                  {mode !== 'separated' && separatedEligible.length > 0 && <> · {separatedEligible.length} resigned/separated employee(s) are generated separately</>}
                  {preview.skippedAlreadyPaid.length > 0 && <> · {preview.skippedAlreadyPaid.length} already paid in a finalized batch this year (skipped)</>}
                </>
              ) : (
                'Complete the selection to see who will be included.'
              )}
            </p>
          )}

          {/* Phones/tablets: full-width on phones, right-aligned from sm. Not sticky. */}
          {generateButton && <div className="sm:flex sm:justify-end lg:hidden">{generateButton}</div>}
        </div>
      </Card>

      {employeesLoading || runsLoading ? (
        <Skeleton className="h-72" />
      ) : !activeRun ? (
        <EmptyState
          title="No 13th Month Pay batch generated yet for this year"
          description={canManage ? 'Choose who to generate for, then click "Generate 13th Month Pay".' : 'Waiting for a payroll admin to generate this batch.'}
        />
      ) : linesLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <div className="space-y-3">
          {/* Total payout leads on phones (full width); the rest sit two-up. From sm all four share one row. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Card className="col-span-2 order-first p-4 sm:order-last sm:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Payout</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums sm:text-xl">{formatCurrency(totals.payout)}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">13th Month Pay for this batch</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Employees</p>
              <p className="mt-1 font-display text-xl font-semibold">{lines.length}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">In this batch</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Separated</p>
              <p className="mt-1 font-display text-xl font-semibold">{totals.separated}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Resigned / separated</p>
            </Card>
            <Card className="col-span-2 p-4 sm:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Deductions</p>
              <p className="mt-1 font-display text-xl font-semibold tabular-nums">{formatCurrency(totals.deductions)}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Undertime & absences</p>
            </Card>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {runsForYear.length > 1 && (
                <div className="w-full max-w-sm">
                  <Select
                    value={activeRun.id}
                    onValueChange={setSelectedRunId}
                    options={runsForYear.map((r) => ({
                      value: r.id,
                      label: `${selectionLabel(r.selection, groups)} · ${r.status === 'draft' ? 'Draft' : 'Finalized'} · ${r.generationDate}`,
                    }))}
                  />
                </div>
              )}
              <span>
                {selectionLabel(activeRun.selection, groups)} · generated {activeRun.generationDate} ·{' '}
              </span>
              <StatusBadge status={activeRun.status === 'draft' ? 'Ready' : 'Finalized'} />
            </div>
            {canManage && activeRun.status === 'draft' && (
              <Button size="sm" variant="destructive" className="w-full sm:w-auto" icon={<Lock className="size-3.5" />} onClick={handleFinalize}>
                Finalize & Issue Payslips
              </Button>
            )}
          </div>

          <BulkEmailToolbar
            candidates={lines.flatMap((l) => {
              const employee = employeeById.get(l.employeeId)
              return employee ? [{ employeeId: l.employeeId, employeeName: fullName(employee), hasEmail: !!employee.personal.personalEmail, status: emails.statusFor(l.employeeId) }] : []
            })}
            selectedIds={payslipSelection.selected}
            canSend={canEmail}
            disabledReason={emailDisabledReason}
            isSending={emails.isSending}
            onSend={sendEmails}
            onSent={payslipSelection.clear}
          />

          {/* Phones and tablets: one card per employee — one column on phones, two on tablets. */}
          <div className="grid gap-2.5 sm:grid-cols-2 lg:hidden">
            <label className="flex w-fit items-center gap-2 px-1 text-xs text-muted-foreground sm:col-span-2">
              <SelectAllCheckbox state={payslipSelection.headerState} onChange={payslipSelection.toggleAll} />
              Select all
            </label>
            {lines.map((line) => {
              const employee = employeeById.get(line.employeeId)
              if (!employee) return null
              const deductions = (line.undertimeDeduction ?? 0) + (line.absenceDeduction ?? 0)
              return (
                <Card key={line.id} watermark={null} className="flex flex-col p-4">
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <RowCheckbox checked={payslipSelection.selected.has(line.employeeId)} onChange={(c) => payslipSelection.toggle(line.employeeId, c)} label={fullName(employee)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                        <p className="text-sm font-semibold leading-tight">{fullName(employee)}</p>
                        {line.separated && <Badge tone="warning">Separated</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {employee.employeeNumber} · {employee.employment.department}
                      </p>
                    </div>
                    <StatusBadge status={activeRun.status === 'draft' ? 'Ready' : 'Finalized'} />
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {line.activeFrom && line.activeTo ? `${formatDate(line.activeFrom)} – ${formatDate(line.activeTo)}` : `Jan – Dec ${activeRun.year}`} · {line.monthsCredited} / 12 months
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-border pt-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Basic Earned</p>
                      <p className="text-sm tabular-nums">{formatCurrency(line.grossBasicEarned ?? line.annualBasicEarned)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Undertime / Absences</p>
                      <p className="text-sm tabular-nums">{deductions > 0 ? <span className="text-danger">−{formatCurrency(deductions)}</span> : <span className="text-muted-foreground">—</span>}</p>
                    </div>
                    <div className="col-span-2 flex items-baseline justify-between rounded-lg bg-muted/40 px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground">13th Month Pay</p>
                      <p className="font-display text-base font-semibold tabular-nums">{formatCurrency(line.thirteenthMonthPay)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <EmailStatusBadge status={emails.statusFor(line.employeeId)} record={emails.records[line.employeeId]} />
                    <div className="flex items-center gap-1">{renderActions(line, employee, activeRun)}</div>
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <SelectAllCheckbox state={payslipSelection.headerState} onChange={payslipSelection.toggleAll} />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Active Period</TableHead>
                  <TableHead className="text-right">Basic Earned</TableHead>
                  <TableHead className="text-right">Undertime / Absences</TableHead>
                  <TableHead className="text-right">13th Month Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => {
                  const employee = employeeById.get(line.employeeId)
                  if (!employee) return null
                  const deductions = (line.undertimeDeduction ?? 0) + (line.absenceDeduction ?? 0)
                  return (
                    <TableRow key={line.id}>
                      <TableCell>
                        <RowCheckbox checked={payslipSelection.selected.has(line.employeeId)} onChange={(c) => payslipSelection.toggle(line.employeeId, c)} label={fullName(employee)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium">{fullName(employee)}</span>
                          {line.separated && <Badge tone="warning">Separated</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {employee.employeeNumber} · {employee.employment.department}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {line.activeFrom && line.activeTo ? `${formatDate(line.activeFrom)} – ${formatDate(line.activeTo)}` : `Jan – Dec ${activeRun.year}`}
                        <p className="text-xs">{line.monthsCredited} / 12 months</p>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(line.grossBasicEarned ?? line.annualBasicEarned)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {deductions > 0 ? <span className="text-danger">−{formatCurrency(deductions)}</span> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{formatCurrency(line.thirteenthMonthPay)}</TableCell>
                      <TableCell>
                        <StatusBadge status={activeRun.status === 'draft' ? 'Ready' : 'Finalized'} />
                      </TableCell>
                      <TableCell>
                        <EmailStatusBadge status={emails.statusFor(line.employeeId)} record={emails.records[line.employeeId]} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">{renderActions(line, employee, activeRun)}</div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
