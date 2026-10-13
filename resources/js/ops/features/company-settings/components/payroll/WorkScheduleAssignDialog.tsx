import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Users } from 'lucide-react'
import { useState } from 'react'
import { StatusBadge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Checkbox } from '@ops/components/ui/Checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { Input } from '@ops/components/ui/Input'
import { useToast } from '@ops/components/ui/Toast'
import { COMPANY_SETTINGS_KEY } from '@ops/features/company-settings/hooks/useCompanySettings'
import type { Schedule } from '@ops/features/company-settings/types'
import { EMPLOYEES_KEY } from '@ops/features/employees/hooks/useEmployeeRecords'
import { apiErrorMessage } from '@ops/lib/api/http'
import { fetchEmployees } from '@ops/lib/services/employeeService'
import { assignScheduleEmployees } from '@ops/lib/services/payrollConfigService'

/**
 * Gives employees a default work schedule: search the active roster, tick the people, assign. An employee has one schedule,
 * so anyone on another schedule is moved (and marked here). Single days are still set on the Schedules roster.
 */
export function WorkScheduleAssignDialog({ schedule, schedules, trigger }: { schedule: Schedule; schedules: Schedule[]; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const queryClient = useQueryClient()
  const { notify } = useToast()

  const roster = useQuery({
    queryKey: [EMPLOYEES_KEY, 'picker', search],
    queryFn: () => fetchEmployees({ search: search.trim() || undefined, status: 'active', perPage: 30 }),
    enabled: open,
  })
  const employees = roster.data?.employees ?? []

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function assign() {
    setSaving(true)
    try {
      const n = await assignScheduleEmployees(schedule.id, [...selected])
      notify({ title: `${n} employee${n === 1 ? '' : 's'} assigned to ${schedule.name}`, tone: 'success' })
      void queryClient.invalidateQueries({ queryKey: [COMPANY_SETTINGS_KEY] })
      void queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] })
      setOpen(false)
      setSelected(new Set())
      setSearch('')
    } catch (error) {
      notify({ title: "Couldn't assign the employees", description: apiErrorMessage(error), tone: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="secondary" icon={<Users className="size-4" />}>
            Assign Employees
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Assign Employees – {schedule.name}</DialogTitle>
        <DialogDescription>Search the active roster and pick the people who follow this schedule by default.</DialogDescription>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, employee ID, or department…" className="pl-9" />
        </div>

        <div className="mt-3 max-h-96 space-y-1.5 overflow-y-auto rounded-lg border border-border p-2">
          {roster.isPending ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : employees.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No employees match.</p>
          ) : (
            employees.map((employee) => {
              const current = schedules.find((s) => s.id === employee.workScheduleId)
              const here = employee.workScheduleId === schedule.id
              return (
                <label key={employee.id} className="flex items-start gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-colors hover:bg-muted">
                  <Checkbox checked={selected.has(employee.id) || here} disabled={here} onCheckedChange={() => toggle(employee.id)} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {employee.personal.firstName} {employee.personal.lastName}
                      </p>
                      <span className="text-xs text-muted-foreground">{employee.employeeNumber}</span>
                      <StatusBadge status={employee.employment.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {employee.employment.position} · {employee.employment.department}
                    </p>
                    <p className="mt-0.5 text-xs">
                      {here ? (
                        <span className="text-primary">Already on this schedule</span>
                      ) : current ? (
                        <span className="text-warning">Currently on {current.name} — will be moved</span>
                      ) : (
                        <span className="text-muted-foreground">No work schedule yet</span>
                      )}
                    </p>
                  </div>
                </label>
              )
            })
          )}
        </div>
        {roster.data && roster.data.total > employees.length && <p className="mt-2 text-xs text-muted-foreground">Showing the first {employees.length} of {roster.data.total}. Search to narrow the list.</p>}

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm font-medium">{selected.size} selected</p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" isLoading={saving} disabled={selected.size === 0} onClick={assign}>
              Assign {selected.size || ''} Employee{selected.size === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
