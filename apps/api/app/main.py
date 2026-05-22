from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

from .core.config import get_settings
from .core.logging import setup_logging, logger
from .core.database import engine
from . import models  # noqa: F401 — asegura que los modelos estén registrados

# Routers
from .routers.auth import router as auth_router
from .routers.public import router as public_router
from .routers.admin.settings import router as settings_router
from .routers.admin.sections import router as sections_router
from .routers.admin.band import router as band_router
from .routers.admin.music import router as music_router
from .routers.admin.events import router as events_router
from .routers.admin.press import router as press_router
from .routers.admin.media import router as media_router
from .routers.admin.downloads import router as downloads_router
from .routers.admin.contacts import router as contacts_router
from .routers.admin.rider import router as rider_router
from .routers.admin.publish import router as publish_router

setup_logging()
settings = get_settings()

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Juanma & The Center People — API",
    description="Backend para el sitio oficial, EPK y CMS",
    version="0.1.0",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos de media estáticamente
media_root = settings.media_root
if os.path.exists(media_root):
    app.mount("/media", StaticFiles(directory=media_root), name="media")

# Registrar routers
for router in [
    auth_router,
    public_router,
    settings_router,
    sections_router,
    band_router,
    music_router,
    events_router,
    press_router,
    media_router,
    downloads_router,
    contacts_router,
    rider_router,
    publish_router,
]:
    app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "juanma-epk-api"}


@app.on_event("startup")
async def startup():
    logger.info(f"API iniciada en modo: {settings.app_env}")
    os.makedirs(media_root, exist_ok=True)
