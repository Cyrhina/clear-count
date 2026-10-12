import { useSession } from '@ops/hooks/useSession'
import { useTenant } from '@ops/hooks/useTenant'
import { useDemoPlanStore } from '@ops/lib/demo/demoPlanStore'
import { useSubscriptionVersion } from '@ops/lib/services/subscriptionService'
import type { PlanTier } from '@ops/types/domain'

/** The plan tier that should currently gate modules — the company's real subscription tier, unless a Demo
 * Portal preview tier is active (see Topbar's tier switcher). The preview is a Company Admin view only:
 * every other role keeps seeing the company's real plan. */
export function useActivePlanTier(): { tier: PlanTier; isPreview: boolean } {
  const { user } = useSession()
  const { company } = useTenant()
  useSubscriptionVersion((s) => s.version) // re-render when the plan changes
  const previewTier = useDemoPlanStore((s) => s.previewTier)
  const realTier = company?.planTier ?? 'basic'

  return previewTier && user.role === 'company_admin' ? { tier: previewTier, isPreview: true } : { tier: realTier, isPreview: false }
}
