import { api } from '../../../shared/api/axiosInstance'
import type { User } from '../../../types'

export const userApi = {
  list: () => api.get<User[]>('/admin/usuarios').then((response) => response.data),
  activate: (id: number) => api.post<User>(`/admin/usuarios/${id}/activar`).then((response) => response.data),
  deactivate: (id: number) => api.post<User>(`/admin/usuarios/${id}/desactivar`).then((response) => response.data),
}
