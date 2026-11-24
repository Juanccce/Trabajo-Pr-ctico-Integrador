import axios from 'axios'

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join('. ')
    return error.message || 'No se pudo conectar con Food Store.'
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}
