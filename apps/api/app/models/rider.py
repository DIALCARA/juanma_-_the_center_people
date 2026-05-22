from sqlalchemy import String, Boolean, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from ..core.database import Base


class RiderProfile(Base):
    __tablename__ = "rider_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), default="Rider técnico")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    stage_plot_media_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    members: Mapped[list["RiderMember"]] = relationship(
        "RiderMember", back_populates="profile", cascade="all, delete-orphan"
    )
    input_channels: Mapped[list["RiderInputChannel"]] = relationship(
        "RiderInputChannel", back_populates="profile", cascade="all, delete-orphan"
    )
    backline: Mapped[list["RiderBackline"]] = relationship(
        "RiderBackline", back_populates="profile", cascade="all, delete-orphan"
    )
    monitoring: Mapped[list["RiderMonitoring"]] = relationship(
        "RiderMonitoring", back_populates="profile", cascade="all, delete-orphan"
    )
    electrical: Mapped[list["RiderElectrical"]] = relationship(
        "RiderElectrical", back_populates="profile", cascade="all, delete-orphan"
    )
    show_lengths: Mapped[list["RiderShowLength"]] = relationship(
        "RiderShowLength", back_populates="profile", cascade="all, delete-orphan"
    )
    contacts: Mapped[list["RiderContact"]] = relationship(
        "RiderContact", back_populates="profile", cascade="all, delete-orphan"
    )
    hospitality: Mapped["RiderHospitality | None"] = relationship(
        "RiderHospitality", back_populates="profile", uselist=False, cascade="all, delete-orphan"
    )


class RiderMember(Base):
    __tablename__ = "rider_members"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    profile_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("rider_profiles.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(100), nullable=False)
    instrument: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    profile: Mapped["RiderProfile"] = relationship("RiderProfile", back_populates="members")


class RiderInputChannel(Base):
    __tablename__ = "rider_input_channels"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    profile_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("rider_profiles.id", ondelete="CASCADE"), nullable=False
    )
    channel_number: Mapped[int] = mapped_column(Integer, nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    mic_or_di: Mapped[str | None] = mapped_column(String(100), nullable=True)
    stand: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    profile: Mapped["RiderProfile"] = relationship(
        "RiderProfile", back_populates="input_channels"
    )


class RiderBackline(Base):
    __tablename__ = "rider_backline"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    profile_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("rider_profiles.id", ondelete="CASCADE"), nullable=False
    )
    equipment: Mapped[str] = mapped_column(String(200), nullable=False)
    # banda | local | por confirmar
    provided_by: Mapped[str] = mapped_column(String(50), default="banda")
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    profile: Mapped["RiderProfile"] = relationship("RiderProfile", back_populates="backline")


class RiderMonitoring(Base):
    __tablename__ = "rider_monitoring"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    profile_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("rider_profiles.id", ondelete="CASCADE"), nullable=False
    )
    musician: Mapped[str] = mapped_column(String(200), nullable=False)
    needs_to_hear: Mapped[str | None] = mapped_column(Text, nullable=True)
    # piso | in-ear | otro
    monitor_type: Mapped[str] = mapped_column(String(50), default="piso")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    profile: Mapped["RiderProfile"] = relationship("RiderProfile", back_populates="monitoring")


class RiderElectrical(Base):
    __tablename__ = "rider_electrical"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    profile_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("rider_profiles.id", ondelete="CASCADE"), nullable=False
    )
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    outlets_count: Mapped[int] = mapped_column(Integer, default=1)
    voltage: Mapped[str | None] = mapped_column(String(50), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    profile: Mapped["RiderProfile"] = relationship("RiderProfile", back_populates="electrical")


class RiderShowLength(Base):
    __tablename__ = "rider_show_lengths"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    profile_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("rider_profiles.id", ondelete="CASCADE"), nullable=False
    )
    # promocional | estandar | completo | otro
    show_type: Mapped[str] = mapped_column(String(50), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    soundcheck_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    linecheck_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    preferred_schedule: Mapped[str | None] = mapped_column(String(200), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    profile: Mapped["RiderProfile"] = relationship("RiderProfile", back_populates="show_lengths")


class RiderContact(Base):
    __tablename__ = "rider_contacts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    profile_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("rider_profiles.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str | None] = mapped_column(String(100), nullable=True)

    profile: Mapped["RiderProfile"] = relationship("RiderProfile", back_populates="contacts")


class RiderHospitality(Base):
    __tablename__ = "rider_hospitality"

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("rider_profiles.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    water: Mapped[str | None] = mapped_column(String(300), nullable=True)
    instrument_storage: Mapped[bool] = mapped_column(Boolean, default=True)
    loading_zone: Mapped[bool] = mapped_column(Boolean, default=True)
    dressing_room: Mapped[bool] = mapped_column(Boolean, default=False)
    food: Mapped[str | None] = mapped_column(String(300), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    profile: Mapped["RiderProfile"] = relationship("RiderProfile", back_populates="hospitality")
