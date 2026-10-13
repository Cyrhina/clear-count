import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card } from '@ops/components/ui/Card'
import { fetchApprovalSummary } from '@ops/lib/services/notificationApiService'
import { cn } from '@ops/lib/utils/cn'

/** Where a type of request lives on its page, when it is not the first tab. */
const TAB: Record<string, string> = { attendance_adjustments: 'adjustments', wfh: 'wfh' }

/** What waits for you, one tile per type of request you may approve, each linking to its screen. Refreshes every minute with the bell. */
export function ApprovalsInbox() {
  const { data } = useQuery({ queryKey: ['approvals', 'summary'], queryFn: fetchApprovalSummary, refetchInterval: 60_000 })
  if (!data || data.rows.length === 0) return null

  return (
    <Card watermark={null} className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Waiting for you · {data.total} pending</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {data.rows.map((row) => (
          <Link
            key={row.type}
            to={row.link}
            state={TAB[row.type] ? { tab: TAB[row.type] } : undefined}
            className="rounded-xl border border-border px-3 py-2 transition-colors hover:bg-muted/60"
          >
            <p className={cn('font-display text-xl font-semibold', row.pending > 0 ? 'text-warning' : 'text-muted-foreground')}>{row.pending}</p>
            <p className="text-xs text-muted-foreground">{row.label}</p>
          </Link>
        ))}
      </div>
    </Card>
  )
}
