import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpRight, BadgeCheck, Clock3, CookingPot, ReceiptText, WalletCards } from 'lucide-react'
import { useMemo, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'

import { orderApi } from '../api/pedidos'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EmptyState, ErrorState, Loading } from '../../../shared/components/States'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Card } from '../../../shared/ui/Card'
import type { Order, OrderState } from '../../../types'
import { formatDate, formatPrice } from '../../../utils/format'
import { AdminNav } from '../../categorias/pages/AdminCategoriesPage'
import { PageTitle } from './CustomerOrderPages'

export function AdminSummaryPage() {
  const summary = useQuery({ queryKey: ['resumen-pedidos'], queryFn: orderApi.summary })
  if (summary.isError) return <section className="content-page"><ErrorState message={handleApiError(summary.error)} retry={() => void summary.refetch()} /></section>
  if (summary.isLoading || !summary.data) return <section className="content-page"><Loading text="Preparando el resumen" /></section>
  const items = [
    { label: 'Pendientes', value: summary.data.pendientes, icon: Clock3, tone: 'amber' },
    { label: 'En preparación', value: summary.data.en_preparacion, icon: CookingPot, tone: 'sage' },
    { label: 'Entregados', value: summary.data.entregados, icon: BadgeCheck, tone: 'blue' },
    { label: 'Cancelados', value: summary.data.cancelados, icon: ReceiptText, tone: 'rose' },
    { label: 'Pedidos hoy', value: summary.data.pedidos_hoy, icon: ArrowUpRight, tone: 'violet' },
    { label: 'Ingresos entregados', value: formatPrice(summary.data.ingresos_entregados), icon: WalletCards, tone: 'green' },
  ]
  return <section className="content-page"><PageTitle eyebrow="Panel de administración" title="Así viene el día." /><AdminNav /><div className="dashboard-grid">{items.map((item) => <Card className="metric-card" key={item.label}><span className={`metric-icon ${item.tone}`}><item.icon size={20} /></span><span className="metric-label">{item.label}</span><strong>{item.value}</strong><small>Actualizado al consultar</small></Card>)}</div><Card className="dashboard-note"><div><span className="eyebrow">A mano</span><h2>Una vista simple del movimiento.</h2><p>Desde el panel podés cambiar estados, revisar el catálogo y resolver cuentas cuando haga falta.</p></div><div className="dashboard-ornament">✳</div></Card></section>
}

const nextStates: Record<OrderState, OrderState[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

export function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [state, setState] = useState<OrderState | ''>('')
  const [error, setError] = useState('')
  const orders = useQuery({ queryKey: ['pedidos', 'admin', state], queryFn: () => orderApi.list({ limit: 100, estado: state || undefined }) })
  const change = useMutation({ mutationFn: ({ id, estado }: { id: number; estado: OrderState }) => orderApi.changeState(id, estado), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['pedidos'] }); await queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] }) }, onError: (reason) => setError(handleApiError(reason)) })
  const columns = useMemo<ColumnDef<Order>[]>(() => [
    { accessorKey: 'id', header: 'Pedido', cell: ({ row }) => <strong>#{String(row.original.id).padStart(4, '0')}</strong> },
    { accessorKey: 'created_at', header: 'Fecha', cell: (info) => formatDate(String(info.getValue())) },
    { accessorKey: 'usuario_id', header: 'Cliente', cell: (info) => `Usuario #${info.getValue()}` },
    { id: 'items', header: 'Detalle', cell: ({ row }) => <span>{row.original.items.map((item) => `${item.cantidad} × ${item.nombre_producto}`).join(', ')}</span> },
    { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    { accessorKey: 'total', header: 'Total', cell: (info) => <strong>{formatPrice(Number(info.getValue()))}</strong> },
    { id: 'actions', header: 'Acción', cell: ({ row }) => <div className="state-actions">{nextStates[row.original.estado].map((target) => <button key={target} className="text-button" disabled={change.isPending} onClick={() => change.mutate({ id: row.original.id, estado: target })}>{target === 'EN_PREPARACION' ? 'Preparar' : target === 'ENTREGADO' ? 'Entregar' : 'Cancelar'}</button>)}</div> },
  ], [change])
  const table = useReactTable({ data: orders.data?.items ?? [], columns, getCoreRowModel: getCoreRowModel() })
  const orderRows = orders.data?.items ?? []
  return <section className="content-page"><PageTitle eyebrow="Panel de administración" title="Pedidos en marcha." /><AdminNav /><Card className="table-card"><div className="card-heading"><div><span className="eyebrow">Cocina y entregas</span><h2>Todos los pedidos</h2></div><label className="filter-select"><span>Estado</span><select value={state} onChange={(event) => setState(event.target.value as OrderState | '')}><option value="">Todos</option><option value="PENDIENTE">Pendiente</option><option value="EN_PREPARACION">En preparación</option><option value="ENTREGADO">Entregado</option><option value="CANCELADO">Cancelado</option></select></label></div>{error && <p className="form-error">{error}</p>}{orders.isLoading ? <Loading /> : orders.isError ? <ErrorState message={handleApiError(orders.error)} retry={() => void orders.refetch()} /> : orderRows.length === 0 ? <EmptyState title="No hay pedidos con ese estado" /> : <div className="table-scroll"><table className="data-table"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div>}</Card></section>
}
