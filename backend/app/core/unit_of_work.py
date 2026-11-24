from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    def __init__(self) -> None:
        self.session: Session | None = None

    def __enter__(self):
        self.session = session_factory()
        self._build_repositories()
        return self

    def _build_repositories(self) -> None:
        pass

    def __exit__(self, exc_type, exc_value, traceback) -> bool:
        if self.session is None:
            return False
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
        return False
