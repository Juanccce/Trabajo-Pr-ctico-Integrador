from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.core.errors import DomainError
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaService
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService()


def call_domain(function, *args):
    try:
        return function(*args)
    except DomainError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.get("", response_model=list[CategoriaRead])
def list_categories(service: CategoriaService = Depends(get_categoria_service)):
    return service.list_active()


@router.get("/{category_id}", response_model=CategoriaRead)
def get_category(category_id: int, service: CategoriaService = Depends(get_categoria_service)):
    return call_domain(service.get, category_id)


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def create_category(data: CategoriaCreate, _: Usuario = Depends(require_role("admin")), service: CategoriaService = Depends(get_categoria_service)):
    return call_domain(service.create, data)


@router.put("/{category_id}", response_model=CategoriaRead)
def update_category(category_id: int, data: CategoriaUpdate, _: Usuario = Depends(require_role("admin")), service: CategoriaService = Depends(get_categoria_service)):
    return call_domain(service.update, category_id, data)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, _: Usuario = Depends(require_role("admin")), service: CategoriaService = Depends(get_categoria_service)):
    call_domain(service.deactivate, category_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
