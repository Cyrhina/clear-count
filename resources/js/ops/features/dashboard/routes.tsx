import { AdminDashboard } from '@ops/features/dashboard/components/AdminDashboard'
import { HrDashboard } from '@ops/features/dashboard/components/HrDashboard'
import { ManagerDashboard } from '@ops/features/dashboard/components/ManagerDashboard'
import { PayrollDashboard } from '@ops/features/dashboard/components/PayrollDashboard'
import { SuperAdminDashboard } from '@ops/features/dashboard/components/SuperAdminDashboard'
import { useSession } from '@ops/hooks/useSession'

export function DashboardPage() {
  const { user } = useSession()

  // Each admin role and the Manager get their own dashboard; the platform-wide Super Admin overview is separate.
  if (user.role === 'super_admin') {
    return <SuperAdminDashboard />
  }
  if (user.role === 'company_admin') {
    return <AdminDashboard />
  }
  if (user.role === 'hr_admin') {
    return <HrDashboard />
  }
  if (user.role === 'payroll_admin') {
    return <PayrollDashboard />
  }
  if (user.role === 'manager') {
    return <ManagerDashboard greetingName={user.name.split(' ')[0]} />
  }

  // The employee has no dashboard: the portal home is /ess.
  return null
}
