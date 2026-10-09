import { db } from '@ops/mock-data'
import type { SessionUser } from '@ops/types/domain'

/**
 * The mock account list, still used by the employee profile and the onboarding checklist.
 * The Users & Access Management screen no longer uses it: see `userAccessService.ts` (Laravel API).
 */
export async function getUsers(session: SessionUser): Promise<SessionUser[]> {
  return db.users.filter((u) => u.companyId === session.companyId)
}

/** Mock: records the reset; the real flow is `sendAccessPasswordReset` in `userAccessService.ts`. */
export async function resetUserPassword(session: SessionUser, userId: string): Promise<void> {
  const user = db.users.find((u) => u.id === userId && u.companyId === session.companyId)
  if (!user || user.role === 'super_admin') return
  user.passwordResetAt = new Date().toISOString()
  db.activityLog.unshift({
    id: crypto.randomUUID(),
    companyId: session.companyId,
    timestamp: new Date().toISOString(),
    actor: session.name,
    actorRole: session.role,
    action: `Reset password for ${user.name}`,
    details: `A reset link was sent to ${user.email}.`,
    module: 'User Access',
    kind: 'Password reset',
    title: `Reset password for ${user.name}`,
  })
}
