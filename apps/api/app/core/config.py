from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl
from typing import List
from functools import lru_cache
from pathlib import Path


# Busca el .env subiendo directorios desde este archivo hasta encontrarlo.
# Permite correr tanto desde apps/api/ como desde la raíz del proyecto.
def _find_env_file() -> str:
    current = Path(__file__).resolve().parent
    for _ in range(6):
        candidate = current / ".env"
        if candidate.is_file():
            return str(candidate)
        current = current.parent
    return ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_find_env_file(),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # General
    app_env: str = "development"
    public_site_url: str = "http://localhost:3000"
    admin_site_url: str = "http://localhost:3001"
    api_base_url: str = "http://localhost:8000"

    # Base de datos
    database_url: str = "sqlite:///./data/app.db"

    # Storage
    media_root: str = "./storage/media"
    media_public_url: str = "http://localhost:8000/media"

    # Auth JWT
    jwt_secret: str = "dev_secret_inseguro_cambiar_en_produccion"
    jwt_expire_minutes: int = 1440  # 24 horas
    jwt_algorithm: str = "HS256"

    # Email SMTP (Zoho Mail u otro proveedor SMTP)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_from_name: str = "Juanma & The Center People"
    smtp_use_tls: bool = True

    # Cuentas SMTP por rol. Todas usan SMTP_HOST/SMTP_PORT/SMTP_USE_TLS.
    email_contact: str = ""
    email_contact_password: str = ""
    email_booking: str = ""
    email_booking_password: str = ""
    email_press: str = ""
    email_press_password: str = ""
    email_admin: str = ""
    email_admin_password: str = ""
    email_noreply: str = ""
    email_noreply_password: str = ""

    # Compatibilidad con la configuración SMTP anterior.
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    admin_notification_email: str = ""

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    # Admin inicial
    initial_admin_email: str = "admin@local.dev"
    initial_admin_password: str = "admin123"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
