from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ...core.database import get_db
from ...models.contact import ContactMessage
from ...models.user import User
from ...dependencies.auth import get_current_user
from ...schemas.common import ok

router = APIRouter(prefix="/api/admin/contact-messages", tags=["Admin - Mensajes"])


@router.get("")
async def list_messages(
    status: Optional[str] = None,
    contact_type: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(ContactMessage)
    if status:
        query = query.filter(ContactMessage.status == status)
    if contact_type:
        query = query.filter(ContactMessage.contact_type == contact_type)
    messages = query.order_by(ContactMessage.created_at.desc()).all()
    return ok([{
        "id": m.id,
        "name": m.name,
        "email": m.email,
        "contact_type": m.contact_type,
        "message": m.message,
        "status": m.status,
        "created_at": m.created_at.isoformat(),
    } for m in messages])


@router.put("/{message_id}/status")
async def update_status(
    message_id: int,
    status: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    valid = {"unread", "read", "archived"}
    if status not in valid:
        raise HTTPException(400, "Estado inválido")
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(404, "Mensaje no encontrado")
    msg.status = status
    db.commit()
    return ok(message="Estado actualizado")
