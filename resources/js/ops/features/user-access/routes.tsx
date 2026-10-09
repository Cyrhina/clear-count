import { CirclePause, Eye, KeyRound, MailPlus, UserCheck, UserX, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { StatusBadge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { Tooltip } from '@ops/components/ui/Tooltip'
import { useToast } from '@ops/components/ui/Toast'
import { ActivityLogPanel } from '@ops/features/user-access/components/ActivityLogPanel'
import { InviteUserDialog } from '@ops/features/user-access/components/InviteUserDialog'
import { RolePermissionsDialog } from '@ops/features/user-access/components/RolePermissionsDialog'
import { useAccessUsers, usePermissionRoles } from '@ops/features/user-access/hooks/useUsers'
import { apiErrorMessage } from '@ops/lib/api/http'
import { changeAccessUserRole, resendAccessInvite, sendAccessPasswordReset, setAccessUserActive, type AccessUser } from '@ops/lib/services/userAccessService'
import type { Role } from '@ops/types/domain'

const ROLE_OPTIONS = [
  { value: 'company_admin', label: 'Company Admin' },
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'payroll_admin', label: 'Payroll Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
]

type UserAction = 'deactivate' | 'reactivate' | 'reset' | 'resend'

const ACTION_COPY: Record<UserAction, { title: string; body: string; confirm: string; done: string }> = {
  deactivate: {
    title: 'Deactivate user?',
    body: 'they lose access to the system and cannot sign in. You can reactivate the account later.',
    confirm: 'Deactivate',
    done: 'User deactivated',
  },
  reactivate: {
    title: 'Reactivate user?',
    body: 'they get their access back.',
    confirm: 'Reactivate',
    done: 'User reactivated',
  },
  reset: {
    title: 'Reset password?',
    body: 'a password reset link is sent to their email.',
    confirm: 'Send reset link',
    done: 'Password reset sent',
  },
  resend: {
    title: 'Resend invite?',
    body: 'a new invitation email is sent. Earlier invite links stop working.',
    confirm: 'Resend invite',
    done: 'Invite sent again',
  },
}

function ActionIcon({ label, icon: Icon, onClick }: { label: string; icon: LucideIcon; onClick: () => void }) {
  return (
    <Tooltip label={label}>
      <Button type="button" size="sm" variant="secondary" aria-label={label} onClick={onClick} className="w-8 px-0">
        <Icon className="size-4" />
      </Button>
    </Tooltip>
  )
}

const statusOf = (u: AccessUser) => (u.status === 'inactive' ? 'inactive' : u.invitePending ? 'pending' : 'active')

function UsersTab() {
  const { users, isLoading, error, refetch } = useAccessUsers()
  const { notify } = useToast()
  const [pending, setPending] = useState<{ user: AccessUser; action: UserAction } | null>(null)
  const [busy, setBusy] = useState(false)

  async function changeRole(user: AccessUser, role: string) {
    try {
      await changeAccessUserRole(user.id, role as Role)
      notify({ title: 'Role updated', description: `${user.name} is now ${ROLE_OPTIONS.find((o) => o.value === role)?.label}.`, tone: 'success' })
    } catch (e) {
      notify({ title: 'Could not change the role', description: apiErrorMessage(e), tone: 'danger' })
    }
    refetch()
  }

  async function confirmAction() {
    if (!pending) return
    const { user, action } = pending
    setBusy(true)
    try {
      if (action === 'deactivate') await setAccessUserActive(user.id, false)
      else if (action === 'reactivate') await setAccessUserActive(user.id, true)
      else if (action === 'resend') await resendAccessInvite(user.id)
      else await sendAccessPasswordReset(user.id)
      notify({
        title: ACTION_COPY[action].done,
        description: action === 'reset' || action === 'resend' ? `An email was sent to ${user.email}.` : user.name,
        tone: 'success',
      })
    } catch (e) {
      notify({ title: 'That did not work', description: apiErrorMessage(e), tone: 'danger' })
    }
    setBusy(false)
    setPending(null)
    refetch()
  }

  const renderRole = (u: AccessUser) =>
    u.can.updateRole ? (
      <Select value={u.role} onValueChange={(value) => changeRole(u, value)} options={ROLE_OPTIONS} aria-label={`Role of ${u.name}`} />
    ) : (
      <span className="text-sm font-medium">{u.roleLabel}</span>
    )

  const renderActions = (u: AccessUser) => {
    if (u.isCurrentUser) return <span className="text-xs text-muted-foreground">You</span>
    const active = u.status === 'active'
    const show = (action: UserAction) => setPending({ user: u, action })
    if (!u.can.toggleStatus && !u.can.resendInvite) return <span className="text-xs text-muted-foreground">—</span>

    return (
      <div className="flex justify-end gap-1.5">
        {active && u.invitePending && u.can.resendInvite && <ActionIcon label="Resend invite" icon={MailPlus} onClick={() => show('resend')} />}
        {active && !u.invitePending && u.can.resendInvite && <ActionIcon label="Reset password" icon={KeyRound} onClick={() => show('reset')} />}
        {u.can.toggleStatus && <ActionIcon label={active ? 'Deactivate' : 'Reactivate'} icon={active ? UserX : UserCheck} onClick={() => show(active ? 'deactivate' : 'reactivate')} />}
      </div>
    )
  }

  if (isLoading) return <Skeleton className="h-72" />
  if (error) return <EmptyState icon={CirclePause} title="Could not load users" description={error} />

  return (
    <>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:hidden">
        {users.map((u) => (
          <div key={u.id} className="space-y-3 rounded-xl border border-border bg-card p-3.5 shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
              <StatusBadge status={statusOf(u)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">{renderRole(u)}</div>
              {renderActions(u)}
            </div>
          </div>
        ))}
      </div>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </TableCell>
                <TableCell className="w-48">{renderRole(u)}</TableCell>
                <TableCell>
                  <StatusBadge status={statusOf(u)} />
                </TableCell>
                <TableCell>{renderActions(u)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent className="max-w-md">
          {pending && (
            <>
              <DialogTitle>{ACTION_COPY[pending.action].title}</DialogTitle>
              <DialogDescription>
                {pending.user.name} ({pending.user.email}) — {ACTION_COPY[pending.action].body}
              </DialogDescription>
              <div className="mt-5 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setPending(null)}>
                  Cancel
                </Button>
                <Button type="button" variant={pending.action === 'deactivate' ? 'destructive' : undefined} onClick={confirmAction} isLoading={busy}>
                  {ACTION_COPY[pending.action].confirm}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function PermissionsTab() {
  const { roles, isLoading, error } = usePermissionRoles()
  const [viewing, setViewing] = useState<{ id: number; name: string } | null>(null)

  if (isLoading) return <Skeleton className="h-72" />
  if (error) return <EmptyState icon={CirclePause} title="Could not load the permission map" description={error} />

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => {
          const capabilities = Object.values(role.capabilitiesByArea).flat()
          return (
            <Card key={role.id} className="flex flex-col p-5">
              <p className="mb-1 font-display text-sm font-semibold tracking-tight">{role.name}</p>
              <p className="mb-2 text-xs text-muted-foreground">{role.description}</p>
              <p className="mb-3 text-xs text-muted-foreground">
                {role.capabilitiesCount} capabilities · {role.areasCount} areas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {capabilities.slice(0, 8).map((cap) => (
                  <span key={cap} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {cap}
                  </span>
                ))}
                {capabilities.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setViewing({ id: role.id, name: role.name })}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    +{capabilities.length - 8} more
                  </button>
                )}
              </div>
              <div className="mt-auto flex justify-end pt-4">
                <Button size="sm" variant="secondary" icon={<Eye className="size-3.5" />} onClick={() => setViewing({ id: role.id, name: role.name })}>
                  View Details
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <RolePermissionsDialog roleId={viewing?.id ?? null} roleLabel={viewing?.name ?? ''} onClose={() => setViewing(null)} />
    </>
  )
}

const TAB_VALUES = ['users', 'permissions', 'activity']

export function UserAccessPage() {
  const [inviteCount, setInviteCount] = useState(0)
  // Dashboard shortcuts open a specific tab with ?tab=permissions / ?tab=activity.
  const [tab, setTab] = useState(() => {
    const tab = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('tab')
    return tab && TAB_VALUES.includes(tab) ? tab : 'users'
  })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users & Access Management"
        description="Manage who can sign in, what they can do, and track important account changes."
        actions={<InviteUserDialog onCreated={() => setInviteCount((n) => n + 1)} />}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <Select className="-mb-2 lg:hidden" value={tab} onValueChange={setTab} aria-label="Users & access section" options={[{ value: 'users', label: 'Users' }, { value: 'permissions', label: 'Permission Map' }, { value: 'activity', label: 'Activity Log' }]} />
        <TabsList className="hidden lg:flex">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Permission Map</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          {/* Remounting after an invite reloads the list without sharing state between the header button and the tab. */}
          <UsersTab key={inviteCount} />
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsTab />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityLogPanel key={inviteCount} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
