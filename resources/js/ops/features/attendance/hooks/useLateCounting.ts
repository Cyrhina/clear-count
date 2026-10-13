import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_LATE_POLICY, lateCycles, lateOrdinal, type LatePolicy } from '@ops/features/attendance/lateCycle'
import { fetchAllEmployees } from '@ops/lib/services/employeeService'
import { getPayrollRules } from '@ops/lib/services/payrollConfigService'

/** The company's Late Policy (and each employee's hire date, for anniversary counting) bound to the cycle helpers. */
export function useLateCounting() {
  const [state, setState] = useState<{ policy: LatePolicy; hired: Map<string, string> }>({ policy: DEFAULT_LATE_POLICY, hired: new Map() })

  useEffect(() => {
    let cancelled = false
    Promise.all([getPayrollRules(), fetchAllEmployees()]).then(([rules, employees]) => {
      if (!cancelled) setState({ policy: rules ?? DEFAULT_LATE_POLICY, hired: new Map(employees.map((e) => [e.id, e.employment.dateHired])) })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(
    () => ({
      policy: state.policy,
      cycles: (employeeId: string, dates: string[] | undefined) => lateCycles(dates ?? [], state.policy, state.hired.get(employeeId)),
      ordinal: (employeeId: string, dates: string[] | undefined, date: string) => lateOrdinal(dates, date, state.policy, state.hired.get(employeeId)),
    }),
    [state],
  )
}
