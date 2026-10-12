import { Check, Clock, Layers, Mail, UserPlus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { UpgradePaymentDialog } from '@ops/features/subscription/components/UpgradePaymentDialog'
import { useSubscriptionUsage } from '@ops/features/subscription/hooks/useSubscription'
import { useActivePlanTier } from '@ops/hooks/useActivePlanTier'
import { useSession } from '@ops/hooks/useSession'
import { useDemoPlanStore } from '@ops/lib/demo/demoPlanStore'
import { usePermission } from '@ops/hooks/usePermission'
import { PLAN_DETAILS, PLAN_ORDER, estimateMonthlyBill, formatEmployeeLimit, formatPlanBasePrice } from '@ops/lib/plans'
import { downgradePlan } from '@ops/lib/services/subscriptionService'
import { useToast } from '@ops/components/ui/Toast'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { PlanTier } from '@ops/types/domain'

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>
          {used} {limit !== null ? `/ ${limit}` : '(unlimited)'}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: limit ? `${pct}%` : '100%' }} />
      </div>
    </div>
  )
}

function DowngradeDialog({ targetPlan, onChanged }: { targetPlan: PlanTier; onChanged: () => void }) {
  const { user } = useSession()
  const { notify } = useToast()
  const setPreviewTier = useDemoPlanStore((s) => s.setPreviewTier)

  async function onConfirm() {
    await downgradePlan(user, targetPlan)
    setPreviewTier(null) // the real plan is now the target, so a preview of another tier would no longer match it
    notify({ title: `Downgraded to ${PLAN_DETAILS[targetPlan].label} Plan`, tone: 'success' })
    onChanged()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Downgrade Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Downgrade to {PLAN_DETAILS[targetPlan].label} Plan</DialogTitle>
        <DialogDescription>
          {formatPlanBasePrice(PLAN_DETAILS[targetPlan])} · {formatEmployeeLimit(targetPlan)} included. Modules that are not in this plan will be locked.
        </DialogDescription>
        <div className="mt-5 flex justify-end gap-2">
          <Button size="sm" onClick={onConfirm}>
            Confirm Downgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SubscriptionPage() {
  const { usage, isLoading, refetch } = useSubscriptionUsage()
  const { tier, isPreview } = useActivePlanTier() // follows the Demo Portal preview tier, so this page matches the sidebar
  const canManage = usePermission('subscription.manage')
  const [searchParams, setSearchParams] = useSearchParams()
  const [upgradeTarget, setUpgradeTarget] = useState<PlanTier | null>(null)
  const pending = usage?.pendingChange

  // The sidebar's "Upgrade to …" buttons arrive as /subscription?upgrade=<tier>: open the payment form for that tier.
  const requested = searchParams.get('upgrade') as PlanTier | null
  useEffect(() => {
    if (!requested || !usage || !canManage) return
    if (PLAN_ORDER.includes(requested) && requested !== 'enterprise' && !usage.pendingChange) setUpgradeTarget(requested)
    setSearchParams({}, { replace: true })
  }, [requested, usage, canManage, setSearchParams])

  if (isLoading || !usage) return <Skeleton className="h-96" />

  const currentPlan = PLAN_DETAILS[tier]
  const currentIndex = PLAN_ORDER.indexOf(tier)
  const bill = estimateMonthlyBill(tier, usage.employeeCount)

  return (
    <div className="space-y-6">
      <PageHeader title="Subscription & Plan Management" description="Current plan, usage, and available upgrades." />

      {pending && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <Clock className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            <p className="font-medium">Upgrade to {PLAN_DETAILS[pending.targetTier].label} is waiting for verification</p>
            <p className="text-xs text-muted-foreground">
              The FBS Pay billing team is checking your payment ({pending.paymentReference}, submitted {formatDate(pending.submittedAt)}). Your plan changes once they confirm it.
            </p>
          </div>
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <Badge tone="brand" className="mb-2">
              {isPreview ? 'Previewing Plan (Demo)' : 'Current Plan'}
            </Badge>
            <p className="font-display text-2xl font-semibold">{currentPlan.label}</p>
            <p className="text-sm text-muted-foreground">
              {formatPlanBasePrice(currentPlan)} · {formatEmployeeLimit(tier)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <p>
                Billing interval <span className="font-medium capitalize text-foreground">{usage.billingInterval}</span>
              </p>
              <p>
                Next renewal{' '}
                <span className="font-medium text-foreground">{usage.nextRenewalDate ? formatDate(usage.nextRenewalDate) : '—'}</span>
              </p>
            </div>
            <div className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
              {bill ? (
                <>
                  <p className="text-muted-foreground">Estimated monthly bill</p>
                  <p className="mt-0.5 font-display text-lg font-semibold text-foreground">{formatCurrency(bill.total)}</p>
                  <p className="text-muted-foreground">
                    Base {formatCurrency(bill.base)}
                    {bill.extraEmployees > 0
                      ? ` + ${bill.extraEmployees} additional employee(s) × ${formatCurrency(currentPlan.additionalEmployeePricePhp ?? 0)} = ${formatCurrency(bill.addOn)}`
                      : ` · ${usage.employeeCount} of ${currentPlan.employeeLimit} included employees used`}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Custom pricing — billed per your Enterprise agreement.</p>
              )}
            </div>
          </div>
          <div className="grid w-full max-w-sm gap-3 sm:w-72">
            <UsageBar label="Employees" used={usage.employeeCount} limit={currentPlan.employeeLimit} />
            <UsageBar label="Users" used={usage.userCount} limit={currentPlan.userLimit} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {PLAN_ORDER.map((planTier, idx) => {
          const details = PLAN_DETAILS[planTier]
          const isCurrent = planTier === tier
          return (
            <Card key={planTier} className={isCurrent ? 'flex flex-col border-primary/40 p-6' : 'flex flex-col p-6'}>
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-semibold">{details.label}</p>
                {isCurrent && <Badge tone="success">Current</Badge>}
              </div>
              <p className="mt-1 min-h-8 text-xs text-muted-foreground">{details.targetAudience}</p>

              <div className="mt-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{details.monthlyPricePhp !== null ? 'Base price' : 'Pricing'}</p>
                <p className="font-display text-2xl font-semibold tracking-tight">
                  {details.monthlyPricePhp !== null ? (
                    <>
                      {formatCurrency(details.monthlyPricePhp)}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </>
                  ) : (
                    'Custom Pricing'
                  )}
                </p>
                {/* Same height on every card so the limits boxes line up. */}
                <p className="min-h-8 text-xs text-muted-foreground">{details.monthlyPricePhp === null ? 'Depends on complexity' : ' '}</p>
              </div>

              <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs">
                <p className="flex items-center gap-2">
                  <Users className="size-3.5 shrink-0 text-primary" />
                  <span className="font-medium">{formatEmployeeLimit(planTier)}</span>
                </p>
                <p className="flex items-center gap-2">
                  <UserPlus className="size-3.5 shrink-0 text-primary" />
                  {details.additionalEmployeePricePhp !== null ? (
                    <span>
                      <span className="font-medium">{formatCurrency(details.additionalEmployeePricePhp)}</span>
                      <span className="text-muted-foreground">/month per additional employee</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Additional employees: custom pricing</span>
                  )}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="size-3.5 shrink-0 text-primary" />
                  {details.userLimit !== null ? `${details.userLimit} admin user seats` : 'Unlimited admin user seats'}
                </p>
              </div>

              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {details.includesTier && (
                  <li className="flex items-start gap-2 font-medium">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                    All {PLAN_DETAILS[details.includesTier].label} features
                  </li>
                )}
                {details.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {isCurrent ? (
                  <Button size="sm" variant="secondary" disabled>
                    Current Plan
                  </Button>
                ) : planTier === 'enterprise' ? (
                  <Button asChild size="sm" icon={<Mail className="size-3.5" />}>
                    <a href="mailto:sales@frontlinebusiness.com.ph?subject=Enterprise%20Plan%20Inquiry">Contact Sales</a>
                  </Button>
                ) : canManage ? (
                  idx > currentIndex ? (
                    <Button size="sm" disabled={!!pending} onClick={() => setUpgradeTarget(planTier)}>
                      {pending?.targetTier === planTier ? 'Pending verification' : 'Upgrade Plan'}
                    </Button>
                  ) : (
                    <DowngradeDialog targetPlan={planTier} onChanged={refetch} />
                  )
                ) : (
                  <Button size="sm" variant="secondary" disabled>
                    {idx < currentIndex ? 'Included' : 'Not available'}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <UpgradePaymentDialog targetPlan={upgradeTarget} onClose={() => setUpgradeTarget(null)} onSubmitted={refetch} />
    </div>
  )
}
