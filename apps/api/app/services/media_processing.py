"""Procesamiento de imágenes: optimización y generación de thumbnails."""
import os
import io
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from PIL import Image

from ..core.config import get_settings
from ..core.logging import logger

settings = get_settings()

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

THUMBNAIL_SIZE = (400, 400)
WEB_MAX_WIDTH = 1920
WEBP_QUALITY = 85
THUMB_QUALITY = 80


def validate_image(filename: str, content_type: str, size_bytes: int, max_mb: int) -> None:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Extensión no permitida: {ext}")
    if content_type not in ALLOWED_MIME_TYPES:
        raise ValueError(f"Tipo MIME no permitido: {content_type}")
    max_bytes = max_mb * 1024 * 1024
    if size_bytes > max_bytes:
        raise ValueError(f"Archivo demasiado grande. Máximo: {max_mb} MB")


def build_filename(media_type_slug: str, category_slug: str, original_name: str) -> str:
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_id = uuid.uuid4().hex[:6]
    stem = Path(original_name).stem
    safe_stem = "".join(c if c.isalnum() or c == "-" else "-" for c in stem.lower())[:30]
    return f"{date_str}_{media_type_slug}_{category_slug}_{safe_stem}_{random_id}"


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def process_image(
    image_bytes: bytes,
    filename: str,
    media_type_slug: str,
    category_slug: str,
) -> dict:
    """
    Procesa una imagen: guarda original, genera versión web WebP y thumbnail WebP.
    Retorna un dict con file_url, thumbnail_url, width, height, size_bytes, mime_type.
    """
    base_name = build_filename(media_type_slug, category_slug, filename)
    media_root = settings.media_root
    media_public_url = settings.media_public_url

    # Carpetas
    originals_dir = os.path.join(media_root, "images", category_slug, "originals")
    web_dir = os.path.join(media_root, "images", category_slug)
    thumb_dir = os.path.join(media_root, "thumbnails", "images")

    for d in [originals_dir, web_dir, thumb_dir]:
        _ensure_dir(d)

    img = Image.open(io.BytesIO(image_bytes))
    original_width, original_height = img.size

    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # Versión web
    web_img = img.copy()
    if web_img.width > WEB_MAX_WIDTH:
        ratio = WEB_MAX_WIDTH / web_img.width
        web_img = web_img.resize(
            (WEB_MAX_WIDTH, int(web_img.height * ratio)), Image.LANCZOS
        )
    web_filename = f"{base_name}.webp"
    web_path = os.path.join(web_dir, web_filename)
    web_img.save(web_path, "WEBP", quality=WEBP_QUALITY, optimize=True)

    # Thumbnail cuadrado
    thumb_img = img.copy()
    thumb_img.thumbnail((THUMBNAIL_SIZE[0] * 2, THUMBNAIL_SIZE[1] * 2), Image.LANCZOS)
    # Recorte centrado
    w, h = thumb_img.size
    left = (w - min(w, h)) // 2
    top = (h - min(w, h)) // 2
    thumb_img = thumb_img.crop((left, top, left + min(w, h), top + min(w, h)))
    thumb_img = thumb_img.resize(THUMBNAIL_SIZE, Image.LANCZOS)
    thumb_filename = f"{base_name}_thumb.webp"
    thumb_path = os.path.join(thumb_dir, thumb_filename)
    thumb_img.save(thumb_path, "WEBP", quality=THUMB_QUALITY, optimize=True)

    # Original (conservar)
    ext = Path(filename).suffix.lower()
    orig_filename = f"{base_name}{ext}"
    orig_path = os.path.join(originals_dir, orig_filename)
    with open(orig_path, "wb") as f:
        f.write(image_bytes)

    file_url = f"{media_public_url}/images/{category_slug}/{web_filename}"
    thumbnail_url = f"{media_public_url}/thumbnails/images/{thumb_filename}"

    logger.info(f"Imagen procesada: {web_filename} ({original_width}x{original_height})")

    return {
        "file_url": file_url,
        "thumbnail_url": thumbnail_url,
        "width": original_width,
        "height": original_height,
        "size_bytes": len(image_bytes),
        "mime_type": "image/webp",
    }


def process_zip_images(
    zip_bytes: bytes,
    media_type_slug: str,
    category_slug: str,
) -> list[dict]:
    """
    Extrae imágenes de un ZIP y procesa cada una.
    Retorna lista de dicts con metadatos de cada imagen procesada.
    """
    import zipfile

    results = []
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        for name in zf.namelist():
            # Prevenir path traversal
            if name.startswith("/") or ".." in name:
                logger.warning(f"Nombre de archivo peligroso ignorado: {name}")
                continue
            ext = Path(name).suffix.lower()
            if ext not in ALLOWED_EXTENSIONS:
                continue
            try:
                data = zf.read(name)
                result = process_image(data, Path(name).name, media_type_slug, category_slug)
                result["original_name"] = Path(name).name
                results.append(result)
            except Exception as e:
                logger.error(f"Error procesando {name} del ZIP: {e}")

    return results
