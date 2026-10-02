import { usePage } from '@inertiajs/react'
import { Suspense, useEffect, useState } from 'react'
import { AppShell } from '@ops/components/layout/AppShell'
import { ToastProvider } from '@ops/components/ui/Toast'
import { useSessionStore } from '@ops/lib/auth/mockSession'
import { seedSamplePayrollRuns } from '@ops/mock-data/payrollRuns'
import { users } from '@ops/mock-data/seed/users'
import { OPS_PAGES } from './pages'
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
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    </ToastProvider>
  )
}

function AuthedPage({ pageKey, email, role }: { pageKey: string; email: string; role: string | null }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    syncMockSession(email, role)
    seeded ??= seedSamplePayrollRuns().catch((e) => console.error('Sample payroll runs could not be seeded', e))
    void seeded.then(() => setReady(true))
  }, [email, role])

  if (!ready) return null
  const Page = OPS_PAGES[pageKey] ?? OPS_PAGES.forbidden

  return (
    <ToastProvider>
      <OutletProvider
        value={
          <Suspense fallback={null}>
            <Page />
          </Suspense>
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
