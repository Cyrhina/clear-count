import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { CardStat, ReportCardList, ReportRecordCard, ReportTableView } from '@ops/features/reports/components/ReportRecordCard'
import { FilterLabel, ReportFilterBar, ReportViewShell, StatTile } from '@ops/features/reports/components/shared'
import type { ExcelExport, ReportMetaItem } from '@ops/features/reports/reportExport'
import { useSession } from '@ops/hooks/useSession'
import { getAttendanceRecords } from '@ops/lib/services/attendanceService'
import { getCompensationApprovals } from '@ops/lib/services/compensationApprovalService'
import { getEmployees } from '@ops/lib/services/employeeService'
import { getOvertimeRecords } from '@ops/lib/services/overtimeService'
import { formatCurrency } from '@ops/lib/utils/format'
import type { AttendanceRecord, CompensationApproval, Employee, OvertimeRecord } from '@ops/types/domain'

const ALL = 'all'
const fullName = (e: Employee) => `${e.personal.firstName} ${e.personal.lastName}`
const round = (n: number) => Math.round(n * 100) / 100
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

const PERIODS = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

function sinceKey(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toMinutes(time: string | null) {
  if (!time) return null
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Hours between time in and time out, less a one-hour break. */
function workedHours(record: AttendanceRecord) {
  const start = toMinutes(record.timeIn)
  const end = toMinutes(record.timeOut)
  return start === null || end === null || end <= start ? 0 : Math.max(0, (end - start) / 60 - 1)
}

interface TeamData {
  employees: Employee[]
  attendance: AttendanceRecord[]
  overtime: OvertimeRecord[]
  workLogs: CompensationApproval[]
}

/** The (branch-scoped) team's employees, attendance, overtime and submitted work — every service already filters to the signed-in manager's team. */
function useTeamData(): TeamData | null {
  const { user } = useSession()
  const [data, setData] = useState<TeamData | null>(null)
  useEffect(() => {
    let cancelled = false
    Promise.all([getEmployees(user), getAttendanceRecords(user), getOvertimeRecords(user), getCompensationApprovals(user)]).then(([employees, attendance, overtime, workLogs]) => {
      if (!cancelled) setData({ employees, attendance, overtime, workLogs })
    })
    return () => {
      cancelled = true
    }
  }, [user])
  return data
}

function useFilters(employees: Employee[] | undefined) {
  const [period, setPeriod] = useState('30')
  const [department, setDepartment] = useState(ALL)
  const departments = useMemo(() => [...new Set((employees ?? []).map((e) => e.employment.department))].sort(), [employees])
  const since = sinceKey(Number(period))
  const bar = (
    <ReportFilterBar onClear={period !== '30' || department !== ALL ? () => (setPeriod('30'), setDepartment(ALL)) : undefined}>
      <FilterLabel label="Period" className="w-44">
        <Select value={period} onValueChange={setPeriod} options={PERIODS} />
      </FilterLabel>
      <FilterLabel label="Department" className="w-48">
        <Select value={department} onValueChange={setDepartment} options={[{ value: ALL, label: 'All departments' }, ...departments.map((d) => ({ value: d, label: d }))]} />
      </FilterLabel>
    </ReportFilterBar>
  )
  const meta: ReportMetaItem[] = [
    { label: 'Period', value: PERIODS.find((p) => p.value === period)?.label ?? period },
    { label: 'Department', value: department === ALL ? 'All' : department },
  ]
  return { since, department, bar, meta }
}

/** Hours Worked — regular hours from attendance, approved hourly submissions, and approved OT / night differential, per team member. */
export function HoursWorkedReport() {
  const data = useTeamData()
  const { since, department, bar, meta } = useFilters(data?.employees)

  const rows = useMemo(() => {
    if (!data) return []
    return data.employees
      .filter((e) => e.employment.status === 'active' && (department === ALL || e.employment.department === department))
      .map((e) => {
        const att = data.attendance.filter((r) => r.employeeId === e.id && r.date >= since)
        const ot = data.overtime.filter((r) => r.employeeId === e.id && r.date >= since && r.status === 'approved')
        const hourly = data.workLogs.filter((w) => w.employeeId === e.id && w.type === 'hourly' && w.workDate >= since && w.status === 'approved')
        const regular = round(sum(att.map(workedHours)))
        const overtime = sum(ot.filter((r) => r.type !== 'night_diff').map((r) => r.hours))
        const nightDiff = sum(ot.filter((r) => r.type === 'night_diff').map((r) => r.hours))
        const submitted = sum(hourly.map((w) => w.quantity))
        return { employee: e, days: att.filter((r) => r.status !== 'absent').length, regular, submitted, overtime, nightDiff, total: round(regular + submitted + overtime + nightDiff) }
      })
      .filter((r) => r.total > 0 || r.days > 0)
      .sort((a, b) => fullName(a.employee).localeCompare(fullName(b.employee)))
  }, [data, since, department])

  function onExport(): ExcelExport {
    const header = ['Employee ID', 'Employee Name', 'Department', 'Days Present', 'Regular Hours', 'Submitted Hours', 'OT Hours', 'ND Hours', 'Total Hours']
    return {
      filename: 'hours-worked',
      rows: [header, ...rows.map((r) => [r.employee.employeeNumber, fullName(r.employee), r.employee.employment.department, r.days, r.regular, r.submitted, r.overtime, r.nightDiff, r.total])],
      sumFooter: true,
      columnTypes: { 'Days Present': 'integer', 'Regular Hours': 'number', 'Submitted Hours': 'number', 'OT Hours': 'number', 'ND Hours': 'number', 'Total Hours': 'number' },
    }
  }

  return (
    <ReportViewShell title="Hours Worked" description="Regular hours, submitted hours, and approved overtime and night differential for your team." meta={meta} orientation="landscape" onExportExcel={rows.length ? onExport : undefined}>
      {!data ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-4">
          {bar}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <StatTile label="Employees" value={String(rows.length)} />
            <StatTile label="Total Hours" value={round(sum(rows.map((r) => r.total))).toLocaleString('en-PH')} />
            <StatTile className="col-span-2 sm:col-span-1" label="Overtime & ND Hours" value={round(sum(rows.map((r) => r.overtime + r.nightDiff))).toLocaleString('en-PH')} />
          </div>
          {rows.length === 0 ? (
            <EmptyState title="No hours recorded for these filters" />
          ) : (
            <>
            <ReportCardList count={rows.length} noun={rows.length === 1 ? 'employee' : 'employees'} note="Sorted by name">
              {rows.map((r) => (
                <ReportRecordCard
                  key={r.employee.id}
                  avatar={fullName(r.employee)}
                  title={fullName(r.employee)}
                  subtitle={`${r.employee.employment.position} · ${r.employee.employment.department}`}
                  meta={r.employee.employeeNumber}
                  details={
                    <>
                      <CardStat label="Submitted Hrs">{r.submitted}</CardStat>
                      <CardStat label="OT Hrs">{r.overtime}</CardStat>
                      <CardStat label="ND Hrs">{r.nightDiff}</CardStat>
                    </>
                  }
                >
                  <CardStat label="Total Hrs">{r.total}</CardStat>
                  <CardStat label="Days Present">{r.days}</CardStat>
                  <CardStat label="Regular Hrs">{r.regular}</CardStat>
                </ReportRecordCard>
              ))}
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Days Present</TableHead>
                  <TableHead className="text-right">Regular Hrs</TableHead>
                  <TableHead className="text-right">Submitted Hrs</TableHead>
                  <TableHead className="text-right">OT Hrs</TableHead>
                  <TableHead className="text-right">ND Hrs</TableHead>
                  <TableHead className="text-right">Total Hrs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.employee.id}>
                    <TableCell>
                      <p className="font-medium">{fullName(r.employee)}</p>
                      <p className="text-[11px] text-muted-foreground">{r.employee.employeeNumber}</p>
                    </TableCell>
                    <TableCell>{r.employee.employment.department}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.days}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.regular}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.submitted}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.overtime}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.nightDiff}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{r.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </ReportTableView>
            </>
          )}
        </div>
      )}
    </ReportViewShell>
  )
}

/** Output Summary — submitted, approved, and pending output (and its value) per team member. */
export function OutputSummaryReport() {
  const data = useTeamData()
  const { since, department, bar, meta } = useFilters(data?.employees)

  const rows = useMemo(() => {
    if (!data) return []
    const byId = new Map(data.employees.map((e) => [e.id, e]))
    const grouped = new Map<string, { employee: Employee; unit: string; submitted: number; approved: number; pending: number; rejected: number; value: number }>()
    for (const w of data.workLogs) {
      const employee = byId.get(w.employeeId)
      if (!employee || w.type !== 'output' || w.workDate < since) continue
      if (department !== ALL && employee.employment.department !== department) continue
      const row = grouped.get(employee.id) ?? { employee, unit: w.unitLabel, submitted: 0, approved: 0, pending: 0, rejected: 0, value: 0 }
      row.submitted += w.quantity
      if (w.status === 'approved') {
        row.approved += w.quantity
        row.value += w.amount
      } else if (w.status === 'pending') row.pending += w.quantity
      else row.rejected += w.quantity
      grouped.set(employee.id, row)
    }
    return [...grouped.values()].sort((a, b) => fullName(a.employee).localeCompare(fullName(b.employee)))
  }, [data, since, department])

  function onExport(): ExcelExport {
    const header = ['Employee ID', 'Employee Name', 'Department', 'Unit', 'Submitted', 'Approved', 'Pending', 'Rejected', 'Approved Value']
    return {
      filename: 'output-summary',
      rows: [header, ...rows.map((r) => [r.employee.employeeNumber, fullName(r.employee), r.employee.employment.department, r.unit, r.submitted, r.approved, r.pending, r.rejected, r.value])],
      sumFooter: true,
      columnTypes: { Submitted: 'integer', Approved: 'integer', Pending: 'integer', Rejected: 'integer', 'Approved Value': 'currency' },
    }
  }

  return (
    <ReportViewShell title="Output Summary" description="Output submitted by your team, and how much of it has been approved." meta={meta} orientation="landscape" onExportExcel={rows.length ? onExport : undefined}>
      {!data ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-4">
          {bar}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <StatTile label="Employees With Output" value={String(rows.length)} />
            <StatTile label="Approved Units" value={sum(rows.map((r) => r.approved)).toLocaleString('en-PH')} />
            <StatTile className="col-span-2 sm:col-span-1" label="Pending Units" value={sum(rows.map((r) => r.pending)).toLocaleString('en-PH')} />
          </div>
          {rows.length === 0 ? (
            <EmptyState title="No output submitted for these filters" />
          ) : (
            <>
            <ReportCardList count={rows.length} noun={rows.length === 1 ? 'employee' : 'employees'} note="Sorted by name">
              {rows.map((r) => (
                <ReportRecordCard
                  key={r.employee.id}
                  avatar={fullName(r.employee)}
                  title={fullName(r.employee)}
                  subtitle={`${r.employee.employment.position} · ${r.employee.employment.department}`}
                  meta={r.employee.employeeNumber}
                  details={
                    <>
                      <CardStat label="Unit">{r.unit}</CardStat>
                      <CardStat label="Pending">{r.pending}</CardStat>
                      <CardStat label="Rejected">{r.rejected}</CardStat>
                    </>
                  }
                >
                  <CardStat label="Approved Value">{formatCurrency(r.value)}</CardStat>
                  <CardStat label="Submitted">{r.submitted}</CardStat>
                  <CardStat label="Approved">{r.approved}</CardStat>
                </ReportRecordCard>
              ))}
            </ReportCardList>
            <ReportTableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Submitted</TableHead>
                  <TableHead className="text-right">Approved</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Rejected</TableHead>
                  <TableHead className="text-right">Approved Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.employee.id}>
                    <TableCell>
                      <p className="font-medium">{fullName(r.employee)}</p>
                      <p className="text-[11px] text-muted-foreground">{r.employee.employeeNumber}</p>
                    </TableCell>
                    <TableCell>{r.employee.employment.department}</TableCell>
                    <TableCell>{r.unit}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.submitted}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.approved}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.pending}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.rejected}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatCurrency(r.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </ReportTableView>
            </>
          )}
        </div>
      )}
    </ReportViewShell>
  )
}
