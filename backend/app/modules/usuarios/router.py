from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_role
from app.core.errors import DomainError
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


@router.get("", response_model=list[UserPublic])
def list_users(_: Usuario = Depends(require_role("admin")), service: UsuarioService = Depends(get_usuario_service)):
    return service.list_users()


def update_status(user_id: int, disabled: bool, actor: Usuario, service: UsuarioService):
    try:
        return service.set_disabled(user_id, disabled, actor.id)
    except DomainError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/{user_id}/activar", response_model=UserPublic)
def activate_user(user_id: int, actor: Usuario = Depends(require_role("admin")), service: UsuarioService = Depends(get_usuario_service)):
    return update_status(user_id, False, actor, service)


@router.post("/{user_id}/desactivar", response_model=UserPublic)
def disable_user(user_id: int, actor: Usuario = Depends(require_role("admin")), service: UsuarioService = Depends(get_usuario_service)):
    return update_status(user_id, True, actor, service)
