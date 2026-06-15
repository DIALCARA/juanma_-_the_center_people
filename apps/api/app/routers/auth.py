from fastapi import APIRouter, Depends, HTTPException, Response, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..core.database import get_db
from ..core.security import verify_password, hash_password, create_access_token
from ..core.config import get_settings
from ..core.logging import logger
from ..models.user import User
from ..dependencies.auth import get_current_user
from ..schemas.common import ok, err

router = APIRouter(prefix="/api/auth", tags=["Auth"])
limiter = Limiter(key_func=get_remote_address)
settings = get_settings()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email, User.is_active == True).first()
    if not user or not verify_password(body.password, user.password_hash):
        logger.warning(f"Intento de login fallido para: {body.email} desde {request.client.host}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    token = create_access_token(user.email)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
    )
    logger.info(f"Login exitoso: {user.email}")
    return ok({"email": user.email, "name": user.name, "role": user.role})


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return ok(message="Sesión cerrada")


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return ok({
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
    })


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
@limiter.limit("5/minute")
async def change_password(
    request: Request,
    body: ChangePasswordRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, current_user.password_hash):
        logger.warning(
            f"Intento fallido de cambio de password para {current_user.email} "
            f"desde {request.client.host}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La contraseña actual es incorrecta",
        )

    if len(body.new_password) < 12:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La nueva contraseña debe tener al menos 12 caracteres",
        )

    if body.new_password == body.current_password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La nueva contraseña debe ser distinta de la actual",
        )

    current_user.password_hash = hash_password(body.new_password)
    db.commit()

    # Invalidar la sesión actual: el usuario debe volver a loguearse con la nueva.
    response.delete_cookie("access_token")
    logger.info(f"Password cambiada para: {current_user.email}")
    return ok(message="Contraseña actualizada. Volvé a iniciar sesión.")
