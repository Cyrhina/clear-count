import { camelizeKeys } from '@ops/lib/api/case'
import { api } from '@ops/lib/api/http'
import { getEmployeeMasterlist, getPayrollRegister } from '@ops/lib/services/reportService'
import { getPayrollPeriods } from '@ops/lib/services/payrollService'
import type { SessionUser } from '@ops/types/domain'

/** API keys and webhooks (`/api/integrations/*`), plus the CSV exports. The employee CSV import is the Employees page's own dialog. */

export type ApiKeyAbility = 'employees.read' | 'attendance.read' | 'payroll.read'

export const API_KEY_ABILITIES: { value: ApiKeyAbility; label: string; description: string }[] = [
  { value: 'employees.read', label: 'Employees', description: 'GET /api/v1/employees' },
  { value: 'attendance.read', label: 'Attendance', description: 'GET /api/v1/attendance' },
  { value: 'payroll.read', label: 'Payroll', description: 'GET /api/v1/payroll and /api/v1/payroll/{id}/lines' },
]

export interface ApiKey {
  id: string
  label: string
  abilities: ApiKeyAbility[]
  createdBy?: string
  createdAt: string
  lastUsedAt?: string
  expiresAt?: string
  expired: boolean
}

export async function getApiKeys(): Promise<ApiKey[]> {
  const res = await api.get<{ data: unknown }>('/api/integrations/api-keys')
  return camelizeKeys<ApiKey[]>(res.data)
}

/** The key itself comes back once, in `token`: the server keeps only a hash. */
export async function createApiKey(input: { label: string; abilities: ApiKeyAbility[]; expiresInDays?: number }): Promise<{ key: ApiKey; token: string }> {
  const res = await api.post<{ data: unknown; token: string }>('/api/integrations/api-keys', { label: input.label, abilities: input.abilities, expires_in_days: input.expiresInDays })
  return { key: camelizeKeys<ApiKey>(res.data), token: res.token }
}

export async function revokeApiKey(keyId: string): Promise<void> {
  await api.delete(`/api/integrations/api-keys/${keyId}`)
}

export type WebhookEvent = 'payroll.finalized' | 'employee.created' | 'leave.approved'

export const WEBHOOK_EVENTS: { value: WebhookEvent; label: string }[] = [
  { value: 'payroll.finalized', label: 'Payroll Finalized' },
  { value: 'employee.created', label: 'Employee Created' },
  { value: 'leave.approved', label: 'Leave Approved' },
]

export type DeliveryStatus = 'pending' | 'retrying' | 'success' | 'failed'

export interface Webhook {
  id: string
  url: string
  events: WebhookEvent[]
  isActive: boolean
  createdAt: string
  lastDelivery?: { status: DeliveryStatus; event: string; at: string }
}

export interface WebhookDelivery {
  id: string
  event: string
  status: DeliveryStatus
  attempts: number
  responseCode?: number
  error?: string
  createdAt: string
  deliveredAt?: string
}

export async function getWebhooks(): Promise<Webhook[]> {
  const res = await api.get<{ data: unknown }>('/api/integrations/webhooks')
  return camelizeKeys<Webhook[]>(res.data)
}

/** The signing secret comes back once, in `secret`. */
export async function createWebhook(input: { url: string; events: WebhookEvent[] }): Promise<{ webhook: Webhook; secret: string }> {
  const res = await api.post<{ data: unknown; secret: string }>('/api/integrations/webhooks', input)
  return { webhook: camelizeKeys<Webhook>(res.data), secret: res.secret }
}

export async function setWebhookActive(webhookId: string, isActive: boolean): Promise<void> {
  await api.patch(`/api/integrations/webhooks/${webhookId}`, { is_active: isActive })
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  await api.delete(`/api/integrations/webhooks/${webhookId}`)
}

export async function getWebhookDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
  const res = await api.get<{ data: unknown }>(`/api/integrations/webhooks/${webhookId}/deliveries`)
  return camelizeKeys<WebhookDelivery[]>(res.data)
}

export async function retryWebhookDelivery(deliveryId: string): Promise<void> {
  await api.post(`/api/integrations/webhook-deliveries/${deliveryId}/retry`)
}

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\r\n')
}

export async function exportEmployeeMasterlistCsv(session: SessionUser): Promise<string> {
  const employees = await getEmployeeMasterlist(session)
  const header = ['Employee #', 'First Name', 'Last Name', 'Department', 'Position', 'Date Hired', 'Status']
  const rows = employees.map((e) => [
    e.employeeNumber,
    e.personal.firstName,
    e.personal.lastName,
    e.employment.department,
    e.employment.position,
    e.employment.dateHired,
    e.employment.status,
  ])
  return toCsv([header, ...rows])
}

export async function exportPayrollRegisterCsv(session: SessionUser): Promise<string> {
  const periods = await getPayrollPeriods(session)
  const report = await getPayrollRegister(session, periods[0]?.id)
  const header = ['Employee', 'Gross Pay', 'SSS', 'PhilHealth', 'Pag-IBIG', 'Withholding Tax', 'Total Deductions', 'Net Pay']
  const rows = report.rows.map((r) => [
    `${r.employee.personal.firstName} ${r.employee.personal.lastName}`,
    String(r.grossPay),
    String(r.sssEmployeeShare),
    String(r.philhealthEmployeeShare),
    String(r.pagibigEmployeeShare),
    String(r.withholdingTax),
    String(r.totalDeductions),
    String(r.netPay),
  ])
  return toCsv([header, ...rows])
}
