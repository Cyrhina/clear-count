import { useQuery } from '@tanstack/react-query'
import { previewLeave } from '@ops/lib/services/leaveApiService'
import type { LeaveDayPortion } from '@ops/types/domain'

/** Live summary under the leave form: days this request uses, credits available, and why it can't be filed. The server works it out. */
export function LeavePreview({
  employeeId,
  leaveTypeId,
  dateFrom,
  dateTo,
  dayPortion,
}: {
  employeeId?: string
  leaveTypeId?: string
  dateFrom?: string
  dateTo?: string
  dayPortion: LeaveDayPortion
}) {
  const ready = !!employeeId && !!leaveTypeId && !!dateFrom && (dayPortion !== 'full' || !!dateTo)
  const { data: plan } = useQuery({
    queryKey: ['leave', 'preview', employeeId, leaveTypeId, dateFrom, dateTo, dayPortion],
    queryFn: () => previewLeave({ employeeId: employeeId!, leaveTypeId: leaveTypeId!, dateFrom: dateFrom!, dateTo: dateTo ?? dateFrom!, dayPortion }),
    enabled: ready,
  })
  if (!ready || !plan) return null
  if (plan.error) return <p className="col-span-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{plan.error}</p>
  return (
    <p className="col-span-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
      Uses <span className="font-semibold text-foreground">{plan.days}</span> working day{plan.days <= 1 ? '' : 's'} of leave
      {plan.available !== null && (
        <>
          {' '}
          · <span className="font-semibold text-foreground">{plan.available}</span> available now
        </>
      )}
      . Rest days, holidays and days off aren&apos;t counted.
    </p>
  )
}
