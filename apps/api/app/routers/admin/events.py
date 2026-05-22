from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date

from ...core.database import get_db
from ...models.event import Event
from ...models.user import User
from ...dependencies.auth import get_current_user
from ...schemas.common import ok

router = APIRouter(prefix="/api/admin/events", tags=["Admin - Eventos"])


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: date
    venue: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    ticket_url: Optional[str] = None
    poster_media_id: Optional[int] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[date] = None
    venue: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    ticket_url: Optional[str] = None
    poster_media_id: Optional[int] = None
    is_visible: Optional[bool] = None


@router.get("")
async def list_events(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    events = db.query(Event).order_by(Event.event_date.desc()).all()
    return ok([_to_dict(e) for e in events])


@router.post("")
async def create_event(body: EventCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    event = Event(**body.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return ok(_to_dict(event), message="Evento creado")


@router.put("/{event_id}")
async def update_event(event_id: int, body: EventUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Evento no encontrado")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return ok(_to_dict(event), message="Evento actualizado")


@router.delete("/{event_id}")
async def delete_event(event_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Evento no encontrado")
    db.delete(event)
    db.commit()
    return ok(message="Evento eliminado")


def _to_dict(e: Event) -> dict:
    return {
        "id": e.id,
        "title": e.title,
        "description": e.description,
        "event_date": e.event_date.isoformat(),
        "venue": e.venue,
        "city": e.city,
        "country": e.country,
        "ticket_url": e.ticket_url,
        "poster_media_id": e.poster_media_id,
        "is_visible": e.is_visible,
    }
