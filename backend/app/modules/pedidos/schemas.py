from datetime import datetime
from enum import Enum

from pydantic import ConfigDict, Field
from sqlmodel import SQLModel


class EstadoPedido(str, Enum):
    PENDIENTE = "PENDIENTE"
    EN_PREPARACION = "EN_PREPARACION"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"


class FormaPago(str, Enum):
    EFECTIVO = "EFECTIVO"
    TRANSFERENCIA = "TRANSFERENCIA"


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = Field(default=None, max_length=1000)


class DetallePedidoRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    estado: EstadoPedido


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
