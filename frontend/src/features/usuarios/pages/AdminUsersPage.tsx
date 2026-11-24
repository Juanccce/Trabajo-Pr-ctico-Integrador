import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { userApi } from '../api/usuarios'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EmptyState, ErrorState, Loading } from '../../../shared/components/States'
import { TablePager } from '../../../shared/components/TablePager'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { useAuthStore } from '../../../store/authStore'
import type { User } from '../../../types'
import { AdminNav } from '../../categorias/pages/AdminCategoriesPage'
import { PageTitle } from '../../pedidos/pages/CustomerOrderPages'

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)
  const [error, setError] = useState('')
  const users = useQuery({ queryKey: ['usuarios'], queryFn: userApi.list })
  const userRows = users.data ?? []
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['usuarios'] })
  const activate = useMutation({ mutationFn: userApi.activate, onSuccess: refresh, onError: (reason) => setError(handleApiError(reason)) })
  const deactivate = useMutation({ mutationFn: userApi.deactivate, onSuccess: refresh, onError: (reason) => setError(handleApiError(reason)) })
  const columns = useMemo<ColumnDef<User>[]>(() => [
    { accessorKey: 'username', header: 'Usuario', cell: ({ row }) => <div><strong>{row.original.username}</strong>{row.original.id === currentUser?.id && <span className="you-tag">Vos</span>}</div> },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol', cell: (info) => <span className="role-chip">{String(info.getValue()) === 'admin' ? 'Admin' : 'Cliente'}</span> },
    { accessorKey: 'disabled', header: 'Estado', cell: (info) => <span className={info.getValue() ? 'user-status inactive' : 'user-status'}>{info.getValue() ? 'Desactivado' : 'Activo'}</span> },
    { id: 'actions', header: '', cell: ({ row }) => row.original.id === currentUser?.id ? <span className="muted">Tu cuenta</span> : row.original.disabled ? <Button variant="secondary" onClick={() => activate.mutate(row.original.id)}>Activar</Button> : <Button variant="ghost" onClick={() => { if (window.confirm(`¿Desactivar a ${row.original.username}?`)) deactivate.mutate(row.original.id) }}>Desactivar</Button> },
  ], [currentUser?.id, activate, deactivate])
  const table = useReactTable({ data: userRows, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 10 } } })
  return <section className="content-page"><PageTitle eyebrow="Panel de administración" title="Las cuentas." /><AdminNav /><Card className="table-card"><div className="card-heading"><div><span className="eyebrow">Accesos</span><h2>Usuarios registrados</h2></div><span className="count-chip">{userRows.length}</span></div>{error && <p className="form-error">{error}</p>}{users.isLoading ? <Loading /> : users.isError ? <ErrorState message={handleApiError(users.error)} retry={() => void users.refetch()} /> : !userRows.length ? <EmptyState title="No hay usuarios todavía" /> : <><div className="table-scroll"><table className="data-table"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div><TablePager table={table} /></>}</Card></section>
}
