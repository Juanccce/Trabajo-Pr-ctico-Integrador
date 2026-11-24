import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { categoryApi, productApi } from '../api/productos'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EmptyState, ErrorState, Loading } from '../../../shared/components/States'
import { TablePager } from '../../../shared/components/TablePager'
import { AdminNav } from '../../categorias/pages/AdminCategoriesPage'
import { PageTitle } from '../../pedidos/pages/CustomerOrderPages'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import type { Category, Product } from '../../../types'
import { formatPrice } from '../../../utils/format'

export function AdminProductsPage() {
  const queryClient = useQueryClient()
  const products = useQuery({ queryKey: ['productos-admin'], queryFn: () => productApi.list({ skip: 0, limit: 100 }) })
  const categories = useQuery({ queryKey: ['categorias'], queryFn: categoryApi.list })
  const productRows = products.data?.items ?? []
  const categoryRows = categories.data ?? []
  const [editing, setEditing] = useState<Product | null>(null)
  const [error, setError] = useState('')
  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ['productos-admin'] }); await queryClient.invalidateQueries({ queryKey: ['productos'] }) }
  const remove = useMutation({ mutationFn: productApi.remove, onSuccess: refresh, onError: (reason) => setError(handleApiError(reason)) })
  const stock = useMutation({ mutationFn: ({ id, data }: { id: number; data: { stock: number; disponible: boolean } }) => productApi.updateStock(id, data), onSuccess: refresh, onError: (reason) => setError(handleApiError(reason)) })
  const columns = useMemo<ColumnDef<Product>[]>(() => [
    { accessorKey: 'nombre', header: 'Producto', cell: ({ row }) => <div className="table-product"><img src={row.original.imagen_url} alt="" /><div><strong>{row.original.nombre}</strong><small>{row.original.categoria.nombre}</small></div></div> },
    { accessorKey: 'precio_base', header: 'Precio', cell: (info) => formatPrice(Number(info.getValue())) },
    { accessorKey: 'stock', header: 'Stock', cell: ({ row }) => <input className="stock-input" aria-label={`Stock de ${row.original.nombre}`} type="number" min="0" defaultValue={row.original.stock} onBlur={(event) => { const value = Number(event.target.value); if (value !== row.original.stock && value >= 0) stock.mutate({ id: row.original.id, data: { stock: value, disponible: row.original.disponible } }) }} /> },
    { accessorKey: 'disponible', header: 'Visible', cell: ({ row }) => <label className="switch"><input type="checkbox" checked={row.original.disponible} onChange={(event) => stock.mutate({ id: row.original.id, data: { stock: row.original.stock, disponible: event.target.checked } })} /><span /></label> },
    { id: 'actions', header: '', cell: ({ row }) => <div className="table-actions"><button className="icon-button" aria-label="Editar" onClick={() => setEditing(row.original)}><Pencil size={16} /></button><button className="icon-button danger-icon" aria-label="Dar de baja" onClick={() => { if (window.confirm(`¿Retirar ${row.original.nombre} del menú?`)) remove.mutate(row.original.id) }}><Trash2 size={16} /></button></div> },
  ], [remove, stock])
  const table = useReactTable({ data: productRows, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 8 } } })
  if (products.isLoading || categories.isLoading) return <section className="content-page"><Loading /></section>
  if (products.isError || categories.isError) return <section className="content-page"><ErrorState message={handleApiError(products.error ?? categories.error)} retry={() => { void products.refetch(); void categories.refetch() }} /></section>
  return <section className="content-page"><PageTitle eyebrow="Panel de administración" title="Productos." /><AdminNav /><div className="admin-grid products-admin-grid"><ProductEditor key={editing?.id ?? 'new'} product={editing} categories={categoryRows} close={() => setEditing(null)} onSaved={() => { void refresh(); setEditing(null) }} /><Card className="table-card"><div className="card-heading"><div><span className="eyebrow">Catálogo</span><h2>Productos activos</h2></div><span className="count-chip">{products.data?.total ?? 0}</span></div>{error && <p className="form-error">{error}</p>}{productRows.length === 0 ? <EmptyState title="No hay productos todavía" /> : <><div className="table-scroll"><table className="data-table"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div><TablePager table={table} /></>}</Card></div></section>
}

function ProductEditor({ product, categories, close, onSaved }: { product: Product | null; categories: Category[]; close: () => void; onSaved: () => void }) {
  const [error, setError] = useState('')
  const form = useForm({
    defaultValues: { nombre: product?.nombre ?? '', descripcion: product?.descripcion ?? '', categoria_id: product?.categoria_id ?? categories[0]?.id ?? 0, precio_base: product?.precio_base ?? 0, imagen_url: product?.imagen_url ?? '', stock: product?.stock ?? 0, disponible: product?.disponible ?? true },
    onSubmit: async ({ value }) => {
      setError('')
      try { if (product) await productApi.update(product.id, value); else await productApi.create(value); onSaved() } catch (reason) { setError(handleApiError(reason)) }
    },
  })
  return <Card className="editor-card"><div className="card-heading"><div><span className="eyebrow">{product ? 'Editar' : 'Nuevo producto'}</span><h2>{product ? product.nombre : 'Sumá al menú'}</h2></div>{product && <button className="text-button" onClick={close}>Cancelar</button>}</div><form className="stack-form" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit() }}><form.Field name="nombre">{(field) => <label className="form-field"><span>Nombre</span><input value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} required /></label>}</form.Field><form.Field name="descripcion">{(field) => <label className="form-field"><span>Descripción</span><textarea value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} rows={2} /></label>}</form.Field><form.Field name="categoria_id">{(field) => <label className="form-field"><span>Categoría</span><select value={field.state.value} onChange={(event) => field.handleChange(Number(event.target.value))} required><option value="" disabled>Elegí una</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>}</form.Field><div className="form-row"><form.Field name="precio_base">{(field) => <label className="form-field"><span>Precio</span><input type="number" min="0" step="1" value={field.state.value} onChange={(event) => field.handleChange(Number(event.target.value))} required /></label>}</form.Field><form.Field name="stock">{(field) => <label className="form-field"><span>Stock</span><input type="number" min="0" value={field.state.value} onChange={(event) => field.handleChange(Number(event.target.value))} required /></label>}</form.Field></div><form.Field name="imagen_url">{(field) => <label className="form-field"><span>URL de imagen</span><input type="url" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} /></label>}</form.Field><form.Field name="disponible">{(field) => <label className="checkbox-line"><input type="checkbox" checked={field.state.value} onChange={(event) => field.handleChange(event.target.checked)} /> Disponible en el menú</label>}</form.Field>{error && <p className="form-error">{error}</p>}<Button type="submit" className="button-wide">{product ? 'Guardar cambios' : <><Plus size={17} /> Crear producto</>}</Button></form></Card>
}
