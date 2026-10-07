import { useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { PlainCards } from '@ops/components/ui/PlainCards'
import { Select } from '@ops/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { RosterTab } from '@ops/features/schedules/components/RosterTab'
import { ShiftTemplatesTab } from '@ops/features/schedules/components/ShiftTemplatesTab'
import { TeamsTab } from '@ops/features/schedules/components/TeamsTab'

const TAB_OPTIONS = [
  { value: 'roster', label: 'Roster' },
  { value: 'teams', label: 'Teams and supervisors' },
  { value: 'templates', label: 'Shift templates' },
]

export function SchedulesPage() {
  const { user } = useSession()
  const [tab, setTab] = useState('roster')
  const teamOnly = Boolean(user.branchId)
  return (
    <PlainCards>
      <PageHeader title="Schedules" description={teamOnly ? "Plan your team's shifts and rest days, and see who is working, resting or on leave." : "View and manage every employee's schedule — shifts, rest days and flexible hours — and choose who supervises each team."} />
      <Tabs value={tab} onValueChange={setTab}>
        {/* Phones: a dropdown instead of a row of tabs. */}
        <Select className="sm:hidden" value={tab} onValueChange={setTab} aria-label="Schedules section" options={TAB_OPTIONS} />
        <TabsList className="hidden sm:flex">
          {TAB_OPTIONS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="roster" className="pt-4 sm:pt-6">
          <RosterTab />
        </TabsContent>
        <TabsContent value="teams" className="pt-4 sm:pt-6">
          <TeamsTab />
        </TabsContent>
        <TabsContent value="templates" className="pt-4 sm:pt-6">
          <ShiftTemplatesTab />
        </TabsContent>
      </Tabs>
    </PlainCards>
  )
}
