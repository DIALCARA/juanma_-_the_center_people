from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from ...core.database import get_db
from ...models.rider import (
    RiderProfile, RiderMember, RiderInputChannel, RiderBackline,
    RiderMonitoring, RiderElectrical, RiderShowLength, RiderContact, RiderHospitality,
)
from ...models.user import User
from ...dependencies.auth import get_current_user
from ...schemas.common import ok

router = APIRouter(prefix="/api/admin/rider", tags=["Admin - Rider"])


@router.get("")
async def get_rider(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    profile = db.query(RiderProfile).filter(RiderProfile.is_active == True).first()
    if not profile:
        return ok(None)
    return ok(_profile_to_dict(profile))


@router.post("")
async def create_rider(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    profile = RiderProfile()
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return ok(_profile_to_dict(profile), message="Rider creado")


# ─── Integrantes del rider ────────────────────────────────────────────────────

class RiderMemberCreate(BaseModel):
    name: str
    role: str
    instrument: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int = 0


@router.post("/{profile_id}/members")
async def add_rider_member(profile_id: int, body: RiderMemberCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    _get_profile_or_404(db, profile_id)
    member = RiderMember(profile_id=profile_id, **body.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return ok(member.__dict__, message="Integrante agregado al rider")


@router.delete("/{profile_id}/members/{member_id}")
async def remove_rider_member(profile_id: int, member_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    member = db.query(RiderMember).filter(RiderMember.id == member_id, RiderMember.profile_id == profile_id).first()
    if not member:
        raise HTTPException(404, "Integrante no encontrado")
    db.delete(member)
    db.commit()
    return ok(message="Integrante eliminado del rider")


# ─── Input list ──────────────────────────────────────────────────────────────

class InputChannelCreate(BaseModel):
    channel_number: int
    source: str
    mic_or_di: Optional[str] = None
    stand: Optional[str] = None
    notes: Optional[str] = None


@router.put("/{profile_id}/input-list")
async def update_input_list(profile_id: int, body: List[InputChannelCreate], db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    _get_profile_or_404(db, profile_id)
    db.query(RiderInputChannel).filter(RiderInputChannel.profile_id == profile_id).delete()
    for ch in body:
        db.add(RiderInputChannel(profile_id=profile_id, **ch.model_dump()))
    db.commit()
    return ok(message="Input list actualizada")


# ─── Backline ─────────────────────────────────────────────────────────────────

class BacklineCreate(BaseModel):
    equipment: str
    provided_by: str = "banda"
    quantity: int = 1
    notes: Optional[str] = None


@router.put("/{profile_id}/backline")
async def update_backline(profile_id: int, body: List[BacklineCreate], db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    _get_profile_or_404(db, profile_id)
    db.query(RiderBackline).filter(RiderBackline.profile_id == profile_id).delete()
    for item in body:
        db.add(RiderBackline(profile_id=profile_id, **item.model_dump()))
    db.commit()
    return ok(message="Backline actualizado")


# ─── Monitoreo ────────────────────────────────────────────────────────────────

class MonitoringCreate(BaseModel):
    musician: str
    needs_to_hear: Optional[str] = None
    monitor_type: str = "piso"
    notes: Optional[str] = None


@router.put("/{profile_id}/monitoring")
async def update_monitoring(profile_id: int, body: List[MonitoringCreate], db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    _get_profile_or_404(db, profile_id)
    db.query(RiderMonitoring).filter(RiderMonitoring.profile_id == profile_id).delete()
    for item in body:
        db.add(RiderMonitoring(profile_id=profile_id, **item.model_dump()))
    db.commit()
    return ok(message="Monitoreo actualizado")


# ─── Eléctrico ───────────────────────────────────────────────────────────────

class ElectricalCreate(BaseModel):
    location: str
    outlets_count: int = 1
    voltage: Optional[str] = None
    notes: Optional[str] = None


@router.put("/{profile_id}/electrical")
async def update_electrical(profile_id: int, body: List[ElectricalCreate], db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    _get_profile_or_404(db, profile_id)
    db.query(RiderElectrical).filter(RiderElectrical.profile_id == profile_id).delete()
    for item in body:
        db.add(RiderElectrical(profile_id=profile_id, **item.model_dump()))
    db.commit()
    return ok(message="Requerimientos eléctricos actualizados")


# ─── Duración del show ────────────────────────────────────────────────────────

class ShowLengthCreate(BaseModel):
    show_type: str
    duration_minutes: int
    soundcheck_minutes: Optional[int] = None
    linecheck_minutes: Optional[int] = None
    preferred_schedule: Optional[str] = None
    notes: Optional[str] = None


@router.put("/{profile_id}/show-lengths")
async def update_show_lengths(profile_id: int, body: List[ShowLengthCreate], db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    _get_profile_or_404(db, profile_id)
    db.query(RiderShowLength).filter(RiderShowLength.profile_id == profile_id).delete()
    for item in body:
        db.add(RiderShowLength(profile_id=profile_id, **item.model_dump()))
    db.commit()
    return ok(message="Duraciones de show actualizadas")


# ─── Contacto técnico ─────────────────────────────────────────────────────────

class RiderContactCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


@router.put("/{profile_id}/contacts")
async def update_contacts(profile_id: int, body: List[RiderContactCreate], db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    _get_profile_or_404(db, profile_id)
    db.query(RiderContact).filter(RiderContact.profile_id == profile_id).delete()
    for item in body:
        db.add(RiderContact(profile_id=profile_id, **item.model_dump()))
    db.commit()
    return ok(message="Contactos técnicos actualizados")


# ─── Hospitality ─────────────────────────────────────────────────────────────

class HospitalityUpdate(BaseModel):
    water: Optional[str] = None
    instrument_storage: Optional[bool] = None
    loading_zone: Optional[bool] = None
    dressing_room: Optional[bool] = None
    food: Optional[str] = None
    notes: Optional[str] = None


@router.put("/{profile_id}/hospitality")
async def update_hospitality(profile_id: int, body: HospitalityUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    _get_profile_or_404(db, profile_id)
    hosp = db.query(RiderHospitality).filter(RiderHospitality.profile_id == profile_id).first()
    if not hosp:
        hosp = RiderHospitality(profile_id=profile_id)
        db.add(hosp)
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(hosp, field, value)
    db.commit()
    return ok(message="Hospitality actualizado")


# ─── helpers ─────────────────────────────────────────────────────────────────

def _get_profile_or_404(db: Session, profile_id: int) -> RiderProfile:
    profile = db.query(RiderProfile).filter(RiderProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(404, "Perfil de rider no encontrado")
    return profile


def _profile_to_dict(p: RiderProfile) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "is_active": p.is_active,
        "stage_plot_media_id": p.stage_plot_media_id,
        "notes": p.notes,
        "members": [{"id": m.id, "name": m.name, "role": m.role, "instrument": m.instrument} for m in p.members],
        "input_channels": [{"id": c.id, "channel_number": c.channel_number, "source": c.source, "mic_or_di": c.mic_or_di} for c in p.input_channels],
        "backline": [{"id": b.id, "equipment": b.equipment, "provided_by": b.provided_by, "quantity": b.quantity} for b in p.backline],
        "monitoring": [{"id": m.id, "musician": m.musician, "monitor_type": m.monitor_type} for m in p.monitoring],
        "electrical": [{"id": e.id, "location": e.location, "outlets_count": e.outlets_count} for e in p.electrical],
        "show_lengths": [{"id": s.id, "show_type": s.show_type, "duration_minutes": s.duration_minutes} for s in p.show_lengths],
        "contacts": [{"id": c.id, "name": c.name, "role": c.role, "email": c.email} for c in p.contacts],
        "hospitality": {
            "water": p.hospitality.water,
            "instrument_storage": p.hospitality.instrument_storage,
            "dressing_room": p.hospitality.dressing_room,
        } if p.hospitality else None,
    }
