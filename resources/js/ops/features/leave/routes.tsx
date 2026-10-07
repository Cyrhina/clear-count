import { useMemo, useState } from 'react'
import { PageHeader } from '@ops/components/layout/PageHeader'
import type { SortDirection } from '@ops/components/ui/FiltersPopover'
import { PlainCards } from '@ops/components/ui/PlainCards'
import { Skeleton } from '@ops/components/ui/Skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ops/components/ui/Tabs'
import { useEmployees } from '@ops/features/employees/hooks/useEmployees'
import { LeaveFilterBar } from '@ops/features/leave/components/LeaveFilterBar'
import { LeaveRequestDialog } from '@ops/features/leave/components/LeaveRequestDialog'
import { LeaveRequestsList } from '@ops/features/leave/components/LeaveRequestsList'
import { LeaveTypesPanel } from '@ops/features/leave/components/LeaveTypesPanel'
import { TeamLeaveCreditsPanel } from '@ops/features/leave/components/TeamLeaveCreditsPanel'
import { HIERARCHY_LABEL, HIERARCHY_LEVELS, getEmployeeHierarchyLevel } from '@ops/features/leave/hierarchyUtil'
import { useLeaveRequests, useLeaveTypes } from '@ops/features/leave/hooks/useLeave'
import { useHighlightTarget } from '@ops/hooks/useHighlightTarget'
import { usePermission } from '@ops/hooks/usePermission'
import type { Employee } from '@ops/types/domain'

const SORT_OPTIONS = [
  { value: 'requestedAt', label: 'Date Requested' },
  { value: 'name', label: 'Employee Name' },
]

/** Leave cards render without the soft theme's corner watermark icon. */
export function LeavePage() {
  return (
    <PlainCards>
      <LeaveContent />
    </PlainCards>
  )
}

function LeaveContent() {
  const { requests, isLoading, refetch } = useLeaveRequests()
  const { leaveTypes, refetch: refetchLeaveTypes } = useLeaveTypes()
  const { employees, refetch: refetchEmployees } = useEmployees()
  const canRequest = usePermission('leave.request')
  const canManageTypes = usePermission('leave.manage_types')
  const canApprove = usePermission('leave.approve')
  const { highlightId } = useHighlightTarget()
  const [activeTab, setActiveTab] = useState('requests')

  const [search, setSearch] = useState('')
  const [leaveTypeId, setLeaveTypeId] = useState('all')
  const [status, setStatus] = useState('all')
  const [hierarchy, setHierarchy] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('requestedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const employeeById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])
  const leaveTypeById = useMemo(() => new Map(leaveTypes.map((lt) => [lt.id, lt])), [leaveTypes])

  const leaveTypeOptions = useMemo(
    () => [{ value: 'all', label: 'All Types' }, ...leaveTypes.map((lt) => ({ value: lt.id, label: lt.name }))],
    [leaveTypes],
  )
  const hierarchyOptions = useMemo(
    () => [{ value: 'all', label: 'All Hierarchy Levels' }, ...HIERARCHY_LEVELS.map((h) => ({ value: h, label: HIERARCHY_LABEL[h] }))],
    [],
  )

  const hasActiveFilters =
    search.trim() !== '' || leaveTypeId !== 'all' || status !== 'all' || hierarchy !== 'all' || dateFrom !== '' || dateTo !== ''

  function clearFilters() {
    setSearch('')
    setLeaveTypeId('all')
    setStatus('all')
    setHierarchy('all')
    setDateFrom('')
    setDateTo('')
  }

  function matchesFilters(employee: Employee | undefined, requestLeaveTypeId: string, reqDateFrom: string, reqDateTo: string): boolean {
    if (!employee) return false
    if (hierarchy !== 'all' && getEmployeeHierarchyLevel(employee) !== hierarchy) return false
    if (leaveTypeId !== 'all' && requestLeaveTypeId !== leaveTypeId) return false
    if (dateFrom && reqDateTo < dateFrom) return false
    if (dateTo && reqDateFrom > dateTo) return false

    const query = search.trim().toLowerCase()
    if (query) {
      const leaveTypeName = leaveTypeById.get(requestLeaveTypeId)?.name.toLowerCase() ?? ''
      const haystack = `${employee.personal.firstName} ${employee.personal.lastName} ${employee.employeeNumber} ${leaveTypeName}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    return true
  }

  const filteredRequests = requests
    .filter((request) => {
      if (status !== 'all' && request.status !== status) return false
      return matchesFilters(employeeById.get(request.employeeId), request.leaveTypeId, request.dateFrom, request.dateTo)
    })
    .sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (a.status !== 'pending' && b.status === 'pending') return 1
      const result =
        sortBy === 'name'
          ? `${employeeById.get(a.employeeId)?.personal.firstName} ${employeeById.get(a.employeeId)?.personal.lastName}`.localeCompare(
              `${employeeById.get(b.employeeId)?.personal.firstName} ${employeeById.get(b.employeeId)?.personal.lastName}`,
            )
          : a.requestedAt.localeCompare(b.requestedAt)
      return sortDirection === 'asc' ? result : -result
    })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leave Management"
        description={canApprove ? 'Leave requests, approvals, and company leave types.' : 'Your team\'s leave requests and leave credits.'}
        actions={activeTab === 'requests' && canRequest && <LeaveRequestDialog employees={employees} leaveTypes={leaveTypes} onCreated={refetch} />}
      />

      <Tabs defaultValue="requests" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="types">{canManageTypes ? 'Leave Types & Credits' : 'Leave Credits'}</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <LeaveFilterBar
            search={search}
            onSearchChange={setSearch}
            leaveTypeId={leaveTypeId}
            onLeaveTypeChange={setLeaveTypeId}
            leaveTypeOptions={leaveTypeOptions}
            status={status}
            onStatusChange={setStatus}
            hierarchy={hierarchy}
            onHierarchyChange={setHierarchy}
            hierarchyOptions={hierarchyOptions}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOptions={SORT_OPTIONS}
            sortDirection={sortDirection}
            onSortDirectionChange={setSortDirection}
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />

          {isLoading ? (
            <Skeleton className="h-72" />
          ) : (
            <LeaveRequestsList
              requests={filteredRequests}
              employees={employees}
              leaveTypes={leaveTypes}
              onDecided={refetch}
              highlightId={highlightId}
            />
          )}
        </TabsContent>

        <TabsContent value="types">
          {canManageTypes ? (
            <LeaveTypesPanel leaveTypes={leaveTypes} employees={employees} onChanged={refetchLeaveTypes} onCreditsGranted={refetchEmployees} />
          ) : (
            <TeamLeaveCreditsPanel employees={employees} leaveTypes={leaveTypes} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
