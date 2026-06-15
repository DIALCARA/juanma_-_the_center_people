from sqlalchemy import String, Boolean, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from ..core.database import Base


class DownloadAsset(Base):
    __tablename__ = "download_assets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    # public | request_required | private
    access_type: Mapped[str] = mapped_column(String(20), default="public")
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    send_via_email: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_in_days: Mapped[int] = mapped_column(Integer, default=7)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    requests: Mapped[list["DownloadRequest"]] = relationship(
        "DownloadRequest", back_populates="asset", cascade="all, delete-orphan"
    )


class DownloadRequest(Base):
    __tablename__ = "download_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    download_asset_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("download_assets.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    organization: Mapped[str | None] = mapped_column(String(200), nullable=True)
    # prensa | booking | festival | colaboracion | otro
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    # pending | approved | rejected | expired
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    approval_token: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    token_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rejected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    downloaded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    asset: Mapped["DownloadAsset"] = relationship("DownloadAsset", back_populates="requests")
