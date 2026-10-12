import { usePage } from '@inertiajs/react'
import { useMemo } from 'react'
import type { Capability } from '@ops/lib/rbac/permissions'

/** The signed-in user's capabilities as the server granted them (Spatie permissions shared through Inertia `auth.permissions`). */
export function useCapabilities(): (capability: Capability) => boolean {
  const permissions = usePage<{ auth: { permissions?: string[] } }>().props.auth?.permissions
  const granted = useMemo(() => new Set(permissions ?? []), [permissions])
  return (capability) => granted.has(capability)
}
