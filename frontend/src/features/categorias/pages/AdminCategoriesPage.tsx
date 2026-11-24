import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { categoryApi } from '../../productos/api/productos'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EmptyState, ErrorState, Loading } from '../../../shared/components/States'
import { TablePager } from '../../../shared/components/TablePager'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import type { Category } from '../../../types'
import { PageTitle } from '../../pedidos/pages/CustomerOrderPages'

export function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const categories = useQuery({ queryKey: ['categorias'], queryFn: categoryApi.list })
  const categoryRows = categories.data ?? []
  const [editing, setEditing] = useState<Category | null>(null)
  const [error, setError] = useState('')
  const remove = useMutation({ mutationFn: categoryApi.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }), onError: (reason) => setError(handleApiError(reason)) })
  const columns = useMemo<ColumnDef<Category>[]>(() => [
    { accessorKey: 'nombre', header: 'Categoría', cell: (info) => <strong>{String(info.getValue())}</strong> },
    { accessorKey: 'descripcion', header: 'Descripción' },
    { id: 'actions', header: '', cell: ({ row }) => <div className="table-actions"><button className="icon-button" aria-label="Editar" onClick={() => setEditing(row.original)}><Pencil size={16} /></button><button className="icon-button danger-icon" aria-label="Dar de baja" onClick={() => { if (window.confirm('Al retirar la categoría también se ocultan sus productos. ¿Seguimos?')) remove.mutate(row.original.id) }}><Trash2 size={16} /></button></div> },
  ], [remove])
  const table = useReactTable({ data: categoryRows, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 8 } } })
  if (categories.isLoading) return <section className="content-page"><Loading /></section>
  if (categories.isError) return <section className="content-page"><ErrorState message={handleApiError(categories.error)} retry={() => void categories.refetch()} /></section>
  return <section className="content-page"><PageTitle eyebrow="Panel de administración" title="Categorías." /><AdminNav /><div className="admin-grid"><CategoryEditor key={editing?.id ?? 'new'} category={editing} close={() => setEditing(null)} onSaved={() => queryClient.invalidateQueries({ queryKey: ['categorias'] })} /><Card className="table-card"><div className="card-heading"><div><span className="eyebrow">Catálogo</span><h2>Las categorías activas</h2></div><span className="count-chip">{categoryRows.length}</span></div>{error && <p className="form-error">{error}</p>}{categoryRows.length === 0 ? <EmptyState title="No hay categorías" /> : <><div className="table-scroll"><table className="data-table"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div><TablePager table={table} /></>}</Card></div></section>
}

function CategoryEditor({ category, close, onSaved }: { category: Category | null; close: () => void; onSaved: () => void }) {
  const [error, setError] = useState('')
  const form = useForm({
    defaultValues: { nombre: category?.nombre ?? '', descripcion: category?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      setError('')
      try { if (category) await categoryApi.update(category.id, value); else await categoryApi.create(value); onSaved(); close() } catch (reason) { setError(handleApiError(reason)) }
    },
  })
  return <Card className="editor-card"><div className="card-heading"><div><span className="eyebrow">{category ? 'Editar' : 'Nueva categoría'}</span><h2>{category ? category.nombre : 'Sumá una opción'}</h2></div>{category && <button className="text-button" onClick={close}>Cancelar</button>}</div><form className="stack-form" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit() }}><form.Field name="nombre">{(field) => <label className="form-field"><span>Nombre</span><input value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} minLength={2} maxLength={100} required /></label>}</form.Field><form.Field name="descripcion">{(field) => <label className="form-field"><span>Descripción</span><textarea value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} rows={3} maxLength={500} /></label>}</form.Field>{error && <p className="form-error">{error}</p>}<Button type="submit" className="button-wide">{category ? 'Guardar cambios' : <><Plus size={17} /> Crear categoría</>}</Button></form></Card>
}

export function AdminNav() {
  return <nav className="admin-nav"><a href="/admin/resumen">Resumen</a><a href="/admin/categorias">Categorías</a><a href="/admin/productos">Productos</a><a href="/admin/pedidos">Pedidos</a><a href="/admin/usuarios">Usuarios</a></nav>
}
