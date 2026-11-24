import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { orderApi } from '../api/pedidos'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EmptyState, ErrorState, Loading } from '../../../shared/components/States'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import { useCartStore } from '../../../store/cartStore'
import { formatDate, formatPrice } from '../../../utils/format'

export function CartPage() {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total())
  const remove = useCartStore((state) => state.remove)
  const changeQuantity = useCartStore((state) => state.changeQuantity)
  const user = useAuthStore((state) => state.user)
  if (!items.length) return <section className="content-page"><PageTitle eyebrow="Tu selección" title="El carrito está esperando." /><EmptyState title="Todavía no agregaste nada" detail="Date una vuelta por el menú y elegí algo rico." /><Link className="button button-primary center-link" to="/">Ir al menú <ArrowRight size={17} /></Link></section>
  return <section className="content-page"><PageTitle eyebrow="Tu selección" title="Lo que pediste." /><div className="cart-layout"><div className="cart-lines">{items.map((item) => <article className="cart-line" key={item.producto_id}><img src={item.imagen_url} alt="" /><div className="cart-line-main"><h3>{item.nombre}</h3><span>{formatPrice(item.precio_unitario)} c/u</span><div className="quantity-control"><button onClick={() => changeQuantity(item.producto_id, item.cantidad - 1)} aria-label="Restar"><Minus size={14} /></button><span>{item.cantidad}</span><button onClick={() => changeQuantity(item.producto_id, item.cantidad + 1)} aria-label="Sumar"><Plus size={14} /></button></div></div><strong className="cart-line-total">{formatPrice(item.precio_unitario * item.cantidad)}</strong><button className="icon-button remove-item" aria-label={`Quitar ${item.nombre}`} onClick={() => remove(item.producto_id)}><Trash2 size={17} /></button></article>)}</div><aside className="order-summary"><span className="eyebrow">Un último paso</span><h2>Resumen</h2><div className="summary-row"><span>Productos ({items.reduce((sum, item) => sum + item.cantidad, 0)})</span><span>{formatPrice(total)}</span></div><div className="summary-row"><span>Envío</span><span className="muted">A coordinar</span></div><div className="summary-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>{user ? <Link to="/checkout" className="button button-primary button-wide">Continuar al pedido <ArrowRight size={17} /></Link> : <Link to="/login" state={{ from: '/checkout' }} className="button button-primary button-wide">Ingresá para continuar <ArrowRight size={17} /></Link>}<p className="summary-caption">El pago se coordina al recibir tu pedido.</p></aside></div><Link className="back-link back-under" to="/"><ArrowLeft size={15} /> Seguir mirando</Link></section>
}

export function CheckoutPage() {
  const items = useCartStore((state) => state.items)
  const clear = useCartStore((state) => state.clear)
  const total = useCartStore((state) => state.total())
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const mutation = useMutation({ mutationFn: orderApi.create, onSuccess: async () => { clear(); await queryClient.invalidateQueries({ queryKey: ['pedidos'] }); navigate('/mis-pedidos') } })
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as 'EFECTIVO' | 'TRANSFERENCIA', notas: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try { await mutation.mutateAsync({ ...value, items: items.map((item) => ({ producto_id: item.producto_id, cantidad: item.cantidad })) }) } catch (reason) { setError(handleApiError(reason)) }
    },
  })
  if (!items.length) return <section className="content-page"><EmptyState title="No hay productos para pedir" detail="Volvé al menú para armar tu pedido." /><Link to="/" className="button button-primary center-link">Ir al menú</Link></section>
  return <section className="content-page"><PageTitle eyebrow="Confirmar pedido" title="¿A dónde lo llevamos?" /><div className="checkout-layout"><form className="checkout-form card" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit() }}><span className="eyebrow">Datos de entrega</span><form.Field name="direccion_entrega" validators={{ onChange: ({ value }) => value.trim().length < 5 ? 'La dirección necesita al menos 5 caracteres.' : undefined }}>{(field) => <label className="form-field"><span>Dirección</span><input autoComplete="street-address" placeholder="Calle, número y barrio" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} minLength={5} maxLength={200} required />{field.state.meta.errors.map((item, index) => <small className="field-error" key={index}>{String(item)}</small>)}</label>}</form.Field><form.Field name="forma_pago">{(field) => <fieldset className="form-field"><legend>¿Cómo preferís pagar?</legend><div className="payment-options"><label className={field.state.value === 'EFECTIVO' ? 'payment-option selected' : 'payment-option'}><input type="radio" name={field.name} checked={field.state.value === 'EFECTIVO'} onChange={() => field.handleChange('EFECTIVO')} />Efectivo</label><label className={field.state.value === 'TRANSFERENCIA' ? 'payment-option selected' : 'payment-option'}><input type="radio" name={field.name} checked={field.state.value === 'TRANSFERENCIA'} onChange={() => field.handleChange('TRANSFERENCIA')} />Transferencia</label></div></fieldset>}</form.Field><form.Field name="notas">{(field) => <label className="form-field"><span>Notas para la cocina <small>(opcional)</small></span><textarea value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} placeholder="Alergias, referencias, algún detalle…" rows={3} maxLength={1000} /></label>}</form.Field>{error && <p className="form-error">{error}</p>}<Button type="submit" disabled={mutation.isPending} className="button-wide">{mutation.isPending ? 'Enviando pedido…' : 'Confirmar pedido'} <ArrowRight size={17} /></Button></form><aside className="order-summary checkout-side"><span className="eyebrow">Revisá antes de enviar</span><h2>Tu pedido</h2>{items.map((item) => <div className="summary-row" key={item.producto_id}><span>{item.cantidad} × {item.nombre}</span><span>{formatPrice(item.cantidad * item.precio_unitario)}</span></div>)}<div className="summary-total"><span>Total</span><strong>{formatPrice(total)}</strong></div><p className="summary-caption">El stock se confirma al enviar el pedido.</p></aside></div></section>
}

export function MyOrdersPage() {
  const queryClient = useQueryClient()
  const orders = useQuery({ queryKey: ['pedidos'], queryFn: () => orderApi.list({ limit: 100 }) })
  const orderRows = orders.data?.items ?? []
  const [error, setError] = useState('')
  const cancel = useMutation({ mutationFn: orderApi.cancel, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pedidos'] }), onError: (reason) => setError(handleApiError(reason)) })
  if (orders.isLoading) return <section className="content-page"><Loading text="Buscando tus pedidos" /></section>
  if (orders.isError) return <section className="content-page"><ErrorState message={handleApiError(orders.error)} retry={() => void orders.refetch()} /></section>
  return <section className="content-page"><PageTitle eyebrow="Tu historial" title="Pedidos hechos con ganas." />{error && <p className="form-error">{error}</p>}{!orderRows.length ? <EmptyState title="Todavía no hay pedidos" detail="El primero puede ser hoy." /> : <div className="order-list">{orderRows.map((order) => <article className="order-card" key={order.id}><div className="order-card-top"><div><span className="order-number">Pedido #{String(order.id).padStart(4, '0')}</span><span className="order-date">{formatDate(order.created_at)}</span></div><BadgeEstado estado={order.estado} /></div><div className="order-card-items">{order.items.map((item) => <span key={`${order.id}-${item.producto_id}`}>{item.cantidad} × {item.nombre_producto}</span>)}</div><div className="order-card-bottom"><strong>{formatPrice(order.total)}</strong><details><summary>Ver detalle</summary><div className="order-detail"><p>{order.direccion_entrega}</p><p>Pago: {order.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</p>{order.notas && <p>Nota: {order.notas}</p>}</div></details>{order.estado === 'PENDIENTE' && <Button variant="ghost" disabled={cancel.isPending} onClick={() => { if (window.confirm('¿Querés cancelar este pedido? El stock va a volver al catálogo.')) cancel.mutate(order.id) }}>Cancelar pedido</Button>}</div></article>)}</div>}</section>
}

export function PageTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="page-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>
}
