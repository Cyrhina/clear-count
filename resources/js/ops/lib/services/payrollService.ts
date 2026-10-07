import { leaveDayFraction } from '@ops/lib/leave/leaveDays'
import { bonusAmountFor, bonusAppliesToEmployee, includedInRegularPayroll } from '@ops/lib/payroll/bonusMatching'
import { findEmployeePayrollGroup } from '@ops/lib/payroll/groupAssignment'
import { allocateMonthly, loanConfigNameFor, payScheduleFor, periodsPerMonthFor } from '@ops/lib/payroll/payFrequency'
import { basicPayFor, dailyRateFor, hourlyRateFor, monthlyEquivalentFor, workLogsForPeriod } from '@ops/lib/payroll/rateBasis'
import { formatPayrollNumber, nextPayrollSequence, payrollYearOf } from '@ops/lib/payroll/payrollNumber'
import { scopeToCompany } from '@ops/lib/tenancy/tenantScope'
import { db } from '@ops/mock-data'
import { marginalRateOn, taxBracketsFor, taxFrequencyForPay, withholdingTaxOn } from '@ops/lib/payroll/withholdingTax'
import type { BonusIncentive, Employee, OvertimeRecord, PayrollDeductionLine, PayrollFrequency, PayrollLine, PayrollPeriod, PayrollPeriodStatus, SessionUser, SssBracket, StatutoryConfig } from '@ops/types/domain'

/** Case/whitespace-insensitive match between a bonus/13th-month payout label and a real payroll period's label — the seam that lets those modules' approved records flow into a run without a hard foreign key to a period that may not exist yet when they're created. */
function periodLabelMatches(label: string, period: PayrollPeriod): boolean {
  return label.trim().toLowerCase() === period.label.trim().toLowerCase()
}

export async function getPayrollPeriods(session: SessionUser): Promise<PayrollPeriod[]> {
  return scopeToCompany(db.payrollPeriods, session.companyId).sort((a, b) => b.startDate.localeCompare(a.startDate))
}

export async function getPayrollLines(session: SessionUser, periodId: string): Promise<PayrollLine[]> {
  return db.payrollLines.filter((l) => l.companyId === session.companyId && l.periodId === periodId)
}

export async function getPayrollLine(session: SessionUser, lineId: string): Promise<PayrollLine | undefined> {
  return db.payrollLines.find((l) => l.companyId === session.companyId && l.id === lineId)
}

export interface CreatePeriodInput {
  label: string
  startDate: string
  endDate: string
  payDate: string
  /** When set, `runPayroll` only includes employees currently assigned to this Payroll Group. */
  payrollGroupId?: string
}

/** The payroll number the next run with this pay date will get (PR001 again at the start of each year). */
export async function getNextPayrollNumber(session: SessionUser, payDate: string): Promise<string> {
  const year = payrollYearOf(payDate)
  return formatPayrollNumber(nextPayrollSequence(scopeToCompany(db.payrollPeriods, session.companyId), year))
}

export async function createPayrollPeriod(session: SessionUser, input: CreatePeriodInput): Promise<PayrollPeriod> {
  const payrollYear = payrollYearOf(input.payDate)
  const period: PayrollPeriod = {
    id: crypto.randomUUID(),
    companyId: session.companyId,
    payrollNumber: formatPayrollNumber(nextPayrollSequence(scopeToCompany(db.payrollPeriods, session.companyId), payrollYear)),
    payrollYear,
    status: 'draft',
    ...input,
  }
  db.payrollPeriods.unshift(period)
  return period
}

/** How much of `date` an approved paid leave covers: 1 for a full-day leave, 0.5 for a half-day leave — a covered day is paid, never deducted as an absence. */
function paidLeaveCoverage(companyId: string, employeeId: string, date: string): number {
  const covered = db.leaveRequests.reduce((sum, r) => {
    if (r.employeeId !== employeeId || r.status !== 'approved' || r.dateFrom > date || r.dateTo < date) return sum
    const type = db.leaveTypes.find((t) => t.id === r.leaveTypeId && t.companyId === companyId)
    return type && type.isPaid !== false ? sum + leaveDayFraction(r) : sum
  }, 0)
  return Math.min(1, covered)
}

/** Absent days in the period, split into unpaid absences (deducted) and paid-leave days (paid). */
function attendanceOutcome(companyId: string, employeeId: string, startDate: string, endDate: string): { unpaidAbsentDays: number; paidLeaveDays: number } {
  const absences = db.attendanceRecords.filter((r) => r.employeeId === employeeId && r.status === 'absent' && r.date >= startDate && r.date <= endDate)
  const paidLeaveDays = absences.reduce((sum, r) => sum + paidLeaveCoverage(companyId, employeeId, r.date), 0)
  return { unpaidAbsentDays: absences.length - paidLeaveDays, paidLeaveDays }
}

function taxFor(taxable: number, config: StatutoryConfig): number {
  return withholdingTaxOn(taxable, config.taxBrackets)
}

function sssBracketFor(basicPay: number, brackets: SssBracket[]): SssBracket | undefined {
  return (
    brackets.find((b) => basicPay >= b.minSalary && (b.maxSalary === null || basicPay < b.maxSalary)) ??
    brackets[brackets.length - 1]
  )
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export interface MonthlyStatutory {
  /** Monthly compensation the brackets are applied to (rate-type-aware monthly-equivalent basic pay). */
  monthlyBasis: number
  sssMsc: number
  sssEmployee: number
  /** Employer SSS share including the EC premium. */
  sssEmployer: number
  sssEc: number
  philhealthBase: number
  philhealthEmployee: number
  philhealthEmployer: number
  pagibigEmployee: number
  pagibigEmployer: number
  /** Monthly compensation income subject to withholding: basis − employee SSS, PhilHealth, Pag-IBIG. */
  monthlyTaxable: number
  /** Monthly-equivalent withholding tax: the tax of one pay period (on the pay frequency's bracket table) × pay periods per month. */
  withholdingTax: number
  /** Marginal bracket rate of the pay frequency's table — applied to taxable extras (overtime, taxable bonuses) paid in a cutoff. */
  marginalRate: number
  /** Marginal rate on the ANNUAL table at this employee's annualized taxable pay — for lump sums paid once a year (13th month). */
  annualMarginalRate: number
}

/**
 * Full monthly statutory contributions and withholding tax for one employee under Philippine rules:
 *  - SSS: bracket MSC × 5% employee / 10% employer (+ EC ₱10/₱30), per the configured schedule;
 *  - PhilHealth: premium rate × basic salary clamped to the floor/ceiling, split per the configured shares;
 *  - Pag-IBIG: 2% (1% at ≤ ₱1,500) of pay up to the maximum fund salary, capped at the configured amount
 *    (a higher voluntary employee contribution on the employee record is honored);
 *  - BIR: TRAIN monthly table on basis − employee contributions.
 * The single source for the payroll engine, the Statutory Contributions employee view, and payslips.
 */
export function monthlyStatutoryFor(config: StatutoryConfig, employee: Employee, payFrequency?: PayrollFrequency, periodsPerMonth = 1): MonthlyStatutory {
  const monthlyBasis = monthlyEquivalentFor(employee)

  const sssBracket = sssBracketFor(monthlyBasis, config.sssBrackets)
  const sssEc = sssBracket?.ec ?? 0
  const sssEmployee = round2(sssBracket?.employeeShare ?? 0)
  const sssEmployer = round2((sssBracket?.employerShare ?? 0) + sssEc)

  const floor = config.philhealthSalaryFloor ?? 10_000
  const ceiling = config.philhealthSalaryCeiling ?? 100_000
  const philhealthBase = Math.min(Math.max(monthlyBasis, floor), ceiling)
  const philhealthPremium = philhealthBase * config.philhealthRate
  const philhealthEmployee = round2(philhealthPremium * config.philhealthEmployeeSharePercent)
  const philhealthEmployer = round2(philhealthPremium * config.philhealthEmployerSharePercent)

  const pagibigRate = config.pagibigRate ?? 0.02
  const fundSalary = Math.min(monthlyBasis, config.pagibigMaxFundSalary ?? 10_000)
  const employeeRate = monthlyBasis <= 1_500 ? pagibigRate / 2 : pagibigRate
  const mandatoryEmployee = Math.min(round2(fundSalary * employeeRate), config.pagibigEmployeeAmount)
  const pagibigEmployee = Math.max(mandatoryEmployee, employee.government.pagibigEmployeeContribution ?? 0)
  const pagibigEmployer = Math.min(round2(fundSalary * pagibigRate), config.pagibigEmployerAmount)

  const monthlyTaxable = Math.max(0, monthlyBasis - sssEmployee - philhealthEmployee - pagibigEmployee)
  // Tax is figured on one pay period's taxable pay against the table for that pay frequency (monthly when none is given).
  const taxFrequency = payFrequency ? taxFrequencyForPay(payFrequency, periodsPerMonth) : 'monthly'
  const table = taxBracketsFor(config, taxFrequency)
  const ppm = taxFrequency === 'monthly' || !table ? 1 : Math.max(periodsPerMonth, 0.0001)
  const periodTaxable = monthlyTaxable / ppm
  const withholdingTax = table ? round2(withholdingTaxOn(periodTaxable, table) * ppm) : round2(taxFor(monthlyTaxable, config))
  const marginalRate = table ? marginalRateOn(periodTaxable, table) : marginalRateOn(monthlyTaxable, config.taxBrackets)
  const annualTable = taxBracketsFor(config, 'annual')
  const annualMarginalRate = annualTable ? marginalRateOn(monthlyTaxable * 12, annualTable) : marginalRateOn(monthlyTaxable, config.taxBrackets)

  return {
    monthlyBasis,
    sssMsc: sssBracket?.msc ?? 0,
    sssEmployee,
    sssEmployer,
    sssEc,
    philhealthBase,
    philhealthEmployee,
    philhealthEmployer,
    pagibigEmployee,
    pagibigEmployer,
    monthlyTaxable,
    withholdingTax,
    marginalRate,
    annualMarginalRate,
  }
}

const OVERTIME_EARNING_LABEL: Record<OvertimeRecord['type'], string> = {
  regular: 'Overtime Pay',
  night_diff: 'Night Differential',
  rest_day_holiday: 'Rest Day / Holiday Overtime',
}

/** Earnings labels the engine produces besides Basic Pay, allowances and bonuses — so payslips can type them correctly. */
export const OVERTIME_EARNING_LABELS = new Set(Object.values(OVERTIME_EARNING_LABEL))
export const PAID_LEAVE_EARNING_LABEL = 'Paid Leave'

function configNamed(companyId: string, name: string) {
  return db.deductionConfigs.find((c) => c.companyId === companyId && c.name === name)
}

function computeLine(session: SessionUser, period: PayrollPeriod, config: StatutoryConfig, employee: Employee): PayrollLine {
  const group = period.payrollGroupId ? db.payrollGroups.find((g) => g.id === period.payrollGroupId) : undefined
  // The group's work schedule decides the daily-payroll divisor (22 working days for 5-day weeks, 26 for 6-day).
  // All Employees runs follow each employee's own Payroll Group frequency (see payScheduleFor).
  const employeeGroup = findEmployeePayrollGroup(db.payrollGroups.filter((g) => g.companyId === session.companyId), employee.id)
  const workSchedule =
    db.schedules.find((s) => s.id === (group ?? employeeGroup)?.workScheduleId) ?? db.schedules.find((s) => s.companyId === session.companyId)
  const schedule = payScheduleFor(period, group, workSchedule, employeeGroup)
  // A run covering several of the employee's cutoffs pays that many periods' worth of salary/allowances.
  const payPeriodsPerMonth = schedule.periodsPerMonth / (schedule.cutoffsCovered?.length ?? 1)
  const { unpaidAbsentDays, paidLeaveDays } = attendanceOutcome(session.companyId, employee.id, period.startDate, period.endDate)

  // Pay Rate Type + Base Rate + this period's attendance/output data → the base earning amount,
  // sized to the run's pay frequency. Daily/Hourly/Output-Based rates only pay for days/hours/units
  // actually recorded, so — unlike Monthly/Semi-Monthly — they get no separate absence deduction.
  const basicPayResult = basicPayFor(employee, period, db.attendanceRecords, db.compensationApprovals, payPeriodsPerMonth)
  const payType = employee.compensation.payType
  const isSalaried = payType === 'monthly' || payType === 'semi_monthly'
  const dailyRate = dailyRateFor(employee)
  const hourlyRate = hourlyRateFor(employee)
  const absenceDeduction = isSalaried ? Math.round(dailyRate * unpaidAbsentDays) : 0
  // Daily/hourly employees aren't paid for absent days, so an approved paid leave on such a day is paid here.
  const paidLeaveEarning =
    !isSalaried && (payType === 'daily' || payType === 'hourly') && paidLeaveDays > 0
      ? [{ label: PAID_LEAVE_EARNING_LABEL, amount: round2(dailyRate * paidLeaveDays) }]
      : []

  // Approved overtime / night differential in the period: hours × hourly rate × the OT rate multiplier.
  const overtimeByType = new Map<OvertimeRecord['type'], number>()
  for (const r of db.overtimeRecords) {
    if (r.employeeId !== employee.id || r.status !== 'approved' || r.date < period.startDate || r.date > period.endDate) continue
    overtimeByType.set(r.type, (overtimeByType.get(r.type) ?? 0) + r.hours * hourlyRate * r.multiplier)
  }
  const overtimeEarnings = [...overtimeByType].map(([type, amount]) => ({ label: OVERTIME_EARNING_LABEL[type], amount: round2(amount) }))
  const overtimePay = overtimeEarnings.reduce((sum, e) => sum + e.amount, 0)

  // Approved Bonuses & Incentives tagged for this cutoff flow into Gross Pay. Bonuses set to
  // "Generate Separate Payslip", and 13th Month Pay, are always paid on their own payslips.
  const approvedBonuses = db.bonuses.filter(
    (b) =>
      b.companyId === session.companyId &&
      b.status === 'approved' &&
      includedInRegularPayroll(b) &&
      periodLabelMatches(b.periodLabel, period) &&
      bonusAppliesToEmployee(b, employee),
  )
  const bonusEarnings = approvedBonuses.map((b) => ({ label: b.name, amount: bonusAmountFor(b, employee) }))

  // Benefits, Loans & Deductions: benefits active in this period. Cash allowances are earnings; the rest are
  // non-cash (shown on the payslip), with any employee share deducted below.
  const activeBenefits = db.employeeBenefits.filter(
    (b) =>
      b.companyId === session.companyId &&
      b.employeeId === employee.id &&
      b.status === 'active' &&
      b.startDate <= period.endDate &&
      (!b.endDate || b.endDate >= period.startDate),
  )
  const benefitAllowances = activeBenefits.filter((b) => b.category === 'allowance')
  const benefitsProvided = activeBenefits
    .filter((b) => b.category !== 'allowance')
    .map((b) => ({ label: b.name, category: b.category, provider: b.provider, amount: round2(b.monthlyValue / payPeriodsPerMonth) }))

  // Final pay: an employee who separates mid-run is paid only through their last working day. Salaried basic pay
  // and fixed allowances are prorated by calendar days; daily/hourly/output pay already follows recorded work.
  const lastDay = employee.employment.dateSeparated
  const isFinalRun = !!lastDay && lastDay >= period.startDate && lastDay < period.endDate
  const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1
  const workedFraction = isFinalRun ? daysBetween(period.startDate, lastDay) / daysBetween(period.startDate, period.endDate) : 1
  const prorate = (amount: number) => round2(amount * workedFraction)
  const basicPayAmount = isSalaried ? prorate(basicPayResult.amount) : basicPayResult.amount
  const basicPayLabel = isFinalRun ? `${basicPayResult.label} (final pay, prorated to ${lastDay})` : basicPayResult.label

  const earnings = [
    { label: basicPayLabel, amount: basicPayAmount },
    ...paidLeaveEarning,
    ...overtimeEarnings,
    ...employee.compensation.allowances.map((a) => ({ label: a.label, amount: prorate(round2(a.amount / payPeriodsPerMonth)) })),
    ...benefitAllowances.map((b) => ({ label: b.name, amount: prorate(round2(b.monthlyValue / payPeriodsPerMonth)) })),
    ...bonusEarnings,
  ]
  const grossPay = round2(earnings.reduce((sum, e) => sum + e.amount, 0))

  // Loans: the monthly amortization, allocated per the loan type's Payroll Settings schedule, never above the balance.
  const activeLoans = db.loans.filter((l) => l.employeeId === employee.id && l.status === 'active' && l.balance > 0 && l.startDate <= period.endDate)
  const loanDeductions = activeLoans
    .map((loan) => ({
      label: loan.label,
      amount: Math.min(allocateMonthly(loan.monthlyDeduction, schedule, configNamed(session.companyId, loanConfigNameFor(loan.type))), loan.balance),
    }))
    .filter((d) => d.amount > 0)

  // Statutory: full monthly amounts, then each allocated to this cutoff per its Payroll Settings schedule
  // (equal split by pay frequency, one specific cutoff, or a custom split).
  const monthly = monthlyStatutoryFor(config, employee, schedule.frequency, schedule.periodsPerMonth)
  // In a final-pay run the contributions and withholding tax are prorated with the salary (workedFraction is 1 otherwise).
  const alloc = (amount: number, name: string) => prorate(allocateMonthly(amount, schedule, configNamed(session.companyId, name)))
  const sssEmployeeShare = alloc(monthly.sssEmployee, 'SSS Contribution')
  const sssEmployerShare = alloc(monthly.sssEmployer, 'SSS Contribution')
  const philhealthEmployeeShare = alloc(monthly.philhealthEmployee, 'PhilHealth Contribution')
  const philhealthEmployerShare = alloc(monthly.philhealthEmployer, 'PhilHealth Contribution')
  const pagibigEmployeeShare = alloc(monthly.pagibigEmployee, 'Pag-IBIG Contribution')
  const pagibigEmployerShare = alloc(monthly.pagibigEmployer, 'Pag-IBIG Contribution')

  // Withholding tax: the monthly TRAIN tax on regular compensation, allocated like the others, plus
  // taxable extras paid this cutoff (overtime, taxable bonuses) at the employee's marginal rate — a
  // simplified stand-in for BIR's annualized method that never alters the regular withholding.
  // The withholding table is the one for this pay date's frequency (annual, monthly, semi-monthly, weekly or daily):
  // the pay period's taxable pay (basic − absences − the contributions taken this period) is looked up in it directly.
  // Bi-weekly and custom pay periods have no BIR table of their own, so they use the closest one (see taxFrequencyForPay).
  // Only if a company has emptied that table does tax fall back to the monthly tax split by the allocation settings.
  const taxFrequency = taxFrequencyForPay(schedule.frequency, schedule.periodsPerMonth)
  const taxTable = taxBracketsFor(config, taxFrequency)
  const cutoffsInRun = schedule.cutoffsCovered?.length ?? 1
  let baseWithholdingTax: number
  let marginalRate = monthly.marginalRate
  let withholdingTaxBasis: PayrollLine['withholdingTaxBasis']
  if (taxFrequency && taxTable) {
    const contributions = sssEmployeeShare + philhealthEmployeeShare + pagibigEmployeeShare
    const regularPay = basicPayAmount + paidLeaveEarning.reduce((sum, e) => sum + e.amount, 0) - absenceDeduction
    const taxable = Math.max(0, round2((regularPay - contributions) / cutoffsInRun))
    baseWithholdingTax = Math.round(withholdingTaxOn(taxable, taxTable) * cutoffsInRun)
    marginalRate = marginalRateOn(taxable, taxTable)
    withholdingTaxBasis = { frequency: taxFrequency, taxable, regularTax: baseWithholdingTax, marginalRate, cutoffs: cutoffsInRun }
  } else {
    baseWithholdingTax = Math.round(alloc(monthly.withholdingTax, 'Withholding Tax'))
  }
  const taxableBonusAmount = approvedBonuses.filter((b) => b.taxable).reduce((sum, b) => sum + bonusAmountFor(b, employee), 0)
  const extrasWithholdingTax = Math.round((taxableBonusAmount + overtimePay) * marginalRate)
  const withholdingTax = baseWithholdingTax + extrasWithholdingTax

  const absenceLines = absenceDeduction > 0 ? [{ label: 'Absences', amount: absenceDeduction }] : []

  // Deductions from Benefits, Loans & Deductions: benefit employee shares and recurring deductions are monthly
  // amounts split like the other recurring deductions; a one-time deduction is taken in full in the run whose
  // period contains its due date.
  const periodActive = (d: { startDate: string; endDate?: string }) => d.startDate <= period.endDate && (!d.endDate || d.endDate >= period.startDate)
  const employeeDeductions = db.employeeDeductions.filter((d) => d.companyId === session.companyId && d.employeeId === employee.id)
  const extraDeductions: PayrollDeductionLine[] = [
    ...activeBenefits
      .filter((b) => b.employeeShare > 0)
      .map((b) => ({ label: `${b.name} – Employee Share`, amount: allocateMonthly(b.employeeShare, schedule, configNamed(session.companyId, b.name)), kind: 'benefit' as const })),
    ...employeeDeductions
      .filter((d) => d.kind === 'recurring' && d.status === 'active' && periodActive(d))
      .map((d) => ({ label: d.name, amount: allocateMonthly(d.amount, schedule, configNamed(session.companyId, d.name)), kind: 'recurring' as const })),
    ...employeeDeductions
      .filter(
        (d) =>
          d.kind === 'one_time' &&
          !!d.dueDate &&
          d.dueDate >= period.startDate &&
          d.dueDate <= period.endDate &&
          (d.status === 'active' || (d.status === 'completed' && d.appliedPeriodId === period.id)),
      )
      .map((d) => ({ label: d.name, amount: d.amount, kind: 'one_time' as const })),
  ].filter((d) => d.amount > 0)

  // Statutory contributions, tax and absences are always taken; loan amortizations only up to what
  // the remaining pay covers, so a thin cutoff never goes negative. The uncollected amortization
  // simply stays on the loan balance for later cutoffs.
  let remainingForLoans = grossPay - (sssEmployeeShare + philhealthEmployeeShare + pagibigEmployeeShare + withholdingTax + absenceDeduction)
  const collectedExtras = extraDeductions
    .map((d) => {
      const amount = round2(Math.max(0, Math.min(d.amount, remainingForLoans)))
      remainingForLoans -= amount
      return { ...d, amount }
    })
    .filter((d) => d.amount > 0)
  const otherDeductions = [...absenceLines, ...collectedExtras]

  const collectedLoanDeductions = loanDeductions
    .map((d) => {
      const amount = round2(Math.max(0, Math.min(d.amount, remainingForLoans)))
      remainingForLoans -= amount
      return { ...d, amount }
    })
    .filter((d) => d.amount > 0)

  const totalDeductions = round2(
    collectedLoanDeductions.reduce((s, d) => s + d.amount, 0) +
      otherDeductions.reduce((s, d) => s + d.amount, 0) +
      sssEmployeeShare +
      philhealthEmployeeShare +
      pagibigEmployeeShare +
      withholdingTax,
  )

  return {
    id: `${period.id}_${employee.id}`,
    companyId: session.companyId,
    periodId: period.id,
    employeeId: employee.id,
    basicPay: employee.compensation.basicPay,
    earnings,
    grossPay,
    absentDays: unpaidAbsentDays,
    loanDeductions: collectedLoanDeductions,
    otherDeductions,
    sssEmployeeShare,
    sssEmployerShare,
    philhealthEmployeeShare,
    philhealthEmployerShare,
    pagibigEmployeeShare,
    pagibigEmployerShare,
    withholdingTax,
    totalDeductions,
    netPay: Math.round(grossPay - totalDeductions),
    payFrequency: schedule.frequency,
    periodsPerMonth: payPeriodsPerMonth,
    periodsInMonth: schedule.periodsPerCycle,
    cutoffIndex: schedule.cutoffIndex,
    cutoffsCovered: schedule.cutoffsCovered,
    monthlyStatutory: {
      sssEmployee: monthly.sssEmployee,
      sssEmployer: monthly.sssEmployer,
      philhealthEmployee: monthly.philhealthEmployee,
      philhealthEmployer: monthly.philhealthEmployer,
      pagibigEmployee: monthly.pagibigEmployee,
      pagibigEmployer: monthly.pagibigEmployer,
      withholdingTax: monthly.withholdingTax,
    },
    withholdingTaxBasis,
    overtimePay: round2(overtimePay),
    benefitsProvided,
    benefitAllowances: benefitAllowances.map((b) => b.name),
  }
}

export interface SeparateBonusPayslip {
  bonus: BonusIncentive
  employee: Employee
  grossBonus: number
  withholdingTax: number
  netPay: number
  /** Marginal bracket rate applied to a taxable bonus (0 for non-taxable). */
  taxRate: number
}

/**
 * The standalone payslip for a bonus set to "Generate Separate Payslip". It carries only the bonus:
 * no basic pay, allowances or statutory contributions (those stay on the regular payroll payslip).
 * A taxable bonus is withheld at the employee's marginal bracket rate, exactly as the regular run
 * withholds a bonus included there. Read-only; nothing is saved.
 */
export function computeSeparateBonusPayslip(session: SessionUser, bonus: BonusIncentive, employee: Employee): SeparateBonusPayslip | undefined {
  const config = db.statutoryConfigs.find((c) => c.companyId === session.companyId)
  if (!config) return undefined

  const grossBonus = bonusAmountFor(bonus, employee)
  const taxRate = bonus.taxable ? marginalTaxRateFor(session, employee) : 0
  const withholdingTax = Math.round(grossBonus * taxRate)
  return { bonus, employee, grossBonus, withholdingTax, netPay: Math.round(grossBonus - withholdingTax), taxRate }
}

/** The employee's marginal withholding bracket rate — the same simplified rate the regular run applies to taxable bonuses. */
function marginalTaxRate(config: StatutoryConfig, employee: Employee, frequency?: PayrollFrequency, periodsPerMonth?: number): number {
  return monthlyStatutoryFor(config, employee, frequency, periodsPerMonth).marginalRate
}

/** Marginal withholding rate for an employee under the company's statutory config (0 if none configured). */
export function marginalTaxRateFor(session: SessionUser, employee: Employee, basis: 'pay_date' | 'annual' = 'pay_date'): number {
  const config = db.statutoryConfigs.find((c) => c.companyId === session.companyId)
  if (!config) return 0
  if (basis === 'annual') return monthlyStatutoryFor(config, employee).annualMarginalRate
  const group = findEmployeePayrollGroup(db.payrollGroups.filter((g) => g.companyId === session.companyId), employee.id)
  const frequency = group?.frequency ?? 'semi_monthly'
  return marginalTaxRate(config, employee, frequency, periodsPerMonthFor(frequency, group))
}

/** Computes a line exactly as `runPayroll` would, without saving it or changing any state — for report previews. */
export function previewPayrollLine(session: SessionUser, period: PayrollPeriod, employee: Employee): PayrollLine | undefined {
  const config = db.statutoryConfigs.find((c) => c.companyId === session.companyId)
  return config ? computeLine(session, period, config, employee) : undefined
}

/** Computes payroll lines for every active employee and moves the period from draft to review. */
export async function runPayroll(session: SessionUser, periodId: string): Promise<PayrollLine[]> {
  const period = db.payrollPeriods.find((p) => p.id === periodId && p.companyId === session.companyId)
  if (!period) throw new Error('Payroll period not found')

  const config = db.statutoryConfigs.find((c) => c.companyId === session.companyId)
  if (!config) throw new Error('Statutory configuration not found')

  const payrollGroup = period.payrollGroupId ? db.payrollGroups.find((g) => g.id === period.payrollGroupId) : undefined
  const activeEmployees = db.employees.filter(
    (e) =>
      e.companyId === session.companyId &&
      // Separated employees stay in the one run that covers their last working day, to receive their final pay.
      (e.employment.status === 'active' || (!!e.employment.dateSeparated && e.employment.dateSeparated >= period.startDate && e.employment.dateSeparated <= period.endDate)) &&
      (!payrollGroup || payrollGroup.employeeIds.includes(e.id)) &&
      !period.excludedEmployeeIds?.includes(e.id),
  )

  db.payrollLines = db.payrollLines.filter((l) => l.periodId !== periodId)
  for (const approval of db.compensationApprovals) {
    if (approval.payrollPeriodId === periodId) approval.payrollPeriodId = undefined
  }

  const lines = activeEmployees.map((employee) => computeLine(session, period, config, employee))
  db.payrollLines.push(...lines)

  // Lock the approved work logs this run paid to the period (computed while still 'draft', the
  // same selection `computeLine` just used) so no other run can pay them again.
  for (const employee of activeEmployees) {
    for (const approval of workLogsForPeriod(employee.id, period, db.compensationApprovals).payable) {
      approval.payrollPeriodId = period.id
    }
  }

  period.status = 'review'
  return lines
}

/** Holds employees out of a run that hasn't been approved yet: their lines are removed and the work logs they locked are freed. Returns how many were held. */
export async function holdEmployeesInPeriod(session: SessionUser, periodId: string, employeeIds: string[]): Promise<number> {
  const period = db.payrollPeriods.find((p) => p.id === periodId && p.companyId === session.companyId)
  if (!period || (period.status !== 'draft' && period.status !== 'review')) return 0
  const held = new Set(period.excludedEmployeeIds ?? [])
  const ids = employeeIds.filter((id) => !held.has(id) && db.employees.some((e) => e.id === id && e.companyId === session.companyId))
  for (const id of ids) held.add(id)
  period.excludedEmployeeIds = [...held]
  const idSet = new Set(ids)
  db.payrollLines = db.payrollLines.filter((l) => !(l.periodId === periodId && idSet.has(l.employeeId)))
  for (const approval of db.compensationApprovals) {
    if (approval.payrollPeriodId === periodId && idSet.has(approval.employeeId)) approval.payrollPeriodId = undefined
  }
  return ids.length
}

/** Puts held employees back into the run; if the run was already calculated, their lines are computed now. Returns how many were released. */
export async function releaseEmployeesInPeriod(session: SessionUser, periodId: string, employeeIds: string[]): Promise<number> {
  const period = db.payrollPeriods.find((p) => p.id === periodId && p.companyId === session.companyId)
  const config = db.statutoryConfigs.find((c) => c.companyId === session.companyId)
  if (!period || !config || (period.status !== 'draft' && period.status !== 'review')) return 0
  const ids = employeeIds.filter((id) => period.excludedEmployeeIds?.includes(id))
  period.excludedEmployeeIds = (period.excludedEmployeeIds ?? []).filter((id) => !ids.includes(id))
  if (period.status === 'review') {
    for (const id of ids) {
      const employee = db.employees.find((e) => e.id === id && e.companyId === session.companyId)
      if (!employee) continue
      db.payrollLines.push(computeLine(session, period, config, employee))
      for (const approval of workLogsForPeriod(employee.id, period, db.compensationApprovals).payable) approval.payrollPeriodId = period.id
    }
  }
  return ids.length
}

function transition(session: SessionUser, periodId: string, from: PayrollPeriodStatus, to: PayrollPeriodStatus) {
  const period = db.payrollPeriods.find((p) => p.id === periodId && p.companyId === session.companyId)
  if (!period || period.status !== from) return
  period.status = to
}

export async function approvePayroll(session: SessionUser, periodId: string): Promise<void> {
  transition(session, periodId, 'review', 'approved')
}

export async function finalizePayroll(session: SessionUser, periodId: string): Promise<void> {
  const period = db.payrollPeriods.find((p) => p.id === periodId && p.companyId === session.companyId)
  if (!period || period.status !== 'approved') return

  const lines = db.payrollLines.filter((l) => l.periodId === periodId)
  for (const line of lines) {
    for (const deduction of line.loanDeductions) {
      const loan = db.loans.find((l) => l.employeeId === line.employeeId && l.label === deduction.label)
      if (loan) {
        loan.balance = Math.max(0, loan.balance - deduction.amount)
        if (loan.balance === 0) loan.status = 'completed'
        loan.repaymentHistory = [
          ...(loan.repaymentHistory ?? []),
          {
            id: crypto.randomUUID(),
            date: period.payDate,
            payrollReference: period.label,
            amount: deduction.amount,
            remainingBalanceAfter: loan.balance,
          },
        ]
      }
    }
  }

  // One-time deductions taken by this run are settled so no later run takes them again.
  for (const line of lines) {
    for (const deduction of line.otherDeductions) {
      if (deduction.kind !== 'one_time') continue
      const record = db.employeeDeductions.find(
        (d) =>
          d.employeeId === line.employeeId &&
          d.kind === 'one_time' &&
          d.status === 'active' &&
          d.name === deduction.label &&
          !!d.dueDate &&
          d.dueDate >= period.startDate &&
          d.dueDate <= period.endDate,
      )
      if (record) {
        record.status = 'completed'
        record.appliedPeriodId = period.id
      }
    }
  }

  period.status = 'finalized'
}

export async function getStatutoryConfig(session: SessionUser): Promise<StatutoryConfig | undefined> {
  return db.statutoryConfigs.find((c) => c.companyId === session.companyId)
}

export async function updateStatutoryConfig(session: SessionUser, updates: Partial<StatutoryConfig>): Promise<void> {
  const config = db.statutoryConfigs.find((c) => c.companyId === session.companyId)
  if (!config) return
  Object.assign(config, updates)
}
