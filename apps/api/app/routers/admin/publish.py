from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from ...core.database import get_db
from ...models.user import User
from ...dependencies.auth import get_current_user
from ...schemas.common import ok
from ...core.logging import logger

router = APIRouter(prefix="/api/admin/publish", tags=["Admin - Publicar"])

# Timestamp de la última publicación (en memoria — suficiente para MVP)
_last_published: datetime | None = None


@router.post("")
async def publish(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    En modo Astro SSR el contenido es live al guardar.
    Este endpoint registra el timestamp y sirve como punto de extensión
    futuro (webhook, CDN invalidation, cache clear, etc.).
    """
    global _last_published
    _last_published = datetime.now(timezone.utc)
    logger.info(f"Publicación registrada por {current_user.email} a las {_last_published.isoformat()}")
    return ok(
        {"published_at": _last_published.isoformat()},
        message="Contenido publicado exitosamente",
    )


@router.get("/status")
async def publish_status(_: User = Depends(get_current_user)):
    return ok({
        "last_published_at": _last_published.isoformat() if _last_published else None,
    })
