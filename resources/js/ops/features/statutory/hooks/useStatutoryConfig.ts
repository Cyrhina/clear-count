import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@ops/hooks/useSession'
import { getStatutoryConfig } from '@ops/lib/services/payrollService'
import type { StatutoryConfig } from '@ops/types/domain'

export function useStatutoryConfig() {
  const { user } = useSession()
  const [config, setConfig] = useState<StatutoryConfig | null | undefined>(undefined)

  const refetch = useCallback(() => {
    getStatutoryConfig(user).then((result) => setConfig(result ?? null))
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { config, isLoading: config === undefined, refetch }
}
