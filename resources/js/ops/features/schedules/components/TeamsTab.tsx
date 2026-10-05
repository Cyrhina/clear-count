import { Building2, ChevronDown, UserCog } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@ops/components/ui/Button'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useToast } from '@ops/components/ui/Toast'
import { todayKey } from '@ops/features/schedules/dateUtil'
import { useRoster } from '@ops/features/schedules/hooks/useRoster'
import { usePermission } from '@ops/hooks/usePermission'
import { useSession } from '@ops/hooks/useSession'
import { useTenant } from '@ops/hooks/useTenant'
import { setDepartmentSupervisor } from '@ops/lib/services/branchDepartmentService'
import { cn } from '@ops/lib/utils/cn'
import type { Employee } from '@ops/types/domain'

const NONE = '__none__'
const fullName = (e: Employee) => `${e.personal.firstName} ${e.personal.lastName}`

/**
 * Branch-first view of the organisation: each branch shows its manager up front, and expands to the departments
 * working there with their headcount and direct supervisor. Branch managers are set under Branches; direct
 * supervisors are picked here, from the department's own employees in that branch.
 */
export function TeamsTab() {
  const today = todayKey()
  const { user } = useSession()
  const { notify } = useToast()
  const { branches } = useTenant()
  const canManage = usePermission('schedules.manage')
  const roster = useRoster(today, today)
  const [open, setOpen] = useState<Set<string>>(new Set())

  const byId = useMemo(() => new Map(roster.employees.map((e) => [e.id, e])), [roster.employees])

  const branchCards = useMemo(
    () =>
      branches.map((branch) => {
        const staff = roster.employees.filter((e) => e.employment.status === 'active' && e.branchId === branch.id)
        // The branch's configured departments (Branches → Departments), including ones nobody is in yet.
        const departments = roster.departments
          .filter((d) => d.branchId === branch.id)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((team) => ({ department: team.name, members: staff.filter((e) => e.employment.department === team.name), team }))
        return { branch, manager: branch.managerEmployeeId ? byId.get(branch.managerEmployeeId) : undefined, staffCount: staff.length, departments }
      }),
    [branches, roster.employees, roster.departments, byId],
  )

  async function change(teamId: string, employeeId: string) {
    const result = await setDepartmentSupervisor(user, teamId, employeeId === NONE ? null : employeeId)
    notify(result.ok ? { title: 'Direct supervisor updated', tone: 'success' } : { title: "Couldn't update the supervisor", description: result.error, tone: 'danger' })
    roster.refetch()
  }

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  if (roster.isLoading) return <Skeleton className="h-64 w-full" />

  const allOpen = open.size === branchCards.length

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Each branch and its manager. Open a branch to see its departments, headcount and direct supervisors. Departments are configured under{' '}
          <Link to="/branches" className="font-medium text-primary hover:underline">
            Branches
          </Link>
          .
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(allOpen ? new Set() : new Set(branchCards.map((b) => b.branch.id)))}>
          {allOpen ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>

      {branchCards.map(({ branch, manager, staffCount, departments }) => {
        const isOpen = open.has(branch.id)
        return (
          <section key={branch.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <button type="button" onClick={() => toggle(branch.id)} aria-expanded={isOpen} className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-muted/40">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  {branch.name}
                  {branch.isHeadOffice && <span className="ml-2 text-xs font-normal text-muted-foreground">Head office</span>}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <UserCog className="size-3.5 shrink-0" />
                  Branch manager:{' '}
                  {manager ? (
                    <span className="font-medium text-foreground">
                      {fullName(manager)} <span className="font-normal text-muted-foreground">· {manager.employment.position}</span>
                    </span>
                  ) : (
                    <span>None assigned</span>
                  )}
                </span>
              </span>
              <span className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
                {departments.length} department{departments.length === 1 ? '' : 's'}
                <br />
                {staffCount} employee{staffCount === 1 ? '' : 's'}
              </span>
              <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
              <div className="overflow-x-auto border-t border-border">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-left text-xs font-medium text-muted-foreground">
                      <th className="px-4 py-2">Department</th>
                      <th className="px-4 py-2">Employees</th>
                      <th className="min-w-64 px-4 py-2">Direct supervisor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(({ department, members, team }) => {
                      const supervisor = team?.supervisorEmployeeId ? byId.get(team.supervisorEmployeeId) : undefined
                      return (
                        <tr key={department} className="border-t border-border/60">
                          <td className="px-4 py-2 font-medium">{department}</td>
                          <td className="px-4 py-2 tabular-nums">{members.length}</td>
                          <td className="px-4 py-2">
                            {canManage && team ? (
                              <Select
                                value={team.supervisorEmployeeId ?? NONE}
                                onValueChange={(v) => change(team.id, v)}
                                aria-label={`Direct supervisor for ${department} in ${branch.name}`}
                                options={[{ value: NONE, label: 'No supervisor' }, ...members.map((e) => ({ value: e.id, label: `${fullName(e)} · ${e.employment.position}` }))]}
                              />
                            ) : supervisor ? (
                              <span>
                                {fullName(supervisor)} <span className="text-xs text-muted-foreground">· {supervisor.employment.position}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">No supervisor</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {departments.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                          No departments set up for this branch yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )
      })}
      {branchCards.length === 0 && <p className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">No branches yet — add one under Branches.</p>}
    </div>
  )
}
