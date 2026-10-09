import { api } from '@ops/lib/api/http'
import type { Role } from '@ops/types/domain'

/** Users & Access Management: the Users, Permission Map and Activity Log tabs, backed by the Laravel API. */

// ---- Users ---------------------------------------------------------------------------------------------------------

export interface AccessUser {
  id: number
  firstName: string
  lastName: string
  name: string
  email: string
  role: Role
  roleLabel: string
  status: 'active' | 'inactive'
  /** Invited but has never signed in. */
  invitePending: boolean
  lastLoginAt: string | null
  isCurrentUser: boolean
  can: { updateRole: boolean; toggleStatus: boolean; resendInvite: boolean }
}

interface UserDto {
  id: number
  first_name: string
  last_name: string
  name: string
  email: string
  role: Role
  role_label: string
  status: 'active' | 'inactive'
  invite_pending: boolean
  last_login_at: string | null
  is_current_user: boolean
  can: { update_role: boolean; toggle_status: boolean; resend_invite: boolean }
}

const toUser = (u: UserDto): AccessUser => ({
  id: u.id,
  firstName: u.first_name,
  lastName: u.last_name,
  name: u.name,
  email: u.email,
  role: u.role,
  roleLabel: u.role_label,
  status: u.status,
  invitePending: u.invite_pending,
  lastLoginAt: u.last_login_at,
  isCurrentUser: u.is_current_user,
  can: { updateRole: u.can.update_role, toggleStatus: u.can.toggle_status, resendInvite: u.can.resend_invite },
})

/** Everyone in the company (the API pages at 100; a company with more would need a pager here). */
export async function listAccessUsers(): Promise<AccessUser[]> {
  const res = await api.get<{ data: UserDto[] }>('/api/users', { per_page: 100, sort: 'first_name' })
  return res.data.map(toUser)
}

export interface InviteUserInput {
  firstName: string
  lastName: string
  email: string
  role: Role
}

export async function inviteAccessUser(input: InviteUserInput): Promise<AccessUser> {
  const res = await api.post<{ data: UserDto }>('/api/users', { first_name: input.firstName, last_name: input.lastName, email: input.email, role: input.role })
  return toUser(res.data)
}

export async function changeAccessUserRole(id: number, role: Role): Promise<AccessUser> {
  const res = await api.patch<{ data: UserDto }>(`/api/users/${id}/role`, { role })
  return toUser(res.data)
}

export async function setAccessUserActive(id: number, active: boolean): Promise<AccessUser> {
  const res = await api.patch<{ data: UserDto }>(`/api/users/${id}/status`, { status: active ? 'active' : 'inactive' })
  return toUser(res.data)
}

export async function resendAccessInvite(id: number): Promise<void> {
  await api.post(`/api/users/${id}/invite`)
}

export async function sendAccessPasswordReset(id: number): Promise<void> {
  await api.post(`/api/users/${id}/reset-access`)
}

// ---- Permission Map ------------------------------------------------------------------------------------------------

export interface PermissionRole {
  id: number
  name: string
  slug: Role
  description: string | null
  capabilitiesCount: number
  areasCount: number
  /** Capability names grouped by area, in display order. */
  capabilitiesByArea: Record<string, string[]>
}

export interface CapabilityInfo {
  name: string
  label: string
  description: string | null
}

export interface PermissionArea {
  key: string
  label: string
  description: string
  granted: CapabilityInfo[]
  notGranted: CapabilityInfo[]
}

export interface PermissionRoleDetail extends PermissionRole {
  areas: PermissionArea[]
}

interface RoleDto {
  id: number
  name: string
  slug: Role
  description: string | null
  capabilities_count: number
  areas_count: number
  capabilities_by_area: Record<string, string[]>
  areas?: { key: string; label: string; description: string; granted: CapabilityInfo[]; not_granted: CapabilityInfo[] }[]
}

const toRole = (r: RoleDto): PermissionRole => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  description: r.description,
  capabilitiesCount: r.capabilities_count,
  areasCount: r.areas_count,
  capabilitiesByArea: r.capabilities_by_area,
})

export async function listPermissionRoles(): Promise<PermissionRole[]> {
  const res = await api.get<{ data: RoleDto[] }>('/api/permission-map')
  return res.data.map(toRole)
}

export async function getPermissionRole(id: number): Promise<PermissionRoleDetail> {
  const res = await api.get<{ data: RoleDto }>(`/api/permission-map/${id}`)
  return { ...toRole(res.data), areas: (res.data.areas ?? []).map((a) => ({ key: a.key, label: a.label, description: a.description, granted: a.granted, notGranted: a.not_granted })) }
}

// ---- Activity Log --------------------------------------------------------------------------------------------------

export interface ActivityItem {
  id: number
  formattedDate: string
  formattedTime: string
  createdAt: string
  user: { id: number | null; name: string; initials: string; role: string | null }
  module: string | null
  action: string
  title: string | null
  description: string | null
}

export interface ActivityQuery {
  dateRange: 'today' | '7_days' | '30_days' | 'custom'
  startDate?: string
  endDate?: string
  module?: string
  action?: string
  userId?: number
  search?: string
  page: number
  perPage: number
}

export interface ActivityPage {
  items: ActivityItem[]
  total: number
  from: number
  to: number
  lastPage: number
}

interface ActivityDto {
  id: number
  formatted_date: string
  formatted_time: string
  created_at: string
  user: ActivityItem['user']
  module: string | null
  action: string
  title: string | null
  description: string | null
}

export async function listActivity(q: ActivityQuery): Promise<ActivityPage> {
  const res = await api.get<{ data: ActivityDto[]; meta: { total: number; from: number | null; to: number | null; last_page: number } }>('/api/activity-logs', {
    date_range: q.dateRange,
    start_date: q.dateRange === 'custom' ? q.startDate : undefined,
    end_date: q.dateRange === 'custom' ? q.endDate : undefined,
    module: q.module,
    action: q.action,
    user_id: q.userId,
    search: q.search,
    page: q.page,
    per_page: q.perPage,
  })
  return {
    items: res.data.map((a) => ({
      id: a.id,
      formattedDate: a.formatted_date,
      formattedTime: a.formatted_time,
      createdAt: a.created_at,
      user: a.user,
      module: a.module,
      action: a.action,
      title: a.title,
      description: a.description,
    })),
    total: res.meta.total,
    from: res.meta.from ?? 0,
    to: res.meta.to ?? 0,
    lastPage: res.meta.last_page,
  }
}

export interface ActivityFilterOptions {
  modules: string[]
  actions: string[]
  users: { id: number; name: string }[]
}

export async function getActivityFilterOptions(): Promise<ActivityFilterOptions> {
  return (await api.get<{ data: ActivityFilterOptions }>('/api/activity-logs/filters')).data
}
