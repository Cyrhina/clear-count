import groups from './groups'
import compensationTypes from './compensation-types'
import complianceDeadlines from './compliance-deadlines'
import earnings from './earnings'
import deductions from './deductions'
import overtimeRates from './overtime-rates'
import rules from './rules'
import workSchedules from './work-schedules'
const payrollSettings = {
    groups: Object.assign(groups, groups),
compensationTypes: Object.assign(compensationTypes, compensationTypes),
complianceDeadlines: Object.assign(complianceDeadlines, complianceDeadlines),
earnings: Object.assign(earnings, earnings),
deductions: Object.assign(deductions, deductions),
overtimeRates: Object.assign(overtimeRates, overtimeRates),
rules: Object.assign(rules, rules),
workSchedules: Object.assign(workSchedules, workSchedules),
}

export default payrollSettings