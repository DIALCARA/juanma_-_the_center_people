from sqlalchemy import String, Boolean, Integer, DateTime, Text, BigInteger, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from ..core.database import Base


class MediaType(Base):
    __tablename__ = "media_types"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    categories: Mapped[list["MediaCategory"]] = relationship(
        "MediaCategory", back_populates="media_type", cascade="all, delete-orphan"
    )


class MediaCategory(Base):
    __tablename__ = "media_categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    media_type_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("media_types.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    parent_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("media_categories.id", ondelete="SET NULL"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    media_type: Mapped["MediaType"] = relationship("MediaType", back_populates="categories")
    items: Mapped[list["MediaItem"]] = relationship(
        "MediaItem", back_populates="category", cascade="all, delete-orphan"
    )


class MediaItem(Base):
    __tablename__ = "media_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    media_type_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("media_types.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("media_categories.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str | None] = mapped_column(String(300), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    # upload | google_photos | youtube | instagram | tiktok | manual_url
    source_type: Mapped[str] = mapped_column(String(50), default="upload")
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    credit_author: Mapped[str | None] = mapped_column(String(200), nullable=True)
    alt_text: Mapped[str | None] = mapped_column(String(500), nullable=True)
    tags_json: Mapped[str | None] = mapped_column(Text, nullable=True)
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

    category: Mapped["MediaCategory | None"] = relationship(
        "MediaCategory", back_populates="items"
    )
