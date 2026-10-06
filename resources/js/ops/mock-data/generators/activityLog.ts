import type { ActivityLogEntry, Employee, SessionUser } from '@ops/types/domain'

interface Template {
  module: NonNullable<ActivityLogEntry['module']>
  kind: string
  title: string
  subtitle: string
  description: string
  file?: { name: string; size: string }
  /** Which kind of user usually does this. */
  by: SessionUser['role'][]
}

const TEMPLATES: Template[] = [
  { module: 'Payroll', kind: 'Exported', title: 'Payroll Summary Report', subtitle: 'PDF file • 2.4 MB', description: 'The payroll summary report was exported in PDF format.', file: { name: 'Payroll_Summary.pdf', size: '2.4 MB' }, by: ['company_admin', 'payroll_admin'] },
  { module: 'Payroll', kind: 'Processed', title: 'Payroll Run', subtitle: 'Semi-monthly regular payroll', description: 'A payroll run was calculated and sent for review.', by: ['payroll_admin'] },
  { module: 'Employees', kind: 'Updated', title: 'Employee Record', subtitle: 'Employment information', description: 'An employee’s employment information was updated.', by: ['hr_admin'] },
  { module: 'Attendance', kind: 'Approved', title: 'Attendance Adjustment', subtitle: 'Time in / time out correction', description: 'An attendance adjustment request was approved.', by: ['company_admin', 'hr_admin', 'manager'] },
  { module: 'Reports', kind: 'Generated', title: 'BIR Form 2316', subtitle: 'For the current tax year', description: 'The annual BIR Form 2316 was generated.', file: { name: 'BIR_2316.xlsx', size: '1.1 MB' }, by: ['payroll_admin', 'company_admin'] },
  { module: 'Loans & Deductions', kind: 'Updated', title: 'SSS Contribution', subtitle: 'For 15 employees', description: 'Recurring SSS contribution settings were updated.', by: ['payroll_admin'] },
  { module: 'Leave', kind: 'Approved', title: 'Vacation Leave', subtitle: '3 days · approved by manager', description: 'A vacation leave request was approved.', by: ['manager', 'hr_admin'] },
  { module: 'Loans & Deductions', kind: 'Added', title: 'Loan Deduction', subtitle: 'For 3 employees', description: 'Employees were enrolled in a loan deduction plan.', by: ['payroll_admin', 'hr_admin'] },
  { module: 'Employees', kind: 'Viewed', title: 'Employee Profile', subtitle: 'Compensation tab', description: 'An employee profile was viewed.', by: ['hr_admin', 'company_admin'] },
  { module: 'Payroll', kind: 'Finalized', title: 'Payroll Run', subtitle: 'Locked and payslips released', description: 'A payroll run was finalized and payslips were made available.', by: ['company_admin'] },
  { module: 'Reports', kind: 'Exported', title: 'Tax Monitoring', subtitle: 'Excel file • 845 KB', description: 'The tax monitoring report was exported in Excel format.', file: { name: 'Tax_Monitoring.xlsx', size: '845 KB' }, by: ['payroll_admin', 'company_admin'] },
  { module: 'Attendance', kind: 'Updated', title: 'Biometrics Import', subtitle: 'Schedule-based import', description: 'Biometrics punches were imported and applied.', by: ['hr_admin'] },
]

const DAYS_AGO = [0, 0, 1, 1, 2, 3, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 19, 21, 22, 24, 25, 27, 28, 30, 32, 34, 36, 38, 41, 44, 47, 50, 54, 58, 62, 67]
const TIMES = ['10:24', '09:58', '16:37', '14:15', '11:42', '15:20', '13:12', '20:46', '17:32', '10:10']

/** Sample audit trail across the company's modules, relative to today, so the Activity Log is populated out of the box. Real actions logged later are added on top. */
export function generateActivityLog(users: SessionUser[], employees: Employee[]): ActivityLogEntry[] {
  const companyIds = [...new Set(users.map((u) => u.companyId))]
  const today = new Date()
  const entries: ActivityLogEntry[] = []

  for (const companyId of companyIds) {
    const staff = users.filter((u) => u.companyId === companyId && u.role !== 'employee' && u.role !== 'super_admin')
    if (staff.length === 0) continue
    const people = employees.filter((e) => e.companyId === companyId)
    DAYS_AGO.forEach((daysAgo, i) => {
      const template = TEMPLATES[(i * 5 + 3) % TEMPLATES.length]
      const matching = staff.filter((u) => template.by.includes(u.role))
      const pool = matching.length ? matching : staff
      const actor = pool[i % pool.length]
      const [hh, mm] = TIMES[i % TIMES.length].split(':').map(Number)
      const at = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo, hh, mm)
      if (at > today) at.setDate(at.getDate() - 1)
      const person = people[(i * 7) % Math.max(people.length, 1)]
      const subtitle = template.module === 'Employees' && person ? `${person.personal.firstName} ${person.personal.lastName} (${person.employeeNumber})` : template.subtitle
      entries.push({
        id: `${companyId}_seed_activity_${i}`,
        companyId,
        timestamp: at.toISOString(),
        actor: actor.name,
        actorRole: actor.role,
        action: template.description,
        module: template.module,
        kind: template.kind,
        title: template.title,
        subtitle,
        file: template.file,
      })
    })
  }
  return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
