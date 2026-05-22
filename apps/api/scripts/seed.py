"""
Script de datos iniciales para Juanma & The Center People.
Ejecutar una sola vez después de las migraciones.
"""
import sys
import os

# Forzar UTF-8 en stdout/stderr (Windows usa cp1252 por defecto y rompe con → y otros chars).
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine
from app.core.database import Base
from app.core.security import hash_password
from app.core.config import get_settings
import app.models  # noqa: F401 — registra todos los modelos

settings = get_settings()


def seed_all() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _seed_user(db)
        _seed_site_settings(db)
        _seed_sections(db)
        _seed_media_types(db)
        _seed_media_categories(db)
        _seed_band_bio(db)
        _seed_quick_facts(db)
        db.commit()
        print("[OK] Seed completado exitosamente.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error en seed: {e}")
        raise
    finally:
        db.close()


def _seed_user(db) -> None:
    from app.models.user import User
    if db.query(User).first():
        print("  → Usuarios ya existen, omitiendo.")
        return
    user = User(
        email=settings.initial_admin_email,
        password_hash=hash_password(settings.initial_admin_password),
        name="Administrador",
        role="admin_editor",
    )
    db.add(user)
    print(f"  → Usuario admin creado: {settings.initial_admin_email}")


def _seed_site_settings(db) -> None:
    from app.models.site_settings import SiteSettings
    if db.query(SiteSettings).first():
        print("  → SiteSettings ya existe, omitiendo.")
        return
    db.add(SiteSettings(
        band_name="Juanma & The Center People",
        tagline="Rock alternativo peruano entre la nostalgia, la calle y el ruido interior.",
        subgenre="Rock alternativo peruano",
        country="Perú",
        city="Lima",
        spotify_url=(
            "https://open.spotify.com/intl-es/artist/"
            "2lnewal0FLnYLAnziEcIgI?si=B_GwlY5-QPS2YN4Zhd1LbQ"
        ),
    ))
    print("  → SiteSettings creado.")


def _seed_sections(db) -> None:
    from app.models.section import Section
    if db.query(Section).first():
        print("  → Secciones ya existen, omitiendo.")
        return
    sections = [
        Section(slug="inicio", title="Inicio", sort_order=1, show_in_home=True,
                empty_state_message="Bienvenido al sitio oficial de Juanma & The Center People."),
        Section(slug="banda", title="Banda", sort_order=2, show_in_home=True,
                empty_state_message="Información de la banda próximamente."),
        Section(slug="musica", title="Música", sort_order=3, show_in_home=True,
                empty_state_message="Próximamente nueva música."),
        Section(slug="fotos", title="Fotos", sort_order=4, show_in_home=True,
                empty_state_message="Galería de fotos próximamente."),
        Section(slug="videos", title="Videos", sort_order=5, show_in_home=True,
                empty_state_message="Videos próximamente."),
        Section(slug="reels", title="Reels", sort_order=6, show_in_home=False,
                empty_state_message="Reels próximamente."),
        Section(slug="prensa-epk", title="Prensa / EPK", sort_order=7, show_in_home=True,
                empty_state_message="Material de prensa disponible próximamente."),
        Section(slug="fechas", title="Fechas", sort_order=8, show_in_home=True,
                show_empty_state=True,
                empty_state_message="No hay próximas fechas anunciadas por ahora."),
        Section(slug="contacto", title="Contacto", sort_order=9, show_in_home=True,
                empty_state_message=""),
    ]
    db.add_all(sections)
    print(f"  → {len(sections)} secciones creadas.")


def _seed_media_types(db) -> None:
    from app.models.media import MediaType
    if db.query(MediaType).first():
        print("  → Tipos de media ya existen, omitiendo.")
        return
    # Tipos = formato técnico del archivo. Categorías = propósito/contexto.
    # "Flyer", "Portada/Artwork" y "Descargable" son CATEGORÍAS dentro de Imagen,
    # no tipos. Los descargables tienen su propia tabla (download_assets).
    types = [
        MediaType(name="Imagen", slug="image"),
        MediaType(name="Video", slug="video"),
        MediaType(name="Reel", slug="reel"),
    ]
    db.add_all(types)
    print(f"  → {len(types)} tipos de media creados.")


def _seed_media_categories(db) -> None:
    from app.models.media import MediaType, MediaCategory
    if db.query(MediaCategory).first():
        print("  → Categorías de media ya existen, omitiendo.")
        return

    image_type = db.query(MediaType).filter_by(slug="image").first()
    video_type = db.query(MediaType).filter_by(slug="video").first()
    reel_type = db.query(MediaType).filter_by(slug="reel").first()

    if not all([image_type, video_type, reel_type]):
        print("  [ERROR] Tipos de media no encontrados. Ejecutar seed de tipos primero.")
        return

    categories = [
        # Fotos (incluye Flyers y Portadas como categorías de propósito)
        MediaCategory(media_type_id=image_type.id, name="Banda", slug="banda", sort_order=1),
        MediaCategory(media_type_id=image_type.id, name="En vivo", slug="en-vivo", sort_order=2),
        MediaCategory(media_type_id=image_type.id, name="Backstage", slug="backstage", sort_order=3),
        MediaCategory(media_type_id=image_type.id, name="Sesiones / Prensa", slug="prensa", sort_order=4),
        MediaCategory(media_type_id=image_type.id, name="Flyers", slug="flyers", sort_order=5),
        MediaCategory(media_type_id=image_type.id, name="Portadas / Artwork", slug="portadas", sort_order=6),
        # Videos
        MediaCategory(media_type_id=video_type.id, name="Videoclips oficiales", slug="videoclips", sort_order=1),
        MediaCategory(media_type_id=video_type.id, name="Live sessions", slug="live-sessions", sort_order=2),
        MediaCategory(media_type_id=video_type.id, name="Entrevistas", slug="entrevistas", sort_order=3),
        MediaCategory(media_type_id=video_type.id, name="Ensayos", slug="ensayos", sort_order=4),
        MediaCategory(media_type_id=video_type.id, name="Teasers", slug="teasers", sort_order=5),
        # Reels
        MediaCategory(media_type_id=reel_type.id, name="Promocionales", slug="promocionales", sort_order=1),
        MediaCategory(media_type_id=reel_type.id, name="En vivo", slug="en-vivo-reels", sort_order=2),
        MediaCategory(media_type_id=reel_type.id, name="Backstage", slug="backstage-reels", sort_order=3),
        MediaCategory(media_type_id=reel_type.id, name="Lanzamientos", slug="lanzamientos", sort_order=4),
    ]
    db.add_all(categories)
    print(f"  → {len(categories)} categorías de media creadas.")


def _seed_band_bio(db) -> None:
    from app.models.band import BandBio
    if db.query(BandBio).first():
        print("  → BandBio ya existe, omitiendo.")
        return
    db.add(BandBio(
        bio_short=(
            "Juanma & The Center People es una banda de rock alternativo peruana "
            "radicada en Lima, con una propuesta melódica, urbana y emocional."
        ),
        bio_long="",
        history="",
    ))
    print("  → BandBio creada.")


def _seed_quick_facts(db) -> None:
    from app.models.band import QuickFact
    if db.query(QuickFact).first():
        print("  → QuickFacts ya existen, omitiendo.")
        return
    facts = [
        QuickFact(label="Nombre", value="Juanma & The Center People", sort_order=1),
        QuickFact(label="País", value="Perú", sort_order=2),
        QuickFact(label="Ciudad base", value="Lima", sort_order=3),
        QuickFact(label="Género", value="Rock alternativo peruano", sort_order=4),
        QuickFact(label="Idioma principal", value="Español", sort_order=5),
        QuickFact(label="Estado", value="Banda activa", sort_order=6),
    ]
    db.add_all(facts)
    print(f"  → {len(facts)} QuickFacts creados.")


if __name__ == "__main__":
    seed_all()
