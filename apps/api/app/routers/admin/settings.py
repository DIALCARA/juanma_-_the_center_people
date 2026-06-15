from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from ...core.database import get_db
from ...models.site_settings import SiteSettings
from ...models.user import User
from ...dependencies.auth import get_current_user
from ...schemas.common import ok

router = APIRouter(prefix="/api/admin/site-settings", tags=["Admin - Configuración"])


class SiteSettingsUpdate(BaseModel):
    band_name: Optional[str] = None
    tagline: Optional[str] = None
    tagline_custom: Optional[str] = None
    subgenre: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    # Imágenes del hero (IDs de MediaItem; null para quitar)
    hero_image_id: Optional[int] = None
    cover_image_id: Optional[int] = None
    spotify_url: Optional[str] = None
    youtube_url: Optional[str] = None
    instagram_url: Optional[str] = None
    tiktok_url: Optional[str] = None
    facebook_url: Optional[str] = None
    contact_email: Optional[str] = None
    booking_email: Optional[str] = None
    press_email: Optional[str] = None
    max_image_size_mb: Optional[int] = None
    max_video_size_mb: Optional[int] = None
    max_zip_size_mb: Optional[int] = None
    max_download_size_mb: Optional[int] = None


@router.get("")
async def get_settings(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    s = db.query(SiteSettings).first()
    if not s:
        raise HTTPException(404, "Configuración no encontrada")
    return ok(s.__dict__)


@router.put("")
async def update_settings(
    body: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    s = db.query(SiteSettings).first()
    if not s:
        s = SiteSettings()
        db.add(s)

    # exclude_unset (no exclude_none) para permitir setear campos a null
    # explícitamente (ej. hero_image_id=null para quitar la imagen del hero).
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(s, field, value)

    db.commit()
    db.refresh(s)
    return ok(s.__dict__, message="Configuración actualizada")
