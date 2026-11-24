from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./foodstore.db"
    secret_key: str = "cambiar-esta-clave-por-una-de-al-menos-32-caracteres"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
