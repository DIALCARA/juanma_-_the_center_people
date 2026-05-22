from sqlalchemy import String, Boolean, Integer, DateTime, Text, Date
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, date, timezone
from ..core.database import Base


class MusicRelease(Base):
    __tablename__ = "music_releases"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    release_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    spotify_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    youtube_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cover_media_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
