import { api } from '../../../shared/api/axiosInstance'
import type { Order, OrderState, OrderSummary, Page, PaymentMethod } from '../../../types'

export interface CreateOrderData {
  items: { producto_id: number; cantidad: number }[]
  forma_pago: PaymentMethod
  direccion_entrega: string
  notas?: string
}

export const orderApi = {
  list: (params: { skip?: number; limit?: number; estado?: OrderState } = {}) => api.get<Page<Order>>('/pedidos', { params }).then((response) => response.data),
  create: (data: CreateOrderData) => api.post<Order>('/pedidos', data).then((response) => response.data),
  cancel: (id: number) => api.patch<Order>(`/pedidos/${id}/cancelar`).then((response) => response.data),
  changeState: (id: number, estado: OrderState) => api.patch<Order>(`/pedidos/${id}/estado`, { estado }).then((response) => response.data),
  summary: () => api.get<OrderSummary>('/pedidos/resumen').then((response) => response.data),
}
