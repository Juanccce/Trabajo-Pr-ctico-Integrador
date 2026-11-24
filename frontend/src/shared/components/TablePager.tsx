import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Table } from '@tanstack/react-table'

export function TablePager<T>({ table }: { table: Table<T> }) {
  const { pageIndex, pageSize } = table.getState().pagination
  if (table.getPageCount() <= 1) return null
  return <div className="table-pager"><span>{pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, table.getFilteredRowModel().rows.length)} de {table.getFilteredRowModel().rows.length}</span><div><button aria-label="Página anterior" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}><ChevronLeft size={15} /></button><b>{pageIndex + 1}<small> / {table.getPageCount()}</small></b><button aria-label="Página siguiente" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}><ChevronRight size={15} /></button></div></div>
}
