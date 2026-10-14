import { useCallback, useEffect, useState } from 'react'
import { useToast } from '@ops/components/ui/Toast'
import { useSession } from '@ops/hooks/useSession'
import { apiErrorMessage } from '@ops/lib/api/http'
import { getPayslipEmails, queuePayslipEmails } from '@ops/lib/services/payslipEmailService'
import type { PayslipEmailKind, PayslipEmailRecord, PayslipEmailStatus } from '@ops/types/domain'

export interface PayslipEmailTarget {
  employeeId: string
  employeeName: string
  subject: string
}

/**
 * Delivery state for the payslip emails of one payroll run / 13th Month batch / bonus: per-employee status (Unsent → Sending… → Sent / Failed).
 * Sending queues the emails on the server; the status is read again every few seconds while any is still queued.
 */
export function usePayslipEmails(kind: PayslipEmailKind, sourceId: string | undefined) {
  const { user } = useSession()
  const { notify } = useToast()
  const [records, setRecords] = useState<Record<string, PayslipEmailRecord>>({})

  const load = useCallback(
    () => (sourceId ? getPayslipEmails(user, kind, sourceId).then((list) => Object.fromEntries(list.map((r) => [r.employeeId, r]))) : Promise.resolve({})),
    [user, kind, sourceId],
  )

  useEffect(() => {
    let cancelled = false
    void load().then((next) => {
      if (!cancelled) setRecords(next)
    }, () => undefined)
    return () => {
      cancelled = true
    }
  }, [load])

  const hasQueued = Object.values(records).some((r) => r.status === 'sending')
  useEffect(() => {
    if (!hasQueued) return
    const timer = setInterval(() => void load().then(setRecords, () => undefined), 3000)
    return () => clearInterval(timer)
  }, [load, hasQueued])

  const statusFor = useCallback((employeeId: string): PayslipEmailStatus => records[employeeId]?.status ?? 'unsent', [records])

  const send = useCallback(
    async (targets: PayslipEmailTarget[]) => {
      if (!sourceId || targets.length === 0) return
      try {
        const queued = await queuePayslipEmails(kind, sourceId, targets)
        setRecords((prev) => ({ ...prev, ...Object.fromEntries(queued.map((r) => [r.employeeId, r])) }))
        notify({ title: 'Payslips queued', description: `${queued.length} payslip${queued.length === 1 ? ' is' : 's are'} being emailed, one a second. The status updates here.`, tone: 'success' })
      } catch (error) {
        notify({ title: 'Payslips were not queued', description: apiErrorMessage(error), tone: 'danger' })
      }
    },
    [kind, sourceId, notify],
  )

  const counts = (employeeIds: string[]) =>
    employeeIds.reduce(
      (acc, id) => {
        acc[statusFor(id)] += 1
        return acc
      },
      { unsent: 0, sending: 0, sent: 0, failed: 0 } as Record<PayslipEmailStatus, number>,
    )

  return { records, statusFor, send, counts, isSending: hasQueued }
}
