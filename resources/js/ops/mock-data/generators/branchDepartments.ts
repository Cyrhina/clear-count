import type { BranchDepartment, Employee } from '@ops/types/domain'

const rank = (position: string) => (/manager/i.test(position) ? 0 : /supervisor/i.test(position) ? 1 : /lead/i.test(position) ? 2 : 3)

/** Seeds each branch's departments from where employees already sit; the most senior active member is the direct supervisor. */
export function generateBranchDepartments(employees: Employee[]): BranchDepartment[] {
  const groups = new Map<string, Employee[]>()
  for (const e of employees) {
    if (e.employment.status === 'archived') continue
    const key = `${e.companyId}|${e.branchId}|${e.employment.department}`
    groups.set(key, [...(groups.get(key) ?? []), e])
  }
  return [...groups].map(([key, members]) => {
    const [companyId, branchId, name] = key.split('|')
    const active = members.filter((m) => m.employment.status === 'active')
    const supervisor = [...(active.length ? active : members)].sort((a, b) => rank(a.employment.position) - rank(b.employment.position))[0]
    return { id: `${branchId}_dept_${name.replace(/\s+/g, '_')}`, companyId, branchId, name, supervisorEmployeeId: supervisor?.id ?? null }
  })
}
