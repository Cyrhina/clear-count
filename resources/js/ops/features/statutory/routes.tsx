import { PageHeader } from '@ops/components/layout/PageHeader'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { EmployeeContributionsTable } from '@ops/features/statutory/components/EmployeeContributionsTable'
import { PagibigCard } from '@ops/features/statutory/components/PagibigCard'
import { SssBracketCard } from '@ops/features/statutory/components/SssBracketCard'
import { PhilhealthCard } from '@ops/features/statutory/components/PhilhealthCard'
import { WithholdingTaxCard } from '@ops/features/statutory/components/WithholdingTaxCard'
import { useStatutoryConfig } from '@ops/features/statutory/hooks/useStatutoryConfig'
import { usePermission } from '@ops/hooks/usePermission'

export function StatutoryPage() {
  const { config, isLoading, refetch } = useStatutoryConfig()
  const canEdit = usePermission('statutory.edit')

  if (isLoading || !config) return <Skeleton className="h-96" />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Statutory Contributions"
        description="Configurable SSS, PhilHealth, Pag-IBIG, and withholding-tax rules — not hard-coded, since contribution rules change periodically."
      />

      <Tabs defaultValue="contributions">
        <TabsList>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="withholding-tax">Withholding Tax</TabsTrigger>
          <TabsTrigger value="employees">Employee Contributions</TabsTrigger>
        </TabsList>

        <TabsContent value="contributions" className="space-y-5">
          <SssBracketCard config={config} canEdit={canEdit} onSaved={refetch} />
          <PhilhealthCard config={config} canEdit={canEdit} onSaved={refetch} />
          <PagibigCard config={config} canEdit={canEdit} onSaved={refetch} />
        </TabsContent>

        <TabsContent value="withholding-tax">
          <WithholdingTaxCard config={config} canEdit={canEdit} onSaved={refetch} />
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeContributionsTable config={config} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
