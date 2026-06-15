"""Servicio de email vía SMTP (compatible con Zoho Mail, Google Workspace, etc.)."""
from dataclasses import dataclass
from email.message import EmailMessage

import aiosmtplib

from ..core.config import get_settings
from ..core.logging import logger

settings = get_settings()


@dataclass(frozen=True)
class EmailProfile:
    role: str
    host: str
    port: int
    password: str
    from_name: str
    use_tls: bool
    email: str

    @property
    def name(self) -> str:
        return self.role

    @property
    def user(self) -> str:
        return self.email

    @property
    def from_email(self) -> str:
        return self.email


def _setting(name: str):
    return getattr(settings, name)


def _pick(value, fallback):
    return value if value not in (None, "") else fallback


def _pick_port(value, fallback: int) -> int:
    return int(_pick(value, fallback))


def _pick_bool(value, fallback: bool) -> bool:
    value = _pick(value, fallback)
    if isinstance(value, bool):
        return value
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _email_for_role(role: str) -> str:
    return _pick(_setting(f"email_{role}"), settings.smtp_from_email or settings.smtp_user)


def _password_for_role(role: str) -> str:
    return _pick(_setting(f"email_{role}_password"), settings.smtp_password)


def _email_profile(role: str = "noreply") -> EmailProfile:
    return EmailProfile(
        role=role,
        host=settings.smtp_host,
        port=settings.smtp_port,
        password=_password_for_role(role),
        from_name=settings.smtp_from_name,
        use_tls=settings.smtp_use_tls,
        email=_email_for_role(role),
    )


async def _send(
    to: str,
    subject: str,
    html: str,
    role: str = "noreply",
    reply_to: str | None = None,
) -> bool:
    profile = _email_profile(role)
    if not profile.host or not profile.email or not profile.password:
        logger.warning(f"SMTP '{profile.name}' no configurado. Email no enviado.")
        return False

    message = EmailMessage()
    message["From"] = f"{profile.from_name} <{profile.from_email}>"
    message["To"] = to
    message["Subject"] = subject
    if reply_to:
        message["Reply-To"] = reply_to
    message.set_content("Este correo requiere un cliente compatible con HTML.")
    message.add_alternative(html, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=profile.host,
            port=profile.port,
            username=profile.user,
            password=profile.password,
            start_tls=profile.use_tls,
            timeout=15,
        )
        logger.info(f"Email enviado a {to} con rol '{profile.name}': {subject}")
        return True
    except Exception as e:
        logger.error(f"Error SMTP '{profile.name}' enviando email a {to}: {e}")
        return False


def _contact_email_role(contact_type: str) -> str:
    if contact_type in {"booking", "collaboration"}:
        return "booking"
    if contact_type == "press":
        return "press"
    return "contact"


async def send_contact_notification(msg) -> bool:
    tipo_labels = {
        "booking": "Booking",
        "press": "Prensa",
        "collaboration": "Colaboración",
        "fan": "Fan",
        "other": "Otro",
    }
    label = tipo_labels.get(msg.contact_type, msg.contact_type)
    role = _contact_email_role(msg.contact_type)
    to_email = _email_for_role(role)
    html = f"""
    <h2>Nuevo mensaje de contacto — {label}</h2>
    <p><strong>Nombre:</strong> {msg.name}</p>
    <p><strong>Email:</strong> {msg.email}</p>
    <p><strong>Tipo:</strong> {label}</p>
    <hr>
    <p>{msg.message}</p>
    """
    return await _send(
        to=to_email,
        subject=f"[Juanma EPK] Nuevo mensaje: {label} de {msg.name}",
        html=html,
        role=role,
        reply_to=msg.email,
    )


async def send_download_approved(download_request) -> bool:
    asset = download_request.asset
    token = download_request.approval_token
    expires = download_request.token_expires_at
    download_url = f"{settings.api_base_url}/api/public/downloads/{token}"
    html = f"""
    <h2>Tu solicitud de descarga fue aprobada</h2>
    <p>Hola <strong>{download_request.name}</strong>,</p>
    <p>Tu solicitud para descargar <strong>{asset.title}</strong> fue aprobada.</p>
    <p>
      <a href="{download_url}" style="background:#c0392b;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">
        Descargar ahora
      </a>
    </p>
    <p><small>Este enlace expira el {expires.strftime('%d/%m/%Y a las %H:%M UTC') if expires else 'en breve'}.</small></p>
    <p>— Juanma & The Center People</p>
    """
    return await _send(
        to=download_request.email,
        subject=f"[Juanma EPK] Descarga aprobada: {asset.title}",
        html=html,
        role="noreply",
    )
