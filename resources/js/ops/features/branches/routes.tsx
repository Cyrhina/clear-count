import { Building2, Eye } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { AddBranchDialog } from '@ops/features/branches/components/AddBranchDialog'
import { BranchDetailsDialog } from '@ops/features/branches/components/BranchDetailsDialog'
import { useBranches, useBranchSummaries, useDepartments } from '@ops/features/branches/hooks/useBranches'
import type { BranchRecord } from '@ops/features/branches/types'
import { usePermission } from '@ops/hooks/usePermission'
import { formatCurrency } from '@ops/lib/utils/format'

function BranchCard({ branch, departmentCount, onView }: { branch: BranchRecord; departmentCount: number; onView: () => void }) {
  return (
    <Card className="flex flex-col">
      <Card.Header className="items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 shrink-0 text-muted-foreground" />
            <Card.Title className="truncate">{branch.name}</Card.Title>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">{[branch.code, branch.city].filter(Boolean).join(' · ') || 'No location details yet'}</p>
        </div>
        {branch.isHeadOffice && (
          <Badge tone="brand" className="shrink-0 whitespace-nowrap">
            Head Office
          </Badge>
        )}
      </Card.Header>

      <Card.Body className="flex flex-1 flex-col justify-between gap-3 pt-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{branch.headcount}</span> employees · {branch.activeCount} active · {departmentCount} department{departmentCount === 1 ? '' : 's'}
        </p>
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" icon={<Eye className="size-3.5" />} onClick={onView}>
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

/** Branches with their headcount and departments. Assigning employees to a branch comes with the Employees module (P3). */
function BranchesTab() {
  const canManage = usePermission('branches.manage')
  const { branches, isLoading, refetch } = useBranches()
  const { departments } = useDepartments()
  const [viewingId, setViewingId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {branches.length} branch{branches.length === 1 ? '' : 'es'} · {branches.reduce((sum, b) => sum + b.headcount, 0)} employees
        </p>
        {canManage && <AddBranchDialog branches={branches} onCreated={refetch} />}
      </div>

      {isLoading ? (
        <Skeleton className="h-56" />
      ) : branches.length === 0 ? (
        <EmptyState title="No branches yet" description="Add a branch to start organising employees by location." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} departmentCount={departments.filter((d) => d.branchId === branch.id).length} onView={() => setViewingId(branch.id)} />
          ))}
        </div>
      )}

      <BranchDetailsDialog branch={branches.find((b) => b.id === viewingId) ?? null} branches={branches} allDepartments={departments} canManage={canManage} onClose={() => setViewingId(null)} onChanged={refetch} />
    </div>
  )
}

function ConsolidatedReportTab() {
  const { summaries, isLoading } = useBranchSummaries()

  if (isLoading) return <Skeleton className="h-72" />
  if (summaries.length === 0) return <EmptyState title="No branches yet" />

  const pay = (value?: number) => (value === undefined ? '—' : formatCurrency(value))

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Branch</TableHead>
            <TableHead>Headcount</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Gross Pay (Latest Period)</TableHead>
            <TableHead>Net Pay (Latest Period)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaries.map(({ branch, headcount, activeCount, grossPay, netPay }) => (
            <TableRow key={branch.id}>
              <TableCell className="font-medium">
                {branch.name}
                {branch.isHeadOffice && (
                  <Badge tone="brand" className="ml-2">
                    HQ
                  </Badge>
                )}
              </TableCell>
              <TableCell>{headcount}</TableCell>
              <TableCell>{activeCount}</TableCell>
              <TableCell>{pay(grossPay)}</TableCell>
              <TableCell>{pay(netPay)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">Pay totals appear once payroll runs are processed.</p>
    </div>
  )
}

export function BranchesPage() {
  const [tab, setTab] = useState('branches')
  return (
    <div className="space-y-5">
      <PageHeader title="Multi-Branch Management" description="Branches with their headcount and departments, and consolidated cross-branch reporting." />

      <Tabs value={tab} onValueChange={setTab}>
        <Select className="-mb-2 lg:hidden" value={tab} onValueChange={setTab} aria-label="Branches section" options={[{ value: 'branches', label: 'Branches' }, { value: 'report', label: 'Consolidated Report' }]} />
        <TabsList className="hidden lg:flex">
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="report">Consolidated Report</TabsTrigger>
        </TabsList>

        <TabsContent value="branches">
          <BranchesTab />
        </TabsContent>
        <TabsContent value="report">
          <ConsolidatedReportTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
