import { Building2, CalendarDays, Mail, MapPin, Phone, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { BranchDepartmentsPanel } from '@ops/features/branches/components/BranchDepartmentsPanel'
import type { BranchRecord, DepartmentRecord } from '@ops/features/branches/types'
import { formatDate } from '@ops/lib/utils/format'

function DetailItem({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 break-words text-sm font-medium">{children}</div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-lg font-semibold">{value}</p>
    </div>
  )
}

/** Full branch profile — address, contact, headcount — and its departments. */
export function BranchDetailsDialog({
  branch,
  branches,
  allDepartments,
  canManage,
  onClose,
  onChanged,
}: {
  branch: BranchRecord | null
  branches: BranchRecord[]
  /** Departments configured across every branch. */
  allDepartments: DepartmentRecord[]
  canManage: boolean
  onClose: () => void
  onChanged: () => void
}) {
  const branchDepartments = branch ? allDepartments.filter((d) => d.branchId === branch.id) : []
  const departmentCount = branchDepartments.length

  return (
    <Dialog open={!!branch} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        {branch && (
          <>
            <DialogTitle className="flex flex-wrap items-center gap-2 pr-8">
              <Building2 className="size-5 text-muted-foreground" />
              {branch.name}
              {branch.isHeadOffice && <Badge tone="brand">Head Office</Badge>}
              {branch.code && <Badge tone="neutral">{branch.code}</Badge>}
            </DialogTitle>
            <DialogDescription>Branch profile and departments.</DialogDescription>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Employees" value={branch.headcount} />
              <Stat label="Active" value={branch.activeCount} />
              <Stat label="Departments" value={departmentCount} />
              <Stat label="Opened" value={branch.openedDate ? formatDate(branch.openedDate) : '—'} />
            </div>

            <div className="mt-5 grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
              <DetailItem icon={<MapPin className="size-4" />} label="Address">
                {branch.address || branch.city ? (
                  <>
                    {branch.address && <p>{branch.address}</p>}
                    {branch.city && <p className="text-muted-foreground">{branch.city}</p>}
                  </>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </DetailItem>
              <DetailItem icon={<CalendarDays className="size-4" />} label="Branch Type">
                {branch.isHeadOffice ? 'Head Office' : 'Branch'}
              </DetailItem>
              <DetailItem icon={<Phone className="size-4" />} label="Contact Number">
                {branch.contactNumber ?? <span className="text-muted-foreground">Not set</span>}
              </DetailItem>
              <DetailItem icon={<Mail className="size-4" />} label="Email">
                {branch.email ?? <span className="text-muted-foreground">Not set</span>}
              </DetailItem>
              <DetailItem icon={<Users className="size-4" />} label="Headcount">
                {branch.headcount} employee{branch.headcount === 1 ? '' : 's'} across {departmentCount} department{departmentCount === 1 ? '' : 's'}
              </DetailItem>
            </div>

            <BranchDepartmentsPanel branch={branch} branches={branches} departments={branchDepartments} allDepartments={allDepartments} canManage={canManage} onChanged={onChanged} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
