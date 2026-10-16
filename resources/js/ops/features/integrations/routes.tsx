import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy, Download, Plug, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Card } from '@ops/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ops/components/ui/Dialog'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { FormField } from '@ops/components/ui/FormField'
import { Checkbox } from '@ops/components/ui/Checkbox'
import { Input } from '@ops/components/ui/Input'
import { PlanGate } from '@ops/components/ui/PlanGate'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Switch } from '@ops/components/ui/Switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { useToast } from '@ops/components/ui/Toast'
import { ImportEmployeesDialog } from '@ops/features/employees/components/ImportEmployeesDialog'
import { useApiKeys, useWebhookDeliveries, useWebhooks } from '@ops/features/integrations/hooks/useIntegrations'
import { useActivePlanTier } from '@ops/hooks/useActivePlanTier'
import { useSession } from '@ops/hooks/useSession'
import { apiErrorMessage, fieldErrors } from '@ops/lib/api/http'
import {
  API_KEY_ABILITIES,
  WEBHOOK_EVENTS,
  createApiKey,
  createWebhook,
  deleteWebhook,
  exportEmployeeMasterlistCsv,
  exportPayrollRegisterCsv,
  retryWebhookDelivery,
  revokeApiKey,
  setWebhookActive,
  type ApiKeyAbility,
  type Webhook,
  type WebhookEvent,
} from '@ops/lib/services/integrationService'
import { formatDate } from '@ops/lib/utils/format'

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function DataExportTab() {
  const { user } = useSession()
  const { notify } = useToast()

  async function onExportEmployees() {
    const csv = await exportEmployeeMasterlistCsv(user)
    downloadCsv('employee-masterlist.csv', csv)
    notify({ title: 'Employee masterlist exported', tone: 'success' })
  }

  async function onExportPayroll() {
    const csv = await exportPayrollRegisterCsv(user)
    downloadCsv('payroll-register.csv', csv)
    notify({ title: 'Payroll register exported', tone: 'success' })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="p-5">
        <p className="text-sm font-medium">Employee Masterlist</p>
        <p className="mt-1 text-xs text-muted-foreground">Export the full employee roster as CSV for use in other systems.</p>
        <Button size="sm" className="mt-4" variant="secondary" icon={<Download className="size-4" />} onClick={onExportEmployees}>
          Export CSV
        </Button>
      </Card>
      <Card className="p-5">
        <p className="text-sm font-medium">Payroll Register</p>
        <p className="mt-1 text-xs text-muted-foreground">Export the latest payroll period so it can integrate with accounting software.</p>
        <Button size="sm" className="mt-4" variant="secondary" icon={<Download className="size-4" />} onClick={onExportPayroll}>
          Export CSV
        </Button>
      </Card>
    </div>
  )
}

/** Shows a secret exactly once: the server keeps only a hash (API key) or never lists it again (webhook secret). */
function SecretDialog({ title, description, secret, onClose }: { title: string; description: string; secret: string | null; onClose: () => void }) {
  const { notify } = useToast()
  return (
    <Dialog open={secret !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="mt-4 flex items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-xs">{secret}</code>
          <Button
            size="sm"
            variant="secondary"
            icon={<Copy className="size-4" />}
            onClick={() => {
              if (secret) void navigator.clipboard.writeText(secret).then(() => notify({ title: 'Copied', tone: 'success' }))
            }}
          >
            Copy
          </Button>
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={onClose}>I&apos;ve saved it</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DataImportTab() {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium">Import Employees</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Add many employees from a CSV file. The dialog shows the exact columns, checks every row before anything is saved and lists the rows that need fixing.
      </p>
      <div className="mt-4">
        <ImportEmployeesDialog />
      </div>
    </Card>
  )
}

const EXPIRY_OPTIONS = [
  { value: 'never', label: 'Never expires' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: '1 year' },
]

function ApiKeysTab() {
  const { notify } = useToast()
  const queryClient = useQueryClient()
  const { apiKeys, isLoading } = useApiKeys()
  const [label, setLabel] = useState('')
  const [abilities, setAbilities] = useState<ApiKeyAbility[]>(['employees.read'])
  const [expiry, setExpiry] = useState('never')
  const [newToken, setNewToken] = useState<string | null>(null)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['integrations', 'keys'] })

  const create = useMutation({
    mutationFn: createApiKey,
    onSuccess: ({ token }) => {
      setNewToken(token)
      setLabel('')
      void refresh()
    },
    onError: (e) => notify({ title: apiErrorMessage(e), tone: 'danger' }),
  })
  const revoke = useMutation({
    mutationFn: revokeApiKey,
    onSuccess: () => {
      void refresh()
      notify({ title: 'API key revoked', tone: 'success' })
    },
    onError: (e) => notify({ title: apiErrorMessage(e), tone: 'danger' }),
  })
  const toggle = (ability: ApiKeyAbility, on: boolean) => setAbilities((prev) => (on ? [...prev, ability] : prev.filter((a) => a !== ability)))

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-end gap-3">
          <FormField label="New key label" className="flex-1 basis-56">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Accounting Sync" maxLength={80} />
          </FormField>
          <FormField label="Expires" className="w-44">
            <Select value={expiry} onValueChange={setExpiry} options={EXPIRY_OPTIONS} aria-label="Expiry" />
          </FormField>
        </div>
        <div>
          <p className="text-xs font-medium">What the key can read</p>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            {API_KEY_ABILITIES.map((a) => (
              <label key={a.value} className="flex items-start gap-2 text-xs">
                <Checkbox checked={abilities.includes(a.value)} onCheckedChange={(v) => toggle(a.value, v === true)} className="mt-0.5" />
                <span>
                  <span className="font-medium">{a.label}</span>
                  <span className="block font-mono text-[11px] text-muted-foreground">{a.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          A key acts as you, limited to what you tick here: it can never read more than your own account can. Send it as <span className="font-mono">Authorization: Bearer &lt;key&gt;</span>. 60 calls a minute per key.
        </p>
        <Button
          size="sm"
          icon={<Plus className="size-4" />}
          disabled={!label.trim() || abilities.length === 0}
          isLoading={create.isPending}
          onClick={() => create.mutate({ label: label.trim(), abilities, expiresInDays: expiry === 'never' ? undefined : Number(expiry) })}
        >
          Generate Key
        </Button>
      </Card>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : apiKeys.length === 0 ? (
        <EmptyState title="No API keys yet" description="Generate a key to let external systems read your data." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Can read</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last used</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">{key.label}</TableCell>
                <TableCell className="text-xs">{key.abilities.map((a) => a.replace('.read', '')).join(', ')}</TableCell>
                <TableCell>
                  {formatDate(key.createdAt)}
                  {key.createdBy && <span className="block text-[11px] text-muted-foreground">by {key.createdBy}</span>}
                </TableCell>
                <TableCell>{key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}</TableCell>
                <TableCell>{key.expired ? <Badge tone="danger">Expired</Badge> : key.expiresAt ? formatDate(key.expiresAt) : '—'}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" icon={<Trash2 className="size-4" />} isLoading={revoke.isPending && revoke.variables === key.id} onClick={() => revoke.mutate(key.id)}>
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <SecretDialog title="Your new API key" description="Copy it now. For your security it is not stored and will not be shown again." secret={newToken} onClose={() => setNewToken(null)} />
    </div>
  )
}

function AddWebhookDialog({ onCreated }: { onCreated: (secret: string) => void }) {
  const { notify } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [events, setEvents] = useState<WebhookEvent[]>(['payroll.finalized'])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const create = useMutation({
    mutationFn: createWebhook,
    onSuccess: ({ secret }) => {
      void queryClient.invalidateQueries({ queryKey: ['integrations', 'webhooks'] })
      setUrl('')
      setOpen(false)
      onCreated(secret)
    },
    onError: (e) => {
      setErrors(fieldErrors(e))
      if (Object.keys(fieldErrors(e)).length === 0) notify({ title: apiErrorMessage(e), tone: 'danger' })
    },
  })

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); setErrors({}) }}>
      <DialogTrigger asChild>
        <Button size="sm" icon={<Plus className="size-4" />}>
          Add Webhook
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add Webhook</DialogTitle>
        <DialogDescription>Clear Count will POST each event to this address, signed with a secret that is shown once after you save.</DialogDescription>
        <div className="mt-5 space-y-4">
          <FormField label="Endpoint URL" required error={errors.url} hint="Must be an https:// address on the public internet.">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/webhooks/clear-count" invalid={!!errors.url} />
          </FormField>
          <FormField label="Events" error={errors.events}>
            <div className="space-y-2">
              {WEBHOOK_EVENTS.map((ev) => (
                <label key={ev.value} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={events.includes(ev.value)} onCheckedChange={(v) => setEvents((prev) => (v === true ? [...prev, ev.value] : prev.filter((x) => x !== ev.value)))} />
                  {ev.label}
                </label>
              ))}
            </div>
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => create.mutate({ url: url.trim(), events })} isLoading={create.isPending} disabled={!url.trim() || events.length === 0}>
              Add Webhook
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const DELIVERY_TONE = { success: 'success', failed: 'danger', retrying: 'warning', pending: 'neutral' } as const

function DeliveriesDialog({ webhook, onClose }: { webhook: Webhook | null; onClose: () => void }) {
  const { notify } = useToast()
  const { deliveries, isLoading, refetch } = useWebhookDeliveries(webhook?.id ?? null)
  const retry = useMutation({
    mutationFn: retryWebhookDelivery,
    onSuccess: () => {
      refetch()
      notify({ title: 'Delivery sent again', tone: 'success' })
    },
    onError: (e) => notify({ title: apiErrorMessage(e), tone: 'danger' }),
  })

  return (
    <Dialog open={webhook !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Deliveries</DialogTitle>
        <DialogDescription className="break-all font-mono text-xs">{webhook?.url}</DialogDescription>
        <div className="mt-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <Skeleton className="h-24" />
          ) : deliveries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nothing has been sent to this address yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {deliveries.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                      {d.event}
                      <Badge tone={DELIVERY_TONE[d.status]} className="capitalize">
                        {d.status}
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(d.createdAt)} · {d.attempts} attempt{d.attempts === 1 ? '' : 's'}
                      {d.responseCode ? ` · HTTP ${d.responseCode}` : ''}
                      {d.error ? ` · ${d.error}` : ''}
                    </p>
                  </div>
                  {d.status === 'failed' && (
                    <Button size="sm" variant="secondary" icon={<RotateCw className="size-4" />} isLoading={retry.isPending && retry.variables === d.id} onClick={() => retry.mutate(d.id)}>
                      Send again
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function WebhooksTab() {
  const { notify } = useToast()
  const queryClient = useQueryClient()
  const { webhooks, isLoading } = useWebhooks()
  const [secret, setSecret] = useState<string | null>(null)
  const [viewing, setViewing] = useState<Webhook | null>(null)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['integrations', 'webhooks'] })
  const onError = (e: unknown) => notify({ title: apiErrorMessage(e), tone: 'danger' })
  const remove = useMutation({
    mutationFn: deleteWebhook,
    onSuccess: () => {
      void refresh()
      notify({ title: 'Webhook removed', tone: 'success' })
    },
    onError,
  })
  const toggle = useMutation({ mutationFn: ({ id, active }: { id: string; active: boolean }) => setWebhookActive(id, active), onSuccess: () => void refresh(), onError })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddWebhookDialog onCreated={setSecret} />
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : webhooks.length === 0 ? (
        <EmptyState title="No webhooks yet" description="Add a webhook to notify external systems of payroll and HR events." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Events</TableHead>
              <TableHead>Endpoint URL</TableHead>
              <TableHead>Last delivery</TableHead>
              <TableHead>On</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((ev) => (
                      <Badge key={ev} tone="brand">
                        {WEBHOOK_EVENTS.find((o) => o.value === ev)?.label ?? ev}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-64 break-all font-mono text-xs">{webhook.url}</TableCell>
                <TableCell>
                  {webhook.lastDelivery ? (
                    <Badge tone={DELIVERY_TONE[webhook.lastDelivery.status]} className="capitalize">
                      {webhook.lastDelivery.status}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">None yet</span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch checked={webhook.isActive} onCheckedChange={(active) => toggle.mutate({ id: webhook.id, active })} aria-label={`Send events to ${webhook.url}`} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setViewing(webhook)}>
                      Deliveries
                    </Button>
                    <Button size="sm" variant="ghost" icon={<Trash2 className="size-4" />} isLoading={remove.isPending && remove.variables === webhook.id} onClick={() => remove.mutate(webhook.id)}>
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <p className="text-xs text-muted-foreground">
        Each delivery has the headers <span className="font-mono">X-FBS-Event</span>, <span className="font-mono">X-FBS-Delivery</span> and <span className="font-mono">X-FBS-Signature: t=&lt;unix&gt;,v1=&lt;hex&gt;</span>, where v1 is the HMAC-SHA256 of
        <span className="font-mono"> t.body</span> with your secret. A failed delivery is retried after 1, 5, 15 and 60 minutes.
      </p>

      <SecretDialog title="Your webhook secret" description="Use it to check the signature of each delivery. Copy it now: it will not be shown again." secret={secret} onClose={() => setSecret(null)} />
      <DeliveriesDialog webhook={viewing} onClose={() => setViewing(null)} />
    </div>
  )
}

const CONNECTED_SERVICES = [
  { name: 'Accounting Software Sync', description: 'Push finalized payroll journal entries automatically.' },
  { name: 'Biometric Attendance Devices', description: 'Import time-in/time-out records from biometric scanners.' },
  { name: 'Banking / Payment Disbursement', description: 'Send net pay directly to employee bank accounts.' },
]

function ConnectedServicesTab() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CONNECTED_SERVICES.map((service) => (
        <Card key={service.name} className="p-5">
          <div className="flex items-center gap-2">
            <Plug className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium">{service.name}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{service.description}</p>
          <Badge tone="neutral" className="mt-3">
            Coming Soon
          </Badge>
        </Card>
      ))}
    </div>
  )
}

function GatedApiTabs() {
  const { tier } = useActivePlanTier()
  const [tab, setTab] = useState('api-keys')

  return (
    <PlanGate feature="api_integrations" planTier={tier}>
      <Tabs value={tab} onValueChange={setTab}>
        <Select className="-mb-2 lg:hidden" value={tab} onValueChange={setTab} aria-label="API section" options={[{ value: 'api-keys', label: 'API Keys' }, { value: 'webhooks', label: 'Webhooks' }]} />
        <TabsList className="hidden lg:flex">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>
        <TabsContent value="api-keys">
          <ApiKeysTab />
        </TabsContent>
        <TabsContent value="webhooks">
          <WebhooksTab />
        </TabsContent>
      </Tabs>
    </PlanGate>
  )
}

export function IntegrationsPage() {
  const [tab, setTab] = useState('export')
  return (
    <div className="space-y-5">
      <PageHeader
        title="Integrations & API"
        description="Import/export data, manage API access, and connect external systems."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <Select className="-mb-2 lg:hidden" value={tab} onValueChange={setTab} aria-label="Integrations section" options={[{ value: 'export', label: 'Data Export' }, { value: 'import', label: 'Data Import' }, { value: 'api', label: 'API & Webhooks' }, { value: 'services', label: 'Connected Services' }]} />
        <TabsList className="hidden lg:flex">
          <TabsTrigger value="export">Data Export</TabsTrigger>
          <TabsTrigger value="import">Data Import</TabsTrigger>
          <TabsTrigger value="api">API & Webhooks</TabsTrigger>
          <TabsTrigger value="services">Connected Services</TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <DataExportTab />
        </TabsContent>
        <TabsContent value="import">
          <DataImportTab />
        </TabsContent>
        <TabsContent value="api">
          <GatedApiTabs />
        </TabsContent>
        <TabsContent value="services">
          <ConnectedServicesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
