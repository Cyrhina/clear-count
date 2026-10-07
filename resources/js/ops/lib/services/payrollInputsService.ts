import { workingDaysBetween } from '@ops/lib/leave/leaveDays'
import { scopeForSession } from '@ops/lib/tenancy/tenantScope'
import { db } from '@ops/mock-data'
import type { Employee, PayrollPeriod, SessionUser } from '@ops/types/domain'

export interface InputsPeriod {
  id: string
  label: string
  startDate: string
  endDate: string
  payrollGroupId?: string
}

export interface TimeInputRow {
  employeeId: string
  employeeNumber: string
  name: string
  department: string
  daysPresent: number
  regularHours: number
  late: number
  undertime: number
  absent: number
  overtimeHours: number
  nightDiffHours: number
}

export interface OutputInputRow {
  id: string
  employeeId: string
  employeeNumber: string
  name: string
  workDate: string
  description: string
  unitLabel: string
  rate: number
  quantity: number
  amount: number
  status: 'approved' | 'pending' | 'rejected'
  /** The run that already pays this record, if any. */
  payrollNumber?: string
}

export interface OtherInputRow {
  id: string
  kind: 'Leave without pay' | 'Allowance' | 'Bonus / incentive' | 'Adjustment'
  employeeId?: string
  employeeNumber?: string
  name: string
  detail: string
  /** Peso value when it has one; leave days are shown in `detail`. */
  amount?: number
  status: string
}

export interface PayrollInputs {
  period: InputsPeriod
  time: TimeInputRow[]
  output: OutputInputRow[]
  other: OtherInputRow[]
  /** Records still waiting on someone else's approval — not paid until they are approved. */
  pending: { output: number; overtime: number; leave: number; adjustments: number }
}

const BREAK_HOURS = 1

function toMinutes(time: string | null): number | null {
  if (!time) return null
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function workedHours(timeIn: string | null, timeOut: string | null): number {
  const start = toMinutes(timeIn)
  const end = toMinutes(timeOut)
  if (start === null || end === null || end <= start) return 0
  return Math.max(0, Math.round(((end - start) / 60 - BREAK_HOURS) * 100) / 100)
}

const inRange = (date: string, from: string, to: string) => date >= from && date <= to
const overlaps = (aFrom: string, aTo: string, from: string, to: string) => aFrom <= to && aTo >= from
const fullName = (e: Employee) => `${e.personal.firstName} ${e.personal.lastName}`

/** The inputs a payroll run reads for a period — read-only; approvals happen in Attendance, Overtime, Leave and Approvals. */
export async function getPayrollInputs(session: SessionUser, periodId: string): Promise<PayrollInputs | undefined> {
  const period: PayrollPeriod | undefined = db.payrollPeriods.find((p) => p.id === periodId && p.companyId === session.companyId)
  if (!period) return undefined

  const group = period.payrollGroupId ? db.payrollGroups.find((g) => g.id === period.payrollGroupId) : undefined
  const people = scopeForSession(db.employees, session).filter((e) => e.employment.status === 'active' && (!group || group.employeeIds.includes(e.id)))
  const ids = new Set(people.map((e) => e.id))
  const byId = new Map(people.map((e) => [e.id, e]))
  const { startDate: from, endDate: to } = period

  const attendance = db.attendanceRecords.filter((r) => ids.has(r.employeeId) && inRange(r.date, from, to))
  const overtime = db.overtimeRecords.filter((r) => ids.has(r.employeeId) && inRange(r.date, from, to))
  const leaves = db.leaveRequests.filter((r) => ids.has(r.employeeId) && overlaps(r.dateFrom, r.dateTo, from, to))
  const adjustments = db.attendanceAdjustments.filter((a) => ids.has(a.employeeId))
  const workLogs = db.compensationApprovals.filter((a) => ids.has(a.employeeId) && inRange(a.workDate, from, to))
  const leaveTypes = new Map(db.leaveTypes.filter((t) => t.companyId === session.companyId).map((t) => [t.id, t]))

  const time: TimeInputRow[] = people
    .map((e) => {
      const mine = attendance.filter((r) => r.employeeId === e.id)
      const approvedOt = overtime.filter((r) => r.employeeId === e.id && r.status === 'approved')
      return {
        employeeId: e.id,
        employeeNumber: e.employeeNumber,
        name: fullName(e),
        department: e.employment.department || '—',
        daysPresent: mine.filter((r) => r.status !== 'absent').length,
        regularHours: Math.round(mine.reduce((sum, r) => sum + workedHours(r.timeIn, r.timeOut), 0) * 100) / 100,
        late: mine.filter((r) => r.status === 'late').length,
        undertime: mine.filter((r) => r.status === 'undertime').length,
        absent: mine.filter((r) => r.status === 'absent').length,
        overtimeHours: approvedOt.filter((r) => r.type !== 'night_diff').reduce((sum, r) => sum + r.hours, 0),
        nightDiffHours: approvedOt.filter((r) => r.type === 'night_diff').reduce((sum, r) => sum + r.hours, 0),
      }
    })
    .filter((row) => row.daysPresent + row.absent + row.overtimeHours + row.nightDiffHours > 0)
    .sort((a, b) => a.name.localeCompare(b.name))

  const output: OutputInputRow[] = workLogs
    .filter((a) => a.type === 'output')
    .map((a) => {
      const e = byId.get(a.employeeId)!
      return {
        id: a.id,
        employeeId: a.employeeId,
        employeeNumber: e.employeeNumber,
        name: fullName(e),
        workDate: a.workDate,
        description: a.description,
        unitLabel: a.unitLabel,
        rate: a.rate,
        quantity: a.quantity,
        amount: a.amount,
        status: a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending',
        payrollNumber: a.payrollPeriodId ? db.payrollPeriods.find((p) => p.id === a.payrollPeriodId)?.payrollNumber : undefined,
      } satisfies OutputInputRow
    })
    .sort((a, b) => a.workDate.localeCompare(b.workDate) || a.name.localeCompare(b.name))

  const other: OtherInputRow[] = []

  for (const l of leaves.filter((r) => r.status === 'approved')) {
    const type = leaveTypes.get(l.leaveTypeId)
    if (!type || type.isPaid !== false) continue
    const e = byId.get(l.employeeId)!
    const days = l.dayPortion && l.dayPortion !== 'full' ? 0.5 : workingDaysBetween(l.employeeId, l.dateFrom > from ? l.dateFrom : from, l.dateTo < to ? l.dateTo : to)
    other.push({ id: l.id, kind: 'Leave without pay', employeeId: e.id, employeeNumber: e.employeeNumber, name: fullName(e), detail: `${type.name} · ${days} day${days === 1 ? '' : 's'}`, status: 'Approved' })
  }

  for (const e of people) {
    for (const a of e.compensation.allowances ?? []) {
      other.push({ id: `${e.id}_allow_${a.label}`, kind: 'Allowance', employeeId: e.id, employeeNumber: e.employeeNumber, name: fullName(e), detail: a.label, amount: a.amount, status: 'Recurring' })
    }
  }

  for (const b of db.bonuses.filter((x) => x.companyId === session.companyId && x.periodLabel === period.label)) {
    other.push({ id: b.id, kind: 'Bonus / incentive', name: b.name, detail: `${b.bonusType.replace(/_/g, ' ')} · ${b.taxable ? 'taxable' : 'non-taxable'}`, amount: b.amount, status: b.status.replace(/_/g, ' ') })
  }

  for (const a of adjustments.filter((x) => x.status === 'approved')) {
    const record = db.attendanceRecords.find((r) => r.id === a.attendanceRecordId)
    if (!record || !inRange(record.date, from, to)) continue
    const e = byId.get(a.employeeId)!
    other.push({ id: a.id, kind: 'Adjustment', employeeId: e.id, employeeNumber: e.employeeNumber, name: fullName(e), detail: `${a.reasonCategory ?? 'Attendance correction'} · ${record.date}`, status: 'Approved' })
  }

  const pendingAdjustments = adjustments.filter((a) => {
    if (a.status !== 'pending') return false
    const record = db.attendanceRecords.find((r) => r.id === a.attendanceRecordId)
    return !!record && inRange(record.date, from, to)
  }).length

  return {
    period: { id: period.id, label: period.label, startDate: from, endDate: to, payrollGroupId: period.payrollGroupId },
    time,
    output,
    other: other.sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name)),
    pending: {
      output: workLogs.filter((a) => a.status === 'pending').length,
      overtime: overtime.filter((r) => r.status === 'pending').length,
      leave: leaves.filter((r) => r.status === 'pending').length,
      adjustments: pendingAdjustments,
    },
  }
}
