from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.core.database import engine
from app.core.security import verify_password
from app.modules.usuarios.models import Usuario


class AuthService:
    def authenticate(self, username: str, password: str) -> Usuario:
        with Session(engine) as session:
            user = session.exec(select(Usuario).where(Usuario.username == username)).first()
            if not user or not verify_password(password, user.hashed_password):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario o contraseña incorrectos")
            if user.disabled:
                raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
            return user
