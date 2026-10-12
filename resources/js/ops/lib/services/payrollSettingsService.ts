// mock: remove in P3-P14. The Company Settings screens now use payrollConfigService and payrollGroupService; this file stays only for
// the mock modules that still read payroll groups, compensation types, deduction configs and rules (see docs/PROGRESS.md, mock-removal ledger).
import { getEmployees } from '@ops/lib/services/employeeService'
import { db } from '@ops/mock-data'
import type {
  CompensationType,
  DeductionConfig,
  EarningConfig,
  PayrollGroup,
  PayrollRules,
  SessionUser,
} from '@ops/types/domain'

// ---- Compensation Types ----------------------------------------------------

export async function getCompensationTypes(session: SessionUser): Promise<CompensationType[]> {
  return db.compensationTypes.filter((c) => c.companyId === session.companyId)
}

// ---- Payroll Groups ---------------------------------------------------------

export async function getPayrollGroups(session: SessionUser): Promise<PayrollGroup[]> {
  return db.payrollGroups.filter((g) => g.companyId === session.companyId)
}

/** Every employee belongs to at most one active Payroll Group — enforced structurally by always stripping them from every other group in the company before adding. */
function stripEmployeeFromOtherGroups(session: SessionUser, employeeId: string, exceptGroupId?: string) {
  for (const group of db.payrollGroups) {
    if (group.companyId !== session.companyId || group.id === exceptGroupId) continue
    group.employeeIds = group.employeeIds.filter((id) => id !== employeeId)
  }
}

/** Replaces a Payroll Group's full membership list in one operation (used by the Assign Employees dialog's bulk save). */
export async function updatePayrollGroupMembership(session: SessionUser, groupId: string, employeeIds: string[]): Promise<void> {
  const group = db.payrollGroups.find((g) => g.id === groupId && g.companyId === session.companyId)
  if (!group) return
  for (const employeeId of employeeIds) stripEmployeeFromOtherGroups(session, employeeId, groupId)
  group.employeeIds = employeeIds
}

/** Moves a single employee to `groupId` (or unassigns entirely when `groupId` is null). Used by reassign/remove actions and the Employee profile's Payroll Group field. */
export async function setEmployeePayrollGroup(session: SessionUser, employeeId: string, groupId: string | null): Promise<void> {
  stripEmployeeFromOtherGroups(session, employeeId, groupId ?? undefined)
  if (!groupId) return
  const group = db.payrollGroups.find((g) => g.id === groupId && g.companyId === session.companyId)
  if (group && !group.employeeIds.includes(employeeId)) group.employeeIds.push(employeeId)
}

// ---- Deductions ----------------------------------------------------------------

export async function getDeductionConfigs(session: SessionUser): Promise<DeductionConfig[]> {
  return db.deductionConfigs.filter((d) => d.companyId === session.companyId)
}

// ---- Payroll Rules (single record per company) --------------------------------

export async function getPayrollRules(session: SessionUser): Promise<PayrollRules | undefined> {
  return db.payrollRules.find((r) => r.companyId === session.companyId)
}

/** Moves several employees into `groupId` (or out of every group when null) without touching the group's other members. Returns how many were moved. */
export async function bulkSetEmployeePayrollGroup(session: SessionUser, employeeIds: string[], groupId: string | null): Promise<number> {
  const employees = new Set((await getEmployees(session)).map((e) => e.id))
  const ids = employeeIds.filter((id) => employees.has(id))
  for (const id of ids) await setEmployeePayrollGroup(session, id, groupId)
  return ids.length
}
