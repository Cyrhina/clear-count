import { useCapabilities } from '@ops/hooks/useCapabilities'
import type { Capability } from '@ops/lib/rbac/permissions'

export function usePermission(capability: Capability): boolean {
  return useCapabilities()(capability)
}
