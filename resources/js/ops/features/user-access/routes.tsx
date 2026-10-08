import { CirclePause, CirclePlay, Eye, KeyRound, UserCheck, UserX, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { StatusBadge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { Tooltip } from '@ops/components/ui/Tooltip'
import { useToast } from '@ops/components/ui/Toast'
import { ActivityLogPanel } from '@ops/features/user-access/components/ActivityLogPanel'
import { InviteUserDialog } from '@ops/features/user-access/components/InviteUserDialog'
import { RolePermissionsDialog } from '@ops/features/user-access/components/RolePermissionsDialog'
import { useUsers } from '@ops/features/user-access/hooks/useUsers'
import { ROLE_DESCRIPTION, groupCapabilities } from '@ops/features/user-access/permissionCatalog'
import { useSession } from '@ops/hooks/useSession'
import { ROLE_PERMISSIONS, type Capability } from '@ops/lib/rbac/permissions'
import { resetUserPassword, setUserActive, setUserSuspended, updateUserRole } from '@ops/lib/services/userService'
import type { Role, SessionUser } from '@ops/types/domain'

const ROLE_OPTIONS = [
  { value: 'company_admin', label: 'Company Admin' },
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'payroll_admin', label: 'Payroll Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
]

const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  company_admin: 'Company Admin',
  hr_admin: 'HR Admin',
  payroll_admin: 'Payroll Admin',
  manager: 'Manager',
  employee: 'Employee',
}

type UserAction = 'suspend' | 'unsuspend' | 'deactivate' | 'reactivate' | 'reset'

const ACTION_COPY: Record<UserAction, { title: string; body: string; confirm: string; done: string }> = {
  suspend: {
    title: 'Suspend user?',
    body: 'they cannot sign in until the suspension is lifted. Their data and role are kept.',
    confirm: 'Suspend',
    done: 'User suspended',
  },
  unsuspend: {
    title: 'Lift suspension?',
    body: 'they can sign in again.',
    confirm: 'Unsuspend',
    done: 'Suspension lifted',
  },
  deactivate: {
    title: 'Deactivate user?',
    body: 'they lose access to the system. You can reactivate the account later.',
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
    body: 'a reset link is sent to their email, and they must choose a new password at next sign-in.',
    confirm: 'Send reset link',
    done: 'Password reset sent',
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

function UsersTab() {
  const { users, isLoading, refetch } = useUsers()
  const { user: session } = useSession()
  const { notify } = useToast()

  async function changeRole(userId: string, role: string) {
    await updateUserRole(session, userId, role as Role)
    notify({ title: 'Role updated', tone: 'success' })
    refetch()
  }

  const [pending, setPending] = useState<{
    user: SessionUser
    action: UserAction
  } | null>(null)
  const [busy, setBusy] = useState(false)

  async function confirmAction() {
    if (!pending) return
    const { user, action } = pending
    setBusy(true)
    if (action === 'deactivate') await setUserActive(session, user.id, false)
    else if (action === 'reactivate') await setUserActive(session, user.id, true)
    else if (action === 'suspend') await setUserSuspended(session, user.id, true)
    else if (action === 'unsuspend') await setUserSuspended(session, user.id, false)
    else await resetUserPassword(session, user.id)
    setBusy(false)
    notify({
      title: ACTION_COPY[action].done,
      description: action === 'reset' ? `A reset link was sent to ${user.email}.` : user.name,
      tone: 'success',
    })
    setPending(null)
    refetch()
  }

  const renderRole = (u: SessionUser) => (
    <>
        {u.role === 'super_admin' ? (
          <span className="text-sm font-medium">{ROLE_LABELS.super_admin}</span>
        ) : (
          <Select value={u.role} onValueChange={(value) => changeRole(u.id, value)} options={ROLE_OPTIONS} />
        )}
    </>
  )

  const renderActions = (u: SessionUser) => (
    <>
        {u.id === session.id || u.role === 'super_admin' ? (
          <span className="text-xs text-muted-foreground">{u.id === session.id ? 'You' : '—'}</span>
        ) : (
          <div className="flex justify-end gap-1.5">
            {u.isActive !== false && (
              <ActionIcon
                label={u.isSuspended ? 'Unsuspend' : 'Suspend'}
                icon={u.isSuspended ? CirclePlay : CirclePause}
                onClick={() =>
                  setPending({
                    user: u,
                    action: u.isSuspended ? 'unsuspend' : 'suspend',
                  })
                }
              />
            )}
            {u.isActive !== false && (
              <ActionIcon
                label="Reset password"
                icon={KeyRound}
                onClick={() =>
                  setPending({
                    user: u,
                    action: 'reset',
                  })
                }
              />
            )}
            <ActionIcon
              label={u.isActive === false ? 'Reactivate' : 'Deactivate'}
              icon={u.isActive === false ? UserCheck : UserX}
              onClick={() =>
                setPending({
                  user: u,
                  action: u.isActive === false ? 'reactivate' : 'deactivate',
                })
              }
            />
          </div>
        )}
    </>
  )

  if (isLoading) return <Skeleton className="h-72" />

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
              <StatusBadge status={u.isActive === false ? 'inactive' : u.isSuspended ? 'suspended' : 'active'} />
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
              <TableCell className="w-48">
                {renderRole(u)}
              </TableCell>
              <TableCell>
                <StatusBadge status={u.isActive === false ? 'inactive' : u.isSuspended ? 'suspended' : 'active'} />
              </TableCell>
              <TableCell>
                {renderActions(u)}
              </TableCell>
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
                <Button type="button" variant={pending.action === 'deactivate' || pending.action === 'suspend' ? 'destructive' : undefined} onClick={confirmAction} isLoading={busy}>
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
  const [viewingRole, setViewingRole] = useState<Role | null>(null)

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(ROLE_PERMISSIONS) as [Role, Capability[]][]).map(([role, capabilities]) => {
          const coveredGroups = groupCapabilities(capabilities).filter((g) => g.granted.length > 0).length
          return (
            <Card key={role} className="flex flex-col p-5">
              <p className="mb-1 font-display text-sm font-semibold tracking-tight">{ROLE_LABELS[role]}</p>
              <p className="mb-2 text-xs text-muted-foreground">{ROLE_DESCRIPTION[role]}</p>
              <p className="mb-3 text-xs text-muted-foreground">
                {capabilities.length} capabilities · {coveredGroups} areas
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
                    onClick={() => setViewingRole(role)}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    +{capabilities.length - 8} more
                  </button>
                )}
              </div>
              <div className="mt-auto flex justify-end pt-4">
                <Button size="sm" variant="secondary" icon={<Eye className="size-3.5" />} onClick={() => setViewingRole(role)}>
                  View Details
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <RolePermissionsDialog
        role={viewingRole}
        roleLabel={viewingRole ? ROLE_LABELS[viewingRole] : ''}
        capabilities={viewingRole ? ROLE_PERMISSIONS[viewingRole] : []}
        onClose={() => setViewingRole(null)}
      />
    </>
  )
}

const TAB_VALUES = ['users', 'permissions', 'activity']

export function UserAccessPage() {
  const { refetch } = useUsers()
  // Dashboard shortcuts open a specific tab with ?tab=permissions / ?tab=activity.
  const [tab, setTab] = useState(() => {
    const tab = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('tab')
    return tab && TAB_VALUES.includes(tab) ? tab : 'users'
  })

  return (
    <div className="space-y-5">
      <PageHeader title="Users & Access Management" description="Manage who can sign in, what they can do, and track important account changes." actions={<InviteUserDialog onCreated={refetch} />} />

      <Tabs value={tab} onValueChange={setTab}>
        <Select className="-mb-2 lg:hidden" value={tab} onValueChange={setTab} aria-label="Users & access section" options={[{ value: 'users', label: 'Users' }, { value: 'permissions', label: 'Permission Map' }, { value: 'activity', label: 'Activity Log' }]} />
        <TabsList className="hidden lg:flex">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Permission Map</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsTab />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityLogPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
