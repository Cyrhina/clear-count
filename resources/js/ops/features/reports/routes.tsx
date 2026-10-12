import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { PlanGate } from '@ops/components/ui/PlanGate'
import { Select } from '@ops/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { DebitCreditReport } from '@ops/features/reports/components/AccountingReports'
import {
  CompensationAnalysisReport,
  EarningsVsDeductionsReport,
  EmployerContributionAnalysisReport,
  AttendanceAbsenteeismReport,
  HeadcountAnalysisReport,
  LaborCostAnalysisReport,
  LeaveUtilizationReport,
  OvertimeCostAnalysisReport,
  PayrollCostAnalysisReport,
  PayrollCostByDimensionReport,
  PayrollExpenseByAccountReport,
  PayrollTrendReport,
} from '@ops/features/reports/components/AdvancedReports'
import {
  EmployeeCompensationReport,
  EmployeeMasterListReport,
  LoansDeductionsReportView,
  OvertimeReportView,
  PayrollRegisterReport,
  PayrollSummaryPerEmployeeReport,
  PayrollSummaryReport,
  PayslipReportView,
  BenefitsReportView,
} from '@ops/features/reports/components/BasicReports'
import { CustomReportBuilder } from '@ops/features/reports/components/CustomReportBuilder'
import { ReportCategorySection, type ReportCategory } from '@ops/features/reports/components/shared'
import { LateAbsenceReport } from '@ops/features/reports/components/LateAbsenceReport'
import { PayStatutoryLoansReport } from '@ops/features/reports/components/PayStatutoryLoansReport'
import { HoursWorkedReport, OutputSummaryReport } from '@ops/features/reports/components/TeamReports'
import { BonusReport, PayrollHistoryReport, ThirteenthMonthPayReport } from '@ops/features/reports/components/PayrollRecordReports'
import { Bir1601CReport, Bir2316Report, ConsolidatedStatutoryReport, StatutoryContributionReport } from '@ops/features/reports/components/StatutoryReports'
import { DeMinimisBenefitsReport, TaxMonitoringReport, TaxableCompensationReport, ThirteenthMonthBenefitsReport, WithholdingTaxSummaryReport } from '@ops/features/reports/components/TaxComplianceReports'
import { usePermission } from '@ops/hooks/usePermission'
import { useActivePlanTier } from '@ops/hooks/useActivePlanTier'

const BASIC_CATEGORIES: ReportCategory[] = [
  {
    label: 'Employee Reports',
    reports: [
      { id: 'employee-master-list', label: 'Employee Master List', description: 'Full profile and demographic export.' },
      { id: 'employee-compensation', label: 'Employee Compensation Report', description: 'Breakdown of basic rates, allowances, and pay frequency.' },
      { id: 'pay-statutory-loans', label: 'Employee Pay, Statutory & Loans', description: 'Basic pay, employee and employer SSS / PhilHealth / Pag-IBIG contributions, and government loans per employee.' },
    ],
  },
  {
    label: 'Team Reports',
    reports: [
      { id: 'hours-worked', label: 'Hours Worked', description: 'Regular hours, submitted hours, and approved OT / night differential per employee.' },
      { id: 'output-summary', label: 'Output Summary', description: 'Output submitted, approved and pending per employee.' },
      { id: 'late-absence', label: 'Late & Absence Report', description: 'Who was late or absent, on which dates, and how many times.' },
    ],
  },
  {
    label: 'Payroll Reports',
    reports: [
      { id: 'payroll-register', label: 'Payroll Register', description: 'Detailed payroll breakdown per employee.' },
      { id: 'payroll-summary', label: 'Payroll Summary', description: 'High-level period total summary.' },
      { id: 'payroll-summary-per-employee', label: 'Payroll Summary per Employee', description: 'Individual period comparisons.' },
      { id: 'payroll-history', label: 'Payroll History', description: 'Every payroll run with its status and totals.' },
      { id: 'payslip-report', label: 'Payslip Report', description: 'Batch view of generated payslips.' },
      { id: 'overtime-report', label: 'Overtime Report', description: 'OT and Night Differential hours & costs.' },
      { id: 'loans-deductions-report', label: 'Loans & Deductions Report', description: 'Active company loans and recurring deduction tracking.' },
      { id: 'bonus-report', label: 'Bonus Report', description: 'Bonuses and incentives with targets, tax treatment and approval status.' },
      { id: 'thirteenth-month-pay-report', label: '13th Month Pay Report', description: '13th Month Pay computed per employee across every batch.' },
      { id: 'benefits-report', label: 'Benefits Report', description: 'HMO, allowances, insurance and other benefits, with amounts paid through payroll.' },
    ],
  },
  {
    label: 'Accounting Reports',
    reports: [
      { id: 'debit-credit', label: 'Payroll Summary — Debit & Credit', description: 'Payroll transactions as formal Debit and Credit accounts.' },
    ],
  },
  {
    label: 'Statutory Contributions',
    reports: [
      { id: 'sss-contribution', label: 'SSS Contribution Report', description: 'Monthly SSS R3/R5 remittance summary.' },
      { id: 'philhealth-contribution', label: 'PhilHealth Contribution Report', description: 'Monthly ER2/RF-1 remittance report.' },
      { id: 'pagibig-contribution', label: 'Pag-IBIG Contribution Report', description: 'Monthly MCRF remittance report.' },
      {
        id: 'consolidated-statutory',
        label: 'Overall Statutory Contribution Report',
        description: 'Unified summary of SSS, PhilHealth, Pag-IBIG, and Tax deductions per employee.',
      },
    ],
  },
  {
    label: 'Tax & Compliance',
    reports: [
      { id: 'tax-monitoring', label: 'Tax Monitoring', description: 'Employees at or over the 13th month and de minimis ceilings, flagged for review.' },
      { id: 'taxable-compensation', label: 'Taxable Compensation', description: 'Gross pay less non-taxable items, per employee, year to date.' },
      { id: 'thirteenth-month-benefits', label: '13th Month & Other Benefits', description: '13th Month Pay and other benefits against the ₱90,000 non-taxable ceiling.' },
      { id: 'de-minimis-benefits', label: 'De Minimis Benefits', description: 'Rice, uniform, laundry and other benefits against their BIR ceilings.' },
      { id: 'withholding-tax-summary', label: 'Withholding Tax Summary', description: 'Tax withheld on compensation, by month or by employee.' },
      { id: 'bir-1601c', label: 'BIR Form 1601-C', description: 'Monthly Remittance Return of Income Taxes Withheld.' },
      { id: 'bir-2316', label: 'BIR Form 2316', description: 'Annual Certificate of Compensation/Tax Withheld.' },
    ],
  },
]

const ADVANCED_CATEGORIES: ReportCategory[] = [
  {
    label: 'Payroll Analytics',
    reports: [
      { id: 'payroll-cost-analysis', label: 'Payroll Cost Analysis', description: 'Trend of gross pay, employer contributions, and net pay by period.' },
      { id: 'payroll-trend-variance', label: 'Payroll Trend & Variance', description: 'Gross vs. net pay across every period, with variance.' },
      { id: 'payroll-cost-department', label: 'Payroll Cost by Department', description: 'Total payroll cost grouped by department.' },
      { id: 'payroll-cost-branch', label: 'Payroll Cost by Branch', description: 'Total payroll cost grouped by branch.' },
      { id: 'payroll-cost-group', label: 'Payroll Cost by Payroll Group', description: 'Total payroll cost grouped by Payroll Group.' },
    ],
  },
  {
    label: 'Workforce Analytics',
    reports: [
      { id: 'headcount-analysis', label: 'Headcount Analysis', description: 'Active vs. inactive headcount by department.' },
      { id: 'compensation-analysis', label: 'Compensation Analysis', description: 'Employee count and average rate by Pay Rate Type.' },
      { id: 'overtime-cost-analysis', label: 'Overtime Cost Analysis', description: 'Overtime hours and cost expenditure trend, month over month.' },
      { id: 'attendance-absenteeism', label: 'Attendance / Absenteeism Analysis', description: 'Present, late, undertime, and absence counts.' },
      { id: 'leave-utilization', label: 'Leave Utilization Analysis', description: 'Approved leave days taken, by leave type.' },
    ],
  },
  {
    label: 'Financial / Management',
    reports: [
      { id: 'labor-cost-analysis', label: 'Labor Cost Analysis', description: 'Gross pay plus employer contributions, per period.' },
      { id: 'earnings-vs-deductions', label: 'Earnings vs. Deductions Analysis', description: 'Total earnings against total deductions, per period.' },
      { id: 'employer-contribution-analysis', label: 'Employer Contribution Analysis', description: 'Employer-side statutory contributions, per period.' },
      { id: 'payroll-expense-by-account', label: 'Payroll Expense by Account & Cost Comparison', description: 'Expense accounts compared period over period.' },
    ],
  },
  {
    label: 'Custom Reports',
    reports: [
      { id: 'custom-report-builder', label: 'Custom Report Builder', description: 'Pick columns and filters, save as a template, and export.' },
    ],
  },
]

function renderBasicReport(id: string) {
  switch (id) {
    case 'employee-master-list':
      return <EmployeeMasterListReport />
    case 'employee-compensation':
      return <EmployeeCompensationReport />
    case 'pay-statutory-loans':
      return <PayStatutoryLoansReport />
    case 'payroll-register':
      return <PayrollRegisterReport />
    case 'payroll-summary':
      return <PayrollSummaryReport />
    case 'payroll-summary-per-employee':
      return <PayrollSummaryPerEmployeeReport />
    case 'payroll-history':
      return <PayrollHistoryReport />
    case 'bonus-report':
      return <BonusReport />
    case 'thirteenth-month-pay-report':
      return <ThirteenthMonthPayReport />
    case 'hours-worked':
      return <HoursWorkedReport />
    case 'output-summary':
      return <OutputSummaryReport />
    case 'late-absence':
      return <LateAbsenceReport />
    case 'payslip-report':
      return <PayslipReportView />
    case 'overtime-report':
      return <OvertimeReportView />
    case 'loans-deductions-report':
      return <LoansDeductionsReportView />
    case 'benefits-report':
      return <BenefitsReportView />
    case 'debit-credit':
      return <DebitCreditReport />
    case 'bir-2316':
      return <Bir2316Report />
    case 'bir-1601c':
      return <Bir1601CReport />
    case 'sss-contribution':
      return <StatutoryContributionReport type="sss" />
    case 'philhealth-contribution':
      return <StatutoryContributionReport type="philhealth" />
    case 'pagibig-contribution':
      return <StatutoryContributionReport type="pagibig" />
    case 'consolidated-statutory':
      return <ConsolidatedStatutoryReport />
    case 'tax-monitoring':
      return <TaxMonitoringReport />
    case 'taxable-compensation':
      return <TaxableCompensationReport />
    case 'thirteenth-month-benefits':
      return <ThirteenthMonthBenefitsReport />
    case 'de-minimis-benefits':
      return <DeMinimisBenefitsReport />
    case 'withholding-tax-summary':
      return <WithholdingTaxSummaryReport />
    default:
      return null
  }
}

function renderAdvancedReport(id: string) {
  switch (id) {
    case 'payroll-cost-analysis':
      return <PayrollCostAnalysisReport />
    case 'payroll-trend-variance':
      return <PayrollTrendReport />
    case 'payroll-cost-department':
      return <PayrollCostByDimensionReport dimension="department" />
    case 'payroll-cost-branch':
      return <PayrollCostByDimensionReport dimension="branch" />
    case 'payroll-cost-group':
      return <PayrollCostByDimensionReport dimension="group" />
    case 'headcount-analysis':
      return <HeadcountAnalysisReport />
    case 'compensation-analysis':
      return <CompensationAnalysisReport />
    case 'overtime-cost-analysis':
      return <OvertimeCostAnalysisReport />
    case 'attendance-absenteeism':
      return <AttendanceAbsenteeismReport />
    case 'leave-utilization':
      return <LeaveUtilizationReport />
    case 'labor-cost-analysis':
      return <LaborCostAnalysisReport />
    case 'earnings-vs-deductions':
      return <EarningsVsDeductionsReport />
    case 'employer-contribution-analysis':
      return <EmployerContributionAnalysisReport />
    case 'payroll-expense-by-account':
      return <PayrollExpenseByAccountReport />
    case 'custom-report-builder':
      return <CustomReportBuilder />
    default:
      return null
  }
}

/**
 * Three tiers: team reports (everyone with `reports.view` — a manager sees their own team's attendance, leave, overtime, hours and
 * output), workforce reports (`reports.workforce.view` — employee, benefits, statutory and tax reports), and everything else
 * (`reports.payroll.view` — payroll, accounting and cost reports).
 */
const TEAM_REPORT_IDS = new Set(['hours-worked', 'output-summary', 'overtime-report', 'attendance-absenteeism', 'late-absence', 'leave-utilization'])
const WORKFORCE_REPORT_IDS = new Set(['employee-master-list', 'employee-compensation', 'pay-statutory-loans', 'benefits-report', 'sss-contribution', 'philhealth-contribution', 'pagibig-contribution', 'consolidated-statutory', 'tax-monitoring', 'taxable-compensation', 'thirteenth-month-benefits', 'de-minimis-benefits', 'withholding-tax-summary', 'bir-1601c', 'bir-2316', 'headcount-analysis'])

type ReportTier = 'payroll' | 'workforce' | 'team'

function useReportTier(): ReportTier {
  const canPayroll = usePermission('reports.payroll.view')
  const canWorkforce = usePermission('reports.workforce.view')
  return canPayroll ? 'payroll' : canWorkforce ? 'workforce' : 'team'
}

function reportAllowed(id: string, tier: ReportTier) {
  return tier === 'payroll' || TEAM_REPORT_IDS.has(id) || (tier === 'workforce' && WORKFORCE_REPORT_IDS.has(id))
}

function visibleCategories(categories: ReportCategory[], tier: ReportTier): ReportCategory[] {
  if (tier === 'payroll') return categories
  const filtered = categories.map((c) => ({ ...c, reports: c.reports.filter((r) => reportAllowed(r.id, tier)) })).filter((c) => c.reports.length > 0)
  if (tier !== 'team') return filtered
  // A manager's reports are all about their team: fold the overtime report into Team Reports, without the payroll framing.
  const overtime = { id: 'overtime-report', label: 'Overtime Summary', description: 'Overtime and night differential hours per employee.' }
  return filtered
    .map((c) => ({ ...c, reports: c.reports.filter((r) => r.id !== 'overtime-report') }))
    .map((c) => (c.label === 'Team Reports' ? { ...c, reports: [...c.reports, overtime] } : c))
    .filter((c) => c.reports.length > 0)
}

export function ReportsPage() {
  const tier = useReportTier()
  const { tier: planTier } = useActivePlanTier()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'advanced' ? 'advanced' : 'basic'

  function onTabChange(tab: string) {
    setSearchParams(tab === 'advanced' ? { tab: 'advanced' } : {}, { replace: true })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={tier === 'team' ? 'Team Reports' : 'Reports'}
        description={tier === 'team' ? 'Attendance, leave, overtime, hours and output for your team.' : 'Basic payroll/employee reports and advanced analytics.'}
      />

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <Select className="-mb-2 lg:hidden" value={activeTab} onValueChange={onTabChange} aria-label="Reports section" options={[{ value: 'basic', label: 'Basic Reports' }, { value: 'advanced', label: 'Advanced Reports' }]} />
        <TabsList className="hidden lg:flex">
          <TabsTrigger value="basic">Basic Reports</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {visibleCategories(BASIC_CATEGORIES, tier).map((category) => (
            <ReportCategorySection key={category.label} category={category} tab="basic" />
          ))}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <PlanGate feature="advanced_reports" planTier={planTier}>
            {visibleCategories(ADVANCED_CATEGORIES, tier).map((category) => (
              <ReportCategorySection key={category.label} category={category} tab="advanced" />
            ))}
          </PlanGate>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ReportLookup {
  label: string
  description: string
  kind: 'basic' | 'advanced'
}

const REPORT_LOOKUP: Record<string, ReportLookup> = Object.fromEntries([
  ...BASIC_CATEGORIES.flatMap((c) => c.reports.map((r) => [r.id, { label: r.label, description: r.description, kind: 'basic' as const }])),
  ...ADVANCED_CATEGORIES.flatMap((c) => c.reports.map((r) => [r.id, { label: r.label, description: r.description, kind: 'advanced' as const }])),
])

export function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const [searchParams] = useSearchParams()
  const { tier: planTier } = useActivePlanTier()
  const tier = useReportTier()
  const meta = reportId && reportAllowed(reportId, tier) ? REPORT_LOOKUP[reportId] : undefined

  // The `?tab=` query param records which tab the user opened this report from, so the back
  // link restores it exactly — including after a full page reload. Fall back to the report's
  // own category (basic/advanced never overlap) if the param is missing or was tampered with.
  const originTab = searchParams.get('tab') === 'advanced' || searchParams.get('tab') === 'basic' ? searchParams.get('tab') : meta?.kind ?? 'basic'

  const content = useMemo(() => {
    if (!reportId || !meta) return null
    return meta.kind === 'basic' ? renderBasicReport(reportId) : renderAdvancedReport(reportId)
  }, [reportId, meta])

  return (
    <div className="space-y-5">
      <div className="print:hidden">
        <Link to={`/reports?tab=${originTab}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Back to Reports
        </Link>
      </div>

      {!meta || !content ? (
        <p className="text-sm text-muted-foreground">Report not found.</p>
      ) : (
        <>
          {meta.kind === 'advanced' ? (
            <PlanGate feature="advanced_reports" planTier={planTier}>
              {content}
            </PlanGate>
          ) : (
            content
          )}
        </>
      )}
    </div>
  )
}
