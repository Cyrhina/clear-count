import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { fetchLeaveBalances, fetchLeaveRequests, fetchLeaveTypes, type LeaveBalance } from '@ops/lib/services/leaveApiService'

/** Key of the leave module; a save invalidates types, requests and balances together. */
export const LEAVE_KEY = 'leave'

/** Leave on the API. (`useLeave.ts` is the mock the ESS pages still read.) */
export function useLeaveTypeList() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: [LEAVE_KEY, 'types'], queryFn: fetchLeaveTypes })
  return { leaveTypes: query.data ?? [], refetch: () => void queryClient.invalidateQueries({ queryKey: [LEAVE_KEY] }) }
}

export function useLeaveRequestList() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: [LEAVE_KEY, 'requests'], queryFn: fetchLeaveRequests })
  return { requests: query.data ?? [], isLoading: query.isPending, refetch: () => void queryClient.invalidateQueries({ queryKey: [LEAVE_KEY] }) }
}

const NONE: Pick<LeaveBalance, 'credits' | 'used' | 'remaining' | 'pending' | 'available'> = { credits: 0, used: 0, remaining: 0, pending: 0, available: null }

/** Balances per employee and leave type: `balanceOf(employeeId, leaveTypeId)`. */
export function useLeaveBalances() {
  const query = useQuery({ queryKey: [LEAVE_KEY, 'balances'], queryFn: fetchLeaveBalances })
  const balanceOf = useCallback(
    (employeeId: string, leaveTypeId: string) => (query.data ?? []).find((b) => b.employeeId === employeeId && b.leaveTypeId === leaveTypeId) ?? NONE,
    [query.data],
  )
  return { balances: query.data ?? [], balanceOf }
}
