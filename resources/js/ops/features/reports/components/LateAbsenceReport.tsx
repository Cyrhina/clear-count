import { ChevronDown } from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { EmployeeCombobox } from '@ops/components/ui/EmployeeCombobox'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useLateCounting } from '@ops/features/attendance/hooks/useLateCounting'
import { lateDatesByEmployee, type LateCycle } from '@ops/features/attendance/lateCycle'
import { CardStat, ReportCardList, ReportRecordCard, ReportTableView } from '@ops/features/reports/components/ReportRecordCard'
import { FilterLabel, ReportFilterBar, ReportViewShell, StatTile } from '@ops/features/reports/components/shared'
import type { ExcelExport, ReportMetaItem } from '@ops/features/reports/reportExport'
import { useSession } from '@ops/hooks/useSession'
import { useTenant } from '@ops/hooks/useTenant'
import { getApprovedLeavesInRange, getAttendanceRecords } from '@ops/lib/services/attendanceService'
import { getEmployees } from '@ops/lib/services/employeeService'
import { cn } from '@ops/lib/utils/cn'
import { formatDate } from '@ops/lib/utils/format'
import type { AttendanceRecord, Employee } from '@ops/types/domain'

const ALL = 'all'
const fullName = (e: Employee) => `${e.personal.firstName} ${e.personal.lastName}`

const STATUS_OPTIONS = [
  { value: 'both', label: 'Late & Absent' },
  { value: 'late', label: 'Late only' },
  { value: 'absent', label: 'Absent only' },
]

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function defaultFrom() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return dateKey(d)
}

interface Incident {
  date: string
  kind: 'late' | 'absent'
  timeIn: string | null
  ordinal?: { n: number; cycle: LateCycle }
}

interface Row {
  employee: Employee
  late: number
  absent: number
  cycle?: LateCycle
  cycleCount: number
  incidents: Incident[]
}

const cycleRange = (r: Row) => (r.cycle ? `${formatDate(r.cycle.start)} – ${formatDate(r.cycle.end)}` : '—')

function IncidentList({ incidents }: { incidents: Incident[] }) {
  return (
    <ul className="space-y-1 text-sm">
      {incidents.map((i) => (
        <li key={`${i.kind}-${i.date}`} className="flex flex-wrap items-center gap-x-3">
          <span className="w-28 font-medium">{formatDate(i.date)}</span>
          {i.kind === 'late' ? (
            <span className="text-muted-foreground">
              Late · in {i.timeIn ?? '—'} · Late #{i.ordinal?.n ?? '—'} of the cycle
            </span>
          ) : (
            <span className="text-muted-foreground">Absent</span>
          )}
        </li>
      ))}
    </ul>
  )
}

/** Late & Absence Report — who was late or absent in a date range, plus each employee's late count in their one-year late cycle. */
export function LateAbsenceReport() {
  const { user } = useSession()
  const { branches } = useTenant()
  const [data, setData] = useState<{ employees: Employee[]; attendance: AttendanceRecord[] } | null>(null)
  const [leaves, setLeaves] = useState<{ employeeId: string; from: string; to: string }[]>([])
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(() => dateKey(new Date()))
  const [department, setDepartment] = useState(ALL)
  const [branchId, setBranchId] = useState(ALL)
  const [status, setStatus] = useState('both')
  const [employeeId, setEmployeeId] = useState<string | undefined>(undefined)
  const [open, setOpen] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    Promise.all([getEmployees(user), getAttendanceRecords(user)]).then(([employees, attendance]) => {
      if (!cancelled) setData({ employees, attendance })
    })
    return () => {
      cancelled = true
    }
  }, [user])

  // Approved leave covering a day means the employee was not absent.
  useEffect(() => {
    let cancelled = false
    getApprovedLeavesInRange(user, from, to).then((l) => {
      if (!cancelled) setLeaves(l.map(({ request }) => ({ employeeId: request.employeeId, from: request.dateFrom, to: request.dateTo })))
    })
    return () => {
      cancelled = true
    }
  }, [user, from, to])

  const lateCounting = useLateCounting()
  const departments = useMemo(() => [...new Set((data?.employees ?? []).map((e) => e.employment.department))].sort(), [data])
  const today = dateKey(new Date())

  const rows = useMemo<Row[]>(() => {
    if (!data) return []
    const allLates = lateDatesByEmployee(data.attendance)
    const result: Row[] = []
    for (const e of data.employees) {
      if ((department !== ALL && e.employment.department !== department) || (branchId !== ALL && e.branchId !== branchId) || (employeeId && e.id !== employeeId)) continue
      const lates = allLates.get(e.id)
      const incidents: Incident[] = []
      for (const r of data.attendance) {
        if (r.employeeId !== e.id || r.date < from || r.date > to) continue
        if (r.status === 'late' && status !== 'absent') incidents.push({ date: r.date, kind: 'late', timeIn: r.timeIn, ordinal: lateCounting.ordinal(e.id, lates, r.date) })
        else if (r.status === 'absent' && status !== 'late' && !leaves.some((l) => l.employeeId === e.id && l.from <= r.date && l.to >= r.date)) incidents.push({ date: r.date, kind: 'absent', timeIn: null })
      }
      if (incidents.length === 0) continue
      incidents.sort((a, b) => a.date.localeCompare(b.date))
      const cycle = lateCounting.cycles(e.id, lates).at(-1)
      result.push({
        employee: e,
        late: incidents.filter((i) => i.kind === 'late').length,
        absent: incidents.filter((i) => i.kind === 'absent').length,
        cycle,
        cycleCount: cycle?.dates.length ?? 0,
        incidents,
      })
    }
    return result.sort((a, b) => fullName(a.employee).localeCompare(fullName(b.employee)))
  }, [data, leaves, from, to, department, branchId, status, employeeId, lateCounting])

  const totalLate = rows.reduce((s, r) => s + r.late, 0)
  const totalAbsent = rows.reduce((s, r) => s + r.absent, 0)
  const top = rows.reduce<Row | undefined>((best, r) => (!best || r.late + r.absent > best.late + best.absent ? r : best), undefined)

  const meta: ReportMetaItem[] = [
    { label: 'Period', value: `${formatDate(from)} – ${formatDate(to)}` },
    { label: 'Department', value: department === ALL ? 'All' : department },
    { label: 'Branch', value: branchId === ALL ? 'All' : (branches.find((b) => b.id === branchId)?.name ?? branchId) },
    { label: 'Status', value: STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status },
  ]

  function onExport(): ExcelExport {
    const header = ['Employee ID', 'Employee Name', 'Department', 'Late Count', 'Absent Count', 'Late Count This Cycle', 'Cycle Start', 'Cycle End']
    return {
      filename: 'late-absence-report',
      rows: [header, ...rows.map((r) => [r.employee.employeeNumber, fullName(r.employee), r.employee.employment.department, r.late, r.absent, r.cycleCount, r.cycle?.start ?? '', r.cycle?.end ?? ''])],
      sumFooter: true,
      columnTypes: { 'Late Count': 'integer', 'Absent Count': 'integer', 'Late Count This Cycle': 'integer' },
    }
  }

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })
  const dirty = from !== defaultFrom() || to !== today || department !== ALL || branchId !== ALL || status !== 'both' || !!employeeId
  const clear = () => (setFrom(defaultFrom()), setTo(today), setDepartment(ALL), setBranchId(ALL), setStatus('both'), setEmployeeId(undefined))

  return (
    <ReportViewShell title="Late & Absence Report" description="Who was late or absent, on which dates, and how many times." meta={meta} orientation="landscape" onExportExcel={rows.length ? onExport : undefined}>
      {!data ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-4">
          <ReportFilterBar onClear={dirty ? clear : undefined}>
            <FilterLabel label="From" className="w-40">
              <Input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
            </FilterLabel>
            <FilterLabel label="To" className="w-40">
              <Input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
            </FilterLabel>
            <FilterLabel label="Department" className="w-44">
              <Select value={department} onValueChange={setDepartment} options={[{ value: ALL, label: 'All departments' }, ...departments.map((d) => ({ value: d, label: d }))]} />
            </FilterLabel>
            <FilterLabel label="Branch" className="w-44">
              <Select value={branchId} onValueChange={setBranchId} options={[{ value: ALL, label: 'All Branches' }, ...branches.map((b) => ({ value: b.id, label: b.name }))]} />
            </FilterLabel>
            <FilterLabel label="Status" className="w-44">
              <Select value={status} onValueChange={setStatus} options={STATUS_OPTIONS} />
            </FilterLabel>
            <FilterLabel label="Employee" className="w-64">
              <EmployeeCombobox
                employees={data.employees.map((e) => ({ id: e.id, name: fullName(e), employeeNumber: e.employeeNumber, department: e.employment.department }))}
                value={employeeId}
                onChange={setEmployeeId}
                placeholder="Search employee by name or ID…"
              />
            </FilterLabel>
          </ReportFilterBar>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile label="Total Late Incidents" value={String(totalLate)} />
            <StatTile label="Total Absences" value={String(totalAbsent)} />
            <StatTile label="Employees Affected" value={String(rows.length)} />
            <StatTile label="Most Frequent" value={top ? `${fullName(top.employee)} (${top.late + top.absent})` : '—'} />
          </div>
          {rows.length === 0 ? (
            <EmptyState title="No late or absent records for these filters" />
          ) : (
            <>
              <ReportCardList count={rows.length} noun={rows.length === 1 ? 'employee' : 'employees'} note="Sorted by name">
                {rows.map((r) => (
                  <ReportRecordCard
                    key={r.employee.id}
                    avatar={fullName(r.employee)}
                    title={fullName(r.employee)}
                    subtitle={r.employee.employment.department}
                    meta={r.employee.employeeNumber}
                    details={
                      <>
                        <CardStat label="Current cycle" className="col-span-2">
                          {cycleRange(r)}
                        </CardStat>
                        <div className="col-span-2">
                          <IncidentList incidents={r.incidents} />
                        </div>
                      </>
                    }
                  >
                    <CardStat label="Late">{r.late}</CardStat>
                    <CardStat label="Absent">{r.absent}</CardStat>
                    <CardStat label="Late this cycle" className="col-span-2">
                      {r.cycleCount}
                    </CardStat>
                  </ReportRecordCard>
                ))}
              </ReportCardList>
              <ReportTableView>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Late</TableHead>
                      <TableHead className="text-right">Absent</TableHead>
                      <TableHead className="text-right">Late This Cycle</TableHead>
                      <TableHead>Current Cycle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => {
                      const expanded = open.has(r.employee.id)
                      return (
                        <Fragment key={r.employee.id}>
                          <TableRow className="cursor-pointer print:cursor-auto" onClick={() => toggle(r.employee.id)}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <ChevronDown aria-hidden="true" className={cn('size-4 shrink-0 text-muted-foreground transition-transform print:hidden', expanded && 'rotate-180')} />
                                <div>
                                  <button type="button" aria-expanded={expanded} className="text-left font-medium" onClick={(e) => (e.stopPropagation(), toggle(r.employee.id))}>
                                    {fullName(r.employee)}
                                  </button>
                                  <p className="text-[11px] text-muted-foreground">{r.employee.employeeNumber}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{r.employee.employment.department}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.late}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.absent}</TableCell>
                            <TableCell className="text-right font-medium tabular-nums">{r.cycleCount}</TableCell>
                            <TableCell>{cycleRange(r)}</TableCell>
                          </TableRow>
                          {expanded && (
                            <TableRow>
                              <TableCell colSpan={6} className="bg-muted/30">
                                <IncidentList incidents={r.incidents} />
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      )
                    })}
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
