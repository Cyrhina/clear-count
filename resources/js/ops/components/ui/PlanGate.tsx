import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@ops/components/ui/Button'
import { usePermission } from '@ops/hooks/usePermission'
import { FEATURE_LABELS, PLAN_DETAILS, minimumPlanFor, planHasFeature, type PlanFeature } from '@ops/lib/plans'
import type { PlanTier } from '@ops/types/domain'

export interface PlanGateProps {
  feature: PlanFeature
  planTier: PlanTier
  children: React.ReactNode
}

/**
 * Doc-mandated UI pattern: never just hide a feature above the current plan —
 * show what it is and where to upgrade, instead of an empty/missing screen.
 */
export function PlanGate({ feature, planTier, children }: PlanGateProps) {
  const canManagePlan = usePermission('subscription.manage')
  if (planHasFeature(planTier, feature)) return <>{children}</>

  const requiredPlan = minimumPlanFor(feature)

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Lock className="size-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">{FEATURE_LABELS[feature]}</p>
        <p className="text-xs text-muted-foreground">Available in {PLAN_DETAILS[requiredPlan].label} Plan</p>
      </div>
      {canManagePlan ? (
        <Button asChild size="sm">
          <Link to="/subscription">Upgrade Plan</Link>
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">Ask your Company Admin to upgrade the plan.</p>
      )}
    </div>
  )
}
