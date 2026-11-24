from datetime import datetime, time, timedelta, timezone

from app.core.errors import DomainError, Forbidden, NotFound
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import CambioEstado, EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

TRANSICIONES = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork | None = None) -> None:
        self.uow = uow or PedidoUnitOfWork()

    def create(self, data: PedidoCreate, user_id: int) -> PedidoRead:
        with self.uow as uow:
            product_ids = [item.producto_id for item in data.items]
            if len(product_ids) != len(set(product_ids)):
                raise DomainError("No se puede repetir un producto en el pedido")
            order = Pedido(usuario_id=user_id, estado="PENDIENTE", forma_pago=data.forma_pago.value, direccion_entrega=data.direccion_entrega, notas=data.notas, total=0)
            uow.pedidos.add(order)
            total = 0.0
            for requested in data.items:
                product = uow.productos.get_by_id(requested.producto_id)
                if product is None or not product.activo:
                    raise NotFound("Producto inexistente")
                if not product.disponible:
                    raise DomainError(f"{product.nombre} no está disponible")
                if product.stock < requested.cantidad:
                    raise DomainError(f"No hay stock suficiente de {product.nombre}")
                product.stock -= requested.cantidad
                uow.session.add(product)
                subtotal = round(product.precio_base * requested.cantidad, 2)
                uow.session.add(DetallePedido(pedido_id=order.id, producto_id=product.id, cantidad=requested.cantidad, nombre_producto=product.nombre, precio_unitario=product.precio_base, subtotal=subtotal))
                total += subtotal
            order.total = round(total, 2)
            order.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
            uow.session.add(order)
            uow.session.flush()
            uow.session.refresh(order)
            return PedidoRead.model_validate(order)

    def list_orders(self, skip: int, limit: int, user: Usuario, estado: str | None) -> PedidosPaginados:
        with self.uow as uow:
            owner_id = None if user.role == "admin" else user.id
            total, orders = uow.pedidos.list_orders(skip, limit, owner_id, estado)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(order) for order in orders])

    def get(self, order_id: int, user: Usuario) -> PedidoRead:
        with self.uow as uow:
            order = uow.pedidos.get_by_id(order_id)
            if order is None:
                raise NotFound("Pedido inexistente")
            if user.role != "admin" and order.usuario_id != user.id:
                raise Forbidden("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(order)

    def _get_order(self, uow, order_id: int) -> Pedido:
        order = uow.pedidos.get_by_id(order_id)
        if order is None:
            raise NotFound("Pedido inexistente")
        return order

    def _restore_stock(self, uow, order: Pedido) -> None:
        for line in order.items:
            product = uow.productos.get_by_id(line.producto_id)
            if product:
                product.stock += line.cantidad
                uow.session.add(product)

    def change_state(self, order_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            order = self._get_order(uow, order_id)
            target = data.estado.value
            if target not in TRANSICIONES[order.estado]:
                raise DomainError("La transición solicitada no es válida")
            if target == "CANCELADO":
                self._restore_stock(uow, order)
            order.estado = target
            order.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
            uow.session.add(order)
            uow.session.flush()
            return PedidoRead.model_validate(order)

    def cancel_own(self, order_id: int, user: Usuario) -> PedidoRead:
        with self.uow as uow:
            order = self._get_order(uow, order_id)
            if order.usuario_id != user.id:
                raise Forbidden("El pedido pertenece a otro usuario")
            if order.estado != "PENDIENTE":
                raise DomainError("Solo se puede cancelar un pedido pendiente")
            self._restore_stock(uow, order)
            order.estado = "CANCELADO"
            order.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
            uow.session.add(order)
            uow.session.flush()
            return PedidoRead.model_validate(order)

    def summary(self) -> ResumenPedidos:
        with self.uow as uow:
            today = datetime.now(timezone.utc).date()
            start = datetime.combine(today, time.min)
            end = start + timedelta(days=1)
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_today(start, end),
                ingresos_entregados=uow.pedidos.delivered_revenue(),
            )
