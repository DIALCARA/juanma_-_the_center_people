from sqlalchemy import String, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from ..core.database import Base


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    band_name: Mapped[str] = mapped_column(String(200), default="Juanma & The Center People")
    tagline: Mapped[str] = mapped_column(
        Text,
        default="Rock alternativo peruano entre la nostalgia, la calle y el ruido interior.",
    )
    tagline_custom: Mapped[str | None] = mapped_column(Text, nullable=True)
    subgenre: Mapped[str] = mapped_column(String(100), default="Rock alternativo peruano")
    country: Mapped[str] = mapped_column(String(100), default="Perú")
    city: Mapped[str] = mapped_column(String(100), default="Lima")
    language_default: Mapped[str] = mapped_column(String(10), default="es")

    # Imágenes hero (IDs de media_items)
    hero_image_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cover_image_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Redes y links
    spotify_url: Mapped[str | None] = mapped_column(
        String(500),
        default="https://open.spotify.com/intl-es/artist/2lnewal0FLnYLAnziEcIgI?si=B_GwlY5-QPS2YN4Zhd1LbQ",
    )
    youtube_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    instagram_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    tiktok_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    facebook_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Emails
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    booking_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    press_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Límites de upload (en MB)
    max_image_size_mb: Mapped[int] = mapped_column(Integer, default=15)
    max_video_size_mb: Mapped[int] = mapped_column(Integer, default=200)
    max_zip_size_mb: Mapped[int] = mapped_column(Integer, default=500)
    max_download_size_mb: Mapped[int] = mapped_column(Integer, default=100)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
