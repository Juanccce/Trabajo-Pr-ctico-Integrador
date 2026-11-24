from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel

from app.modules.usuarios.models import utc_now


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="PENDIENTE", max_length=20, index=True)
    forma_pago: str = Field(max_length=20)
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None, max_length=1000)
    total: float = Field(default=0, ge=0)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    usuario: "Usuario" = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido", cascade_delete=True)


class DetallePedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(ge=1)
    nombre_producto: str = Field(max_length=120)
    precio_unitario: float = Field(ge=0)
    subtotal: float = Field(ge=0)
    pedido: Pedido = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")
