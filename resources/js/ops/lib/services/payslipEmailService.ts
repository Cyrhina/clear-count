import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import type { PayslipEmailKind, PayslipEmailRecord, SessionUser } from '@ops/types/domain'

/*
 * Payslip emails (payroll, 13th month and bonus) are queued on the server: a job per email, spaced a second apart, with the PDF attached.
 * Their delivery status is kept in `payslip_emails`; a queued one reads here as "sending".
 */

type ApiEmail = Omit<PayslipEmailRecord, 'companyId' | 'status' | 'sentBy'> & { status: 'queued' | 'sent' | 'failed' }

const toRecord = (e: ApiEmail): PayslipEmailRecord => ({ ...e, companyId: '', sentBy: undefined, status: e.status === 'queued' ? 'sending' : e.status })

/** Every delivery record for one payroll run / 13th Month batch / bonus. */
export async function getPayslipEmails(_session: SessionUser, kind: PayslipEmailKind, sourceId: string): Promise<PayslipEmailRecord[]> {
  const res = await api.get<{ data: unknown[] }>('/api/payslip-emails', { kind, source_id: sourceId })
  return camelizeKeys<ApiEmail[]>(res.data).map(toRecord)
}

/** Queues the emails; they go out one a second. */
export async function queuePayslipEmails(kind: PayslipEmailKind, sourceId: string, targets: { employeeId: string; subject: string }[]): Promise<PayslipEmailRecord[]> {
  const res = await api.post<{ data: unknown[] }>('/api/payslip-emails', {
    kind,
    source_id: Number(sourceId),
    targets: targets.map((t) => ({ employee_id: Number(t.employeeId), subject: t.subject })),
  })
  return camelizeKeys<ApiEmail[]>(res.data).map(toRecord)
}
