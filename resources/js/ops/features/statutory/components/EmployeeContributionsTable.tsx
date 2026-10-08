import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card } from '@ops/components/ui/Card'
import { Input } from '@ops/components/ui/Input'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useCompanySettings } from '@ops/features/company-settings/hooks/useCompanySettings'
import { usePayrollGroups } from '@ops/features/company-settings/hooks/usePayrollGroups'
import { useEmployees } from '@ops/features/employees/hooks/useEmployees'
import { findEmployeePayrollGroup } from '@ops/lib/payroll/groupAssignment'
import { periodsPerCycleForFrequency, periodsPerMonthFor, workingDaysPerMonthFor } from '@ops/lib/payroll/payFrequency'
import { monthlyStatutoryFor } from '@ops/lib/services/payrollService'
import { formatCurrency } from '@ops/lib/utils/format'
import type { PayrollFrequency, StatutoryConfig } from '@ops/types/domain'

const FREQUENCY_LABEL: Record<PayrollFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  semi_monthly: 'Semi-monthly',
  monthly: 'Monthly',
  custom: 'Custom',
}

function Money({ value, muted }: { value: number; muted?: boolean }) {
  return <span className={muted ? 'tabular-nums text-muted-foreground' : 'tabular-nums'}>{formatCurrency(value)}</span>
}

/**
 * Every active employee's statutory contributions under the current configuration — computed by the
 * same function the payroll engine uses, so these figures always match Payroll Runs and payslips and
 * update immediately when the brackets/rates on the other tabs are edited.
 */
export function EmployeeContributionsTable({ config }: { config: StatutoryConfig }) {
  const { employees, isLoading } = useEmployees()
  const { groups } = usePayrollGroups()
  const { schedules } = useCompanySettings()
  const [search, setSearch] = useState('')

  const rows = useMemo(
    () =>
      employees
        .filter((e) => e.employment.status === 'active')
        .map((employee) => {
          const group = findEmployeePayrollGroup(groups, employee.id)
          const frequency: PayrollFrequency = group?.frequency ?? 'semi_monthly'
          const workSchedule = schedules.find((sc) => sc.id === group?.workScheduleId) ?? schedules[0]
          const workingDays = workingDaysPerMonthFor(workSchedule)
          // Split divisor: ÷1 monthly, ÷2 semi-monthly, ÷4 weekly, ÷22/26 daily, periods-in-month for bi-weekly/custom.
          const periodsPerMonth = periodsPerCycleForFrequency(frequency, periodsPerMonthFor(frequency, group, workSchedule), workingDays)
          const m = monthlyStatutoryFor(config, employee, frequency, periodsPerMonthFor(frequency, group, workSchedule))
          const employeeTotal = m.sssEmployee + m.philhealthEmployee + m.pagibigEmployee + m.withholdingTax
          return {
            employee,
            groupName: group?.name,
            frequency,
            periodsPerMonth,
            m,
            employeeTotal,
            employerTotal: m.sssEmployer + m.philhealthEmployer + m.pagibigEmployer,
            perCutoff: Math.round((employeeTotal / periodsPerMonth) * 100) / 100,
          }
        })
        .sort((a, b) => a.employee.personal.lastName.localeCompare(b.employee.personal.lastName)),
    [employees, groups, schedules, config],
  )

  const query = search.trim().toLowerCase()
  const visible = rows.filter(
    (r) => !query || `${r.employee.personal.firstName} ${r.employee.personal.lastName} ${r.employee.employeeNumber} ${r.employee.employment.department}`.toLowerCase().includes(query),
  )
  const totals = visible.reduce(
    (acc, r) => ({
      sssEe: acc.sssEe + r.m.sssEmployee,
      sssEr: acc.sssEr + r.m.sssEmployer,
      phEe: acc.phEe + r.m.philhealthEmployee,
      phEr: acc.phEr + r.m.philhealthEmployer,
      hdmfEe: acc.hdmfEe + r.m.pagibigEmployee,
      hdmfEr: acc.hdmfEr + r.m.pagibigEmployer,
      tax: acc.tax + r.m.withholdingTax,
    }),
    { sssEe: 0, sssEr: 0, phEe: 0, phEr: 0, hdmfEe: 0, hdmfEr: 0, tax: 0 },
  )

  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold tracking-tight">Employee Contributions</p>
          <p className="text-xs text-muted-foreground">
            Monthly SSS, PhilHealth, Pag-IBIG and withholding tax per employee, and what is deducted each cutoff for their payroll group&apos;s pay frequency.
            Employer SSS includes the EC premium.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee…" className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          {/* Phones and tablets: one card per employee — one column on phones, two on tablets. */}
          <div className="grid gap-2.5 sm:grid-cols-2 lg:hidden">
            {visible.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground sm:col-span-2">No employees match your search.</p>}
            {visible.map((r) => (
              <Card key={r.employee.id} watermark={null} className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">
                      {r.employee.personal.firstName} {r.employee.personal.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.employee.employeeNumber} · {r.employee.employment.department}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium">{FREQUENCY_LABEL[r.frequency]}</p>
                    <p className="max-w-32 truncate text-[11px] text-muted-foreground">{r.groupName ?? 'No payroll group'}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3 text-sm">
                  <span className="text-xs text-muted-foreground">Monthly basis</span>
                  <Money value={r.m.monthlyBasis} />
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-2 rounded-lg bg-muted/40 px-3 py-2.5 text-xs">
                  <span />
                  <span className="text-right text-muted-foreground">Employee</span>
                  <span className="text-right text-muted-foreground">Employer</span>

                  <span>
                    SSS<span className="block text-[11px] text-muted-foreground">MSC {formatCurrency(r.m.sssMsc)}</span>
                  </span>
                  <Money value={r.m.sssEmployee} />
                  <Money value={r.m.sssEmployer} />

                  <span>PhilHealth</span>
                  <Money value={r.m.philhealthEmployee} />
                  <Money value={r.m.philhealthEmployer} />

                  <span>Pag-IBIG</span>
                  <Money value={r.m.pagibigEmployee} />
                  <Money value={r.m.pagibigEmployer} />

                  <span className="border-t border-border pt-2">Withholding tax</span>
                  <span className="border-t border-border pt-2 text-right">
                    <Money value={r.m.withholdingTax} />
                  </span>
                  <span className="border-t border-border pt-2 text-right text-muted-foreground">—</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-primary/10 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Deducted per cutoff</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatCurrency(r.employeeTotal)} ÷ {r.frequency === 'biweekly' ? '2 or 3' : r.frequency === 'daily' ? `${r.periodsPerMonth} working days` : r.periodsPerMonth}
                    </p>
                  </div>
                  <p className="shrink-0 text-base font-semibold tabular-nums text-primary">
                    {formatCurrency(r.perCutoff)}
                    {r.frequency === 'biweekly' && ` / ${formatCurrency(Math.round((r.employeeTotal / 3) * 100) / 100)}`}
                  </p>
                </div>
              </Card>
            ))}

            {visible.length > 0 && (
              <Card watermark={null} className="space-y-1.5 bg-muted/50 p-4 text-sm sm:col-span-2">
                <p className="font-semibold">Total ({visible.length} employees, monthly)</p>
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1 text-xs">
                  <span />
                  <span className="text-right text-muted-foreground">Employee</span>
                  <span className="text-right text-muted-foreground">Employer</span>
                  <span>SSS</span>
                  <Money value={totals.sssEe} />
                  <Money value={totals.sssEr} />
                  <span>PhilHealth</span>
                  <Money value={totals.phEe} />
                  <Money value={totals.phEr} />
                  <span>Pag-IBIG</span>
                  <Money value={totals.hdmfEe} />
                  <Money value={totals.hdmfEr} />
                  <span>Withholding tax</span>
                  <Money value={totals.tax} />
                  <span />
                </div>
              </Card>
            )}
          </div>

          <div className="hidden lg:block">
        <Table className="whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2} className="align-bottom">
                Employee
              </TableHead>
              <TableHead rowSpan={2} className="align-bottom">
                Pay Frequency
              </TableHead>
              <TableHead rowSpan={2} className="text-right align-bottom">
                Monthly Basis
              </TableHead>
              <TableHead colSpan={3} className="border-l border-border text-center">
                SSS
              </TableHead>
              <TableHead colSpan={2} className="border-l border-border text-center">
                PhilHealth
              </TableHead>
              <TableHead colSpan={2} className="border-l border-border text-center">
                Pag-IBIG
              </TableHead>
              <TableHead rowSpan={2} className="border-l border-border text-right align-bottom">
                Withholding Tax
              </TableHead>
              <TableHead rowSpan={2} className="border-l border-border text-right align-bottom">
                Deducted per Cutoff
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="border-l border-border text-right">MSC</TableHead>
              <TableHead className="text-right">EE</TableHead>
              <TableHead className="text-right">ER + EC</TableHead>
              <TableHead className="border-l border-border text-right">EE</TableHead>
              <TableHead className="text-right">ER</TableHead>
              <TableHead className="border-l border-border text-right">EE</TableHead>
              <TableHead className="text-right">ER</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((r) => (
              <TableRow key={r.employee.id}>
                <TableCell>
                  <p className="font-medium">
                    {r.employee.personal.firstName} {r.employee.personal.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.employee.employeeNumber} · {r.employee.employment.department}
                  </p>
                </TableCell>
                <TableCell>
                  <p>{FREQUENCY_LABEL[r.frequency]}</p>
                  <p className="text-xs text-muted-foreground">{r.groupName ?? 'No payroll group (semi-monthly)'}</p>
                </TableCell>
                <TableCell className="text-right">
                  <Money value={r.m.monthlyBasis} />
                </TableCell>
                <TableCell className="border-l border-border text-right">
                  <Money value={r.m.sssMsc} muted />
                </TableCell>
                <TableCell className="text-right">
                  <Money value={r.m.sssEmployee} />
                </TableCell>
                <TableCell className="text-right">
                  <Money value={r.m.sssEmployer} />
                </TableCell>
                <TableCell className="border-l border-border text-right">
                  <Money value={r.m.philhealthEmployee} />
                </TableCell>
                <TableCell className="text-right">
                  <Money value={r.m.philhealthEmployer} />
                </TableCell>
                <TableCell className="border-l border-border text-right">
                  <Money value={r.m.pagibigEmployee} />
                </TableCell>
                <TableCell className="text-right">
                  <Money value={r.m.pagibigEmployer} />
                </TableCell>
                <TableCell className="border-l border-border text-right">
                  <Money value={r.m.withholdingTax} />
                </TableCell>
                <TableCell className="border-l border-border text-right">
                  <p className="font-medium tabular-nums">
                    {formatCurrency(r.perCutoff)}
                    {r.frequency === 'biweekly' && ` / ${formatCurrency(Math.round((r.employeeTotal / 3) * 100) / 100)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(r.employeeTotal)} ÷ {r.frequency === 'biweekly' ? '2 or 3 (periods in month)' : r.frequency === 'daily' ? `${r.periodsPerMonth} working days` : r.periodsPerMonth}
                  </p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <tfoot className="border-t-2 border-border bg-muted/50 font-semibold">
            <tr>
              <td className="px-4 py-3" colSpan={4}>
                Total ({visible.length} employees, monthly)
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(totals.sssEe)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(totals.sssEr)}</td>
              <td className="border-l border-border px-4 py-3 text-right tabular-nums">{formatCurrency(totals.phEe)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(totals.phEr)}</td>
              <td className="border-l border-border px-4 py-3 text-right tabular-nums">{formatCurrency(totals.hdmfEe)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(totals.hdmfEr)}</td>
              <td className="border-l border-border px-4 py-3 text-right tabular-nums">{formatCurrency(totals.tax)}</td>
              <td className="border-l border-border px-4 py-3" />
            </tr>
          </tfoot>
        </Table>
          </div>
        </>
      )}
    </Card>
  )
}
