"""Endpoints públicos del sitio (sin autenticación)."""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from slowapi import Limiter
from slowapi.util import get_remote_address
from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid

from ..core.database import get_db
from ..core.config import get_settings
from ..core.logging import logger
from ..models.site_settings import SiteSettings
from ..models.section import Section
from ..models.band import BandBio, BandMember, QuickFact, SocialLink
from ..models.music import MusicRelease
from ..models.media import MediaItem, MediaType, MediaCategory
from ..models.event import Event
from ..models.press import PressQuote
from ..models.download import DownloadAsset, DownloadRequest
from ..models.contact import ContactMessage
from ..schemas.common import ok, err, PaginatedResponse

router = APIRouter(prefix="/api/public", tags=["Público"])
limiter = Limiter(key_func=get_remote_address)
settings = get_settings()


@router.get("/site-settings")
async def get_site_settings(db: Session = Depends(get_db)):
    s = db.query(SiteSettings).first()
    if not s:
        raise HTTPException(404, "Configuración no encontrada")
    return ok({
        "band_name": s.band_name,
        "tagline": s.tagline_custom or s.tagline,
        "subgenre": s.subgenre,
        "country": s.country,
        "city": s.city,
        "spotify_url": s.spotify_url,
        "youtube_url": s.youtube_url,
        "instagram_url": s.instagram_url,
        "tiktok_url": s.tiktok_url,
        "facebook_url": s.facebook_url,
        "contact_email": s.contact_email,
        "booking_email": s.booking_email,
        "press_email": s.press_email,
    })


@router.get("/sections")
async def get_sections(db: Session = Depends(get_db)):
    """Devuelve TODAS las secciones (incluso deshabilitadas) con sus flags.
    El cliente decide qué hacer:
    - Header: filtra por is_enabled para el menú
    - Páginas individuales: muestran "no disponible" si su is_enabled=false
    - Home: filtra por show_in_home además
    """
    sections = (
        db.query(Section)
        .order_by(Section.sort_order)
        .all()
    )
    return ok([{
        "id": s.id,
        "slug": s.slug,
        "title": s.title,
        "description": s.description,
        "is_enabled": s.is_enabled,
        "show_in_home": s.show_in_home,
        "show_empty_state": s.show_empty_state,
        "empty_state_message": s.empty_state_message,
        "sort_order": s.sort_order,
    } for s in sections])


@router.get("/home")
async def get_home(db: Session = Depends(get_db)):
    site = db.query(SiteSettings).first()
    bio = db.query(BandBio).first()
    featured_release = (
        db.query(MusicRelease)
        .filter(MusicRelease.is_featured == True, MusicRelease.is_visible == True)
        .first()
    )
    featured_media = (
        db.query(MediaItem)
        .filter(MediaItem.is_featured == True, MediaItem.is_visible == True)
        .limit(6)
        .all()
    )
    upcoming_events = (
        db.query(Event)
        .filter(Event.is_visible == True, Event.event_date >= datetime.now(timezone.utc).date())
        .order_by(Event.event_date)
        .limit(3)
        .all()
    )
    # Mapa {slug: flags} para que la home sepa qué bloques mostrar
    sections_map = {
        s.slug: {
            "is_enabled": s.is_enabled,
            "show_in_home": s.show_in_home,
            "empty_state_message": s.empty_state_message,
        }
        for s in db.query(Section).all()
    }
    return ok({
        "site": {
            "band_name": site.band_name if site else "Juanma & The Center People",
            "tagline": (site.tagline_custom or site.tagline) if site else "",
            "spotify_url": site.spotify_url if site else None,
            "instagram_url": site.instagram_url if site else None,
        },
        "bio_short": bio.bio_short if bio else None,
        "featured_release": _release_to_dict(featured_release) if featured_release else None,
        "featured_media": [_media_to_dict(m) for m in featured_media],
        "upcoming_events": [_event_to_dict(e) for e in upcoming_events],
        "sections": sections_map,
    })


@router.get("/band")
async def get_band(db: Session = Depends(get_db)):
    bio = db.query(BandBio).first()
    members = (
        db.query(BandMember)
        .filter(BandMember.is_visible == True)
        .order_by(BandMember.sort_order)
        .all()
    )
    facts = (
        db.query(QuickFact)
        .filter(QuickFact.is_visible == True)
        .order_by(QuickFact.sort_order)
        .all()
    )

    # Resolver URL de foto de cada integrante
    member_dicts = []
    for m in members:
        photo_url = None
        if m.photo_media_id:
            media = db.query(MediaItem).filter(MediaItem.id == m.photo_media_id).first()
            if media:
                photo_url = media.thumbnail_url or media.file_url
        member_dicts.append({
            "id": m.id,
            "name": m.name,
            "role": m.role,
            "instrument": m.instrument,
            "bio": m.bio,
            "bio_long": m.bio_long,
            "photo_url": photo_url,
        })

    return ok({
        "bio": {
            "bio_short": bio.bio_short if bio else None,
            "bio_long": bio.bio_long if bio else None,
            "history": bio.history if bio else None,
        },
        "members": member_dicts,
        "quick_facts": [{"label": f.label, "value": f.value} for f in facts],
    })


@router.get("/music")
async def get_music(db: Session = Depends(get_db)):
    site = db.query(SiteSettings).first()
    releases = (
        db.query(MusicRelease)
        .filter(MusicRelease.is_visible == True)
        .order_by(MusicRelease.is_featured.desc(), MusicRelease.release_date.desc())
        .all()
    )
    return ok({
        "spotify_url": site.spotify_url if site else None,
        "releases": [_release_to_dict(r) for r in releases],
    })


@router.get("/media-categories")
async def get_media_categories(
    type: str,
    db: Session = Depends(get_db),
):
    """Devuelve las categorías de un tipo que tienen al menos 1 archivo visible.
    Útil para que el frontend renderice solo categorías con contenido (sin "tabs vacías")."""
    mt = db.query(MediaType).filter(MediaType.slug == type).first()
    if not mt:
        return ok([])

    # Subquery: ids de categorías con al menos 1 MediaItem visible de este tipo
    from sqlalchemy import func, distinct
    cats_with_content = (
        db.query(distinct(MediaItem.category_id))
        .filter(MediaItem.media_type_id == mt.id, MediaItem.is_visible == True)
        .all()
    )
    cat_ids = {c[0] for c in cats_with_content if c[0] is not None}

    cats = (
        db.query(MediaCategory)
        .filter(
            MediaCategory.media_type_id == mt.id,
            MediaCategory.is_active == True,
            MediaCategory.id.in_(cat_ids) if cat_ids else False,
        )
        .order_by(MediaCategory.sort_order)
        .all()
    )

    # Count por categoría (para mostrar al lado del nombre si se quiere)
    counts = dict(
        db.query(MediaItem.category_id, func.count(MediaItem.id))
        .filter(MediaItem.media_type_id == mt.id, MediaItem.is_visible == True)
        .group_by(MediaItem.category_id)
        .all()
    )

    return ok([
        {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "count": counts.get(c.id, 0),
        }
        for c in cats
    ])


@router.get("/media")
async def get_media(
    type: Optional[str] = None,
    category: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(MediaItem).filter(MediaItem.is_visible == True)
    if type:
        mt = db.query(MediaType).filter(MediaType.slug == type).first()
        if mt:
            query = query.filter(MediaItem.media_type_id == mt.id)
    if category:
        mc = db.query(MediaCategory).filter(MediaCategory.slug == category).first()
        if mc:
            query = query.filter(MediaItem.category_id == mc.id)

    total = query.count()
    items = query.order_by(MediaItem.sort_order, MediaItem.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    return {
        "success": True,
        "data": {
            "items": [_media_to_dict(m) for m in items],
            "total": total,
            "page": page,
            "page_size": page_size,
        },
    }


@router.get("/events")
async def get_events(db: Session = Depends(get_db)):
    section = db.query(Section).filter(Section.slug == "fechas").first()
    upcoming = (
        db.query(Event)
        .filter(Event.is_visible == True, Event.event_date >= datetime.now(timezone.utc).date())
        .order_by(Event.event_date)
        .all()
    )
    return ok({
        "events": [_event_to_dict(e) for e in upcoming],
        "empty_state_message": section.empty_state_message if section else None,
        "show_empty_state": section.show_empty_state if section else True,
    })


@router.get("/press-epk")
async def get_press_epk(db: Session = Depends(get_db)):
    bio = db.query(BandBio).first()
    facts = db.query(QuickFact).filter(QuickFact.is_visible == True).order_by(QuickFact.sort_order).all()
    quotes = db.query(PressQuote).filter(PressQuote.is_visible == True).order_by(PressQuote.sort_order).all()
    downloads = (
        db.query(DownloadAsset)
        .filter(DownloadAsset.is_visible == True, DownloadAsset.access_type != "private")
        .order_by(DownloadAsset.sort_order)
        .all()
    )
    return ok({
        "bio": {
            "bio_short": bio.bio_short if bio else None,
            "bio_long": bio.bio_long if bio else None,
        },
        "quick_facts": [{"label": f.label, "value": f.value} for f in facts],
        "press_quotes": [{
            "id": q.id,
            "quote": q.quote,
            "author": q.author,
            "media_name": q.media_name,
            "url": q.url,
        } for q in quotes],
        "downloads": [{
            "id": d.id,
            "title": d.title,
            "description": d.description,
            "thumbnail_url": d.thumbnail_url,
            "access_type": d.access_type,
        } for d in downloads],
    })


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    contact_type: str
    message: str


@router.post("/contact")
@limiter.limit("3/minute")
async def submit_contact(
    request: Request,
    body: ContactRequest,
    db: Session = Depends(get_db),
):
    valid_types = {"booking", "press", "collaboration", "fan", "other"}
    if body.contact_type not in valid_types:
        raise HTTPException(400, "Tipo de contacto inválido")

    msg = ContactMessage(
        name=body.name,
        email=body.email,
        contact_type=body.contact_type,
        message=body.message,
    )
    db.add(msg)
    db.commit()

    # Notificación por email (best effort)
    try:
        from ..services.email import send_contact_notification
        await send_contact_notification(msg)
    except Exception as e:
        logger.error(f"Error enviando notificación de contacto: {e}")

    logger.info(f"Mensaje de contacto recibido de: {body.email}")
    return ok(message="Mensaje recibido. Te contactaremos pronto.")


class DownloadRequestBody(BaseModel):
    download_asset_id: int
    name: str
    email: EmailStr
    organization: Optional[str] = None
    reason: str
    message: Optional[str] = None


@router.post("/download-requests")
@limiter.limit("5/minute")
async def request_download(
    request: Request,
    body: DownloadRequestBody,
    db: Session = Depends(get_db),
):
    asset = db.query(DownloadAsset).filter(
        DownloadAsset.id == body.download_asset_id,
        DownloadAsset.is_visible == True,
        DownloadAsset.access_type == "request_required",
    ).first()
    if not asset:
        raise HTTPException(404, "Recurso no encontrado o no disponible para solicitud")

    dr = DownloadRequest(
        download_asset_id=asset.id,
        name=body.name,
        email=body.email,
        organization=body.organization,
        reason=body.reason,
        message=body.message,
    )
    db.add(dr)
    db.commit()
    logger.info(f"Solicitud de descarga recibida: {body.email} → asset #{asset.id}")
    return ok(message="Solicitud enviada. Te notificaremos cuando sea aprobada.")


@router.get("/downloads/{token}")
async def download_by_token(token: str, db: Session = Depends(get_db)):
    dr = db.query(DownloadRequest).filter(
        DownloadRequest.approval_token == token,
        DownloadRequest.status == "approved",
    ).first()
    if not dr:
        raise HTTPException(404, "Enlace de descarga no encontrado")
    if dr.token_expires_at and dr.token_expires_at < datetime.now(timezone.utc):
        dr.status = "expired"
        db.commit()
        raise HTTPException(410, "El enlace de descarga ha expirado")

    dr.downloaded_at = datetime.now(timezone.utc)
    db.commit()
    logger.info(f"Descarga por token: solicitud #{dr.id}")

    asset = dr.asset
    return ok({
        "title": asset.title,
        "file_url": asset.file_url,
    })


# ─── helpers privados ────────────────────────────────────────────────────────

def _release_to_dict(r: MusicRelease) -> dict:
    return {
        "id": r.id,
        "title": r.title,
        "description": r.description,
        "release_date": r.release_date.isoformat() if r.release_date else None,
        "spotify_url": r.spotify_url,
        "youtube_url": r.youtube_url,
        "cover_media_id": r.cover_media_id,
        "is_featured": r.is_featured,
    }


def _media_to_dict(m: MediaItem) -> dict:
    return {
        "id": m.id,
        "title": m.title,
        "description": m.description,
        "file_url": m.file_url,
        "thumbnail_url": m.thumbnail_url,
        "source_url": m.source_url,
        "source_type": m.source_type,
        "alt_text": m.alt_text,
        "is_featured": m.is_featured,
        "width": m.width,
        "height": m.height,
        # category_name viene como atributo solo si la relación está cargada.
        # Usamos el atributo lazy de SQLAlchemy: m.category.name si existe.
        "category_name": m.category.name if m.category else None,
    }


def _event_to_dict(e: Event) -> dict:
    return {
        "id": e.id,
        "title": e.title,
        "description": e.description,
        "event_date": e.event_date.isoformat(),
        "venue": e.venue,
        "city": e.city,
        "country": e.country,
        "ticket_url": e.ticket_url,
    }
