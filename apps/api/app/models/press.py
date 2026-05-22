from sqlalchemy import String, Boolean, Integer, DateTime, Text, Date
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, date, timezone
from ..core.database import Base


class PressQuote(Base):
    __tablename__ = "press_quotes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    quote: Mapped[str] = mapped_column(Text, nullable=False)
    author: Mapped[str] = mapped_column(String(200), nullable=False)
    media_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    quote_date: Mapped[date | None] = mapped_column(Date, nullable=True)
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
