import { Check, Minus, Search, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@ops/components/ui/Dialog'
import { Input } from '@ops/components/ui/Input'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Switch } from '@ops/components/ui/Switch'
import { apiErrorMessage } from '@ops/lib/api/http'
import { getPermissionRole, type CapabilityInfo, type PermissionRoleDetail } from '@ops/lib/services/userAccessService'
import { cn } from '@ops/lib/utils/cn'

function CapabilityRow({ capability, granted }: { capability: CapabilityInfo; granted: boolean }) {
  return (
    <li className={cn('flex items-start gap-3 px-4 py-2.5', !granted && 'opacity-60')}>
      <span className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full', granted ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground')}>
        {granted ? <Check className="size-3" /> : <Minus className="size-3" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium">
          {capability.label}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-normal text-muted-foreground">{capability.name}</code>
        </p>
        <p className="text-xs text-muted-foreground">{capability.description}</p>
      </div>
      {!granted && <span className="shrink-0 text-[11px] text-muted-foreground">Not granted</span>}
    </li>
  )
}

/** The full, grouped capability list for one role (loaded from the API) — every permission it has, optionally beside the ones it doesn't. */
export function RolePermissionsDialog({ roleId, roleLabel, onClose }: { roleId: number | null; roleLabel: string; onClose: () => void }) {
  const [role, setRole] = useState<PermissionRoleDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [showNotGranted, setShowNotGranted] = useState(false)

  useEffect(() => {
    if (roleId === null) return
    let cancelled = false
    setRole(null)
    setError(null)
    getPermissionRole(roleId)
      .then((r) => !cancelled && setRole(r))
      .catch((e) => !cancelled && setError(apiErrorMessage(e)))
    return () => {
      cancelled = true
    }
  }, [roleId])

  const total = role ? role.areas.reduce((n, a) => n + a.granted.length + a.notGranted.length, 0) : 0
  const q = query.trim().toLowerCase()
  const matches = (c: CapabilityInfo, area: string) => !q || `${c.name} ${c.label} ${c.description ?? ''} ${area}`.toLowerCase().includes(q)
  const groups = (role?.areas ?? [])
    .map((a) => ({ ...a, visibleGranted: a.granted.filter((c) => matches(c, a.label)), visibleNotGranted: showNotGranted ? a.notGranted.filter((c) => matches(c, a.label)) : [] }))
    .filter((a) => a.visibleGranted.length + a.visibleNotGranted.length > 0)

  function close(open: boolean) {
    if (open) return
    setQuery('')
    setShowNotGranted(false)
    onClose()
  }

  return (
    <Dialog open={roleId !== null} onOpenChange={close}>
      <DialogContent className="flex max-w-3xl flex-col overflow-hidden p-0 sm:p-0">
        <div className="space-y-3 border-b border-border px-4 pb-4 pt-4 pr-12 sm:px-6 sm:pt-5">
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            {roleLabel}
            {role && (
              <Badge tone="brand">
                {role.capabilitiesCount} of {total} capabilities
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{role?.description ?? ' '}</DialogDescription>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search permissions…" className="pl-9" />
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={showNotGranted} onCheckedChange={setShowNotGranted} />
              Show permissions not granted
            </label>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          {error ? (
            <p className="py-10 text-center text-sm text-danger">{error}</p>
          ) : !role ? (
            <Skeleton className="h-48" />
          ) : groups.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{q ? 'No permissions match your search.' : 'This role has no permissions.'}</p>
          ) : (
            groups.map((g) => (
              <section key={g.key} className="overflow-hidden rounded-xl border border-border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-semibold">{g.label}</p>
                    <p className="text-xs text-muted-foreground">{g.description}</p>
                  </div>
                  <Badge tone={g.notGranted.length === 0 ? 'success' : g.granted.length === 0 ? 'neutral' : 'brand'}>
                    {g.granted.length} / {g.granted.length + g.notGranted.length} granted
                  </Badge>
                </div>
                <ul className="divide-y divide-border">
                  {g.visibleGranted.map((c) => (
                    <CapabilityRow key={c.name} capability={c} granted />
                  ))}
                  {g.visibleNotGranted.map((c) => (
                    <CapabilityRow key={c.name} capability={c} granted={false} />
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
