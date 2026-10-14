import { usePage } from '@inertiajs/react'
import type { PlanTier } from '@ops/types/domain'

/**
 * The plan tier that gates modules: the signed-in company's real plan, from the Inertia props (so it is known on the first
 * render and follows `router.reload({ only: ['auth'] })` after a plan change). The super admin has no company and sees everything.
 */
export function useActivePlanTier(): { tier: PlanTier } {
  const company = usePage<{ auth: { company?: { plan_tier: PlanTier } | null } }>().props.auth.company
  return { tier: company?.plan_tier ?? 'enterprise' }
}
