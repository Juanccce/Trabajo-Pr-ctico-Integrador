import { LoaderCircle } from 'lucide-react'

export function Loading({ text = 'Cargando' }: { text?: string }) {
  return <div className="state-box"><LoaderCircle className="spin" size={22} /><span>{text}…</span></div>
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return <div className="state-box state-empty"><strong>{title}</strong>{detail && <span>{detail}</span>}</div>
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="state-box state-error"><strong>{message}</strong>{retry && <button className="text-button" onClick={retry}>Volver a intentar</button>}</div>
}

export function SkeletonGrid() {
  return <div className="product-grid">{Array.from({ length: 6 }, (_, i) => <div className="skeleton-card" key={i}><div className="skeleton-image" /><div className="skeleton-line" /><div className="skeleton-line short" /></div>)}</div>
}
