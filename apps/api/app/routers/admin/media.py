from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import io

from ...core.database import get_db
from ...models.media import MediaItem, MediaType, MediaCategory
from ...models.site_settings import SiteSettings
from ...models.user import User
from ...dependencies.auth import get_current_user
from ...services.media_processing import (
    validate_image,
    process_image,
    process_zip_images,
    ALLOWED_MIME_TYPES,
)
from ...schemas.common import ok
from ...core.logging import logger

router = APIRouter(prefix="/api/admin/media", tags=["Admin - Multimedia"])


class MediaItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    alt_text: Optional[str] = None
    category_id: Optional[int] = None
    source_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    credit_author: Optional[str] = None
    is_featured: Optional[bool] = None
    is_visible: Optional[bool] = None
    sort_order: Optional[int] = None


class VideoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    source_url: str
    thumbnail_url: Optional[str] = None
    category_id: Optional[int] = None
    media_type_slug: str = "video"
    credit_author: Optional[str] = None
    is_featured: bool = False


@router.get("")
async def list_media(
    type_slug: Optional[str] = None,
    type_id: Optional[int] = None,
    category_id: Optional[int] = None,
    page: int = 1,
    page_size: int = 30,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(MediaItem)
    if type_id:
        query = query.filter(MediaItem.media_type_id == type_id)
    elif type_slug:
        mt = db.query(MediaType).filter(MediaType.slug == type_slug).first()
        if mt:
            query = query.filter(MediaItem.media_type_id == mt.id)
    if category_id:
        query = query.filter(MediaItem.category_id == category_id)
    total = query.count()
    items = query.order_by(MediaItem.sort_order, MediaItem.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    return {
        "success": True,
        "data": {
            "items": [_to_dict(m) for m in items],
            "total": total,
            "page": page,
            "page_size": page_size,
        },
    }


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    media_type_slug: str = Form(default="image"),
    category_id: Optional[int] = Form(default=None),
    title: Optional[str] = Form(default=None),
    alt_text: Optional[str] = Form(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    settings_row = db.query(SiteSettings).first()
    max_mb = settings_row.max_image_size_mb if settings_row else 15

    content = await file.read()
    content_type = file.content_type or ""

    try:
        validate_image(file.filename or "upload", content_type, len(content), max_mb)
    except ValueError as e:
        raise HTTPException(400, str(e))

    mt = db.query(MediaType).filter(MediaType.slug == media_type_slug).first()
    if not mt:
        raise HTTPException(400, f"Tipo de media no encontrado: {media_type_slug}")

    category_slug = "misc"
    if category_id:
        cat = db.query(MediaCategory).filter(MediaCategory.id == category_id).first()
        if cat:
            category_slug = cat.slug

    result = process_image(content, file.filename or "upload", media_type_slug, category_slug)

    item = MediaItem(
        media_type_id=mt.id,
        category_id=category_id,
        title=title or file.filename,
        alt_text=alt_text,
        source_type="upload",
        **result,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    logger.info(f"Imagen subida: {item.file_url}")
    return ok(_to_dict(item), message="Imagen subida y procesada")


@router.post("/upload/multiple")
async def upload_multiple(
    files: List[UploadFile] = File(...),
    media_type_slug: str = Form(default="image"),
    category_id: Optional[int] = Form(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    settings_row = db.query(SiteSettings).first()
    max_mb = settings_row.max_image_size_mb if settings_row else 15
    mt = db.query(MediaType).filter(MediaType.slug == media_type_slug).first()
    if not mt:
        raise HTTPException(400, f"Tipo no encontrado: {media_type_slug}")

    category_slug = "misc"
    if category_id:
        cat = db.query(MediaCategory).filter(MediaCategory.id == category_id).first()
        if cat:
            category_slug = cat.slug

    created = []
    errors = []
    for f in files:
        content = await f.read()
        try:
            validate_image(f.filename or "upload", f.content_type or "", len(content), max_mb)
            result = process_image(content, f.filename or "upload", media_type_slug, category_slug)
            item = MediaItem(
                media_type_id=mt.id,
                category_id=category_id,
                title=f.filename,
                source_type="upload",
                **result,
            )
            db.add(item)
            db.flush()
            created.append(_to_dict(item))
        except Exception as e:
            errors.append(f"{f.filename}: {str(e)}")

    db.commit()
    return {
        "success": True,
        "data": created,
        "errors": errors,
        "message": f"{len(created)} archivo(s) subido(s)",
    }


@router.post("/import/zip")
async def import_zip(
    file: UploadFile = File(...),
    media_type_slug: str = Form(default="image"),
    category_id: Optional[int] = Form(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    settings_row = db.query(SiteSettings).first()
    max_mb = settings_row.max_zip_size_mb if settings_row else 500

    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(400, "Solo se aceptan archivos ZIP")

    content = await file.read()
    if len(content) > max_mb * 1024 * 1024:
        raise HTTPException(400, f"ZIP demasiado grande. Máximo: {max_mb} MB")

    mt = db.query(MediaType).filter(MediaType.slug == media_type_slug).first()
    if not mt:
        raise HTTPException(400, f"Tipo no encontrado: {media_type_slug}")

    category_slug = "misc"
    if category_id:
        cat = db.query(MediaCategory).filter(MediaCategory.id == category_id).first()
        if cat:
            category_slug = cat.slug

    results = process_zip_images(content, media_type_slug, category_slug)
    created = []
    for r in results:
        orig_name = r.pop("original_name", "archivo")
        item = MediaItem(
            media_type_id=mt.id,
            category_id=category_id,
            title=orig_name,
            source_type="upload",
            **r,
        )
        db.add(item)
        db.flush()
        created.append(_to_dict(item))

    db.commit()
    logger.info(f"ZIP importado: {len(created)} imágenes de {file.filename}")
    return ok(created, message=f"{len(created)} imágenes importadas del ZIP")


@router.post("/video")
async def create_video(
    body: VideoCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    mt = db.query(MediaType).filter(MediaType.slug == body.media_type_slug).first()
    if not mt:
        raise HTTPException(400, f"Tipo no encontrado: {body.media_type_slug}")
    item = MediaItem(
        media_type_id=mt.id,
        category_id=body.category_id,
        title=body.title,
        description=body.description,
        source_url=body.source_url,
        thumbnail_url=body.thumbnail_url,
        credit_author=body.credit_author,
        source_type="youtube",
        is_featured=body.is_featured,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return ok(_to_dict(item), message="Video creado")


@router.put("/{item_id}")
async def update_media(
    item_id: int,
    body: MediaItemUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    item = db.query(MediaItem).filter(MediaItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Elemento no encontrado")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return ok(_to_dict(item), message="Elemento actualizado")


@router.delete("/{item_id}")
async def delete_media(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    item = db.query(MediaItem).filter(MediaItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Elemento no encontrado")
    db.delete(item)
    db.commit()
    return ok(message="Elemento eliminado")


@router.get("/types")
async def list_types(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    types = db.query(MediaType).all()
    return ok([{"id": t.id, "name": t.name, "slug": t.slug} for t in types])


@router.get("/categories")
async def list_categories(
    type_slug: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(MediaCategory).filter(MediaCategory.is_active == True)
    if type_slug:
        mt = db.query(MediaType).filter(MediaType.slug == type_slug).first()
        if mt:
            query = query.filter(MediaCategory.media_type_id == mt.id)
    cats = query.order_by(MediaCategory.sort_order).all()
    return ok([{"id": c.id, "name": c.name, "slug": c.slug, "media_type_id": c.media_type_id} for c in cats])


def _to_dict(m: MediaItem) -> dict:
    return {
        "id": m.id,
        "media_type_id": m.media_type_id,
        "category_id": m.category_id,
        "title": m.title,
        "description": m.description,
        "file_url": m.file_url,
        "thumbnail_url": m.thumbnail_url,
        "source_url": m.source_url,
        "source_type": m.source_type,
        "alt_text": m.alt_text,
        "mime_type": m.mime_type,
        "size_bytes": m.size_bytes,
        "width": m.width,
        "height": m.height,
        "is_featured": m.is_featured,
        "is_visible": m.is_visible,
        "sort_order": m.sort_order,
        "credit_author": m.credit_author,
        "created_at": m.created_at.isoformat(),
    }
