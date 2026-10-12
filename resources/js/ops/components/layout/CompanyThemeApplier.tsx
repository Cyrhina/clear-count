import { usePage } from '@inertiajs/react'
import { useEffect } from 'react'
import { applyBrandTheme } from '@ops/lib/theme/brandTheme'

/** Applies the company's logo-based color theme (if turned on in Company Information) across the app. Renders nothing. */
export function CompanyThemeApplier() {
  // The saved company comes from the server with every page (see HandleInertiaRequests).
  const company = usePage<{ auth: { company?: { use_logo_colors?: boolean; brand_color?: string | null } | null } }>().props.auth.company
  const color = company?.use_logo_colors ? (company.brand_color ?? undefined) : undefined

  useEffect(() => {
    applyBrandTheme(color)
    return () => applyBrandTheme(undefined)
  }, [color])

  return null
}
