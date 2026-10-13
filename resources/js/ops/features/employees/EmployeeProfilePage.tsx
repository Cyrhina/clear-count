import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Archive, Download, FileText, KeyRound, Pencil, ShieldCheck, Trash2, Upload, UserPlus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Avatar } from '@ops/components/ui/Avatar'
import { Badge, StatusBadge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { PlainCards } from '@ops/components/ui/PlainCards'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@ops/components/ui/Dialog'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { useToast } from '@ops/components/ui/Toast'
import { CompensationHistoryTable } from '@ops/features/employees/components/CompensationHistoryTable'
import { AttendanceSummaryTab } from '@ops/features/employees/components/AttendanceSummaryTab'
import { EditBankInfoForm } from '@ops/features/employees/components/edit/EditBankInfoForm'
import { EditBenefitsForm } from '@ops/features/employees/components/edit/EditBenefitsForm'
import { EditCompensationForm } from '@ops/features/employees/components/edit/EditCompensationForm'
import { EditEmploymentInfoForm } from '@ops/features/employees/components/edit/EditEmploymentInfoForm'
import { EditGovernmentInfoForm } from '@ops/features/employees/components/edit/EditGovernmentInfoForm'
import { EditPersonalInfoForm } from '@ops/features/employees/components/edit/EditPersonalInfoForm'
import { ApplyWfhDialog } from '@ops/features/attendance/components/ApplyWfhDialog'
import { WfhArrangementCards } from '@ops/features/ess/components/WfhArrangementCards'
import { useBranches } from '@ops/features/branches/hooks/useBranches'
import { useEmployeeRecord } from '@ops/features/employees/hooks/useEmployeeRecords'
import { usePermission } from '@ops/hooks/usePermission'
import { apiErrorMessage } from '@ops/lib/api/http'
import { SEPARATION_LABEL, assignEmployeePayrollGroup, createEmployeeAccount, deleteEmployeeDocument, employeeDocumentLink, saveEmployeeStatus, uploadEmployeeDocument } from '@ops/lib/services/employeeService'
import { Input } from '@ops/components/ui/Input'
import { useSession } from '@ops/hooks/useSession'
import { summarizeMixedCompensation } from '@ops/features/employees/mixedCompensation'
import { categoryLabel } from '@ops/lib/payroll/groupAssignment'
import { PAY_RATE_TYPE_LABEL, estimatedEquivalentFor, formatBaseRate, rateFieldLabel } from '@ops/lib/payroll/payRate'
import { getPayrollGroups } from '@ops/lib/services/payrollGroupService'
import { fetchWfh } from '@ops/lib/services/wfhArrangementService'
import { sendAccessPasswordReset } from '@ops/lib/services/userAccessService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { EmploymentStatus, WfhArrangement } from '@ops/types/domain'

function Field({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value?.trim() ? value : '—'}</p>
    </div>
  )
}

type EditableSection = 'personal' | 'employment' | 'compensation' | 'benefits' | 'government' | 'bank'

function SectionEditButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} onClick={onClick}>
      Edit Information
    </Button>
  )
}

/** Profile cards render without the soft theme's corner watermark icon. */
export function EmployeeProfilePage() {
  return (
    <PlainCards>
      <EmployeeProfileContent />
    </PlainCards>
  )
}

function EmployeeProfileContent() {
  const { id } = useParams<{ id: string }>()
  const { employee, isLoading, refetch } = useEmployeeRecord(id)
  const { branches } = useBranches()
  const groupsQuery = useQuery({ queryKey: ['employees', 'payroll-groups'], queryFn: getPayrollGroups })
  const groups = groupsQuery.data ?? []
  const { user } = useSession()
  const { notify } = useToast()
  const [wfh, setWfh] = useState<WfhArrangement[]>([])
  useEffect(() => {
    if (id) fetchWfh().then((l) => setWfh(l.arrangements.filter((a) => a.employeeId === id)))
  }, [user, id])
  const navigate = useNavigate()
  const [statusDialog, setStatusDialog] = useState<EmploymentStatus | null>(null)
  const [separateOpen, setSeparateOpen] = useState(false)
  const [separationReason, setSeparationReason] = useState<keyof typeof SEPARATION_LABEL>('resigned')
  const [separationDate, setSeparationDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [separationNotes, setSeparationNotes] = useState('')
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null)
  const [pendingGroupId, setPendingGroupId] = useState<string | null | undefined>(undefined)
  const canEditProfile = usePermission('employees.edit')
  const canEditCompensation = usePermission('employees.compensation.edit')
  const canEditGovernment = usePermission('employees.government.edit')
  const canEditBank = usePermission('employees.bank.edit')
  const canSeparate = usePermission('employees.separate')
  const canViewPay = usePermission('employees.pay.view')
  const canViewAttendance = usePermission('attendance.view')
  const canAdjustAttendance = usePermission('attendance.adjust')
  const canManageUsers = usePermission('users.manage')
  // The sign-in account linked to this employee, if they have one — only then is there a password to reset.
  const account = employee?.account ?? null
  const [resetOpen, setResetOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const documentInput = useRef<HTMLInputElement>(null)
  const [accountEmail, setAccountEmail] = useState('')
  const [tab, setTab] = useState('personal')
  // Same sections as the tab row, in the same order — shown as a dropdown on phones.
  const tabOptions = [
    { value: 'personal', label: 'Personal Information' },
    { value: 'employment', label: 'Employment' },
    ...(canViewPay ? [{ value: 'compensation', label: 'Compensation' }] : []),
    { value: 'payroll', label: 'Payroll Information' },
    ...(canViewAttendance ? [{ value: 'attendance', label: 'Attendance' }] : []),
    ...(canViewPay
      ? [
          { value: 'benefits', label: 'Benefits' },
          { value: 'government', label: 'Government Information' },
          { value: 'bank', label: 'Bank/Payment' },
          { value: 'documents', label: 'Documents' },
          { value: 'history', label: 'History' },
        ]
      : []),
  ]

  function stopEditing() {
    setEditingSection(null)
    refetch()
  }

  if (isLoading) return <Skeleton className="h-96" />
  if (!employee) {
    return (
      <EmptyState
        title="Employee not found"
        description="It may have been removed, or belongs to a different company."
        action={
          <Button size="sm" variant="secondary" onClick={() => navigate('/employees')}>
            Back to employee list
          </Button>
        }
      />
    )
  }

  const fullName = `${employee.personal.firstName} ${employee.personal.lastName}`
  const branch = branches.find((b) => b.id === employee.branchId)
  const currentGroup = groups.find((g) => g.id === employee.payrollGroupId)
  const pendingGroup = pendingGroupId ? groups.find((g) => g.id === pendingGroupId) : undefined

  /** Runs a change on the record: the success toast and a refresh, or the server's message. */
  async function run(change: () => Promise<unknown>, success: { title: string; description?: string }) {
    try {
      await change()
    } catch (error) {
      return notify({ title: "Couldn't save the change", description: apiErrorMessage(error), tone: 'danger' })
    }
    notify({ ...success, tone: 'success' })
    refetch()
    return true
  }

  async function uploadDocument(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !employee) return
    await run(() => uploadEmployeeDocument(employee.id, file), { title: 'Document uploaded', description: file.name })
  }

  async function openDocument(documentId: string) {
    if (!employee) return
    try {
      // A link that works for five minutes; the file itself is never public.
      window.open(await employeeDocumentLink(employee.id, documentId), '_blank', 'noopener')
    } catch (error) {
      notify({ title: "Couldn't open the document", description: apiErrorMessage(error), tone: 'danger' })
    }
  }

  async function applyStatusChange() {
    if (!statusDialog || !employee) return
    if (await run(() => saveEmployeeStatus(employee.id, statusDialog), { title: `Employee ${statusDialog}` })) setStatusDialog(null)
  }

  async function applyPasswordReset() {
    if (!account) return
    if (await run(() => sendAccessPasswordReset(Number(account.id)), { title: 'Password reset sent', description: `A reset link was sent to ${account.email}.` })) setResetOpen(false)
  }

  async function applyAccountCreate() {
    if (!employee || !accountEmail.trim()) return
    if (await run(() => createEmployeeAccount(employee.id, accountEmail.trim()), { title: 'Login created', description: `An invite link was sent to ${accountEmail.trim()}.` })) setAccountOpen(false)
  }

  async function applySeparation() {
    if (!employee || !separationDate) return
    const done = await run(() => saveEmployeeStatus(employee.id, 'archived', { reason: separationReason, date: separationDate, notes: separationNotes.trim() || undefined }), {
      title: `${fullName} marked as ${SEPARATION_LABEL[separationReason].toLowerCase()}`,
      description: `Last working day ${formatDate(separationDate)}`,
    })
    if (done) {
      setSeparateOpen(false)
      setSeparationNotes('')
    }
  }

  async function applyGroupChange() {
    if (pendingGroupId === undefined || !employee) return
    const done = await run(() => assignEmployeePayrollGroup(employee, pendingGroupId), { title: pendingGroupId ? `Reassigned to ${pendingGroup?.name}` : 'Removed from Payroll Group' })
    if (done) {
      setPendingGroupId(undefined)
      void groupsQuery.refetch()
    }
  }

  return (
    <div className="space-y-5">
      <Link to="/employees" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Back to employees
      </Link>

      <PageHeader
        title={fullName}
        description={`${employee.employment.position} · ${employee.employment.department} · ${branch?.name ?? ''}`}
        actions={
          <div className="flex items-center gap-2">
            {employee.employment.dateSeparated && employee.employment.separationReason ? (
              <Badge tone="danger">
                {SEPARATION_LABEL[employee.employment.separationReason]} · {formatDate(employee.employment.dateSeparated)}
              </Badge>
            ) : (
              <StatusBadge status={employee.employment.status} />
            )}
            {canManageUsers && !account && (
              <Button size="sm" variant="secondary" icon={<UserPlus className="size-4" />} onClick={() => { setAccountEmail(employee.personal.personalEmail ?? ''); setAccountOpen(true) }}>
                Create login
              </Button>
            )}
            {account && account.isActive !== false && (
              <Button size="sm" variant="secondary" icon={<KeyRound className="size-4" />} onClick={() => setResetOpen(true)}>
                Reset password
              </Button>
            )}
            {canSeparate && employee.employment.status === 'active' && (
              <Button size="sm" variant="secondary" onClick={() => setStatusDialog('inactive')}>
                Deactivate
              </Button>
            )}
            {canSeparate && employee.employment.status !== 'archived' && (
              <Button size="sm" variant="destructive" icon={<Archive className="size-4" />} onClick={() => setSeparateOpen(true)}>
                Separate Employee
              </Button>
            )}
            {canSeparate && employee.employment.status !== 'active' && (
              <Button size="sm" onClick={() => setStatusDialog('active')}>
                Reactivate
              </Button>
            )}
          </div>
        }
      />

      <Card className="flex items-center gap-4 p-5">
        <Avatar name={fullName} size="lg" />
        <div>
          <p className="font-display text-base font-semibold tracking-tight">{fullName}</p>
          <p className="text-sm text-muted-foreground">
            {employee.employeeNumber} &middot; Hired {formatDate(employee.employment.dateHired)}
          </p>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        {/* Phones and tablets: a dropdown instead of a wrapped row of tabs. */}
        <Select className="lg:hidden" value={tab} onValueChange={setTab} aria-label="Employee information section" options={tabOptions} />
        <TabsList className="hidden lg:flex">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          {canViewPay && <TabsTrigger value="compensation">Compensation</TabsTrigger>}
          <TabsTrigger value="payroll">Payroll Information</TabsTrigger>
          {canViewAttendance && <TabsTrigger value="attendance">Attendance</TabsTrigger>}
          {canViewPay && <TabsTrigger value="benefits">Benefits</TabsTrigger>}
          {canViewPay && <TabsTrigger value="government">Government Information</TabsTrigger>}
          {canViewPay && <TabsTrigger value="bank">Bank/Payment</TabsTrigger>}
          {canViewPay && <TabsTrigger value="documents">Documents</TabsTrigger>}
          {canViewPay && <TabsTrigger value="history">History</TabsTrigger>}
        </TabsList>

        <TabsContent value="personal">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <Card.Title>Personal Information</Card.Title>
              {canEditProfile && editingSection !== 'personal' && (
                <SectionEditButton onClick={() => setEditingSection('personal')} />
              )}
            </div>
            {editingSection === 'personal' ? (
              <EditPersonalInfoForm employee={employee} onSaved={stopEditing} onCancel={() => setEditingSection(null)} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-3">
                <Field label="First name" value={employee.personal.firstName} />
                <Field label="Last name" value={employee.personal.lastName} />
                <Field label="Birth date" value={formatDate(employee.personal.birthDate)} />
                <Field label="Civil status" value={employee.personal.civilStatus} />
                <Field label="Contact number" value={employee.personal.contactNumber} />
                <Field label="Personal email" value={employee.personal.personalEmail} />
                <Field label="Address" value={employee.personal.address} />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="employment">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <Card.Title>Employment</Card.Title>
              {canEditProfile && editingSection !== 'employment' && (
                <SectionEditButton onClick={() => setEditingSection('employment')} />
              )}
            </div>
            {editingSection === 'employment' ? (
              <EditEmploymentInfoForm employee={employee} onSaved={stopEditing} onCancel={() => setEditingSection(null)} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-3">
                <Field label="Position" value={employee.employment.position} />
                <Field label="Department" value={employee.employment.department} />
                <Field label="Branch" value={branch?.name} />
                <Field label="Employment type" value={employee.employment.employmentType.replace('_', ' ')} />
                <Field label="Date hired" value={formatDate(employee.employment.dateHired)} />
                <Field label="Status" value={employee.employment.status} />
              </div>
            )}
          </Card>
          <Card className="mt-5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Card.Title>Work arrangement</Card.Title>
              {canAdjustAttendance && <ApplyWfhDialog employeeIds={[employee.id]} />}
            </div>
            <div className="mt-3">
              {wfh.length === 0 ? <p className="text-sm text-muted-foreground">No WFH arrangement — onsite</p> : <WfhArrangementCards items={wfh} showTimes />}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="compensation" className="space-y-5">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <Card.Title>Current Compensation</Card.Title>
              {canEditCompensation && editingSection !== 'compensation' && (
                <SectionEditButton onClick={() => setEditingSection('compensation')} />
              )}
            </div>
            {editingSection === 'compensation' ? (
              <EditCompensationForm employee={employee} onSaved={stopEditing} onCancel={() => setEditingSection(null)} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-3">
                  <Field label="Pay Rate Type" value={PAY_RATE_TYPE_LABEL[employee.compensation.payType]} />
                  <Field
                    label={rateFieldLabel(employee.compensation.payType)}
                    value={formatBaseRate(employee.compensation.payType, employee.compensation.basicPay, employee.compensation.outputUnit)}
                  />
                  {employee.compensation.payType === 'output_based' && (
                    <Field label="Output Unit" value={employee.compensation.outputUnit ?? undefined} />
                  )}
                  {employee.compensation.mixed && <Field label="Mixed Compensation" value={summarizeMixedCompensation(employee.compensation.mixed)} />}
                </div>
                {(() => {
                  const estimate = estimatedEquivalentFor(employee.compensation.payType, employee.compensation.basicPay)
                  return estimate ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Estimated, not the actual payroll rate — {estimate.label.toLowerCase()}: {formatCurrency(estimate.value)}
                    </p>
                  ) : null
                })()}
                {employee.compensation.allowances.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Allowances</p>
                    <div className="flex flex-wrap gap-2">
                      {employee.compensation.allowances.map((a) => (
                        <Badge key={a.label} tone="brand">
                          {a.label}: {formatCurrency(a.amount)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          <Card className="p-5">
            <Card.Title>Compensation History</Card.Title>
            <Card.Description>Salary changes over time, with the reason and who approved each one.</Card.Description>
            <div className="mt-4">
              <CompensationHistoryTable entries={employee.compensationHistory} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <Card.Title>Payroll Information</Card.Title>
              <Badge tone="neutral">Managed via Payroll Settings</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payroll Group</p>
                {canEditProfile ? (
                  <Select
                    value={currentGroup?.id ?? 'unassigned'}
                    onValueChange={(v) => setPendingGroupId(v === 'unassigned' ? null : v)}
                    options={[
                      { value: 'unassigned', label: 'Unassigned' },
                      ...groups.filter((g) => g.status === 'active').map((g) => ({ value: g.id, label: g.name })),
                    ]}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm font-medium text-foreground">{currentGroup?.name ?? 'Unassigned'}</p>
                )}
              </div>
              <Field label="Compensation Type" value={currentGroup?.compensation ?? PAY_RATE_TYPE_LABEL[employee.compensation.payType]} />
              <Field label="Payroll Frequency" value={currentGroup?.frequency ?? '—'} />
              {canViewPay && <Field label="Pay Rate Type" value={PAY_RATE_TYPE_LABEL[employee.compensation.payType]} />}
              {canViewPay && (
                <Field
                  label={rateFieldLabel(employee.compensation.payType)}
                  value={formatBaseRate(employee.compensation.payType, employee.compensation.basicPay, employee.compensation.outputUnit)}
                />
              )}
              {canViewPay && employee.compensation.payType === 'output_based' && (
                <Field label="Output Unit" value={employee.compensation.outputUnit ?? undefined} />
              )}
              <Field label="Branch" value={branch?.name} />
              <Field label="Employee Category" value={categoryLabel(employee.employment.category)} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Position and category only suggest which Payroll Group fits best — they never restrict assignment. Manage
              members in bulk from Company &amp; Payroll Settings &rarr; Payroll Groups.
            </p>
          </Card>
        </TabsContent>

        {canViewAttendance && (
          <TabsContent value="attendance">
            <AttendanceSummaryTab employeeId={employee.id} />
          </TabsContent>
        )}

        <TabsContent value="benefits">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <Card.Title>Benefits</Card.Title>
              {canEditProfile && editingSection !== 'benefits' && (
                <SectionEditButton onClick={() => setEditingSection('benefits')} />
              )}
            </div>
            {editingSection === 'benefits' ? (
              <EditBenefitsForm employee={employee} onSaved={stopEditing} onCancel={() => setEditingSection(null)} />
            ) : (
              <div>
                <Field label="HMO plan" value={employee.benefits.hmoPlan} />
                <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Leave credits</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(employee.benefits.leaveCreditsByType).map(([type, credits]) => (
                    <Badge key={type} tone="neutral">
                      {type}: {credits} days
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="government">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <Card.Title>Government Information</Card.Title>
              {canEditGovernment && editingSection !== 'government' && (
                <SectionEditButton onClick={() => setEditingSection('government')} />
              )}
            </div>
            {editingSection === 'government' ? (
              <EditGovernmentInfoForm employee={employee} onSaved={stopEditing} onCancel={() => setEditingSection(null)} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-3">
                <Field label="SSS No." value={employee.government.sssNo} />
                <Field label="PhilHealth No." value={employee.government.philhealthNo} />
                <Field label="Pag-IBIG No." value={employee.government.pagibigNo} />
                <Field label="TIN" value={employee.government.tinNo} />
                <Field
                  label="Pag-IBIG Employee Contribution (PHP)"
                  value={
                    employee.government.pagibigEmployeeContribution
                      ? `${formatCurrency(employee.government.pagibigEmployeeContribution)} (custom)`
                      : 'Company default'
                  }
                />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <Card.Title>Bank/Payment</Card.Title>
              {canEditBank && editingSection !== 'bank' && (
                <SectionEditButton onClick={() => setEditingSection('bank')} />
              )}
            </div>
            {editingSection === 'bank' ? (
              <EditBankInfoForm employee={employee} onSaved={stopEditing} onCancel={() => setEditingSection(null)} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-3">
                <Field label="Bank name" value={employee.bank.bankName} />
                <Field label="Account number" value={employee.bank.accountNumber} />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <div className="space-y-3">
            {canEditProfile && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">PDF, image, Word or Excel files up to 5 MB. They are private; opening one uses a link that expires in a few minutes.</p>
                <Button size="sm" icon={<Upload className="size-3.5" />} onClick={() => documentInput.current?.click()}>
                  Upload document
                </Button>
                <input ref={documentInput} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" className="hidden" onChange={uploadDocument} />
              </div>
            )}
            {employee.documents.length === 0 ? (
              <EmptyState icon={FileText} title="No documents uploaded" />
            ) : (
              <div className="space-y-2">
                {employee.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <p className="truncate text-sm font-medium">{doc.name}</p>
                      <span className="text-xs uppercase text-muted-foreground">{doc.fileType}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <p className="mr-2 text-xs text-muted-foreground">Uploaded {formatDate(doc.uploadedAt)}</p>
                      <Button size="sm" variant="ghost" aria-label={`Open ${doc.name}`} onClick={() => openDocument(doc.id)}>
                        <Download className="size-4" />
                      </Button>
                      {canEditProfile && (
                        <Button size="sm" variant="ghost" aria-label={`Delete ${doc.name}`} onClick={() => run(() => deleteEmployeeDocument(employee.id, doc.id), { title: 'Document deleted' })}>
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-3">
            {employee.history
              .map((entry) => (
                <div key={entry.id} className="flex gap-3 border-l-2 border-border pl-4">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.actor} &middot; {formatDate(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={statusDialog !== null} onOpenChange={(open) => !open && setStatusDialog(null)}>
        <DialogContent>
          <DialogTitle className="capitalize">{statusDialog} {fullName}?</DialogTitle>
          <DialogDescription>
            {statusDialog === 'archived'
              ? 'Archived employees are removed from active lists but their record and history are kept.'
              : statusDialog === 'active'
                ? 'This restores the employee to the active roster.'
                : 'Deactivated employees keep their record but are excluded from active payroll runs.'}
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setStatusDialog(null)}>
              Cancel
            </Button>
            <Button variant={statusDialog === 'archived' ? 'destructive' : 'primary'} onClick={applyStatusChange}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Create a login for {fullName}?</DialogTitle>
          <DialogDescription>An invite link is sent to this email so they can set their own password. They sign in as an Employee.</DialogDescription>
          <div className="mt-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
            <Input type="email" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAccountOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!accountEmail.trim()} onClick={applyAccountCreate}>
              Send invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Reset password?</DialogTitle>
          <DialogDescription>
            {fullName} ({account?.email}) — a reset link is sent to their email, and they must choose a new password at next sign-in.
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyPasswordReset}>
              Send reset link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={separateOpen} onOpenChange={setSeparateOpen}>
        <DialogContent>
          <DialogTitle>Separate {fullName}?</DialogTitle>
          <DialogDescription>
            Record why and when the employment ended. The employee is archived — removed from active lists and payroll — but their record, payslips and history are kept.
          </DialogDescription>
          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Separation type</p>
              <Select
                value={separationReason}
                onValueChange={(v) => setSeparationReason(v as keyof typeof SEPARATION_LABEL)}
                options={Object.entries(SEPARATION_LABEL).map(([value, label]) => ({ value, label }))}
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Last working day</p>
              <Input type="date" value={separationDate} min={employee.employment.dateHired} onChange={(e) => setSeparationDate(e.target.value)} />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes (optional)</p>
              <Input value={separationNotes} onChange={(e) => setSeparationNotes(e.target.value)} placeholder="e.g. Accepted another offer" />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSeparateOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={!separationDate} onClick={applySeparation}>
              Confirm separation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingGroupId !== undefined} onOpenChange={(open) => !open && setPendingGroupId(undefined)}>
        <DialogContent>
          <DialogTitle>{pendingGroupId ? `Reassign to ${pendingGroup?.name}?` : 'Remove from Payroll Group?'}</DialogTitle>
          <DialogDescription>
            {currentGroup
              ? `This employee is currently assigned to ${currentGroup.name}. ${
                  pendingGroupId ? `Reassign to ${pendingGroup?.name}?` : 'Unassign them from it?'
                }`
              : `Assign ${fullName} to ${pendingGroup?.name}?`}
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPendingGroupId(undefined)}>
              Cancel
            </Button>
            <Button onClick={applyGroupChange}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
