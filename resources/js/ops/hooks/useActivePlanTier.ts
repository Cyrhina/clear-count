import { useTenant } from '@ops/hooks/useTenant'
import { useDemoPlanStore } from '@ops/lib/demo/demoPlanStore'
import type { PlanTier } from '@ops/types/domain'

/** The plan tier that should currently gate the Sidebar's modules — the company's real
 * subscription tier, unless a Demo Portal preview tier is active (see Topbar's tier switcher). */
export function useActivePlanTier(): { tier: PlanTier; isPreview: boolean } {
  const { company } = useTenant()
  const previewTier = useDemoPlanStore((s) => s.previewTier)
  const realTier = company?.planTier ?? 'basic'

  return previewTier ? { tier: previewTier, isPreview: true } : { tier: realTier, isPreview: false }
}
