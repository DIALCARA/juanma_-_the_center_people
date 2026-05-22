from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from ...core.database import get_db
from ...models.band import BandBio, BandMember, QuickFact, SocialLink
from ...models.media import MediaItem
from ...models.user import User
from ...dependencies.auth import get_current_user
from ...schemas.common import ok

router = APIRouter(prefix="/api/admin/band", tags=["Admin - Banda"])


# ─── Bio ─────────────────────────────────────────────────────────────────────

class BioUpdate(BaseModel):
    bio_short: Optional[str] = None
    bio_long: Optional[str] = None
    history: Optional[str] = None


@router.get("/bio")
async def get_bio(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """Endpoint consolidado: el admin lo carga al entrar al módulo Banda y trae bio + integrantes + datos rápidos en un solo round-trip."""
    bio = db.query(BandBio).first()
    members = db.query(BandMember).order_by(BandMember.sort_order).all()
    facts = db.query(QuickFact).order_by(QuickFact.sort_order).all()

    # Resolver URL de foto de cada integrante para que el CMS pueda mostrar preview
    members_out = []
    for m in members:
        d = dict(m.__dict__)
        d.pop("_sa_instance_state", None)
        photo_url = None
        if m.photo_media_id:
            media = db.query(MediaItem).filter(MediaItem.id == m.photo_media_id).first()
            if media:
                photo_url = media.thumbnail_url or media.file_url
        d["photo_url"] = photo_url
        members_out.append(d)

    return ok({
        "bio": bio.__dict__ if bio else {"bio_short": "", "bio_long": "", "history": ""},
        "members": members_out,
        "quick_facts": [f.__dict__ for f in facts],
    })


@router.put("/bio")
async def update_bio(body: BioUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    bio = db.query(BandBio).first()
    if not bio:
        bio = BandBio()
        db.add(bio)
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(bio, field, value)
    db.commit()
    db.refresh(bio)
    return ok(bio.__dict__, message="Bio actualizada")


# ─── Integrantes ─────────────────────────────────────────────────────────────

class MemberCreate(BaseModel):
    name: str
    role: str = ""
    instrument: Optional[str] = None
    bio: Optional[str] = None          # bio breve
    bio_long: Optional[str] = None     # bio completa
    photo_media_id: Optional[int] = None
    sort_order: int = 0
    is_visible: bool = True


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    instrument: Optional[str] = None
    bio: Optional[str] = None
    bio_long: Optional[str] = None
    photo_media_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_visible: Optional[bool] = None


@router.get("/members")
async def list_members(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    members = db.query(BandMember).order_by(BandMember.sort_order).all()
    return ok([m.__dict__ for m in members])


@router.post("/members")
async def create_member(body: MemberCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    member = BandMember(**body.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return ok(member.__dict__, message="Integrante creado")


@router.put("/members/{member_id}")
async def update_member(member_id: int, body: MemberUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    member = db.query(BandMember).filter(BandMember.id == member_id).first()
    if not member:
        raise HTTPException(404, "Integrante no encontrado")
    # exclude_unset (no exclude_none) para permitir limpiar campos pasando null explícito (ej: quitar foto)
    for field, value in body.model_dump(exclude_unset=True).items():
        # photo_url es derivado del backend, no es un campo de la tabla
        if field == "photo_url":
            continue
        setattr(member, field, value)
    db.commit()
    db.refresh(member)
    return ok(member.__dict__, message="Integrante actualizado")


@router.delete("/members/{member_id}")
async def delete_member(member_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    member = db.query(BandMember).filter(BandMember.id == member_id).first()
    if not member:
        raise HTTPException(404, "Integrante no encontrado")
    db.delete(member)
    db.commit()
    return ok(message="Integrante eliminado")


# ─── Quick facts ─────────────────────────────────────────────────────────────

class FactCreate(BaseModel):
    label: str
    value: str = ""
    sort_order: int = 0
    is_visible: bool = True


class FactUpdate(BaseModel):
    label: Optional[str] = None
    value: Optional[str] = None
    sort_order: Optional[int] = None
    is_visible: Optional[bool] = None


@router.get("/quick-facts")
async def list_facts(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    facts = db.query(QuickFact).order_by(QuickFact.sort_order).all()
    return ok([f.__dict__ for f in facts])


@router.post("/quick-facts")
async def create_fact(body: FactCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    fact = QuickFact(**body.model_dump())
    db.add(fact)
    db.commit()
    db.refresh(fact)
    return ok(fact.__dict__, message="Dato creado")


@router.put("/quick-facts/{fact_id}")
async def update_fact(fact_id: int, body: FactUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    fact = db.query(QuickFact).filter(QuickFact.id == fact_id).first()
    if not fact:
        raise HTTPException(404, "Dato no encontrado")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(fact, field, value)
    db.commit()
    db.refresh(fact)
    return ok(fact.__dict__, message="Dato actualizado")


@router.delete("/quick-facts/{fact_id}")
async def delete_fact(fact_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    fact = db.query(QuickFact).filter(QuickFact.id == fact_id).first()
    if not fact:
        raise HTTPException(404, "Dato no encontrado")
    db.delete(fact)
    db.commit()
    return ok(message="Dato eliminado")
