import v1 from './v1'
import employees from './employees'
import employeeDocuments from './employee-documents'
import bonuses from './bonuses'
import payroll from './payroll'
import payslips from './payslips'
import payslipEmails from './payslip-emails'
import me from './me'
import manager from './manager'
import dashboard from './dashboard'
import reports from './reports'
import integrations from './integrations'
import subscription from './subscription'
import platform from './platform'
const api = {
    v1: Object.assign(v1, v1),
employees: Object.assign(employees, employees),
employeeDocuments: Object.assign(employeeDocuments, employeeDocuments),
bonuses: Object.assign(bonuses, bonuses),
payroll: Object.assign(payroll, payroll),
payslips: Object.assign(payslips, payslips),
payslipEmails: Object.assign(payslipEmails, payslipEmails),
me: Object.assign(me, me),
manager: Object.assign(manager, manager),
dashboard: Object.assign(dashboard, dashboard),
reports: Object.assign(reports, reports),
integrations: Object.assign(integrations, integrations),
subscription: Object.assign(subscription, subscription),
platform: Object.assign(platform, platform),
}

export default api