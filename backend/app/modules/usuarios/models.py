from datetime import datetime, timezone

from sqlmodel import Field, Relationship, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, min_length=3, max_length=50)
    full_name: str = Field(max_length=120)
    email: str = Field(index=True, unique=True, max_length=255)
    hashed_password: str
    role: str = Field(default="user", max_length=10)
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)
    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
