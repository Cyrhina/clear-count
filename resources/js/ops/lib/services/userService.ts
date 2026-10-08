import { db } from '@ops/mock-data'
import type { Role, SessionUser } from '@ops/types/domain'

function logActivity(session: SessionUser, action: string, kind: string, details?: string) {
  db.activityLog.unshift({
    id: crypto.randomUUID(),
    companyId: session.companyId,
    timestamp: new Date().toISOString(),
    actor: session.name,
    actorRole: session.role,
    action,
    details,
    module: 'User Access',
    kind,
    title: action,
  })
}

export async function getUsers(session: SessionUser): Promise<SessionUser[]> {
  return db.users.filter((u) => u.companyId === session.companyId)
}

export async function getActivityLog(session: SessionUser) {
  return db.activityLog.filter((a) => a.companyId === session.companyId)
}

export interface InviteUserInput {
  name: string
  email: string
  role: Role
}

export async function inviteUser(session: SessionUser, input: InviteUserInput): Promise<SessionUser> {
  const user: SessionUser = {
    id: crypto.randomUUID(),
    companyId: session.companyId,
    role: input.role,
    name: input.name,
    email: input.email,
    isActive: true,
  }
  db.users.push(user)
  logActivity(session, `Invited ${input.name} as ${input.role.replace('_', ' ')}`, 'Invited')
  return user
}

export async function updateUserRole(session: SessionUser, userId: string, role: Role): Promise<void> {
  const user = db.users.find((u) => u.id === userId && u.companyId === session.companyId)
  if (!user) return
  user.role = role
  logActivity(session, `Changed ${user.name}'s role to ${role.replace('_', ' ')}`, 'Updated')
}

export async function setUserActive(session: SessionUser, userId: string, isActive: boolean): Promise<void> {
  const user = db.users.find((u) => u.id === userId && u.companyId === session.companyId)
  if (!user || user.id === session.id || user.role === 'super_admin') return
  user.isActive = isActive
  logActivity(session, `${isActive ? 'Reactivated' : 'Deactivated'} ${user.name}`, isActive ? 'Reactivated' : 'Deactivated')
}

export async function setUserSuspended(session: SessionUser, userId: string, isSuspended: boolean): Promise<void> {
  const user = db.users.find((u) => u.id === userId && u.companyId === session.companyId)
  if (!user || user.id === session.id || user.role === 'super_admin') return
  user.isSuspended = isSuspended
  logActivity(session, `${isSuspended ? 'Suspended' : 'Lifted suspension of'} ${user.name}`, isSuspended ? 'Suspended' : 'Unsuspended')
}

/** Mock: records the reset; a real backend would email the user a one-time link. */
export async function resetUserPassword(session: SessionUser, userId: string): Promise<void> {
  const user = db.users.find((u) => u.id === userId && u.companyId === session.companyId)
  if (!user || user.role === 'super_admin') return
  user.passwordResetAt = new Date().toISOString()
  logActivity(session, `Reset password for ${user.name}`, 'Password reset', `A reset link was sent to ${user.email}.`)
}
