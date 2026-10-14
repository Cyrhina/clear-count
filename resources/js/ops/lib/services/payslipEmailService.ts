import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { db } from '@ops/mock-data'
import type { PayslipEmailKind, PayslipEmailRecord, SessionUser } from '@ops/types/domain'

/*
 * Payroll payslip emails are queued on the server (a job per email, spaced a second apart, with the PDF attached) and their delivery status is
 * kept in `payslip_emails`. The 13th month and bonus kinds still use the mock relay below. mock: remove in P12.
 */

type ApiEmail = Omit<PayslipEmailRecord, 'companyId' | 'status' | 'sentBy'> & { status: 'queued' | 'sent' | 'failed' }

const toRecord = (e: ApiEmail): PayslipEmailRecord => ({ ...e, companyId: '', sentBy: undefined, status: e.status === 'queued' ? 'sending' : e.status })

/** The delivery records of a run's payslip emails; a queued one reads as 'sending'. */
export async function fetchPayrollPayslipEmails(periodId: string): Promise<PayslipEmailRecord[]> {
  const res = await api.get<{ data: unknown[] }>('/api/payslip-emails', { kind: 'payroll', source_id: periodId })
  return camelizeKeys<ApiEmail[]>(res.data).map(toRecord)
}

/** Queues the emails; they go out one a second. */
export async function queuePayrollPayslipEmails(periodId: string, targets: { employeeId: string; subject: string }[]): Promise<PayslipEmailRecord[]> {
  const res = await api.post<{ data: unknown[] }>('/api/payslip-emails', { kind: 'payroll', source_id: Number(periodId), targets: targets.map((t) => ({ employee_id: Number(t.employeeId), subject: t.subject })) })
  return camelizeKeys<ApiEmail[]>(res.data).map(toRecord)
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Every dispatch record for one payroll period / 13th Month run / bonus. */
export async function getPayslipEmails(session: SessionUser, kind: PayslipEmailKind, sourceId: string): Promise<PayslipEmailRecord[]> {
  if (kind === 'payroll') return fetchPayrollPayslipEmails(sourceId)
  return db.payslipEmails.filter((r) => r.companyId === session.companyId && r.kind === kind && r.sourceId === sourceId)
}

export interface SendPayslipEmailInput {
  kind: PayslipEmailKind
  sourceId: string
  employeeId: string
  subject: string
}

/**
 * Sends one employee's payslip email (mock mail relay with realistic latency). Delivery fails when the
 * employee has no valid email address on file; the attempt is logged either way so the status persists.
 */
export async function sendPayslipEmail(session: SessionUser, input: SendPayslipEmailInput): Promise<PayslipEmailRecord> {
  await delay(450 + Math.random() * 700)
  const employee = db.employees.find((e) => e.id === input.employeeId && e.companyId === session.companyId)
  const recipient = employee?.personal.personalEmail?.trim()
  const now = new Date().toISOString()

  let record = db.payslipEmails.find(
    (r) => r.companyId === session.companyId && r.kind === input.kind && r.sourceId === input.sourceId && r.employeeId === input.employeeId,
  )
  if (!record) {
    record = {
      id: crypto.randomUUID(),
      companyId: session.companyId,
      kind: input.kind,
      sourceId: input.sourceId,
      employeeId: input.employeeId,
      subject: input.subject,
      status: 'unsent',
      attempts: 0,
    }
    db.payslipEmails.push(record)
  }

  record.subject = input.subject
  record.recipient = recipient
  record.attempts += 1
  record.lastAttemptAt = now
  if (!employee) {
    record.status = 'failed'
    record.error = 'Employee record not found'
  } else if (!recipient) {
    record.status = 'failed'
    record.error = 'No email address on file — add one to the employee profile'
  } else if (!EMAIL_PATTERN.test(recipient)) {
    record.status = 'failed'
    record.error = `Invalid email address: ${recipient}`
  } else {
    record.status = 'sent'
    record.sentAt = now
    record.sentBy = session.name
    record.error = undefined
  }
  return { ...record }
}
