from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.core.errors import DomainError
from app.modules.productos.schemas import ProductoCreate, ProductoRead, ProductoStockUpdate, ProductoUpdate, ProductosPaginados
from app.modules.productos.service import ProductoService
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService()


def call_domain(function, *args):
    try:
        return function(*args)
    except DomainError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.get("", response_model=ProductosPaginados)
def list_products(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), search: str | None = None, categoria_id: int | None = None, disponible: bool | None = None, service: ProductoService = Depends(get_producto_service)):
    return service.list_active(skip, limit, search, categoria_id, disponible)


@router.get("/{product_id}", response_model=ProductoRead)
def get_product(product_id: int, service: ProductoService = Depends(get_producto_service)):
    return call_domain(service.get, product_id)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductoCreate, _: Usuario = Depends(require_role("admin")), service: ProductoService = Depends(get_producto_service)):
    return call_domain(service.create, data)


@router.put("/{product_id}", response_model=ProductoRead)
def update_product(product_id: int, data: ProductoUpdate, _: Usuario = Depends(require_role("admin")), service: ProductoService = Depends(get_producto_service)):
    return call_domain(service.update, product_id, data)


@router.patch("/{product_id}/stock", response_model=ProductoRead)
def update_stock(product_id: int, data: ProductoStockUpdate, _: Usuario = Depends(require_role("admin")), service: ProductoService = Depends(get_producto_service)):
    return call_domain(service.update_stock, product_id, data)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, _: Usuario = Depends(require_role("admin")), service: ProductoService = Depends(get_producto_service)):
    call_domain(service.deactivate, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
