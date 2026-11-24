import { api } from '../../../shared/api/axiosInstance'
import type { User } from '../../../types'

export interface RegisterData {
  username: string
  full_name: string
  email: string
  password: string
}

export const authApi = {
  async login(username: string, password: string) {
    const body = new URLSearchParams({ username, password })
    await api.post('/auth/token', body, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    return api.get<User>('/auth/me').then((response) => response.data)
  },
  register: (data: RegisterData) => api.post<User>('/auth/register', data).then((response) => response.data),
  me: () => api.get<User>('/auth/me').then((response) => response.data),
  logout: () => api.post('/auth/logout'),
}
