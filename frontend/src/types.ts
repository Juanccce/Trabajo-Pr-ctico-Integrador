export type Role = 'user' | 'admin'
export type OrderState = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'
export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA'

export interface User {
  id: number
  username: string
  full_name: string
  email: string
  role: Role
  disabled: boolean
  created_at: string
}

export interface Category {
  id: number
  nombre: string
  descripcion: string
  activo: boolean
}

export interface Product {
  id: number
  categoria_id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  activo: boolean
  categoria: Category
}

export interface Page<T> {
  total: number
  items: T[]
}

export interface OrderLine {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

export interface Order {
  id: number
  usuario_id: number
  estado: OrderState
  forma_pago: PaymentMethod
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: OrderLine[]
}

export interface OrderSummary {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}

export interface ProductFilters {
  skip: number
  limit: number
  search?: string
  categoria_id?: number
}
