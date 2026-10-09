import type { AttendanceRecord, AttendanceStatus, Employee, Schedule } from '@ops/types/domain'

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

/** Small stable hash so every employee gets their own pattern (same data on every reload). */
function hashOf(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

function pickStatus(roll: number): AttendanceStatus {
  if (roll === 0) return 'absent'
  if (roll <= 2) return 'undertime'
  if (roll <= 5) return 'late'
  return 'present'
}

const pad = (n: number) => String(n).padStart(2, '0')
const clock = (totalMinutes: number) => `${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`

/** Generates the last `days` weekdays of attendance for every active employee, following each company's default schedule. */
export function generateAttendanceRecords(
  employees: Employee[],
  schedulesByCompany: Map<string, Schedule>,
  days = 14,
): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  const today = new Date()

  let cursorDays = 0
  const workingDays: Date[] = []
  while (workingDays.length < days) {
    const d = new Date(today)
    d.setDate(today.getDate() - cursorDays)
    cursorDays++
    if (d.getDay() !== 0 && d.getDay() !== 6) workingDays.push(d)
  }

  const build = (employee: Employee, schedule: Schedule, date: Date, status: AttendanceStatus, h: number, salt: number): AttendanceRecord => {
    const dateKey = toDateKey(date)
    const worked = status !== 'absent'
    return {
      id: `${employee.id}_att_${dateKey}`,
      companyId: employee.companyId,
      employeeId: employee.id,
      scheduleId: schedule.id,
      date: dateKey,
      // AM in / AM out (lunch out) / PM in (lunch in) / PM out — late arrivals and lunch lengths differ per person and day.
      timeIn: !worked ? null : status === 'late' ? clock(9 * 60 + 3 + ((h + salt) % 38)) : clock(8 * 60 + 40 + ((h + salt) % 18)),
      breakOut: !worked ? null : clock(12 * 60 + ((h + salt) % 6)),
      breakIn: !worked ? null : clock(13 * 60 + ((h + salt * 3) % 9)),
      timeOut: !worked ? null : status === 'undertime' ? clock(16 * 60 + 5 + ((h + salt) % 40)) : clock(18 * 60 + ((h + salt) % 12)),
      status,
    }
  }

  for (const employee of employees) {
    if (employee.employment.status !== 'active') continue
    const schedule = schedulesByCompany.get(employee.companyId)
    if (!schedule) continue
    const h = hashOf(employee.id + employee.employeeNumber)

    workingDays.forEach((date, dayIndex) => {
      const status = pickStatus((h + dayIndex * 7 + dayIndex * dayIndex * 3) % 20)
      records.push(build(employee, schedule, date, status, h, dayIndex))
    })
  }

  return records
}
