from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
from pathlib import Path
import uuid
import os
import re

from ...core.database import get_db
from ...core.config import get_settings
from ...models.download import DownloadAsset, DownloadRequest
from ...models.site_settings import SiteSettings
from ...models.user import User
from ...dependencies.auth import get_current_user
from ...schemas.common import ok
from ...core.logging import logger

settings = get_settings()

# Extensiones permitidas en descargas (más amplio que imágenes)
ALLOWED_DOWNLOAD_EXTS = {
    ".pdf", ".png", ".jpg", ".jpeg", ".webp", ".svg",
    ".zip", ".rar", ".7z",
    ".mp3", ".wav", ".flac",
    ".mp4", ".mov",
    ".doc", ".docx", ".txt", ".rtf",
    ".eps", ".ai",
}

router = APIRouter(prefix="/api/admin", tags=["Admin - Descargas"])


# ─── Assets ──────────────────────────────────────────────────────────────────

class AssetCreate(BaseModel):
    title: str
    description: Optional[str] = None
    file_url: str
    thumbnail_url: Optional[str] = None
    access_type: str = "public"
    is_visible: bool = True
    send_via_email: bool = True
    # Días de vigencia del token cuando access_type=request_required.
    # Solo aplica en ese caso; para "public" se ignora.
    expires_in_days: Optional[int] = 7
    sort_order: int = 0


class AssetUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    access_type: Optional[str] = None
    is_visible: Optional[bool] = None
    send_via_email: Optional[bool] = None
    expires_in_days: Optional[int] = None
    sort_order: Optional[int] = None


@router.get("/download-assets")
async def list_assets(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    assets = db.query(DownloadAsset).order_by(DownloadAsset.sort_order).all()
    return ok([a.__dict__ for a in assets])


@router.post("/download-assets/upload")
async def upload_asset_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Sube un archivo para usarlo como recurso descargable.
    Devuelve { file_url } que luego se usa al crear/editar el DownloadAsset.
    No persiste el asset en DB — eso lo hace el endpoint POST /download-assets."""
    site = db.query(SiteSettings).first()
    max_mb = site.max_download_size_mb if site else 100

    original_name = file.filename or "archivo"
    ext = Path(original_name).suffix.lower()
    if ext not in ALLOWED_DOWNLOAD_EXTS:
        raise HTTPException(
            400,
            f"Extensión no permitida: {ext}. Permitidas: {sorted(ALLOWED_DOWNLOAD_EXTS)}",
        )

    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > max_mb:
        raise HTTPException(
            413,
            f"Archivo demasiado grande ({size_mb:.1f} MB). Máximo permitido: {max_mb} MB",
        )

    # Sanitizar nombre: solo alfanuméricos, guiones, puntos
    stem = Path(original_name).stem
    safe_stem = re.sub(r"[^A-Za-z0-9_-]+", "-", stem).strip("-").lower() or "archivo"
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    random_suffix = uuid.uuid4().hex[:6]
    final_name = f"{timestamp}_{safe_stem}_{random_suffix}{ext}"

    downloads_dir = os.path.join(settings.media_root, "downloads")
    os.makedirs(downloads_dir, exist_ok=True)
    dest_path = os.path.join(downloads_dir, final_name)
    with open(dest_path, "wb") as f:
        f.write(content)

    file_url = f"{settings.media_public_url}/downloads/{final_name}"
    logger.info(f"Asset descargable subido: {file_url} ({size_mb:.2f} MB)")
    return ok({"file_url": file_url, "filename": final_name, "size_bytes": len(content)})


@router.post("/download-assets")
async def create_asset(body: AssetCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    valid = {"public", "request_required", "private"}
    if body.access_type not in valid:
        raise HTTPException(400, "Tipo de acceso inválido")
    asset = DownloadAsset(**body.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return ok(asset.__dict__, message="Recurso descargable creado")


@router.put("/download-assets/{asset_id}")
async def update_asset(asset_id: int, body: AssetUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    asset = db.query(DownloadAsset).filter(DownloadAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "Recurso no encontrado")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(asset, field, value)
    db.commit()
    db.refresh(asset)
    return ok(asset.__dict__, message="Recurso actualizado")


@router.delete("/download-assets/{asset_id}")
async def delete_asset(asset_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    asset = db.query(DownloadAsset).filter(DownloadAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "Recurso no encontrado")
    db.delete(asset)
    db.commit()
    return ok(message="Recurso eliminado")


# ─── Solicitudes ─────────────────────────────────────────────────────────────

@router.get("/download-requests")
async def list_requests(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(DownloadRequest)
    if status:
        query = query.filter(DownloadRequest.status == status)
    requests = query.order_by(DownloadRequest.created_at.desc()).all()
    return ok([_req_to_dict(r) for r in requests])


class RequestAction(BaseModel):
    action: str  # approve | reject


@router.put("/download-requests/{request_id}")
async def action_request(
    request_id: int,
    body: RequestAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action_aliases = {
        "approve": "approve",
        "approved": "approve",
        "reject": "reject",
        "rejected": "reject",
    }
    action = action_aliases.get(body.action)
    if action is None:
        raise HTTPException(400, "Acción inválida. Usar 'approve' o 'reject'")

    dr = db.query(DownloadRequest).filter(DownloadRequest.id == request_id).first()
    if not dr:
        raise HTTPException(404, "Solicitud no encontrada")
    if dr.status != "pending":
        raise HTTPException(400, f"La solicitud ya está en estado: {dr.status}")

    now = datetime.now(timezone.utc)

    if action == "approve":
        token = str(uuid.uuid4())
        expires = now + timedelta(days=dr.asset.expires_in_days)
        dr.status = "approved"
        dr.approval_token = token
        dr.token_expires_at = expires
        dr.approved_at = now
        db.commit()

        try:
            from ...services.email import send_download_approved
            await send_download_approved(dr)
        except Exception as e:
            logger.error(f"Error enviando email de aprobación: {e}")

        logger.info(f"Solicitud #{request_id} aprobada por {current_user.email}")
        return ok({"token": token, "expires_at": expires.isoformat()}, message="Solicitud aprobada")

    else:
        dr.status = "rejected"
        dr.rejected_at = now
        db.commit()
        logger.info(f"Solicitud #{request_id} rechazada por {current_user.email}")
        return ok(message="Solicitud rechazada")


def _req_to_dict(r: DownloadRequest) -> dict:
    return {
        "id": r.id,
        "download_asset_id": r.download_asset_id,
        "name": r.name,
        "email": r.email,
        "organization": r.organization,
        "reason": r.reason,
        "message": r.message,
        "status": r.status,
        "approval_token": r.approval_token,
        "token_expires_at": r.token_expires_at.isoformat() if r.token_expires_at else None,
        "approved_at": r.approved_at.isoformat() if r.approved_at else None,
        "rejected_at": r.rejected_at.isoformat() if r.rejected_at else None,
        "created_at": r.created_at.isoformat(),
    }
