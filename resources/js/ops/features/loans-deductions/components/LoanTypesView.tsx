import { Pencil, Power, Trash2 } from 'lucide-react'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import { SectionIntro } from '@ops/features/loans-deductions/components/SectionIntro'
import { Card } from '@ops/components/ui/Card'
import { LoanTypeDialog } from '@ops/features/loans-deductions/components/LoanTypeDialog'
import { useDeductionConfigs, useLoanTypes } from '@ops/features/loans-deductions/hooks/useBenefitsDeductions'
import { useLoans } from '@ops/features/loans-deductions/hooks/useLoans'
import { usePermission } from '@ops/hooks/usePermission'
import { loanConfigNameFor } from '@ops/lib/payroll/payFrequency'
import { deleteLoanType, updateLoanType } from '@ops/lib/services/loanApiService'
import { formatCurrency } from '@ops/lib/utils/format'
import type { DeductionConfig, LoanTypeConfig } from '@ops/types/domain'

function allocationLabel(config: DeductionConfig | undefined): string {
  if (!config) return 'Equal split across pay runs'
  if (config.allocationMethod === 'specific_cutoff') return `Full amount on pay period ${config.specificCutoffPeriod ?? 1}`
  if (config.allocationMethod === 'custom') return `Custom split (${(config.customSplitPercentages ?? []).join('% / ')}%)`
  return 'Equal split across pay runs'
}

const PROVIDER_TONE = { SSS: 'brand', 'Pag-IBIG': 'warning', Company: 'neutral', Other: 'neutral' } as const

/** The loan types an employee loan can be filed under. Built-in types can be edited or deactivated; the company can add its own. */
export function LoanTypesView() {
  const { loans } = useLoans()
  const { types, refetch } = useLoanTypes()
  const configs = useDeductionConfigs()
  const canManage = usePermission('loans.manage')
  const { notify } = useToast()

  async function toggle(type: LoanTypeConfig) {
    await updateLoanType(type.id, { isActive: !type.isActive })
    notify({ title: type.isActive ? `${type.label} deactivated` : `${type.label} reactivated`, description: type.isActive ? 'It can no longer be picked for new loans. Existing loans are unaffected.' : undefined, tone: 'success' })
    refetch()
  }

  async function remove(type: LoanTypeConfig) {
    if (await deleteLoanType(type.id)) {
      notify({ title: `${type.label} deleted`, tone: 'success' })
      refetch()
    }
  }

  return (
    <div className="space-y-4">
      <SectionIntro
        title="Loan Types"
        description="The types you can choose when adding an employee loan. Each is deducted per its entry in Company & Payroll Settings → Deductions (how the monthly amount is split across a month’s pay runs); types you add are collected like a Company Loan."
        action={canManage && <LoanTypeDialog existing={types} onSaved={refetch} />}
      />

      {/* Phones and tablets: one card per loan type (two columns on tablet). */}
      <div className="grid items-start gap-3 sm:grid-cols-2 lg:hidden">
        {types.map((type) => {
          const ofType = loans.filter((l) => l.type === type.key)
          const active = ofType.filter((l) => l.status === 'active')
          const settingName = loanConfigNameFor(type.key)
          const config = configs.find((c) => c.name === settingName)
          return (
            <Card key={type.id} watermark={null} className={type.isActive ? 'space-y-3 p-4' : 'space-y-3 p-4 opacity-60'}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-semibold">{type.label}</p>
                    {!type.builtIn && <Badge tone="neutral">Custom</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{type.description}</p>
                </div>
                <Badge tone={type.isActive ? 'success' : 'neutral'}>{type.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-muted/40 p-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">Provider</dt>
                  <dd className="mt-1">
                    <Badge tone={PROVIDER_TONE[type.provider]}>{type.provider}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Typical terms</dt>
                  <dd className="mt-1 font-medium">{type.typicalTerm}</dd>
                  <dd className="text-muted-foreground">{type.typicalAmount}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Active loans</dt>
                  <dd className="mt-1 font-medium">{active.length}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Outstanding balance</dt>
                  <dd className="mt-1 font-medium">{active.length > 0 ? formatCurrency(active.reduce((sum, l) => sum + l.balance, 0)) : '—'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Collected in payroll</dt>
                  <dd className="mt-1 font-medium">{allocationLabel(config)}</dd>
                  <dd className="text-muted-foreground">Setting: {settingName}</dd>
                </div>
              </dl>

              {canManage && (
                <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
                  <LoanTypeDialog
                    type={type}
                    existing={types}
                    onSaved={refetch}
                    trigger={
                      <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} iconOnlyOnMobile>
                        Edit
                      </Button>
                    }
                  />
                  <Button size="sm" variant="ghost" icon={<Power className="size-3.5" />} iconOnlyOnMobile onClick={() => toggle(type)}>
                    {type.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  {!type.builtIn && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Trash2 className="size-3.5" />}
                      iconOnlyOnMobile
                      disabled={ofType.length > 0}
                      title={ofType.length > 0 ? 'Loans use this type — deactivate it instead.' : undefined}
                      onClick={() => remove(type)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loan Type</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Typical Terms</TableHead>
            <TableHead>Collected In Payroll</TableHead>
            <TableHead>Active Loans</TableHead>
            <TableHead>Outstanding Balance</TableHead>
            <TableHead>Status</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((type) => {
            const ofType = loans.filter((l) => l.type === type.key)
            const active = ofType.filter((l) => l.status === 'active')
            const settingName = loanConfigNameFor(type.key)
            const config = configs.find((c) => c.name === settingName)
            return (
              <TableRow key={type.id} className={type.isActive ? undefined : 'opacity-60'}>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium">{type.label}</span>
                    {!type.builtIn && <Badge tone="neutral">Custom</Badge>}
                  </div>
                  <p className="max-w-xs text-xs text-muted-foreground">{type.description}</p>
                </TableCell>
                <TableCell>
                  <Badge tone={PROVIDER_TONE[type.provider]}>{type.provider}</Badge>
                </TableCell>
                <TableCell>
                  <p>{type.typicalTerm}</p>
                  <p className="text-xs text-muted-foreground">{type.typicalAmount}</p>
                </TableCell>
                <TableCell>
                  <p>{allocationLabel(config)}</p>
                  <p className="text-xs text-muted-foreground">Setting: {settingName}</p>
                </TableCell>
                <TableCell>{active.length}</TableCell>
                <TableCell>{active.length > 0 ? formatCurrency(active.reduce((sum, l) => sum + l.balance, 0)) : <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>
                  <Badge tone={type.isActive ? 'success' : 'neutral'}>{type.isActive ? 'Active' : 'Inactive'}</Badge>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <LoanTypeDialog
                        type={type}
                        existing={types}
                        onSaved={refetch}
                        trigger={
                          <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />}>
                            Edit
                          </Button>
                        }
                      />
                      <Button size="sm" variant="ghost" icon={<Power className="size-3.5" />} onClick={() => toggle(type)}>
                        {type.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      {!type.builtIn && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Trash2 className="size-3.5" />}
                          disabled={ofType.length > 0}
                          title={ofType.length > 0 ? 'Loans use this type — deactivate it instead.' : undefined}
                          onClick={() => remove(type)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}
