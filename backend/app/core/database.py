from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args, pool_pre_ping=True)


def session_factory() -> Session:
    return Session(engine)


def create_all_tables() -> None:
    SQLModel.metadata.create_all(engine)
