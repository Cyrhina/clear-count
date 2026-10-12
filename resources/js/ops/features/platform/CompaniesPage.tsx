import { Building2, Clock } from 'lucide-react'
import { useReducer, useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Dialog, DialogContent, DialogTitle } from '@ops/components/ui/Dialog'
import { useToast } from '@ops/components/ui/Toast'
import { PLAN_DETAILS } from '@ops/lib/plans'
import { confirmPlanChange, rejectPlanChange } from '@ops/lib/services/subscriptionService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import { db } from '@ops/mock-data'

export function CompaniesPage() {
  const { notify } = useToast()
  const [, refresh] = useReducer((n: number) => n + 1, 0)
  const [proofOf, setProofOf] = useState<string | null>(null)
  const pending = db.companies.filter((c) => c.pendingPlanChange)

  async function decide(companyId: string, approve: boolean) {
    await (approve ? confirmPlanChange(companyId) : rejectPlanChange(companyId))
    notify({ title: approve ? 'Payment confirmed — plan updated' : 'Upgrade request rejected', tone: approve ? 'success' : 'default' })
    refresh()
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Companies"
        description="Cross-tenant view for platform administration. Full SaaS super-admin tooling is treated as future scope."
      />

      {pending.length > 0 && (
        <Card className="p-5">
          <Card.Title>Upgrade payments to verify</Card.Title>
          <Card.Description>Check each payment against the QR account, then confirm. The company&apos;s plan only changes when you confirm.</Card.Description>
          <div className="mt-4 space-y-3">
            {pending.map((company) => {
              const change = company.pendingPlanChange!
              return (
                <div key={company.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <div className="min-w-0 text-sm">
                    <p className="flex items-center gap-2 font-medium">
                      <Clock className="size-3.5 text-warning" />
                      {company.name}: {PLAN_DETAILS[company.planTier].label} → {PLAN_DETAILS[change.targetTier].label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(change.amountPhp)} · note <span className="font-mono">{change.paymentReference}</span> · receipt <span className="font-mono">{change.receiptReference}</span> · {formatDate(change.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setProofOf(change.proofImage)} title="View proof of payment" className="overflow-hidden rounded-lg border border-border">
                      <img src={change.proofImage} alt="Proof of payment" className="size-10 object-cover" />
                    </button>
                    <Button size="sm" variant="secondary" onClick={() => decide(company.id, false)}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => decide(company.id, true)}>
                      Confirm Payment
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Dialog open={proofOf !== null} onOpenChange={(open) => !open && setProofOf(null)}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Proof of payment</DialogTitle>
          {proofOf && <img src={proofOf} alt="Proof of payment" className="mt-3 max-h-[70vh] w-full rounded-lg object-contain" />}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {db.companies.map((company) => (
          <Card key={company.id}>
            <Card.Header>
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                <Card.Title>{company.name}</Card.Title>
              </div>
              <Badge tone="brand" className="capitalize">
                {PLAN_DETAILS[company.planTier].label}
              </Badge>
            </Card.Header>
            <Card.Body className="space-y-1 pt-3 text-sm text-muted-foreground">
              <p>Payroll frequency: {company.payrollFrequency.replace('_', '-')}</p>
              <p>{db.employees.filter((e) => e.companyId === company.id).length} employees</p>
              {company.pendingPlanChange && <p className="text-warning">Upgrade to {PLAN_DETAILS[company.pendingPlanChange.targetTier].label} awaiting verification</p>}
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  )
}
