from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.core.errors import DomainError
from app.modules.pedidos.schemas import CambioEstado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.service import PedidoService
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService()


def call_domain(function, *args):
    try:
        return function(*args)
    except DomainError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def create_order(data: PedidoCreate, user: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    return call_domain(service.create, data, user.id)


@router.get("", response_model=PedidosPaginados)
def list_orders(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), estado: str | None = None, user: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    return service.list_orders(skip, limit, user, estado)


@router.get("/resumen", response_model=ResumenPedidos)
def order_summary(_: Usuario = Depends(require_role("admin")), service: PedidoService = Depends(get_pedido_service)):
    return service.summary()


@router.get("/{order_id}", response_model=PedidoRead)
def get_order(order_id: int, user: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    return call_domain(service.get, order_id, user)


@router.patch("/{order_id}/estado", response_model=PedidoRead)
def change_order_state(order_id: int, data: CambioEstado, _: Usuario = Depends(require_role("admin")), service: PedidoService = Depends(get_pedido_service)):
    return call_domain(service.change_state, order_id, data)


@router.patch("/{order_id}/cancelar", response_model=PedidoRead)
def cancel_order(order_id: int, user: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    return call_domain(service.cancel_own, order_id, user)
