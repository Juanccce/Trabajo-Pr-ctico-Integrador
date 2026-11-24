from app.core.errors import NotFound
from app.modules.categorias.schemas import CategoriaRead
from app.modules.productos.models import Producto
from app.modules.productos.schemas import ProductoCreate, ProductoRead, ProductoStockUpdate, ProductoUpdate, ProductosPaginados
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork | None = None) -> None:
        self.uow = uow or ProductoUnitOfWork()

    def _read(self, item: Producto) -> ProductoRead:
        item.categoria
        return ProductoRead.model_validate(item)

    def list_active(self, skip: int, limit: int, search: str | None, categoria_id: int | None, disponible: bool | None) -> ProductosPaginados:
        with self.uow as uow:
            total, products = uow.productos.list_active(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[self._read(item) for item in products])

    def get(self, product_id: int) -> ProductoRead:
        with self.uow as uow:
            item = uow.productos.get_by_id(product_id)
            if not item or not item.activo:
                raise NotFound("Producto inexistente")
            return self._read(item)

    def create(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            category = uow.categorias.get_by_id(data.categoria_id)
            if not category or not category.activo:
                raise NotFound("La categoría no existe o está dada de baja")
            item = uow.productos.add(Producto(**data.model_dump()))
            return self._read(item)

    def update(self, product_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            item = uow.productos.get_by_id(product_id)
            if not item or not item.activo:
                raise NotFound("Producto inexistente")
            changes = data.model_dump(exclude_unset=True, exclude_none=True)
            if "categoria_id" in changes:
                category = uow.categorias.get_by_id(changes["categoria_id"])
                if not category or not category.activo:
                    raise NotFound("La categoría no existe o está dada de baja")
            for key, value in changes.items():
                setattr(item, key, value)
            uow.session.add(item)
            uow.session.flush()
            return self._read(item)

    def update_stock(self, product_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            item = uow.productos.get_by_id(product_id)
            if not item or not item.activo:
                raise NotFound("Producto inexistente")
            item.stock = data.stock
            item.disponible = data.disponible
            uow.session.add(item)
            uow.session.flush()
            return self._read(item)

    def deactivate(self, product_id: int) -> None:
        with self.uow as uow:
            item = uow.productos.get_by_id(product_id)
            if not item or not item.activo:
                raise NotFound("Producto inexistente")
            item.activo = False
            uow.session.add(item)
