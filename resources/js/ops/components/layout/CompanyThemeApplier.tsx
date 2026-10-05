import { useEffect } from 'react'
import { useTenant } from '@ops/hooks/useTenant'
import { applyBrandTheme } from '@ops/lib/theme/brandTheme'

/** Applies the company's logo-based color theme (if turned on in Company Information) across the app. Renders nothing. */
export function CompanyThemeApplier() {
  const { company } = useTenant()
  const color = company?.useLogoTheme ? company.brandColor : undefined

  useEffect(() => {
    applyBrandTheme(color)
    return () => applyBrandTheme(undefined)
  }, [color])

  return null
}
