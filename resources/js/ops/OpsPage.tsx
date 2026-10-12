import { usePage } from '@inertiajs/react'
import { Suspense, useEffect, useState } from 'react'
import { AppShell } from '@ops/components/layout/AppShell'
import { ToastProvider } from '@ops/components/ui/Toast'
import { BrandLoader, BrandSplash } from '@ops/components/ui/BrandLogo'
import { CompanyThemeApplier } from '@ops/components/layout/CompanyThemeApplier'
import { useSessionStore } from '@ops/lib/auth/mockSession'
import { seedSamplePayrollRuns } from '@ops/mock-data/payrollRuns'
import { users } from '@ops/mock-data/seed/users'
import { PlanGate } from '@ops/components/ui/PlanGate'
import { useActivePlanTier } from '@ops/hooks/useActivePlanTier'
import { OPS_PAGES, PAGE_FEATURES } from './pages'
import { OutletProvider } from './shim/react-router-dom'

interface OpsProps {
  page: string
  auth: { user: { email: string } | null; role: string | null }
  [key: string]: unknown
}

/** Map the Laravel-authenticated user onto the mock-data user (matched by email, then role). */
function syncMockSession(email: string, role: string | null) {
  const mock = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? users.find((u) => u.role === role) ?? users[0]
  useSessionStore.setState({ currentUserId: mock.id, currentUser: mock, isAuthenticated: true })
}

let seeded: Promise<void> | null = null

/** Guest pages (login, forgot/reset password): no app shell, no mock session. */
function GuestPage({ pageKey }: { pageKey: string }) {
  const Page = OPS_PAGES[pageKey]
  return (
    <ToastProvider>
      <Suspense fallback={<BrandLoader />}>
        <Page />
      </Suspense>
    </ToastProvider>
  )
}

function AuthedPage({ pageKey, email, role }: { pageKey: string; email: string; role: string | null }) {
  const [ready, setReady] = useState(false)
  const { tier } = useActivePlanTier()

  useEffect(() => {
    syncMockSession(email, role)
    seeded ??= seedSamplePayrollRuns().catch((e) => console.error('Sample payroll runs could not be seeded', e))
    void seeded.then(() => setReady(true))
  }, [email, role])

  if (!ready) return <BrandSplash />
  const Page = OPS_PAGES[pageKey] ?? OPS_PAGES.forbidden
  const feature = PAGE_FEATURES[pageKey]

  return (
    <ToastProvider>
      <CompanyThemeApplier />
      <OutletProvider
        value={
          feature ? (
            <PlanGate feature={feature} planTier={tier}>
              <Suspense fallback={<BrandLoader />}>
                <Page />
              </Suspense>
            </PlanGate>
          ) : (
            <Suspense fallback={<BrandLoader />}>
              <Page />
            </Suspense>
          )
        }
      >
        <AppShell />
      </OutletProvider>
    </ToastProvider>
  )
}

export default function OpsPage() {
  const { page, auth } = usePage<OpsProps>().props
  if (page.startsWith('auth.') || !auth.user) return <GuestPage pageKey={OPS_PAGES[page] ? page : 'auth.login'} />
  return <AuthedPage pageKey={page} email={auth.user.email} role={auth.role} />
}
