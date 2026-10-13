import { useQuery } from '@tanstack/react-query'
import { getOnboarding, type OnboardingStepId } from '@ops/lib/services/onboardingService'

export interface ChecklistStep {
  id: OnboardingStepId
  label: string
  description: string
  done: boolean
  link: string
}

const STEPS: Omit<ChecklistStep, 'done'>[] = [
  { id: 'company_info', label: 'Company Information', description: 'Name, email, type, and timezone are set.', link: '/company-settings' },
  { id: 'branches', label: 'Branches', description: 'At least one branch (or the head office) is set up.', link: '/branches' },
  { id: 'payroll_groups', label: 'Payroll Groups', description: 'At least one payroll group with its pay schedule is defined.', link: '/company-settings' },
  { id: 'work_schedule', label: 'Work Schedule', description: 'At least one work schedule is defined.', link: '/company-settings' },
  { id: 'holidays', label: 'Company Holidays', description: "This year's holiday calendar is configured for attendance and payroll.", link: '/company-settings' },
  { id: 'statutory', label: 'Government & Tax Settings', description: 'SSS, PhilHealth, Pag-IBIG, and withholding tax are switched on.', link: '/statutory' },
  { id: 'employees', label: 'Add Employees', description: 'At least one employee has been added to the roster.', link: '/employees' },
  { id: 'users', label: 'Invite Users', description: 'HR, payroll, managers, and employees have accounts. Not required to run payroll.', link: '/user-access' },
]

export function useOnboardingChecklist() {
  const query = useQuery({ queryKey: ['onboarding'], queryFn: getOnboarding })
  const data = query.data
  return {
    steps: data ? STEPS.map((s) => ({ ...s, done: data.steps[s.id] })) : [],
    readyForPayroll: data?.readyForPayroll ?? false,
    isLoading: query.isPending,
  }
}
