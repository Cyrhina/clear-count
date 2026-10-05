import type { BenefitPlan, DeductionPlan, Employee, EmployeeBenefit, EmployeeDeduction } from '@ops/types/domain'

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const daysFromToday = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return iso(d)
}

/** Benefits start on the hire date, but never earlier than this (the demo's payroll history begins mid-2026). */
const BENEFIT_START_FLOOR = '2026-01-01'
const startFor = (employee: Employee) => (employee.employment.dateHired > BENEFIT_START_FLOOR ? employee.employment.dateHired : BENEFIT_START_FLOOR)

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
const planIdFor = (companyId: string, category: BenefitPlan['category'], name: string) => `${companyId}_plan_${category}_${slug(name)}`

type PlanSeed = Pick<BenefitPlan, 'category' | 'name' | 'provider' | 'coverage' | 'monthlyValue' | 'amountType'>

/** The plans every company offers. Most already have employees (see generateBenefits); HMO Plans A/C and Transportation Allowance start empty. */
const PLAN_CATALOG: PlanSeed[] = [
  { category: 'hmo', name: 'HMO Plan A', provider: 'Maxicare', coverage: 'Employee only · basic inpatient and outpatient', monthlyValue: 1200 },
  { category: 'hmo', name: 'HMO Plan B', provider: 'Maxicare', coverage: 'Employee only · inpatient, outpatient and emergency', monthlyValue: 1850 },
  { category: 'hmo', name: 'HMO Plan C', provider: 'Maxicare', coverage: 'Employee + 1 dependent · premium with dental and optical', monthlyValue: 2800 },
  { category: 'allowance', name: 'Communication Allowance', monthlyValue: 500, amountType: 'fixed' },
  { category: 'allowance', name: 'Rice Subsidy', monthlyValue: 600, amountType: 'fixed' },
  { category: 'allowance', name: 'Transportation Allowance', monthlyValue: 800, amountType: 'custom' },
  { category: 'allowance', name: 'Uniform & Clothing Allowance', monthlyValue: 450, amountType: 'custom' },
  { category: 'insurance', name: 'Group Life & Accident Insurance', provider: 'Pru Life UK', coverage: '₱250,000 life · ₱100,000 accidental death', monthlyValue: 250 },
  { category: 'insurance', name: 'Accident Insurance (Probationary)', provider: 'Pru Life UK', coverage: 'Covered during probation only', monthlyValue: 150 },
  { category: 'other', name: 'Wellness Program', provider: 'Anytime Fitness', coverage: 'Gym membership', monthlyValue: 400 },
  { category: 'other', name: 'Education Assistance', coverage: 'Review/seminar fees, reimbursed against receipts', monthlyValue: 1000 },
]

export function generateBenefitPlans(employees: Employee[]): BenefitPlan[] {
  const companyIds = [...new Set(employees.map((e) => e.companyId))]
  return companyIds.flatMap((companyId) =>
    PLAN_CATALOG.map((p) => ({ id: planIdFor(companyId, p.category, p.name), companyId, ...p, employeeShare: 0, status: 'active' as const })),
  )
}

/**
 * Sample benefits for the demo roster: an HMO plan for everyone whose profile lists one (matching the
 * profile's plan name), group life insurance for regular employees, plus cash allowances and a few other
 * perks spread by department. Cash allowances are paid through payroll; the rest show on the payslip.
 */
export function generateBenefits(employees: Employee[]): EmployeeBenefit[] {
  const benefits: EmployeeBenefit[] = []
  const active = employees.filter((e) => e.employment.status === 'active')
  let uniformRecipients = 0

  active.forEach((employee, index) => {
    const base = { companyId: employee.companyId, employeeId: employee.id, startDate: startFor(employee), status: 'active' as const }
    const id = (key: string) => `${employee.id}_ben_${key}`

    if (employee.benefits.hmoPlan) {
      const withDependent = index % 4 === 0
      benefits.push({
        ...base,
        id: id('hmo'),
        planId: planIdFor(employee.companyId, 'hmo', employee.benefits.hmoPlan),
        category: 'hmo',
        name: employee.benefits.hmoPlan,
        provider: 'Maxicare',
        coverage: `${employee.benefits.hmoPlan} (${withDependent ? 'Employee + 1 dependent' : 'Employee only'})`,
        monthlyValue: 1850,
        // The employer covers the employee; adding a dependent costs the employee a monthly share.
        employeeShare: withDependent ? 350 : 0,
        notes: withDependent ? 'Dependent add-on shared with the employee via payroll deduction.' : undefined,
      })
    }

    if (employee.employment.employmentType === 'regular') {
      benefits.push({
        ...base,
        id: id('life'),
        planId: planIdFor(employee.companyId, 'insurance', 'Group Life & Accident Insurance'),
        category: 'insurance',
        name: 'Group Life & Accident Insurance',
        provider: 'Pru Life UK',
        coverage: '₱250,000 life · ₱100,000 accidental death',
        monthlyValue: 250,
        employeeShare: 0,
      })
    }

    const dept = employee.employment.department
    if (['IT', 'Sales', 'Customer Support'].includes(dept)) {
      benefits.push({ ...base, id: id('comm'), planId: planIdFor(employee.companyId, 'allowance', 'Communication Allowance'), category: 'allowance', name: 'Communication Allowance', monthlyValue: 500, employeeShare: 0, notes: 'Monthly mobile/internet subsidy.' })
    }
    if (['Warehouse', 'Operations'].includes(dept)) {
      benefits.push({ ...base, id: id('rice'), planId: planIdFor(employee.companyId, 'allowance', 'Rice Subsidy'), category: 'allowance', name: 'Rice Subsidy', monthlyValue: 600, employeeShare: 0, notes: 'Monthly rice allowance.' })
    }

    if (['Warehouse', 'Operations'].includes(dept)) {
      // A customizable de minimis allowance (₱6,000 a year ceiling): a few go over it, a few sit right at it, the rest are well under.
      const monthly = [650, 450, 300][uniformRecipients++ % 3]
      benefits.push({ ...base, id: id('uniform'), planId: planIdFor(employee.companyId, 'allowance', 'Uniform & Clothing Allowance'), category: 'allowance', name: 'Uniform & Clothing Allowance', monthlyValue: monthly, employeeShare: 0, notes: 'Monthly uniform and clothing allowance.' })
    }

    if (index % 5 === 0) {
      benefits.push({ ...base, id: id('wellness'), planId: planIdFor(employee.companyId, 'other', 'Wellness Program'), category: 'other', name: 'Wellness Program', provider: 'Anytime Fitness', coverage: 'Gym membership', monthlyValue: 400, employeeShare: 0 })
    }
    if (index % 7 === 1) {
      benefits.push({ ...base, id: id('educ'), planId: planIdFor(employee.companyId, 'other', 'Education Assistance'), category: 'other', name: 'Education Assistance', coverage: 'Review/seminar fees, reimbursed against receipts', monthlyValue: 1000, employeeShare: 0 })
    }
  })

  // One benefit that has ended, so cancelled records are represented too.
  const lapsed = active.find((e) => e.employment.employmentType !== 'regular') ?? active[active.length - 1]
  if (lapsed) {
    benefits.push({
      id: `${lapsed.id}_ben_lapsed`,
      companyId: lapsed.companyId,
      employeeId: lapsed.id,
      planId: planIdFor(lapsed.companyId, 'insurance', 'Accident Insurance (Probationary)'),
      category: 'insurance',
      name: 'Accident Insurance (Probationary)',
      provider: 'Pru Life UK',
      coverage: 'Covered during probation only',
      monthlyValue: 150,
      employeeShare: 0,
      startDate: BENEFIT_START_FLOOR,
      endDate: '2026-03-31',
      status: 'cancelled',
    })
  }
  return benefits
}

const deductionPlanId = (companyId: string, name: string) => `${companyId}_dplan_${slug(name)}`

const DEDUCTION_PLAN_CATALOG: Pick<DeductionPlan, 'name' | 'amount' | 'amountType' | 'reason'>[] = [
  { name: 'Cooperative Savings', amount: 300, amountType: 'custom', reason: 'Voluntary savings contribution to the employee cooperative.' },
  { name: 'Canteen/Meal Plan', amount: 450, amountType: 'fixed', reason: 'Monthly canteen meal plan.' },
  { name: 'Union Dues', amount: 150, amountType: 'fixed', reason: 'Monthly union membership dues.' },
  { name: 'Parking Fee', amount: 500, amountType: 'fixed', reason: 'Monthly company parking.' },
]

/** The recurring-deduction plans every company offers. Parking Fee starts empty (its one record is cancelled). */
export function generateDeductionPlans(employees: Employee[]): DeductionPlan[] {
  const companyIds = [...new Set(employees.map((e) => e.companyId))]
  return companyIds.flatMap((companyId) => DEDUCTION_PLAN_CATALOG.map((p) => ({ id: deductionPlanId(companyId, p.name), companyId, ...p, status: 'active' as const })))
}

/**
 * Sample deductions that aren't loans or government contributions: recurring company deductions (cooperative
 * savings, union dues, canteen plan) and one-time ones (uniform, ID replacement) dated inside the sample
 * payroll history, so finalized runs have already taken some and later ones are still scheduled.
 */
export function generateEmployeeDeductions(employees: Employee[]): EmployeeDeduction[] {
  const deductions: EmployeeDeduction[] = []
  const active = employees.filter((e) => e.employment.status === 'active')

  active.forEach((employee, index) => {
    const base = { companyId: employee.companyId, employeeId: employee.id, status: 'active' as const }
    const id = (key: string) => `${employee.id}_ded_${key}`
    const start = startFor(employee)

    if (index % 3 === 0) {
      deductions.push({ ...base, id: id('coop'), planId: deductionPlanId(employee.companyId, 'Cooperative Savings'), name: 'Cooperative Savings', kind: 'recurring', amount: 300, startDate: start, reason: 'Voluntary savings contribution to the employee cooperative.' })
    }
    if (index % 5 === 2) {
      deductions.push({ ...base, id: id('canteen'), planId: deductionPlanId(employee.companyId, 'Canteen/Meal Plan'), name: 'Canteen/Meal Plan', kind: 'recurring', amount: 450, startDate: start, reason: 'Monthly canteen meal plan.' })
    }
    if (index % 7 === 3) {
      deductions.push({ ...base, id: id('union'), planId: deductionPlanId(employee.companyId, 'Union Dues'), name: 'Union Dues', kind: 'recurring', amount: 150, startDate: start, reason: 'Monthly union membership dues.' })
    }

    // One-time deductions spread over the payroll history: ~7 weeks ago, ~3 weeks ago, and one still ahead.
    if (index % 6 === 1) {
      deductions.push({ ...base, id: id('uniform'), name: 'Uniform Cost', kind: 'one_time', amount: 800, startDate: daysFromToday(-52), dueDate: daysFromToday(-50), reason: 'Two company uniform sets.' })
    }
    if (index % 6 === 4) {
      deductions.push({ ...base, id: id('idfee'), name: 'ID Replacement Fee', kind: 'one_time', amount: 150, startDate: daysFromToday(-22), dueDate: daysFromToday(-20), reason: 'Lost company ID.' })
    }
    if (index % 9 === 5) {
      deductions.push({ ...base, id: id('equip'), name: 'Equipment Damage Charge', kind: 'one_time', amount: 1200, startDate: daysFromToday(0), dueDate: daysFromToday(10), reason: 'Damaged company headset, agreed to be deducted next cut-off.' })
    }
  })

  // A recurring deduction that was stopped early, so cancelled records are represented too.
  const stopped = active[2]
  if (stopped) {
    deductions.push({
      id: `${stopped.id}_ded_stopped`,
      companyId: stopped.companyId,
      employeeId: stopped.id,
      planId: deductionPlanId(stopped.companyId, 'Parking Fee'),
      name: 'Parking Fee',
      kind: 'recurring',
      amount: 500,
      startDate: BENEFIT_START_FLOOR,
      endDate: '2026-06-30',
      status: 'cancelled',
      reason: 'Employee moved to a shuttle; fee stopped.',
    })
  }
  return deductions
}
