import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@ops/components/ui/Badge'
import { Button } from '@ops/components/ui/Button'
import { EmptyState } from '@ops/components/ui/EmptyState'
import { Select } from '@ops/components/ui/Select'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { useToast } from '@ops/components/ui/Toast'
import { AddHolidayDialog } from '@ops/features/company-settings/components/AddHolidayDialog'
import { COMPANY_SETTINGS_KEY } from '@ops/features/company-settings/hooks/useCompanySettings'
import { apiErrorMessage } from '@ops/lib/api/http'
import { deleteHoliday, getHolidays, importDefaultHolidays } from '@ops/lib/services/holidayService'
import { formatDate } from '@ops/lib/utils/format'

/** Holidays tab: the company calendar for one year, with the Philippine default calendar one click away. */
export function HolidaysTab({ canEdit }: { canEdit: boolean }) {
  const thisYear = new Date().getFullYear()
  const [year, setYear] = useState(thisYear)
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const holidays = useQuery({ queryKey: [COMPANY_SETTINGS_KEY, 'holidays', year], queryFn: () => getHolidays(year) })
  const [busy, setBusy] = useState(false)

  const refetch = () => void queryClient.invalidateQueries({ queryKey: [COMPANY_SETTINGS_KEY] })

  async function run(action: () => Promise<void>) {
    setBusy(true)
    try {
      await action()
      refetch()
    } catch (error) {
      notify({ title: 'Could not update the holidays', description: apiErrorMessage(error), tone: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  const importDefaults = (mode: 'missing' | 'reset') =>
    run(async () => {
      const result = await importDefaultHolidays(year, mode)
      notify({ title: `Philippine holidays for ${year}`, description: `${result.added} added, ${result.skipped} already on the calendar${result.removed ? `, ${result.removed} reset` : ''}.`, tone: 'success' })
    })

  const remove = (id: string, name: string) =>
    run(async () => {
      await deleteHoliday(id)
      notify({ title: `${name} removed`, tone: 'success' })
    })

  const yearOptions = [thisYear - 1, thisYear, thisYear + 1, thisYear + 2].map((y) => ({ value: String(y), label: String(y) }))

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))} options={yearOptions} className="w-28" aria-label="Holiday year" />
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={<Download className="size-4" />} onClick={() => importDefaults('missing')} disabled={busy}>
              Import PH holidays
            </Button>
            <AddHolidayDialog onCreated={refetch} />
          </div>
        )}
      </div>

      {holidays.isPending ? (
        <Skeleton className="h-48" />
      ) : holidays.error ? (
        <EmptyState title="Could not load the holidays" description={apiErrorMessage(holidays.error)} />
      ) : holidays.data.length === 0 ? (
        <EmptyState title={`No holidays configured for ${year}`} description={canEdit ? 'Use “Import PH holidays” to add the Philippine calendar, or add your own.' : undefined} />
      ) : (
        <div className="space-y-2">
          {holidays.data.map((h) => (
            <div key={h.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <div>
                <p className="text-sm font-medium">{h.name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(h.date)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={h.type === 'regular' ? 'brand' : 'neutral'}>{h.typeLabel}</Badge>
                {canEdit && (
                  <Button size="sm" variant="ghost" icon={<Trash2 className="size-3.5" />} onClick={() => remove(h.id, h.name)} disabled={busy} aria-label={`Remove ${h.name}`} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
