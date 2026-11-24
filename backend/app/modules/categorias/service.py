from app.core.errors import Conflict, NotFound
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork | None = None) -> None:
        self.uow = uow or CategoriaUnitOfWork()

    def list_active(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(item) for item in uow.categorias.list_active()]

    def get(self, category_id: int) -> CategoriaRead:
        with self.uow as uow:
            item = uow.categorias.get_by_id(category_id)
            if not item or not item.activo:
                raise NotFound("Categoría inexistente")
            return CategoriaRead.model_validate(item)

    def create(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre):
                raise Conflict("Ya existe una categoría con ese nombre")
            item = uow.categorias.add(Categoria(**data.model_dump()))
            return CategoriaRead.model_validate(item)

    def update(self, category_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            item = uow.categorias.get_by_id(category_id)
            if not item or not item.activo:
                raise NotFound("Categoría inexistente")
            changes = data.model_dump(exclude_unset=True, exclude_none=True)
            if "nombre" in changes:
                other = uow.categorias.get_by_nombre(changes["nombre"])
                if other and other.id != category_id:
                    raise Conflict("Ya existe una categoría con ese nombre")
            for key, value in changes.items():
                setattr(item, key, value)
            uow.session.add(item)
            uow.session.flush()
            return CategoriaRead.model_validate(item)

    def deactivate(self, category_id: int) -> None:
        with self.uow as uow:
            item = uow.categorias.get_by_id(category_id)
            if not item or not item.activo:
                raise NotFound("Categoría inexistente")
            item.activo = False
            for product in item.productos:
                product.activo = False
                uow.session.add(product)
            uow.session.add(item)
