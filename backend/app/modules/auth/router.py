from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.core.errors import DomainError
from app.core.security import create_access_token
from app.modules.auth.schemas import LoginMessage, RegisterRequest, UserPublic
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/auth", tags=["autenticación"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest):
    try:
        return UsuarioService().register(data)
    except DomainError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.post("/token", response_model=LoginMessage)
def login(response: Response, form: OAuth2PasswordRequestForm = Depends()):
    user = AuthService().authenticate(form.username, form.password)
    response.set_cookie("access_token", create_access_token(user.username), httponly=True, secure=False, samesite="lax", max_age=settings.access_token_expire_minutes * 60, path="/")
    return LoginMessage(message="Login exitoso")


@router.post("/logout", response_model=LoginMessage)
def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return LoginMessage(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(user: Usuario = Depends(get_current_active_user)):
    return UserPublic.model_validate(user)
