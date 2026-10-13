import { useQuery } from '@tanstack/react-query'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@ops/components/ui/Button'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { useToast } from '@ops/components/ui/Toast'
import type { BranchRecord, DepartmentRecord } from '@ops/features/branches/types'
import { apiErrorMessage } from '@ops/lib/api/http'
import { fetchEmployees } from '@ops/lib/services/employeeService'
import { copyBranchDepartments, createBranchDepartment, removeBranchDepartment, renameBranchDepartment, setBranchDepartmentSupervisor } from '@ops/lib/services/branchDepartmentService'

const NONE = '__none__'

function SupervisorSelect({ department, canManage, onChanged }: { department: DepartmentRecord; canManage: boolean; onChanged: () => void }) {
  const { notify } = useToast()
  const members = useQuery({
    queryKey: ['employees', 'department-members', department.branchId, department.name],
    queryFn: () => fetchEmployees({ branchId: department.branchId, department: department.name, perPage: 100 }),
  }).data?.employees ?? []
  const supervisor = members.find((e) => e.id === department.supervisorEmployeeId)
  const label = (e: (typeof members)[number]) => `${e.personal.firstName} ${e.personal.lastName} · ${e.employment.position}`

  if (!canManage) return supervisor ? <span>{label(supervisor)}</span> : <span className="text-muted-foreground">No supervisor</span>

  async function change(value: string) {
    try {
      await setBranchDepartmentSupervisor(department.id, value === NONE ? null : value)
    } catch (error) {
      return notify({ title: "Couldn't update the supervisor", description: apiErrorMessage(error), tone: 'danger' })
    }
    notify({ title: 'Direct supervisor updated', tone: 'success' })
    onChanged()
  }

  return (
    <Select
      value={department.supervisorEmployeeId ?? NONE}
      onValueChange={change}
      aria-label={`Direct supervisor for ${department.name}`}
      options={[{ value: NONE, label: 'No supervisor' }, ...members.filter((e) => e.employment.status === 'active' || e.id === department.supervisorEmployeeId).map((e) => ({ value: e.id, label: label(e) }))]}
    />
  )
}

/**
/**
 * The departments configured for one branch: add / rename / remove, and copy the list from another branch.
 * Employees pick their department from this list (Add / Edit Employee). Each department's direct supervisor is chosen
 * from the employees in it (SupervisorSelect).
 */
export function BranchDepartmentsPanel({
  branch,
  branches,
  departments,
  allDepartments,
  canManage,
  onChanged,
}: {
  branch: BranchRecord
  branches: BranchRecord[]
  /** This branch's departments. */
  departments: DepartmentRecord[]
  /** Every branch's departments — used to offer "copy from". */
  allDepartments: DepartmentRecord[]
  canManage: boolean
  onChanged: () => void
}) {
  const { notify } = useToast()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const copySources = branches.filter((b) => b.id !== branch.id && allDepartments.some((d) => d.branchId === b.id))

  /** Runs a call, shows the toast on success, and shows the server's message on failure. */
  async function run(action: () => Promise<unknown>, failure: string, success: { title: string; description?: string }, after?: () => void) {
    try {
      await action()
    } catch (error) {
      return notify({ title: failure, description: apiErrorMessage(error), tone: 'danger' })
    }
    after?.()
    notify({ ...success, tone: 'success' })
    onChanged()
  }

  const add = () => run(() => createBranchDepartment(branch.id, name), "Couldn't add the department", { title: 'Department added', description: `${name.trim()} is now available in ${branch.name}.` }, () => setName(''))

  async function copyFrom(fromBranchId: string) {
    try {
      const added = await copyBranchDepartments(fromBranchId, branch.id)
      notify({
        title: added ? 'Departments copied' : 'Nothing to copy',
        description: added ? `${added} department${added === 1 ? '' : 's'} added from ${branches.find((b) => b.id === fromBranchId)?.name}. Supervisors are not copied.` : `${branch.name} already has all of them.`,
        tone: added ? 'success' : 'default',
      })
      onChanged()
    } catch (error) {
      notify({ title: "Couldn't copy the departments", description: apiErrorMessage(error), tone: 'danger' })
    }
  }

  const saveRename = (department: DepartmentRecord) =>
    run(() => renameBranchDepartment(department.id, draft), "Couldn't rename the department", { title: 'Department renamed', description: `Employees in it now show ${draft.trim()}.` }, () => setEditingId(null))

  const remove = (department: DepartmentRecord) =>
    run(() => removeBranchDepartment(department.id), "Couldn't remove the department", { title: 'Department removed', description: `${department.name} was removed from ${branch.name}.` })

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
              {departments.map((d) => (
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
                  <td className="px-3 py-2 tabular-nums">{d.employeeCount}</td>
                  <td className="px-3 py-2">
                    <SupervisorSelect department={d} canManage={canManage} onChanged={onChanged} />
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
