import { useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { EmployeeContributionsTable } from '@ops/features/statutory/components/EmployeeContributionsTable'
import { PagibigCard } from '@ops/features/statutory/components/PagibigCard'
import { SssBracketCard } from '@ops/features/statutory/components/SssBracketCard'
import { PhilhealthCard } from '@ops/features/statutory/components/PhilhealthCard'
import { WithholdingTaxCard } from '@ops/features/statutory/components/WithholdingTaxCard'
import { useStatutoryConfig } from '@ops/features/statutory/hooks/useStatutoryConfig'
import { usePermission } from '@ops/hooks/usePermission'

const TAB_OPTIONS = [
  { value: 'contributions', label: 'Contributions' },
  { value: 'withholding-tax', label: 'Withholding Tax' },
  { value: 'employees', label: 'Employee Contributions' },
]

export function StatutoryPage() {
  const [tab, setTab] = useState('contributions')
  const { config, isLoading, refetch } = useStatutoryConfig()
  const canEdit = usePermission('statutory.edit')

  if (isLoading || !config) return <Skeleton className="h-96" />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Statutory Contributions"
        description="Configurable SSS, PhilHealth, Pag-IBIG, and withholding-tax rules — not hard-coded, since contribution rules change periodically."
      />

      <Tabs value={tab} onValueChange={setTab}>
        {/* Phones and tablets: a dropdown instead of a row of tabs. */}
        <Select className="lg:hidden" value={tab} onValueChange={setTab} aria-label="Statutory section" options={TAB_OPTIONS} />
        <TabsList className="hidden lg:flex">
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="withholding-tax">Withholding Tax</TabsTrigger>
          <TabsTrigger value="employees">Employee Contributions</TabsTrigger>
        </TabsList>

        <TabsContent value="contributions" className="space-y-5 pt-4 lg:pt-6">
          <SssBracketCard config={config} canEdit={canEdit} onSaved={refetch} />
          <PhilhealthCard config={config} canEdit={canEdit} onSaved={refetch} />
          <PagibigCard config={config} canEdit={canEdit} onSaved={refetch} />
        </TabsContent>

        <TabsContent value="withholding-tax" className="pt-4 lg:pt-6">
          <WithholdingTaxCard config={config} canEdit={canEdit} onSaved={refetch} />
        </TabsContent>

        <TabsContent value="employees" className="pt-4 lg:pt-6">
          <EmployeeContributionsTable config={config} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
