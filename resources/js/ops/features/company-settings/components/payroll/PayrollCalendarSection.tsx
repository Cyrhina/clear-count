import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ops/components/ui/Table'
import { COMPANY_SETTINGS_KEY } from '@ops/features/company-settings/hooks/useCompanySettings'
import type { PayrollGroup } from '@ops/features/company-settings/types'
import { apiErrorMessage } from '@ops/lib/api/http'
import { getHolidays } from '@ops/lib/services/holidayService'
import { getPayrollGroupCalendar } from '@ops/lib/services/payrollGroupService'
import { formatDate } from '@ops/lib/utils/format'

/** The cutoff and pay dates of one payroll group for a year, worked out by the server from the group's rules. */
export function PayrollCalendarSection({ groups }: { groups: PayrollGroup[] }) {
  const thisYear = new Date().getFullYear()
  const [groupId, setGroupId] = useState(groups.find((g) => g.status === 'active')?.id ?? groups[0]?.id ?? '')
  const [year, setYear] = useState(thisYear)
  const group = groups.find((g) => g.id === groupId)

  const calendar = useQuery({
    queryKey: [COMPANY_SETTINGS_KEY, 'calendar', groupId, year],
    queryFn: () => getPayrollGroupCalendar(groupId, year),
    enabled: Boolean(group),
  })
  const holidays = useQuery({ queryKey: [COMPANY_SETTINGS_KEY, 'holidays', thisYear], queryFn: () => getHolidays(thisYear) })
  const today = new Date().toISOString().slice(0, 10)
  const upcomingHolidays = (holidays.data ?? []).filter((h) => h.date >= today).slice(0, 3)

  const yearOptions = [thisYear - 1, thisYear, thisYear + 1].map((y) => ({ value: String(y), label: String(y) }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Payroll Calendar</p>
          <p className="text-xs text-muted-foreground">Cutoff and pay dates by payroll group, with the nearest upcoming holidays.</p>
        </div>
        <div className="flex gap-2">
          <Select value={groupId} onValueChange={setGroupId} options={groups.map((g) => ({ value: g.id, label: g.name }))} className="w-56" disabled={groups.length === 0} />
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))} options={yearOptions} className="w-28" />
        </div>
      </div>

      {!group ? (
        <EmptyState title="No payroll groups to display" />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge tone={group.status === 'active' ? 'success' : 'neutral'} className="capitalize">
              {group.status}
            </Badge>
            <span>{group.frequency}</span>
            <span>·</span>
            <span>Cutoff: {group.cutoffDisplay}</span>
            <span>·</span>
            <span>Pay dates: {group.payDatesDisplay}</span>
          </div>

          {calendar.isPending ? (
            <Skeleton className="h-48" />
          ) : calendar.error ? (
            <EmptyState title="Could not load the calendar" description={apiErrorMessage(calendar.error)} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Cutoff</TableHead>
                  <TableHead>Pay date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(calendar.data ?? []).map((period) => (
                  <TableRow key={period.periodNo}>
                    <TableCell className="font-medium">#{period.periodNo}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {period.month} · period {period.periodInMonth}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(period.cutoffStart)} – {formatDate(period.cutoffEnd)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(period.payDate)} ({period.payDay})
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Upcoming Holidays</p>
        {upcomingHolidays.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming holidays configured.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {upcomingHolidays.map((h) => (
              <Badge key={h.id} tone="brand">
                {h.name} · {formatDate(h.date)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
