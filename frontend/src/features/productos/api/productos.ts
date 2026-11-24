import { api } from '../../../shared/api/axiosInstance'
import type { Category, Page, Product, ProductFilters } from '../../../types'

export const productApi = {
  list: (filters: ProductFilters) => api.get<Page<Product>>('/productos', { params: filters }).then((response) => response.data),
  categories: () => api.get<Category[]>('/categorias').then((response) => response.data),
  create: (data: Omit<Product, 'id' | 'activo' | 'categoria'>) => api.post<Product>('/productos', data).then((response) => response.data),
  update: (id: number, data: Partial<Omit<Product, 'id' | 'activo' | 'categoria'>>) => api.put<Product>(`/productos/${id}`, data).then((response) => response.data),
  updateStock: (id: number, data: { stock: number; disponible: boolean }) => api.patch<Product>(`/productos/${id}/stock`, data).then((response) => response.data),
  remove: (id: number) => api.delete(`/productos/${id}`),
}

export const categoryApi = {
  list: productApi.categories,
  create: (data: { nombre: string; descripcion: string }) => api.post<Category>('/categorias', data).then((response) => response.data),
  update: (id: number, data: { nombre: string; descripcion: string }) => api.put<Category>(`/categorias/${id}`, data).then((response) => response.data),
  remove: (id: number) => api.delete(`/categorias/${id}`),
}
