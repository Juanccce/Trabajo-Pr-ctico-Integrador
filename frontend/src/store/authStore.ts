import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { authApi } from '../features/auth/api/auth'
import { setAuthExpiredHandler } from '../shared/api/axiosInstance'
import type { User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  user: null,
  loading: true,
  login: async (username, password) => {
    const user = await authApi.login(username, password)
    set({ user })
  },
  logout: async () => {
    try { await authApi.logout() } finally { set({ user: null }) }
  },
  checkSession: async () => {
    set({ loading: true })
    try { set({ user: await authApi.me() }) } catch { set({ user: null }) } finally { set({ loading: false }) }
  },
  clearSession: () => set({ user: null, loading: false }),
}), {
  name: 'food-store-session',
  partialize: (state) => ({ user: state.user }) as AuthState,
}))

setAuthExpiredHandler(() => useAuthStore.getState().clearSession())
