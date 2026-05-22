from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date

from ...core.database import get_db
from ...models.music import MusicRelease
from ...models.user import User
from ...dependencies.auth import get_current_user
from ...schemas.common import ok

router = APIRouter(prefix="/api/admin/music", tags=["Admin - Música"])


class ReleaseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    release_date: Optional[date] = None
    spotify_url: Optional[str] = None
    youtube_url: Optional[str] = None
    cover_media_id: Optional[int] = None
    is_featured: bool = False
    sort_order: int = 0


class ReleaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    release_date: Optional[date] = None
    spotify_url: Optional[str] = None
    youtube_url: Optional[str] = None
    cover_media_id: Optional[int] = None
    is_featured: Optional[bool] = None
    is_visible: Optional[bool] = None
    sort_order: Optional[int] = None


@router.get("")
async def list_releases(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    releases = db.query(MusicRelease).order_by(MusicRelease.sort_order, MusicRelease.release_date.desc()).all()
    return ok([_to_dict(r) for r in releases])


@router.post("")
async def create_release(body: ReleaseCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    release = MusicRelease(**body.model_dump())
    db.add(release)
    db.commit()
    db.refresh(release)
    return ok(_to_dict(release), message="Lanzamiento creado")


@router.put("/{release_id}")
async def update_release(release_id: int, body: ReleaseUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    release = db.query(MusicRelease).filter(MusicRelease.id == release_id).first()
    if not release:
        raise HTTPException(404, "Lanzamiento no encontrado")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(release, field, value)
    db.commit()
    db.refresh(release)
    return ok(_to_dict(release), message="Lanzamiento actualizado")


@router.delete("/{release_id}")
async def delete_release(release_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    release = db.query(MusicRelease).filter(MusicRelease.id == release_id).first()
    if not release:
        raise HTTPException(404, "Lanzamiento no encontrado")
    db.delete(release)
    db.commit()
    return ok(message="Lanzamiento eliminado")


def _to_dict(r: MusicRelease) -> dict:
    return {
        "id": r.id,
        "title": r.title,
        "description": r.description,
        "release_date": r.release_date.isoformat() if r.release_date else None,
        "spotify_url": r.spotify_url,
        "youtube_url": r.youtube_url,
        "cover_media_id": r.cover_media_id,
        "is_featured": r.is_featured,
        "is_visible": r.is_visible,
        "sort_order": r.sort_order,
    }
