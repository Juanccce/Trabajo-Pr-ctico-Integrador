from sqlmodel import SQLModel

from app.modules.usuarios.schemas import UserCreate, UserPublic


class RegisterRequest(UserCreate):
    pass


class LoginMessage(SQLModel):
    message: str


__all__ = ["RegisterRequest", "UserPublic", "LoginMessage"]
