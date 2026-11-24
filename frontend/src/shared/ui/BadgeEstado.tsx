import type { OrderState } from '../../types'

const labels: Record<OrderState, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export function BadgeEstado({ estado }: { estado: OrderState }) {
  return <span className={`status-pill status-${estado.toLowerCase()}`}>{labels[estado]}</span>
}
