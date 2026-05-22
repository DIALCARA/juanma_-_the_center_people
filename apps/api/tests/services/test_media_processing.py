"""Tests del servicio de procesamiento de imágenes."""
import io
import pytest
from PIL import Image

from app.services.media_processing import validate_image, process_image, process_zip_images


def make_jpeg_bytes(width: int = 100, height: int = 100) -> bytes:
    img = Image.new("RGB", (width, height), color=(100, 150, 200))
    buf = io.BytesIO()
    img.save(buf, "JPEG")
    return buf.getvalue()


def make_zip_with_images() -> bytes:
    import zipfile
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("foto1.jpg", make_jpeg_bytes())
        zf.writestr("foto2.jpg", make_jpeg_bytes(200, 300))
        zf.writestr("readme.txt", "no soy imagen")
    return buf.getvalue()


def test_validate_imagen_valida():
    content = make_jpeg_bytes()
    validate_image("foto.jpg", "image/jpeg", len(content), 15)


def test_validate_extension_invalida():
    with pytest.raises(ValueError, match="Extensión no permitida"):
        validate_image("archivo.exe", "image/jpeg", 100, 15)


def test_validate_mime_invalido():
    with pytest.raises(ValueError, match="Tipo MIME no permitido"):
        validate_image("foto.jpg", "application/pdf", 100, 15)


def test_validate_demasiado_grande():
    with pytest.raises(ValueError, match="demasiado grande"):
        validate_image("foto.jpg", "image/jpeg", 20 * 1024 * 1024, 15)


def test_process_image_genera_archivos(tmp_path, monkeypatch):
    monkeypatch.setenv("MEDIA_ROOT", str(tmp_path))
    monkeypatch.setenv("MEDIA_PUBLIC_URL", "http://test")

    from app.core.config import get_settings
    settings = get_settings.cache_clear() or get_settings()

    from app.services import media_processing
    media_processing.settings = type("S", (), {
        "media_root": str(tmp_path),
        "media_public_url": "http://test",
    })()

    content = make_jpeg_bytes(800, 600)
    result = media_processing.process_image(content, "foto_test.jpg", "image", "banda")

    assert "file_url" in result
    assert "thumbnail_url" in result
    assert result["width"] == 800
    assert result["height"] == 600


def test_process_zip_solo_imagenes(tmp_path):
    from app.services import media_processing
    media_processing.settings = type("S", (), {
        "media_root": str(tmp_path),
        "media_public_url": "http://test",
    })()

    zip_bytes = make_zip_with_images()
    results = media_processing.process_zip_images(zip_bytes, "image", "banda")

    assert len(results) == 2  # solo las 2 imágenes, no el .txt


def test_process_zip_path_traversal(tmp_path):
    import zipfile
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("../../../etc/passwd.jpg", make_jpeg_bytes())
    buf.seek(0)

    from app.services import media_processing
    media_processing.settings = type("S", (), {
        "media_root": str(tmp_path),
        "media_public_url": "http://test",
    })()

    results = media_processing.process_zip_images(buf.read(), "image", "misc")
    assert len(results) == 0  # rechaza el archivo peligroso
