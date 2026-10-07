import type { SssBracket, StatutoryConfig, TaxBracket } from '@ops/types/domain'
import { companies } from '@ops/mock-data/seed/companies'

/**
 * SSS contribution schedule effective January 2025 (Circular 2024-006): 15% of the Monthly Salary
 * Credit — 5% employee, 10% employer — on MSCs from ₱5,000 to ₱35,000 in ₱500 steps, plus the
 * employer-paid Employees' Compensation premium (₱10 below ₱15,000 MSC, ₱30 from ₱15,000).
 */
function buildSssBrackets(): SssBracket[] {
  const brackets: SssBracket[] = []
  for (let msc = 5000; msc <= 35000; msc += 500) {
    brackets.push({
      minSalary: msc === 5000 ? 0 : msc - 250,
      maxSalary: msc === 35000 ? null : msc + 250,
      msc,
      employeeShare: msc * 0.05,
      employerShare: msc * 0.1,
      ec: msc < 15000 ? 10 : 30,
    })
  }
  return brackets
}

const SSS_BRACKETS = buildSssBrackets()

/**
 * BIR withholding tables by pay period (TRAIN, 2023 onward). Each is the annual table scaled to the pay period:
 * the first bracket is exempt, then 15% / 20% / 25% / 30% / 35% over the bracket minimum.
 */
const taxTable = (mins: number[], baseTaxes: number[]): TaxBracket[] =>
  mins.map((min, i) => ({ min, max: mins[i + 1] ?? null, rate: [0, 0.15, 0.2, 0.25, 0.3, 0.35][i], baseTax: baseTaxes[i] }))

const TAX_TABLES = {
  annual: taxTable([0, 250_000, 400_000, 800_000, 2_000_000, 8_000_000], [0, 0, 22_500, 102_500, 402_500, 2_202_500]),
  semi_monthly: taxTable([0, 10_417, 16_667, 33_333, 83_333, 333_333], [0, 0, 937.5, 4_270.7, 16_770.7, 91_770.7]),
  weekly: taxTable([0, 4_808, 7_692, 15_385, 38_462, 153_846], [0, 0, 432.6, 1_971.2, 7_740.45, 42_355.65]),
  daily: taxTable([0, 685, 1_096, 2_192, 5_479, 21_918], [0, 0, 61.65, 280.85, 1_102.6, 6_034.3]),
}

export const statutoryConfigs: StatutoryConfig[] = companies.map((company) => ({
  companyId: company.id,
  sssBrackets: SSS_BRACKETS,
  // PhilHealth 2024–2025: 5% premium on basic salary, floor ₱10,000 / ceiling ₱100,000, split 50/50.
  philhealthRate: 0.05,
  philhealthEmployeeSharePercent: 0.5,
  philhealthEmployerSharePercent: 0.5,
  philhealthSalaryFloor: 10_000,
  philhealthSalaryCeiling: 100_000,
  // Pag-IBIG (HDMF Circular 460): 2% each on pay up to the ₱10,000 maximum fund salary (₱200 cap); employees earning ₱1,500 or less pay 1%.
  pagibigRate: 0.02,
  pagibigMaxFundSalary: 10_000,
  pagibigEmployeeAmount: 200,
  pagibigEmployerAmount: 200,
  // BIR withholding tax on compensation — TRAIN Law monthly table effective January 2023.
  taxBrackets: [
    { min: 0, max: 20833, rate: 0, baseTax: 0 },
    { min: 20833, max: 33333, rate: 0.15, baseTax: 0 },
    { min: 33333, max: 66667, rate: 0.2, baseTax: 1875 },
    { min: 66667, max: 166667, rate: 0.25, baseTax: 8541.8 },
    { min: 166667, max: 666667, rate: 0.3, baseTax: 33541.8 },
    { min: 666667, max: null, rate: 0.35, baseTax: 183541.8 },
  ],
  taxBracketTables: structuredClone(TAX_TABLES),
}))
