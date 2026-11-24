from collections.abc import Callable

from fastapi import Cookie, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import engine
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_current_user(access_token: str | None = Cookie(default=None)) -> Usuario:
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Falta iniciar sesión")
    username = decode_access_token(access_token)
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="La sesión venció o no es válida")
    with Session(engine) as session:
        user = session.exec(select(Usuario).where(Usuario.username == username)).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario inexistente")
        return user


def get_current_active_user(user: Usuario = Depends(get_current_user)) -> Usuario:
    if user.disabled:
        raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
    return user


def require_role(*roles: str) -> Callable:
    def role_dependency(user: Usuario = Depends(get_current_active_user)) -> Usuario:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="No tenés permiso para realizar esta acción")
        return user
    return role_dependency
