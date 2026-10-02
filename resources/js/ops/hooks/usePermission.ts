import { useSession } from '@ops/hooks/useSession'
import type { Capability } from '@ops/lib/rbac/permissions'
import { roleHasCapability } from '@ops/lib/rbac/permissions'

export function usePermission(capability: Capability): boolean {
  const { user } = useSession()
  return roleHasCapability(user.role, capability)
}
