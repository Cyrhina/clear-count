import { create } from 'zustand'

/** Optional cap on WFH days per employee per month. 0 = no cap. Only warns — it never blocks an arrangement. */
export const useWfhLimitStore = create<{ monthlyLimit: number; setMonthlyLimit: (n: number) => void }>((set) => ({
  monthlyLimit: 0,
  setMonthlyLimit: (n) => set({ monthlyLimit: Math.max(0, Math.floor(n) || 0) }),
}))
