import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import { fullName } from '@ops/features/branches/branchUtils'
import { useSession } from '@ops/hooks/useSession'
import {
  addBranchDepartment,
  copyBranchDepartments,
  removeBranchDepartment,
  renameBranchDepartment,
  setDepartmentSupervisor,
} from '@ops/lib/services/branchDepartmentService'
import type { Branch, BranchDepartment, Employee } from '@ops/types/domain'

const NONE = '__none__'

/**
 * The departments configured for one branch: add / rename / remove, copy the list from another branch, and pick each
 * department's direct supervisor. Employees pick their department from this list (Add / Edit Employee).
 */
export function BranchDepartmentsPanel({
  branch,
  branches,
  staff,
  departments,
  allDepartments,
  canManage,
  onChanged,
}: {
  branch: Branch
  branches: Branch[]
  /** Employees currently assigned to this branch. */
  staff: Employee[]
  /** This branch's departments. */
  departments: BranchDepartment[]
  /** Every branch's departments — used to offer "copy from". */
  allDepartments: BranchDepartment[]
  canManage: boolean
  onChanged: () => void
}) {
  const { user } = useSession()
  const { notify } = useToast()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const copySources = branches.filter((b) => b.id !== branch.id && allDepartments.some((d) => d.branchId === b.id))

  async function add() {
    const result = await addBranchDepartment(user, branch.id, name)
    if (!result.ok) return notify({ title: "Couldn't add the department", description: result.error, tone: 'danger' })
    setName('')
    notify({ title: 'Department added', description: `${result.department.name} is now available in ${branch.name}.`, tone: 'success' })
    onChanged()
  }

  async function copyFrom(fromBranchId: string) {
    const added = await copyBranchDepartments(user, fromBranchId, branch.id)
    notify({
      title: added ? 'Departments copied' : 'Nothing to copy',
      description: added ? `${added} department${added === 1 ? '' : 's'} added from ${branches.find((b) => b.id === fromBranchId)?.name}. Supervisors are not copied.` : `${branch.name} already has all of them.`,
      tone: added ? 'success' : 'default',
    })
    onChanged()
  }

  async function saveRename(department: BranchDepartment) {
    const result = await renameBranchDepartment(user, department.id, draft)
    if (!result.ok) return notify({ title: "Couldn't rename the department", description: result.error, tone: 'danger' })
    setEditingId(null)
    notify({ title: 'Department renamed', description: `Employees in it now show ${result.department.name}.`, tone: 'success' })
    onChanged()
  }

  async function remove(department: BranchDepartment) {
    const result = await removeBranchDepartment(user, department.id)
    if (!result.ok) return notify({ title: "Couldn't remove the department", description: result.error, tone: 'danger' })
    notify({ title: 'Department removed', description: `${department.name} was removed from ${branch.name}.`, tone: 'success' })
    onChanged()
  }

  async function changeSupervisor(department: BranchDepartment, employeeId: string) {
    const result = await setDepartmentSupervisor(user, department.id, employeeId === NONE ? null : employeeId)
    notify(result.ok ? { title: 'Direct supervisor updated', tone: 'success' } : { title: "Couldn't update the supervisor", description: result.error, tone: 'danger' })
    onChanged()
  }

  return (
    <div className="mt-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Departments ({departments.length})</p>
          <p className="text-xs text-muted-foreground">Employees in this branch choose their department from this list.</p>
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            {copySources.length > 0 && (
              <div className="w-48">
                <Select value={undefined} onValueChange={copyFrom} options={copySources.map((b) => ({ value: b.id, label: b.name }))} placeholder="Copy from branch…" aria-label="Copy departments from another branch" />
              </div>
            )}
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                void add()
              }}
            >
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New department" aria-label="New department name" className="w-44" />
              <Button type="submit" size="sm" icon={<Plus className="size-4" />} disabled={!name.trim()}>
                Add
              </Button>
            </form>
          </div>
        )}
      </div>

      {departments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No departments yet.{canManage ? ' Add one above, or copy the list from another branch.' : ''}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/30 text-left text-xs font-medium text-muted-foreground">
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Employees</th>
                <th className="min-w-56 px-3 py-2">Direct supervisor</th>
                {canManage && <th className="px-3 py-2 text-right">Manage</th>}
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => {
                const members = staff.filter((e) => e.employment.department === d.name)
                const active = members.filter((e) => e.employment.status === 'active')
                const supervisor = members.find((e) => e.id === d.supervisorEmployeeId)
                return (
                  <tr key={d.id} className="border-t border-border/60">
                    <td className="px-3 py-2 font-medium">
                      {editingId === d.id ? (
                        <form
                          className="flex items-center gap-1"
                          onSubmit={(e) => {
                            e.preventDefault()
                            void saveRename(d)
                          }}
                        >
                          <Input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Department name" className="h-8 w-44" autoFocus />
                          <Button type="submit" size="sm" variant="ghost" aria-label="Save name">
                            <Check className="size-4" />
                          </Button>
                          <Button type="button" size="sm" variant="ghost" aria-label="Cancel rename" onClick={() => setEditingId(null)}>
                            <X className="size-4" />
                          </Button>
                        </form>
                      ) : (
                        d.name
                      )}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {members.length}
                      {members.length !== active.length && <span className="text-xs text-muted-foreground"> · {active.length} active</span>}
                    </td>
                    <td className="px-3 py-2">
                      {canManage ? (
                        <Select
                          value={d.supervisorEmployeeId ?? NONE}
                          onValueChange={(v) => changeSupervisor(d, v)}
                          aria-label={`Direct supervisor for ${d.name}`}
                          options={[{ value: NONE, label: 'No supervisor' }, ...active.map((e) => ({ value: e.id, label: `${fullName(e)} · ${e.employment.position}` }))]}
                        />
                      ) : supervisor ? (
                        <span>
                          {fullName(supervisor)} <span className="text-xs text-muted-foreground">· {supervisor.employment.position}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No supervisor</span>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label={`Rename ${d.name}`}
                            onClick={() => {
                              setEditingId(d.id)
                              setDraft(d.name)
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button type="button" size="sm" variant="ghost" aria-label={`Remove ${d.name}`} onClick={() => remove(d)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
