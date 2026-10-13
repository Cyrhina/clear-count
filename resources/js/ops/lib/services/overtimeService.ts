// mock: remove in P10 (payroll), P14 (dashboards, reports). The Overtime page uses overtimeApiService; getOvertimeRecords and the CSV export still serve payroll, dashboards, reports, manager service and notifications.
import { getEmployees } from '@ops/lib/services/employeeService'
import { db } from '@ops/mock-data'
import type { OvertimeRecord, SessionUser } from '@ops/types/domain'

async function scopedEmployeeIds(session: SessionUser): Promise<Set<string>> {
  const employees = await getEmployees(session)
  return new Set(employees.map((e) => e.id))
}

export async function getOvertimeRecords(session: SessionUser): Promise<OvertimeRecord[]> {
  const employeeIds = await scopedEmployeeIds(session)
  return db.overtimeRecords
    .filter((r) => r.companyId === session.companyId && employeeIds.has(r.employeeId))
    .sort((a, b) => b.date.localeCompare(a.date) || b.requestedAt.localeCompare(a.requestedAt))
}

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\r\n')
}

export async function exportOvertimeSummaryCsv(session: SessionUser): Promise<string> {
  const [records, employees] = await Promise.all([getOvertimeRecords(session), getEmployees(session)])
  const employeeById = new Map(employees.map((e) => [e.id, e]))

  const header = ['Employee', 'Employee ID', 'Department', 'Date', 'Start', 'End', 'Hours', 'Type', 'Multiplier', 'Status']
  const rows = records.map((r) => {
    const employee = employeeById.get(r.employeeId)
    return [
      employee ? `${employee.personal.firstName} ${employee.personal.lastName}` : r.employeeId,
      employee?.employeeNumber ?? '',
      employee?.employment.department ?? '',
      r.date,
      r.startTime,
      r.endTime,
      String(r.hours),
      r.type,
      `${Math.round(r.multiplier * 100)}%`,
      r.status,
    ]
  })
  return toCsv([header, ...rows])
}
