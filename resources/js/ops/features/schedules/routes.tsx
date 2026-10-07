import { useSession } from '@ops/hooks/useSession'
import { PageHeader } from '@ops/components/layout/PageHeader'
import { PlainCards } from '@ops/components/ui/PlainCards'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { RosterTab } from '@ops/features/schedules/components/RosterTab'
import { ShiftTemplatesTab } from '@ops/features/schedules/components/ShiftTemplatesTab'
import { TeamsTab } from '@ops/features/schedules/components/TeamsTab'

export function SchedulesPage() {
  const { user } = useSession()
  const teamOnly = Boolean(user.branchId)
  return (
    <PlainCards>
      <PageHeader title="Schedules" description={teamOnly ? "Plan your team's shifts and rest days, and see who is working, resting or on leave." : "View and manage every employee's schedule — shifts, rest days and flexible hours — and choose who supervises each team."} />
      <Tabs defaultValue="roster">
        <TabsList>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="teams">Teams and supervisors</TabsTrigger>
          <TabsTrigger value="templates">Shift templates</TabsTrigger>
        </TabsList>
        <TabsContent value="roster">
          <RosterTab />
        </TabsContent>
        <TabsContent value="teams">
          <TeamsTab />
        </TabsContent>
        <TabsContent value="templates">
          <ShiftTemplatesTab />
        </TabsContent>
      </Tabs>
    </PlainCards>
  )
}
