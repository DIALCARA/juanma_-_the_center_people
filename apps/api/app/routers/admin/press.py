from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date

from ...core.database import get_db
from ...models.press import PressQuote
from ...models.user import User
from ...dependencies.auth import get_current_user
from ...schemas.common import ok

router = APIRouter(prefix="/api/admin/press-quotes", tags=["Admin - Press Quotes"])


class QuoteCreate(BaseModel):
    quote: str
    author: str
    media_name: Optional[str] = None
    url: Optional[str] = None
    quote_date: Optional[date] = None
    sort_order: int = 0


class QuoteUpdate(BaseModel):
    quote: Optional[str] = None
    author: Optional[str] = None
    media_name: Optional[str] = None
    url: Optional[str] = None
    quote_date: Optional[date] = None
    is_visible: Optional[bool] = None
    sort_order: Optional[int] = None


@router.get("")
async def list_quotes(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    quotes = db.query(PressQuote).order_by(PressQuote.sort_order).all()
    return ok([q.__dict__ for q in quotes])


@router.post("")
async def create_quote(body: QuoteCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    quote = PressQuote(**body.model_dump())
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return ok(quote.__dict__, message="Cita creada")


@router.put("/{quote_id}")
async def update_quote(quote_id: int, body: QuoteUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    quote = db.query(PressQuote).filter(PressQuote.id == quote_id).first()
    if not quote:
        raise HTTPException(404, "Cita no encontrada")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(quote, field, value)
    db.commit()
    db.refresh(quote)
    return ok(quote.__dict__, message="Cita actualizada")


@router.delete("/{quote_id}")
async def delete_quote(quote_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    quote = db.query(PressQuote).filter(PressQuote.id == quote_id).first()
    if not quote:
        raise HTTPException(404, "Cita no encontrada")
    db.delete(quote)
    db.commit()
    return ok(message="Cita eliminada")
