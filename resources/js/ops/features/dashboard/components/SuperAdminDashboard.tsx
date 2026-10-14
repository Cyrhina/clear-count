import { ArrowRight, Building2, CalendarDays, History, KeyRound, ShieldCheck, UserPlus, Users, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Link } from 'react-router-dom'
import { Badge } from '@ops/components/ui/Badge'
import { Card } from '@ops/components/ui/Card'
import { MetricCard } from '@ops/components/ui/MetricCard'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useSession } from '@ops/hooks/useSession'
import { PLAN_DETAILS } from '@ops/lib/plans'
import { apiErrorMessage } from '@ops/lib/api/http'
import { getPlatformDashboard } from '@ops/lib/services/subscriptionService'
import { formatDate } from '@ops/lib/utils/format'
import { ROLE_LABELS } from '@ops/components/layout/DemoSwitchers'

const ROLE_COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)', 'var(--color-muted-foreground)']

const MODULES: { label: string; description: string; to: string; icon: LucideIcon }[] = [
  { label: 'User Management', description: 'View and manage users', to: '/user-access', icon: UsersRound },
  { label: 'Roles & Permissions', description: 'Assign roles and access', to: '/user-access?tab=permissions', icon: ShieldCheck },
  { label: 'Company Management', description: 'Companies and their plans', to: '/platform/companies', icon: Building2 },
  { label: 'Audit Logs', description: 'Track system activity', to: '/user-access?tab=activity', icon: History },
]

const QUICK_ACTIONS: { label: string; description: string; to: string; icon: LucideIcon }[] = [
  { label: 'Add New User', description: 'Invite a user to a company', to: '/user-access', icon: UserPlus },
  { label: 'Manage Roles', description: 'Review what each role can do', to: '/user-access?tab=permissions', icon: KeyRound },
  { label: 'View Audit Logs', description: 'Track system activity', to: '/user-access?tab=activity', icon: History },
]

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

function SectionHeader({ title, description, viewAll }: { title: string; description?: string; viewAll?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <Card.Title>{title}</Card.Title>
        {description && <Card.Description className="mt-0.5 text-xs">{description}</Card.Description>}
      </div>
      {viewAll && (
        <Link to={viewAll} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
          View all <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  )
}

/** Platform-wide overview for the Super Admin: the totals, the split by company and role, and the latest activity come from the server. */
export function SuperAdminDashboard() {
  const { user } = useSession()
  const query = useQuery({ queryKey: ['platform', 'dashboard'], queryFn: getPlatformDashboard })
  const d = query.data

  const data = d && {
    totalUsers: d.totals.users,
    activeUsers: d.totals.activeUsers,
    totalCompanies: d.totals.companies,
    totalEmployees: d.totals.employees,
    activeEmployees: d.totals.activeEmployees,
    roleCount: d.usersByRole.length,
    byRole: d.usersByRole.map((r, i) => ({ ...r, color: ROLE_COLORS[i % ROLE_COLORS.length] })),
    employeesByCompany: d.employeesByCompany,
    maxEmployees: Math.max(1, ...d.employeesByCompany.map((e) => e.count)),
    recentCompanies: d.recentCompanies,
    activity: d.activity.map((a) => ({ id: a.id, title: a.title, subtitle: [a.actor, a.company].filter(Boolean).join(' · '), timestamp: a.createdAt })),
  }

  if (query.error) return <p className="text-sm text-danger">{apiErrorMessage(query.error)}</p>
  if (!data) return <Skeleton className="h-96" />

  return (
    <div className="dashboard-elevated space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back, {ROLE_LABELS[user.role]}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the system, users, and settings across all companies.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <MetricCard compact label="Total Users" value={String(data.totalUsers)} icon={Users} tone="primary" hint={`${data.activeUsers} active`} />
            <MetricCard compact label="Total Companies" value={String(data.totalCompanies)} icon={Building2} tone="success" hint="Across the platform" />
            <MetricCard compact label="Active Roles" value={String(data.roleCount)} icon={ShieldCheck} tone="accent" hint="Roles in use" />
            <MetricCard compact label="Total Employees" value={String(data.totalEmployees)} icon={UsersRound} tone="warning" hint={`${data.activeEmployees} active`} />
          </div>

          <Card className="p-5">
            <SectionHeader title="Platform Overview" description="At a glance: who is on the platform and how it is split." />
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold">Employees by Company</p>
                <div className="space-y-3">
                  {data.employeesByCompany.map(({ id, name, count }) => (
                    <div key={id}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                        <span className="truncate font-medium">{name}</span>
                        <span className="tabular-nums text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(count / data.maxEmployees) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold">Users by Role</p>
                <div className="flex flex-wrap items-center gap-5 sm:flex-nowrap">
                  <div className="relative size-36 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.byRole} dataKey="count" nameKey="label" innerRadius={44} outerRadius={68} paddingAngle={2} stroke="none">
                          {data.byRole.map((r) => (
                            <Cell key={r.role} fill={r.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-card)', fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-xl font-semibold leading-none">{data.totalUsers}</span>
                      <span className="text-[10px] text-muted-foreground">Total Users</span>
                    </div>
                  </div>
                  <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
                    {data.byRole.map((r) => (
                      <li key={r.role} className="flex items-center gap-2">
                        <span className="size-2 shrink-0 rounded-full" style={{ background: r.color }} />
                        <span className="min-w-0 flex-1 truncate">{r.label}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {r.count} ({Math.round((r.count / Math.max(1, data.totalUsers)) * 100)}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-5">
              <SectionHeader title="Recent Companies" description="Companies on the platform" viewAll="/platform/companies" />
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">Company</th>
                      <th className="pb-2 font-medium">Plan</th>
                      <th className="pb-2 text-right font-medium">Employees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentCompanies.map((c) => (
                      <tr key={c.id} className="border-t border-border/60">
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Building2 className="size-3.5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium">{c.name}</span>
                              {c.planRenewsOn && <span className="block text-[11px] text-muted-foreground">Renews {formatDate(c.planRenewsOn, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3">
                          <Badge tone={c.status === 'suspended' ? 'danger' : 'brand'}>{c.status === 'suspended' ? 'Suspended' : PLAN_DETAILS[c.planTier].label}</Badge>
                        </td>
                        <td className="py-2.5 text-right tabular-nums">{c.employees}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-5">
              <SectionHeader title="System Modules" description="Quick access to key management features" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {MODULES.map((m) => (
                  <Link key={m.label} to={m.to} className="group flex items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <m.icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{m.label}</span>
                      <span className="block text-[11px] leading-snug text-muted-foreground">{m.description}</span>
                    </span>
                    <ArrowRight className="mt-1 size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <SectionHeader title="Recent Activity" viewAll="/user-access?tab=activity" />
            <ul className="mt-4 space-y-3">
              {data.activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <History className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.subtitle}</p>
                  </div>
                  <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                    <p>{formatDate(a.timestamp, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p>{timeOf(a.timestamp)}</p>
                  </div>
                </li>
              ))}
              {data.activity.length === 0 && <li className="text-sm text-muted-foreground">No activity yet.</li>}
            </ul>
          </Card>

          <Card className="p-5">
            <SectionHeader title="Quick Actions" />
            <div className="mt-4 space-y-2">
              {QUICK_ACTIONS.map((q) => (
                <Link key={q.label} to={q.to} className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <q.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{q.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{q.description}</span>
                  </span>
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
