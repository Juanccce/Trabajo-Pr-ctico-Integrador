import axios from 'axios'

let onAuthExpired: (() => void) | undefined

export function setAuthExpiredHandler(handler: () => void) {
  onAuthExpired = handler
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const url = String(error.config?.url ?? '')
      const inactive = error.response?.status === 400 && error.response.data?.detail === 'Cuenta de usuario desactivada'
      if ((error.response?.status === 401 && !url.includes('/auth/token') && !url.includes('/auth/me')) || inactive) onAuthExpired?.()
    }
    return Promise.reject(error)
  },
)
