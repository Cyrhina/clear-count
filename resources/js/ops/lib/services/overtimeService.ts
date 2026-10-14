// Read helper and the CSV export for the reports and dashboards: overtime on the API (the Overtime page uses overtimeApiService directly).
import { memoRead } from '@ops/lib/api/memo'
import { getEmployees } from '@ops/lib/services/employeeService'
import { fetchOvertime } from '@ops/lib/services/overtimeApiService'
import type { OvertimeRecord, SessionUser } from '@ops/types/domain'

export async function getOvertimeRecords(session: SessionUser): Promise<OvertimeRecord[]> {
  return (await memoRead(`overtime:${session.id}`, fetchOvertime)).slice().sort((a, b) => b.date.localeCompare(a.date) || b.requestedAt.localeCompare(a.requestedAt))
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
