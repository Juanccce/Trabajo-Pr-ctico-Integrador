import { useQuery } from '@tanstack/react-query'
import { ArrowDownRight, ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'

import { productApi } from '../api/productos'
import { handleApiError } from '../../../shared/api/handleApiError'
import { ErrorState, SkeletonGrid } from '../../../shared/components/States'
import { Button } from '../../../shared/ui/Button'
import { useCartStore } from '../../../store/cartStore'
import { formatPrice } from '../../../utils/format'

const pageSize = 6

export function CatalogPage() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [page, setPage] = useState(0)
  const add = useCartStore((state) => state.add)
  const categories = useQuery({ queryKey: ['categorias'], queryFn: productApi.categories })
  const products = useQuery({
    queryKey: ['productos', { search, categoryId, page }],
    queryFn: () => productApi.list({ skip: page * pageSize, limit: pageSize, search: search || undefined, categoria_id: categoryId }),
  })
  const pages = Math.max(1, Math.ceil((products.data?.total ?? 0) / pageSize))

  return <>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" />Cocina de barrio, todos los días</div>
        <h1>Algo rico<br />te está <em>esperando.</em></h1>
        <p>Platos simples, ingredientes frescos y ese sabor de volver a pedir.</p>
        <a href="#menu" className="hero-cta">Explorar el menú <ArrowDownRight size={18} /></a>
        <div className="hero-note"><span>✳</span> Preparado al momento, sin apuro.</div>
      </div>
      <div className="hero-art">
        <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1100&q=90" alt="Hamburguesa de la casa con queso y vegetales" />
        <div className="hero-stamp"><span>rico</span><strong>de verdad</strong><small>hecho acá · para vos</small></div>
        <div className="hero-photo-caption"><span>01 / Favorito de la casa</span><b>Doble cheddar</b></div>
      </div>
      <span className="hero-scribble">bueno<br />y punto</span>
    </section>

    <section className="menu-section" id="menu">
      <div className="section-heading">
        <div><span className="eyebrow">Elegí tu próximo favorito</span><h2>El menú <em>de hoy</em></h2></div>
        <p>Una carta corta, hecha con ganas.<br />El resto lo ponemos en la cocina.</p>
      </div>
      <div className="catalog-controls">
        <div className="category-tabs">
          <button className={!categoryId ? 'category-tab active' : 'category-tab'} onClick={() => { setCategoryId(undefined); setPage(0) }}>Todo</button>
          {(categories.data ?? []).map((category) => <button key={category.id} className={categoryId === category.id ? 'category-tab active' : 'category-tab'} onClick={() => { setCategoryId(category.id); setPage(0) }}>{category.nombre}</button>)}
        </div>
        <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} placeholder="¿Qué se te antoja?" /><kbd>/</kbd></label>
      </div>
      {products.isError ? <ErrorState message={handleApiError(products.error)} retry={() => void products.refetch()} /> : products.isLoading || !products.data ? <SkeletonGrid /> : products.data.items.length === 0 ? <div className="empty-menu"><div className="empty-plate">∅</div><h3>No encontramos eso</h3><p>Probá con otra búsqueda o elegí una categoría distinta.</p><button className="text-button" onClick={() => { setSearch(''); setCategoryId(undefined) }}>Ver todo el menú <ArrowRight size={15} /></button></div> : <div className="product-grid">{products.data.items.map((product, index) => <article className="product-card" key={product.id}>
        <div className="product-photo-wrap"><img className="product-photo" src={product.imagen_url || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'} alt={product.nombre} loading="lazy" onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80' }} />{index === 0 && page === 0 && !search && <span className="photo-tag">Más pedido</span>}<span className="photo-number">{String(index + 1 + page * pageSize).padStart(2, '0')}</span></div>
        <div className="product-info"><div className="product-meta"><span>{product.categoria.nombre}</span><span className="product-stock">{product.disponible && product.stock > 0 ? 'Sale hoy' : 'Agotado'}</span></div><h3>{product.nombre}</h3><p>{product.descripcion}</p><div className="product-bottom"><strong>{formatPrice(product.precio_base)}</strong><Button variant="secondary" disabled={!product.disponible || product.stock < 1} onClick={() => add({ producto_id: product.id, nombre: product.nombre, precio_unitario: product.precio_base, imagen_url: product.imagen_url })}>Agregar <span className="plus">+</span></Button></div></div>
      </article>)}</div>}
      {!products.isLoading && !products.isError && products.data && products.data.total > pageSize && <div className="pagination"><span>Mostrando {page * pageSize + 1}–{Math.min((page + 1) * pageSize, products.data.total)} de {products.data.total}</span><div><button aria-label="Página anterior" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}><ChevronLeft size={19} /></button><b>{page + 1} <small>/ {pages}</small></b><button aria-label="Página siguiente" disabled={page + 1 >= pages} onClick={() => setPage((value) => Math.min(pages - 1, value + 1))}><ChevronRight size={19} /></button></div></div>}
    </section>
    <section className="closing-note"><span className="note-star">✳</span><p>El buen día empieza<br />por <em>algo rico.</em></p><span>Nosotros nos encargamos.</span></section>
  </>
}
