import { monthlyEquivalentFor } from '@ops/lib/payroll/rateBasis'
import { projectedThirteenthMonth } from '@ops/lib/payroll/taxCompliance'
import type { BonusIncentive, Employee } from '@ops/types/domain'

/** Two illustrative, pre-populated bonus entries per company — demonstrates the module's list/approval UI out of the box. Neither targets a real payroll period, so neither is picked up by `computeLine` until an admin edits/recreates one against an actual cutoff. */
export function generateBonuses(employees: Employee[]): BonusIncentive[] {
  const companyIds = [...new Set(employees.map((e) => e.companyId))]
  const now = new Date().toISOString()

  const year = new Date().getFullYear()

  return companyIds.flatMap((companyId) => [
    ...nonTaxableAwards(employees, companyId, year, now),
    {
      id: `${companyId}_bonus_christmas`,
      companyId,
      name: 'Christmas Bonus',
      bonusType: 'fixed_amount',
      targetType: 'company',
      amount: 5000,
      periodLabel: 'December 2026',
      taxable: false,
      frequency: 'one_time',
      payoutMode: 'separate_payslip',
      notes: 'Company-wide year-end bonus for every active employee.',
      status: 'pending',
      createdAt: now,
    },
    {
      id: `${companyId}_bonus_q3sales`,
      companyId,
      name: 'Q3 Sales Incentive',
      bonusType: 'performance_based',
      targetType: 'department',
      targetDepartment: 'Sales',
      amount: 3000,
      periodLabel: 'September 2026',
      taxable: true,
      frequency: 'one_time',
      payoutMode: 'regular_payroll',
      notes: 'Performance incentive for the Sales department after hitting Q3 targets.',
      status: 'approved',
      createdAt: now,
      decidedBy: 'System Seed',
      decidedAt: now,
    },
  ])
}

/**
 * Non-taxable awards for the company's two highest-paid employees, sized so their 13th Month Pay & other
 * benefits land just under and just over the ₱90,000 ceiling — the Tax Monitoring report and the dashboard
 * tax alerts have something to flag out of the box.
 */
function nonTaxableAwards(employees: Employee[], companyId: string, year: number, now: string): BonusIncentive[] {
  const topEarners = employees
    .filter((e) => e.companyId === companyId && e.employment.status === 'active' && e.employment.dateHired < `${year}-01-01`)
    .sort((a, b) => monthlyEquivalentFor(b) - monthlyEquivalentFor(a))
    .slice(0, 2)
  const targets = [85_000, 105_000]

  return topEarners.flatMap((employee, i) => {
    const amount = Math.round(targets[i] - projectedThirteenthMonth(employee, year))
    if (amount <= 0) return []
    return [
      {
        id: `${employee.id}_bonus_retention`,
        companyId,
        name: 'Retention Award',
        bonusType: 'fixed_amount' as const,
        targetType: 'employee' as const,
        targetEmployeeId: employee.id,
        amount,
        periodLabel: `November ${year}`,
        taxable: false,
        frequency: 'one_time' as const,
        payoutMode: 'separate_payslip' as const,
        notes: 'Non-taxable retention award; counts toward the ₱90,000 ceiling on 13th Month Pay & other benefits.',
        status: 'approved' as const,
        createdAt: now,
        decidedBy: 'System Seed',
        decidedAt: now,
      },
    ]
  })
}
