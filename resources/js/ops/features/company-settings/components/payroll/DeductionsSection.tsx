import { Pencil } from 'lucide-react'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Switch } from '@ops/components/ui/Switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { useToast } from '@ops/components/ui/Toast'
import { useSession } from '@ops/hooks/useSession'
import { updateDeductionConfig } from '@ops/lib/services/payrollSettingsService'
import type { DeductionConfig } from '@ops/types/domain'
import { DeductionDialog } from '@ops/features/company-settings/components/payroll/DeductionDialog'

const CATEGORY_LABEL: Record<DeductionConfig['category'], string> = {
  government: 'Government Contribution',
  tax: 'Tax',
  loan: 'Loan',
  other: 'Other',
}

const CATEGORY_TONE: Record<DeductionConfig['category'], 'brand' | 'warning' | 'neutral' | 'danger'> = {
  government: 'brand',
  tax: 'warning',
  loan: 'neutral',
  other: 'danger',
}

export function DeductionsSection({ deductions, canEdit, onRefetch }: { deductions: DeductionConfig[]; canEdit: boolean; onRefetch: () => void }) {
  const { user } = useSession()
  const { notify } = useToast()

  async function toggleActive(deduction: DeductionConfig) {
    await updateDeductionConfig(user, deduction.id, { isActive: !deduction.isActive })
    notify({ title: deduction.isActive ? 'Deduction deactivated' : 'Deduction activated', tone: 'success' })
    onRefetch()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Deductions Configuration</p>
          <p className="text-xs text-muted-foreground">Government contributions, tax, loans, and other recurring deductions.</p>
        </div>
        {canEdit && <DeductionDialog onSaved={onRefetch} />}
      </div>

      {deductions.length === 0 ? (
        <EmptyState title="No deductions configured" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Fixed / Variable</TableHead>
              <TableHead>Recurrence</TableHead>
              <TableHead>Active</TableHead>
              {canEdit && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {deductions.map((deduction) => (
              <TableRow key={deduction.id}>
                <TableCell className="font-medium">{deduction.name}</TableCell>
                <TableCell>
                  <Badge tone={CATEGORY_TONE[deduction.category]}>{CATEGORY_LABEL[deduction.category]}</Badge>
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">{deduction.calcType}</TableCell>
                <TableCell className="capitalize text-muted-foreground">{deduction.recurrence.replace('_', '-')}</TableCell>
                <TableCell>
                  <Switch checked={deduction.isActive} onCheckedChange={() => toggleActive(deduction)} disabled={!canEdit} />
                </TableCell>
                {canEdit && (
                  <TableCell className="text-right">
                    <DeductionDialog
                      deduction={deduction}
                      onSaved={onRefetch}
                      trigger={
                        <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />}>
                          Edit
                        </Button>
                      }
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
