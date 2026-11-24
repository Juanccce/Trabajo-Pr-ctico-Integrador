from app.core.errors import Conflict, NotFound
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork | None = None) -> None:
        self.uow = uow or UsuarioUnitOfWork()

    def register(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) or uow.usuarios.get_by_email(str(data.email)):
                raise Conflict("El nombre de usuario o el email ya están registrados")
            user = Usuario(username=data.username, full_name=data.full_name, email=str(data.email), hashed_password=hash_password(data.password))
            uow.usuarios.add(user)
            return UserPublic.model_validate(user)

    def list_users(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(user) for user in uow.usuarios.get_all(skip=0, limit=500)]

    def set_disabled(self, user_id: int, disabled: bool, actor_id: int) -> UserPublic:
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if user is None:
                raise NotFound("Usuario inexistente")
            if disabled and user.id == actor_id:
                raise ValueError("No podés desactivar tu propia cuenta")
            user.disabled = disabled
            uow.session.add(user)
            uow.session.flush()
            return UserPublic.model_validate(user)
