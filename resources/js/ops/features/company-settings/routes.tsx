import { useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Select } from '@ops/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { HolidaysTab } from '@ops/features/company-settings/components/HolidaysTab'
import { CompanyInfoForm } from '@ops/features/company-settings/components/CompanyInfoForm'
import { ComplianceDeadlinesSection } from '@ops/features/company-settings/components/payroll/ComplianceDeadlinesSection'
import { DeductionsSection } from '@ops/features/company-settings/components/payroll/DeductionsSection'
import { EarningsSection } from '@ops/features/company-settings/components/payroll/EarningsSection'
import { PayrollCalendarSection } from '@ops/features/company-settings/components/payroll/PayrollCalendarSection'
import { OvertimeHolidayRatesSection } from '@ops/features/company-settings/components/payroll/OvertimeHolidayRatesSection'
import { LatePolicySection } from '@ops/features/company-settings/components/payroll/LatePolicySection'
import { PayrollGroupsSection } from '@ops/features/company-settings/components/payroll/PayrollGroupsSection'
import { PayrollRulesSection } from '@ops/features/company-settings/components/payroll/PayrollRulesSection'
import { WorkSchedulesSection } from '@ops/features/company-settings/components/payroll/WorkSchedulesSection'
import { useCompanySettings } from '@ops/features/company-settings/hooks/useCompanySettings'
import { PlanGate } from '@ops/components/ui/PlanGate'
import { useActivePlanTier } from '@ops/hooks/useActivePlanTier'
import { usePermission } from '@ops/hooks/usePermission'

export function CompanySettingsPage() {
  const {
    company,
    schedules,
    payrollGroups,
    compensationTypes,
    earningConfigs,
    deductionConfigs,
    payrollRules,
    rates,
    isLoading,
    error,
    refetch,
    complianceDeadlines,
  } = useCompanySettings()
  const { tier: planTier } = useActivePlanTier()
  const [tab, setTab] = useState('company')
  const [payrollTab, setPayrollTab] = useState('groups')
  const canEditCompany = usePermission('settings.company.edit')
  const canEditPayroll = usePermission('settings.payroll.edit')

  if (error) return <EmptyState title="Could not load the settings" description={error} />
  if (isLoading || !company) return <Skeleton className="h-96" />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Company & Payroll Settings"
        description="Company profile, payroll structure, and holidays for your organization."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <Select className="-mb-2 lg:hidden" value={tab} onValueChange={setTab} aria-label="Settings section" options={[{ value: 'company', label: 'Company Info' }, { value: 'payroll-settings', label: 'Payroll Settings' }, { value: 'holidays', label: 'Holidays' }]} />
        <TabsList className="hidden lg:flex">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="payroll-settings">Payroll Settings</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <CompanyInfoForm company={company} canEdit={canEditCompany} onSaved={refetch} />
        </TabsContent>

        <TabsContent value="payroll-settings">
          <Tabs value={payrollTab} onValueChange={setPayrollTab}>
            <Select className="-mb-2 lg:hidden" value={payrollTab} onValueChange={setPayrollTab} aria-label="Payroll settings section" options={[{ value: 'groups', label: 'Payroll Groups' }, { value: 'earnings', label: 'Earnings' }, { value: 'deductions', label: 'Deductions' }, { value: 'rules', label: 'Payroll Rules' }, { value: 'late-policy', label: 'Late Policy' }, { value: 'ot-holiday-rates', label: 'Overtime & Holiday Rates' }, { value: 'schedules', label: 'Work Schedules' }, { value: 'calendar', label: 'Payroll Calendar' }]} />
            <TabsList className="hidden lg:flex">
              <TabsTrigger value="groups">Payroll Groups</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="deductions">Deductions</TabsTrigger>
              <TabsTrigger value="rules">Payroll Rules</TabsTrigger>
              <TabsTrigger value="late-policy">Late Policy</TabsTrigger>
              <TabsTrigger value="ot-holiday-rates">Overtime &amp; Holiday Rates</TabsTrigger>
              <TabsTrigger value="schedules">Work Schedules</TabsTrigger>
              <TabsTrigger value="calendar">Payroll Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="groups">
              <PlanGate feature="flexible_compensation" planTier={planTier}>
                <PayrollGroupsSection
                  groups={payrollGroups}
                  deductionDefaults={payrollRules?.defaultDeductionSchedules}
                  compensationTypes={compensationTypes}
                  schedules={schedules}
                  canEdit={canEditPayroll}
                  onRefetch={refetch}
                />
              </PlanGate>
            </TabsContent>

            <TabsContent value="earnings">
              <EarningsSection earnings={earningConfigs} canEdit={canEditPayroll} onRefetch={refetch} />
            </TabsContent>

            <TabsContent value="deductions">
              <DeductionsSection deductions={deductionConfigs} canEdit={canEditPayroll} onRefetch={refetch} />
            </TabsContent>

            <TabsContent value="rules">
              <PayrollRulesSection rules={payrollRules} canEdit={canEditPayroll} onRefetch={refetch} />
            </TabsContent>

            <TabsContent value="late-policy">
              <LatePolicySection rules={payrollRules} canEdit={canEditPayroll} onRefetch={refetch} />
            </TabsContent>

            <TabsContent value="ot-holiday-rates">
              <OvertimeHolidayRatesSection rules={payrollRules} rates={rates} canEdit={canEditPayroll} onRefetch={refetch} />
            </TabsContent>

            <TabsContent value="schedules">
              <WorkSchedulesSection schedules={schedules} canEdit={canEditPayroll} onRefetch={refetch} />
            </TabsContent>

            <TabsContent value="calendar">
              <PayrollCalendarSection groups={payrollGroups} />
              <ComplianceDeadlinesSection deadlines={complianceDeadlines} canEdit={canEditPayroll} onRefetch={refetch} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="holidays">
          <HolidaysTab canEdit={canEditCompany} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
