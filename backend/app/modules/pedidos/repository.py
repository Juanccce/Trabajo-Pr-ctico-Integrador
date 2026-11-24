from datetime import datetime

from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session) -> None:
        super().__init__(session, Pedido)

    def list_orders(self, skip: int, limit: int, usuario_id: int | None, estado: str | None):
        query = select(Pedido)
        if usuario_id is not None:
            query = query.where(Pedido.usuario_id == usuario_id)
        if estado:
            query = query.where(Pedido.estado == estado)
        total = int(self.session.exec(select(func.count()).select_from(query.subquery())).one())
        items = self.session.exec(query.order_by(Pedido.created_at.desc()).offset(skip).limit(limit)).all()
        return total, list(items)

    def count_by_estado(self, estado: str) -> int:
        return int(self.session.exec(select(func.count(Pedido.id)).where(Pedido.estado == estado)).one())

    def count_today(self, start: datetime, end: datetime) -> int:
        return int(self.session.exec(select(func.count(Pedido.id)).where(Pedido.created_at >= start, Pedido.created_at < end)).one())

    def delivered_revenue(self) -> float:
        value = self.session.exec(select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == "ENTREGADO")).one()
        return float(value or 0)
