import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Loading } from '../shared/components/States'
import { MainLayout } from '../shared/layout/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'

const LoginPage = lazy(() => import('../features/auth/pages/AuthPages').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('../features/auth/pages/AuthPages').then((module) => ({ default: module.RegisterPage })))
const UnauthorizedPage = lazy(() => import('../features/auth/pages/AuthPages').then((module) => ({ default: module.UnauthorizedPage })))
const AdminCategoriesPage = lazy(() => import('../features/categorias/pages/AdminCategoriesPage').then((module) => ({ default: module.AdminCategoriesPage })))
const CartPage = lazy(() => import('../features/pedidos/pages/CustomerOrderPages').then((module) => ({ default: module.CartPage })))
const CheckoutPage = lazy(() => import('../features/pedidos/pages/CustomerOrderPages').then((module) => ({ default: module.CheckoutPage })))
const MyOrdersPage = lazy(() => import('../features/pedidos/pages/CustomerOrderPages').then((module) => ({ default: module.MyOrdersPage })))
const AdminOrdersPage = lazy(() => import('../features/pedidos/pages/AdminOrderPages').then((module) => ({ default: module.AdminOrdersPage })))
const AdminSummaryPage = lazy(() => import('../features/pedidos/pages/AdminOrderPages').then((module) => ({ default: module.AdminSummaryPage })))
const CatalogPage = lazy(() => import('../features/productos/pages/CatalogPage').then((module) => ({ default: module.CatalogPage })))
const AdminProductsPage = lazy(() => import('../features/productos/pages/AdminProductsPage').then((module) => ({ default: module.AdminProductsPage })))
const AdminUsersPage = lazy(() => import('../features/usuarios/pages/AdminUsersPage').then((module) => ({ default: module.AdminUsersPage })))

export function AppRouter() {
  return <BrowserRouter><MainLayout><Suspense fallback={<Loading text="Abriendo Food Store" />}><Routes>
    <Route path="/" element={<CatalogPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/registro" element={<RegisterPage />} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route path="/carrito" element={<CartPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/mis-pedidos" element={<MyOrdersPage />} />
    </Route>
    <Route element={<ProtectedRoute roles={['admin']} />}>
      <Route path="/admin/resumen" element={<AdminSummaryPage />} />
      <Route path="/admin/categorias" element={<AdminCategoriesPage />} />
      <Route path="/admin/productos" element={<AdminProductsPage />} />
      <Route path="/admin/pedidos" element={<AdminOrdersPage />} />
      <Route path="/admin/usuarios" element={<AdminUsersPage />} />
    </Route>
    <Route path="*" element={<CatalogPage />} />
  </Routes></Suspense></MainLayout></BrowserRouter>
}
