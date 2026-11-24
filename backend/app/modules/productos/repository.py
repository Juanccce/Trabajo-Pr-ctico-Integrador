from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session) -> None:
        super().__init__(session, Producto)

    def list_active(self, skip: int, limit: int, search: str | None, categoria_id: int | None, disponible: bool | None):
        query = select(Producto).where(Producto.activo.is_(True))
        if search:
            query = query.where(func.lower(Producto.nombre).contains(search.lower()))
        if categoria_id is not None:
            query = query.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            query = query.where(Producto.disponible == disponible)
        total = self.session.exec(select(func.count()).select_from(query.subquery())).one()
        items = self.session.exec(query.order_by(Producto.nombre).offset(skip).limit(limit)).all()
        return int(total), list(items)
