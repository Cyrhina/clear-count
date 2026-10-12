import type {
  CompensationType as DomainCompensationType,
  ComplianceDeadline as DomainComplianceDeadline,
  DeductionConfig as DomainDeductionConfig,
  DeductionSchedule,
  EarningConfig as DomainEarningConfig,
  PayrollRules as DomainPayrollRules,
  Schedule as DomainSchedule,
} from '@ops/types/domain'

/**
 * What the Company & Payroll Settings screens get from the API. Most entities are the `types/domain.ts` shape without
 * `companyId` (the server scopes every request to the signed-in company), so the components keep their field names.
 */
type WithoutCompany<T> = Omit<T, 'companyId'>

export type EarningConfig = WithoutCompany<DomainEarningConfig>
export type DeductionConfig = WithoutCompany<DomainDeductionConfig>
export type CompensationType = WithoutCompany<DomainCompensationType>
export type ComplianceDeadline = WithoutCompany<DomainComplianceDeadline>
export type Schedule = WithoutCompany<DomainSchedule>
/** The deprecated `overtimeDefaultMultiplier` is not part of the API. */
export type PayrollRules = Omit<DomainPayrollRules, 'companyId' | 'overtimeDefaultMultiplier'>

/** One row of Overtime & Holiday Rates. `key` is the stable name the payroll engine looks a rate up by. */
export interface RateRow {
  id: string
  key: string
  group: 'overtime' | 'holiday'
  label: string
  /** A decimal multiplier: 1.25 means 125%. */
  multiplier: number
  isCustom: boolean
}

export type HolidayType = 'regular' | 'special_non_working' | 'special_working' | 'double_holiday'
export type HolidayScope = 'national' | 'regional' | 'branch_specific'

export interface Holiday {
  id: string
  name: string
  /** YYYY-MM-DD */
  date: string
  year: number
  type: HolidayType
  typeLabel: string
  scope: HolidayScope
  scopeLabel: string
  branchIds: string[]
  description?: string
  /** Added by the company itself, not copied from the Philippine default calendar. */
  isCustom: boolean
}

/** The pay frequencies a payroll group can have (the API's keys). */
export type GroupFrequency = 'monthly' | 'semi_monthly' | 'weekly' | 'bi_weekly'

/** Cutoff rule; which fields are present depends on the frequency. Weekdays are 1 = Monday ... 7 = Sunday. */
export interface CutoffConfig {
  /** Semi-monthly: exactly two periods. `endDay` is a day number or the word `end`. */
  periods?: { startDay: number; endDay: number | 'end' }[]
  /** Monthly: the day the pay month starts (26 means the 26th of last month to the 25th). */
  startDay?: number
  /** Weekly and bi-weekly. */
  startWeekday?: number
  /** Bi-weekly: any real period start; every 14 days from it. Must fall on `startWeekday`. */
  anchorDate?: string
}

export interface PayDateConfig {
  type: 'fixed_days' | 'last_working_day' | 'weekday_after_cutoff'
  days?: number[]
  weekday?: number
  weeksAfter?: number
  weekendRule?: 'previous' | 'next' | 'none'
}

export interface PayrollGroup {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  /** Display strings for the card. */
  frequency: string
  compensation?: string
  cutoffDisplay: string
  payDatesDisplay: string
  deductionScheduleDisplay: string
  workScheduleName?: string
  effectiveDate: string
  employeesCount: number
  /** Raw values for the edit form. */
  frequencyKey: GroupFrequency
  compensationTypeId?: string
  cutoffConfig: CutoffConfig
  payDateConfig: PayDateConfig
  deductionSchedule: DeductionSchedule
  workScheduleId?: string
  /** Only on the single-group endpoint. */
  employees?: { id: string; employeeNumber: string; name: string; department?: string; status: string }[]
}

export type PayrollGroupInput = Pick<PayrollGroup, 'name' | 'status' | 'frequencyKey' | 'cutoffConfig' | 'payDateConfig' | 'deductionSchedule' | 'effectiveDate'> & {
  description?: string
  compensationTypeId?: string
  workScheduleId?: string
}

export interface CalendarPeriod {
  periodNo: number
  /** YYYY-MM */
  month: string
  periodInMonth: number
  label: string
  cutoffStart: string
  cutoffEnd: string
  payDate: string
  payDay: string
}
