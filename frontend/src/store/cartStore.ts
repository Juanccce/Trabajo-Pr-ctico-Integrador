import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  imagen_url: string
}

interface CartState {
  items: CartItem[]
  add: (item: Omit<CartItem, 'cantidad'>) => void
  remove: (productId: number) => void
  changeQuantity: (productId: number, quantity: number) => void
  clear: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(persist((set, get) => ({
  items: [],
  add: (item) => set((state) => {
    const found = state.items.find((current) => current.producto_id === item.producto_id)
    return { items: found ? state.items.map((current) => current.producto_id === item.producto_id ? { ...current, cantidad: current.cantidad + 1 } : current) : [...state.items, { ...item, cantidad: 1 }] }
  }),
  remove: (productId) => set((state) => ({ items: state.items.filter((item) => item.producto_id !== productId) })),
  changeQuantity: (productId, quantity) => set((state) => ({ items: state.items.map((item) => item.producto_id === productId ? { ...item, cantidad: Math.max(1, quantity) } : item) })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0),
}), { name: 'food-store-cart' }))
