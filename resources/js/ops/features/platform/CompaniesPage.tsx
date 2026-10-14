import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Clock, Plus } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { FormField } from '@ops/components/ui/FormField'
import { Input } from '@ops/components/ui/Input'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useToast } from '@ops/components/ui/Toast'
import { apiErrorMessage, fieldErrors } from '@ops/lib/api/http'
import { PLAN_DETAILS, PLAN_ORDER } from '@ops/lib/plans'
import {
  createCompany,
  decidePayment,
  getPlatformCompanies,
  getPlatformPayments,
  setCompanyPlan,
  setCompanyStatus,
  type NewCompanyInput,
  type PlatformCompany,
  type SubscriptionPayment,
} from '@ops/lib/services/subscriptionService'
import { formatCurrency, formatDate } from '@ops/lib/utils/format'
import type { PlanTier } from '@ops/types/domain'

const PLAN_OPTIONS = PLAN_ORDER.map((tier) => ({ value: tier, label: PLAN_DETAILS[tier].label }))
const EMPTY_COMPANY: NewCompanyInput = { name: '', planTier: 'basic', adminFirstName: '', adminLastName: '', adminEmail: '' }

function NewCompanyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notify } = useToast()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<NewCompanyInput>(EMPTY_COMPANY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const create = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['platform'] })
      notify({ title: `${form.name} added — an invite was emailed to ${form.adminEmail}`, tone: 'success' })
      setForm(EMPTY_COMPANY)
      onClose()
    },
    onError: (e) => setErrors({ ...fieldErrors(e), form: apiErrorMessage(e) }),
  })
  const set = <K extends keyof NewCompanyInput>(key: K, value: NewCompanyInput[K]) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) { setErrors({}); onClose() } }}>
      <DialogContent className="max-w-md">
        <DialogTitle>New company</DialogTitle>
        <DialogDescription>Creates the company with a head office and its first Company Admin, who gets an email to set a password.</DialogDescription>
        <div className="mt-4 space-y-3">
          <FormField label="Company name" error={errors.name}>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} invalid={!!errors.name} />
          </FormField>
          <FormField label="Plan" error={errors.plan_tier}>
            <Select value={form.planTier} onValueChange={(v) => set('planTier', v as PlanTier)} options={PLAN_OPTIONS} aria-label="Plan" />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Admin first name" error={errors.admin_first_name}>
              <Input value={form.adminFirstName} onChange={(e) => set('adminFirstName', e.target.value)} invalid={!!errors.admin_first_name} />
            </FormField>
            <FormField label="Admin last name" error={errors.admin_last_name}>
              <Input value={form.adminLastName} onChange={(e) => set('adminLastName', e.target.value)} invalid={!!errors.admin_last_name} />
            </FormField>
          </div>
          <FormField label="Admin email" error={errors.admin_email}>
            <Input type="email" value={form.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} invalid={!!errors.admin_email} />
          </FormField>
          {errors.form && !Object.keys(errors).some((k) => k !== 'form' && errors[k]) && <p className="text-sm text-danger">{errors.form}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button isLoading={create.isPending} onClick={() => create.mutate(form)}>
            Create company
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CompanyCard({ company }: { company: PlatformCompany }) {
  const { notify } = useToast()
  const queryClient = useQueryClient()
  const suspended = company.status === 'suspended'
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['platform'] })
  const onError = (e: unknown) => notify({ title: apiErrorMessage(e), tone: 'danger' })
  const status = useMutation({
    mutationFn: () => setCompanyStatus(company.id, suspended ? 'active' : 'suspended'),
    onSuccess: () => {
      void refresh()
      notify({ title: suspended ? `${company.name} is active again` : `${company.name} is suspended: its users are signed out`, tone: 'success' })
    },
    onError,
  })
  const plan = useMutation({
    mutationFn: (tier: PlanTier) => setCompanyPlan(company.id, tier),
    onSuccess: () => {
      void refresh()
      notify({ title: 'Plan updated', tone: 'success' })
    },
    onError,
  })

  return (
    <Card>
      <Card.Header>
        <div className="flex min-w-0 items-center gap-2">
          <Building2 className="size-4 shrink-0 text-muted-foreground" />
          <Card.Title className="truncate">{company.name}</Card.Title>
        </div>
        <Badge tone={suspended ? 'danger' : 'success'} className="capitalize">
          {company.status}
        </Badge>
      </Card.Header>
      <Card.Body className="space-y-1 pt-3 text-sm text-muted-foreground">
        <p>
          {company.employees} employees · {company.users ?? 0} admin/manager accounts
        </p>
        <p>Payroll frequency: {company.payrollFrequency.replace('_', '-')}</p>
        {company.planRenewsOn && <p>Renews {formatDate(company.planRenewsOn)}</p>}
        {company.admin && (
          <p className="truncate">
            Admin: {company.admin.name} ({company.admin.email}){company.admin.invitePending ? ' · invite not accepted yet' : ''}
          </p>
        )}
        {company.hasPendingPayment && <p className="text-warning">Upgrade payment awaiting verification</p>}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <div className="w-44">
            <Select value={company.planTier} onValueChange={(v) => plan.mutate(v as PlanTier)} options={PLAN_OPTIONS} aria-label={`Plan of ${company.name}`} disabled={plan.isPending} />
          </div>
          <Button size="sm" variant="secondary" isLoading={status.isPending} onClick={() => status.mutate()}>
            {suspended ? 'Activate' : 'Suspend'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

function PendingPayments({ payments }: { payments: SubscriptionPayment[] }) {
  const { notify } = useToast()
  const queryClient = useQueryClient()
  const [proofOf, setProofOf] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<SubscriptionPayment | null>(null)
  const [remarks, setRemarks] = useState('')
  const decide = useMutation({
    mutationFn: ({ payment, approve }: { payment: SubscriptionPayment; approve: boolean }) => decidePayment(payment.id, approve ? 'approved' : 'rejected', approve ? undefined : remarks.trim() || undefined),
    onSuccess: (_, { approve }) => {
      void queryClient.invalidateQueries({ queryKey: ['platform'] })
      setRejecting(null)
      setRemarks('')
      notify({ title: approve ? 'Payment confirmed — plan updated' : 'Upgrade request rejected', tone: approve ? 'success' : 'default' })
    },
    onError: (e) => notify({ title: apiErrorMessage(e), tone: 'danger' }),
  })

  if (payments.length === 0) return null

  return (
    <>
      <Card className="p-5">
        <Card.Title>Upgrade payments to verify</Card.Title>
        <Card.Description>Check each payment against the QR account, then confirm. The company&apos;s plan only changes when you confirm.</Card.Description>
        <div className="mt-4 space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div className="min-w-0 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <Clock className="size-3.5 text-warning" />
                  {payment.companyName}: {PLAN_DETAILS[payment.fromTier].label} → {PLAN_DETAILS[payment.toTier].label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(payment.amount)} · note <span className="font-mono">{payment.paymentReference}</span> · receipt <span className="font-mono">{payment.receiptReference}</span> · {formatDate(payment.submittedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setProofOf(payment.proofUrl)} title="View proof of payment" className="overflow-hidden rounded-lg border border-border">
                  <img src={payment.proofUrl} alt="Proof of payment" className="size-10 object-cover" />
                </button>
                <Button size="sm" variant="secondary" onClick={() => setRejecting(payment)}>
                  Reject
                </Button>
                <Button size="sm" isLoading={decide.isPending && decide.variables?.payment.id === payment.id && decide.variables.approve} onClick={() => decide.mutate({ payment, approve: true })}>
                  Confirm Payment
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={proofOf !== null} onOpenChange={(open) => !open && setProofOf(null)}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Proof of payment</DialogTitle>
          {proofOf && <img src={proofOf} alt="Proof of payment" className="mt-3 max-h-[70vh] w-full rounded-lg object-contain" />}
        </DialogContent>
      </Dialog>

      <Dialog open={rejecting !== null} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle>Reject this payment?</DialogTitle>
          <DialogDescription>The company stays on its current plan and is told why.</DialogDescription>
          <FormField label="Reason (optional)" className="mt-4">
            <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. The amount does not match" maxLength={255} />
          </FormField>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button isLoading={decide.isPending} onClick={() => rejecting && decide.mutate({ payment: rejecting, approve: false })}>
              Reject payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function CompaniesPage() {
  const [creating, setCreating] = useState(false)
  const companies = useQuery({ queryKey: ['platform', 'companies'], queryFn: getPlatformCompanies })
  const payments = useQuery({ queryKey: ['platform', 'payments'], queryFn: getPlatformPayments })
  const pending = (payments.data ?? []).filter((p) => p.status === 'pending')

  return (
    <div className="space-y-5">
      <PageHeader
        title="Companies"
        description="Every company on the platform: onboard a new one, suspend or reactivate it, set its plan, and verify upgrade payments."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>
            New company
          </Button>
        }
      />

      <PendingPayments payments={pending} />

      {companies.isPending ? (
        <Skeleton className="h-48" />
      ) : companies.error ? (
        <p className="text-sm text-danger">{apiErrorMessage(companies.error)}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.data.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}

      <NewCompanyDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
