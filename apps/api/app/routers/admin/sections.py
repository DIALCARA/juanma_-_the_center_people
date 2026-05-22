from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from ...core.database import get_db
from ...models.section import Section
from ...models.user import User
from ...dependencies.auth import get_current_user
from ...schemas.common import ok

router = APIRouter(prefix="/api/admin/sections", tags=["Admin - Secciones"])


class SectionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    show_in_home: Optional[bool] = None
    show_empty_state: Optional[bool] = None
    empty_state_message: Optional[str] = None
    sort_order: Optional[int] = None


class SectionOrderItem(BaseModel):
    id: int
    sort_order: int


@router.get("")
async def list_sections(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    sections = db.query(Section).order_by(Section.sort_order).all()
    return ok([s.__dict__ for s in sections])


@router.put("/{section_id}")
async def update_section(
    section_id: int,
    body: SectionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        raise HTTPException(404, "Sección no encontrada")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(section, field, value)
    db.commit()
    db.refresh(section)
    return ok(section.__dict__, message="Sección actualizada")


@router.put("/reorder/bulk")
async def reorder_sections(
    body: List[SectionOrderItem],
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    for item in body:
        db.query(Section).filter(Section.id == item.id).update({"sort_order": item.sort_order})
    db.commit()
    return ok(message="Orden actualizado")
