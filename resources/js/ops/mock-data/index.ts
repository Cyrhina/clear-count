import { generateActivityLog } from '@ops/mock-data/generators/activityLog'
import { generateAttendanceRecords } from '@ops/mock-data/generators/attendance'
import { generateBenefitPlans, generateBenefits, generateDeductionPlans, generateEmployeeDeductions } from '@ops/mock-data/generators/benefitsDeductions'
import { generateBonuses } from '@ops/mock-data/generators/bonuses'
import { generateCompensationApprovals } from '@ops/mock-data/generators/compensationApprovals'
import { generateEmployeesForCompany } from '@ops/mock-data/generators/employees'
import { generateBranchDepartments } from '@ops/mock-data/generators/branchDepartments'
import { generateShiftAssignments } from '@ops/mock-data/generators/shiftAssignments'
import { generateLoans } from '@ops/mock-data/generators/loans'
import { generateOvertimeRecords } from '@ops/mock-data/generators/overtime'
import { generateAttendanceAdjustments, generateLeaveRequests, generateSampleLeaveOverrides } from '@ops/mock-data/generators/workflowRecords'
import { branches } from '@ops/mock-data/seed/branches'
import { companies } from '@ops/mock-data/seed/companies'
import { compensationTypes } from '@ops/mock-data/seed/compensationTypes'
import { deductionConfigs } from '@ops/mock-data/seed/deductionConfigs'
import { earningConfigs } from '@ops/mock-data/seed/earningConfigs'
import { holidays } from '@ops/mock-data/seed/holidays'
import { leaveTypes } from '@ops/mock-data/seed/leaveTypes'
import { payrollGroups } from '@ops/mock-data/seed/payrollGroups'
import { payrollRules } from '@ops/mock-data/seed/payrollRules'
import { complianceDeadlines } from '@ops/mock-data/seed/complianceDeadlines'
import { loanTypes } from '@ops/mock-data/seed/loanTypes'
import { schedules } from '@ops/mock-data/seed/schedules'
import { statutoryConfigs } from '@ops/mock-data/seed/statutoryConfig'
import { users } from '@ops/mock-data/seed/users'
import type { ActivityLogEntry, ApiKey, Employee, PayrollLine, PayrollPeriod, PayslipEmailRecord, ThirteenthMonthLine, ThirteenthMonthRun, Webhook } from '@ops/types/domain'

const EMPLOYEE_COUNT_BY_COMPANY: Record<string, number> = {
  co_frontline: 24,
  co_manila_bay: 18,
  co_cebu_craft: 15,
}

function buildEmployees(): Employee[] {
  return companies.flatMap((company) => {
    const companyBranches = branches.filter((b) => b.companyId === company.id)
    const count = EMPLOYEE_COUNT_BY_COMPANY[company.id] ?? 15
    return generateEmployeesForCompany(company.id, companyBranches, count)
  })
}

const employees = buildEmployees()

/** HR Admin and Payroll Admin are employees of the company too — give their employee records their names, so My Profile shows them. */
function linkStaffEmployees() {
  const staff: { id: string; firstName: string; lastName: string; department: string; position: string }[] = [
    { id: 'co_frontline_emp_0002', firstName: 'Patrick', lastName: 'Ong', department: 'HR', position: 'HR Manager' },
    { id: 'co_frontline_emp_0003', firstName: 'Karen', lastName: 'Sison', department: 'Finance', position: 'Payroll Specialist' },
  ]
  for (const entry of staff) {
    const employee = employees.find((e) => e.id === entry.id)
    if (!employee) continue
    employee.personal.firstName = entry.firstName
    employee.personal.lastName = entry.lastName
    if (employee.personal.personalEmail) employee.personal.personalEmail = `${entry.firstName.toLowerCase()}.${entry.lastName.toLowerCase()}@gmail.com`
    employee.employment.department = entry.department
    employee.employment.position = entry.position
  }
}
linkStaffEmployees()

/** The demo Employee login is paid by hours worked, so My Work & Output, approvals and payroll all show real figures for them. */
function makeDemoEmployeeHourly() {
  const employee = employees.find((e) => e.id === 'co_frontline_emp_0001')
  if (!employee) return
  employee.employment.status = 'active'
  delete employee.employment.dateSeparated
  delete employee.employment.separationReason
  employee.employment.category = 'field_worker'
  employee.compensation.payType = 'hourly'
  employee.compensation.basicPay = 110
  employee.compensation.outputUnit = null
}
makeDemoEmployeeHourly()
// The attendance generator follows each company's default (Standard Day) shift, not the last template listed.
const schedulesByCompany = new Map(schedules.filter((s) => s.id.endsWith('_sched_default')).map((s) => [s.companyId, s]))
const attendanceRecords = generateAttendanceRecords(employees, schedulesByCompany)

/**
 * The hand-authored user seeds link to specific employee ids, but the employee
 * generator assigns names/branches deterministically from that id — not
 * necessarily what the seed author guessed. Reconcile in place so a user's
 * display name/branch always matches the employee record their session
 * actually resolves to (same object references, so this also updates what
 * `lib/auth/mockSession.ts` reads from the `users` seed module).
 */
function reconcileUsersWithEmployees() {
  for (const user of users) {
    if (!user.employeeId) continue
    const employee = employees.find((e) => e.id === user.employeeId)
    if (!employee) continue
    user.name = `${employee.personal.firstName} ${employee.personal.lastName}`
    if (user.role === 'manager' || user.role === 'employee') user.branchId = employee.branchId
  }
}
reconcileUsersWithEmployees()

/** Mock branch managers: the first active manager/supervisor-level employee in each branch (else its first active employee). */
function assignBranchManagers() {
  for (const branch of branches) {
    const staff = employees.filter((e) => e.branchId === branch.id && e.employment.status === 'active')
    const manager = staff.find((e) => /manager|supervisor|head|lead/i.test(e.employment.position)) ?? staff[0]
    if (manager) branch.managerEmployeeId = manager.id
  }
}
assignBranchManagers()

const sampleLeaves = generateSampleLeaveOverrides(employees)

/**
 * The generated attendance predates leaves, so make the sample leave days look like a real device log:
 * no punches on full-day leave (except FR-0003, kept as the "punched while on leave" conflict case),
 * morning-only punches for a PM half-day, and none for an AM half-day with no afternoon punch.
 */
function alignAttendanceWithSampleLeaves() {
  for (const leave of sampleLeaves) {
    if (leave.status !== 'approved') continue
    const employee = employees.find((e) => e.id === leave.employeeId)
    if (!employee || employee.employeeNumber === 'FR-0003') continue
    for (const record of attendanceRecords) {
      if (record.employeeId !== leave.employeeId || record.date < leave.dateFrom || record.date > leave.dateTo) continue
      if (leave.dayPortion === 'half_pm') {
        record.timeIn = '08:58'
        record.timeOut = '12:32'
        record.status = 'undertime'
      } else {
        record.timeIn = null
        record.timeOut = null
        record.status = 'absent'
      }
    }
  }
}
alignAttendanceWithSampleLeaves()

/**
 * Payroll group seeds are authored with empty `employeeIds` (see
 * `seed/payrollGroups.ts`) since the employee generator runs after seeds
 * load. Distribute each company's generated employees across its payroll
 * groups here so the "Assigned Employees" counts aren't empty out of the box.
 */
function assignEmployeesToPayrollGroups() {
  for (const company of companies) {
    const companyGroups = payrollGroups.filter((g) => g.companyId === company.id)
    if (companyGroups.length === 0) continue
    const companyEmployees = employees.filter((e) => e.companyId === company.id)
    companyEmployees.forEach((employee, index) => {
      const group = companyGroups[index % companyGroups.length]
      group.employeeIds.push(employee.id)
    })
  }
}
assignEmployeesToPayrollGroups()

/**
 * In-memory mock database. This is the ONLY module that holds raw seed data;
 * every feature must read through `lib/services/*`, never import from here directly.
 */
export const db = {
  companies,
  branches,
  users,
  employees,
  schedules,
  shiftAssignments: generateShiftAssignments(employees, schedules),
  branchDepartments: generateBranchDepartments(employees),
  leaveTypes,
  compensationTypes,
  payrollGroups,
  earningConfigs,
  deductionConfigs,
  payrollRules,
  complianceDeadlines,
  attendanceRecords,
  attendanceAdjustments: generateAttendanceAdjustments(employees, attendanceRecords),
  leaveRequests: [...generateLeaveRequests(employees, leaveTypes), ...sampleLeaves],
  statutoryConfigs,
  loanTypes,
  loans: generateLoans(employees),
  benefitPlans: generateBenefitPlans(employees),
  employeeBenefits: generateBenefits(employees),
  deductionPlans: generateDeductionPlans(employees),
  employeeDeductions: generateEmployeeDeductions(employees),
  overtimeRecords: generateOvertimeRecords(employees),
  bonuses: generateBonuses(employees),
  compensationApprovals: generateCompensationApprovals(employees),
  holidays,
  activityLog: generateActivityLog(users, employees) as ActivityLogEntry[],
  payrollPeriods: [] as PayrollPeriod[],
  payrollLines: [] as PayrollLine[],
  thirteenthMonthRuns: [] as ThirteenthMonthRun[],
  thirteenthMonthLines: [] as ThirteenthMonthLine[],
  payslipEmails: [] as PayslipEmailRecord[],
  apiKeys: [] as ApiKey[],
  webhooks: [] as Webhook[],
}
