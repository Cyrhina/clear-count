import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { users } from '@ops/mock-data/seed/users'
import type { SessionUser } from '@ops/types/domain'

interface SessionState {
  currentUserId: string
  currentUser: SessionUser
  availableUsers: SessionUser[]
  isAuthenticated: boolean
  setCurrentUserId: (userId: string) => void
  /** Returns the signed-in user on success (so the caller can route by role), or null on invalid credentials. */
  login: (email: string, password: string) => SessionUser | null
  logout: () => void
}

const defaultUser = users[0]

/**
 * Preset demo logins for the login screen's "Quick Demo Login" shortcuts.
 * Deliberately separate from the real seeded user emails (mock-data/seed/users.ts)
 * so this login-gate feature never has to touch that seed data.
 */
export const DEMO_ACCOUNTS: { email: string; password: string; userId: string; roleLabel: string }[] = [
  { email: 'company_admin.consignado@frontlinebusiness.com.ph', password: '123123qQ!', userId: 'u_fl_admin', roleLabel: 'Company Admin' },
  { email: 'payroll_admin.consignado@frontlinebusiness.com.ph', password: '123123qQ!', userId: 'u_fl_payroll', roleLabel: 'Payroll Admin' },
  { email: 'hr_admin.consignado@frontlinebusiness.com.ph', password: '123123qQ!', userId: 'u_fl_hr', roleLabel: 'HR Admin' },
  { email: 'manager.consignado@frontlinebusiness.com.ph', password: '123123qQ!', userId: 'u_fl_manager', roleLabel: 'Manager' },
  { email: 'employee.consignado@frontlinebusiness.com.ph', password: '123123qQ!', userId: 'u_fl_employee', roleLabel: 'Employee' },
]

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      currentUserId: defaultUser.id,
      currentUser: defaultUser,
      availableUsers: users,
      isAuthenticated: false,
      setCurrentUserId: (userId) =>
        set(() => {
          const nextUser = users.find((u) => u.id === userId) ?? defaultUser
          return { currentUserId: nextUser.id, currentUser: nextUser }
        }),
      login: (email, password) => {
        const account = DEMO_ACCOUNTS.find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
        )
        if (!account) return null

        const nextUser = users.find((u) => u.id === account.userId) ?? defaultUser
        set({ currentUserId: nextUser.id, currentUser: nextUser, isAuthenticated: true })
        return nextUser
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'fbs-ops-demo-session',
      partialize: (state) => ({ currentUserId: state.currentUserId, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const restored = users.find((u) => u.id === state.currentUserId) ?? defaultUser
          state.currentUser = restored
        }
      },
    },
  ),
)
