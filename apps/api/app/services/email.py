"""Servicio de email vía Mailgun."""
import httpx
from ..core.config import get_settings
from ..core.logging import logger

settings = get_settings()

MAILGUN_API_URL = f"https://api.mailgun.net/v3/{settings.mailgun_domain}/messages"


async def _send(to: str, subject: str, html: str) -> bool:
    if not settings.mailgun_api_key or not settings.mailgun_domain:
        logger.warning("Mailgun no configurado. Email no enviado.")
        return False
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                MAILGUN_API_URL,
                auth=("api", settings.mailgun_api_key),
                data={
                    "from": settings.mailgun_from_email,
                    "to": to,
                    "subject": subject,
                    "html": html,
                },
                timeout=10.0,
            )
        if resp.status_code == 200:
            logger.info(f"Email enviado a {to}: {subject}")
            return True
        logger.error(f"Error Mailgun {resp.status_code}: {resp.text}")
        return False
    except Exception as e:
        logger.error(f"Excepción enviando email: {e}")
        return False


async def send_contact_notification(msg) -> bool:
    tipo_labels = {
        "booking": "Booking",
        "press": "Prensa",
        "collaboration": "Colaboración",
        "fan": "Fan",
        "other": "Otro",
    }
    label = tipo_labels.get(msg.contact_type, msg.contact_type)
    html = f"""
    <h2>Nuevo mensaje de contacto — {label}</h2>
    <p><strong>Nombre:</strong> {msg.name}</p>
    <p><strong>Email:</strong> {msg.email}</p>
    <p><strong>Tipo:</strong> {label}</p>
    <hr>
    <p>{msg.message}</p>
    """
    return await _send(
        to=settings.admin_notification_email or settings.mailgun_from_email,
        subject=f"[Juanma EPK] Nuevo mensaje: {label} de {msg.name}",
        html=html,
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
    )
