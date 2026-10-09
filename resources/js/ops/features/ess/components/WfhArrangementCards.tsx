import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { formatDate } from '@ops/lib/utils/format'
import type { WfhArrangement, WfhStatus } from '@ops/types/domain'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const STATUS: Record<WfhStatus, { label: string; tone: 'warning' | 'success' | 'danger' | 'neutral' }> = {
  pending: { label: 'Pending', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
}
const TIMES = { default: 'Schedule times', custom: 'Fixed times', self_log: 'Logs own time' }

/** Vertical list of WFH arrangements (works at every width). Pass `onWithdraw` to let pending ones be withdrawn. */
export function WfhArrangementCards({ items, onWithdraw, showTimes }: { items: WfhArrangement[]; onWithdraw?: (a: WfhArrangement) => void; showTimes?: boolean }) {
  return (
    <ul className="space-y-2">
      {items.map((a) => (
        <li key={a.id} className="rounded-xl border border-border p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">
              {a.kind === 'temporary' ? 'Temporary' : 'Standing'} · {formatDate(a.dateFrom)}
              {a.dateTo ? ` – ${formatDate(a.dateTo)}` : ' onward'}
            </p>
            <Badge tone={STATUS[a.status].tone}>{STATUS[a.status].label}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {a.daysOfWeek.length ? a.daysOfWeek.map((d) => DAYS[d]).join(', ') : 'Every working day'}
            {showTimes && ` · ${TIMES[a.times]}`}
          </p>
          <p className="mt-1 text-muted-foreground">{a.reason}</p>
          {onWithdraw && a.status === 'pending' && (
            <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={() => onWithdraw(a)}>
              Withdraw
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
