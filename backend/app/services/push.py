import base64
import json
import logging

from cryptography.hazmat.primitives import serialization
from py_vapid import Vapid02
from pywebpush import WebPushException, webpush
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import PushSubscription, Setting

logger = logging.getLogger("fuego.push")

VAPID_CLAIMS = {"sub": "https://fuegodance.cl"}
MONTHS = ("enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
          "agosto", "septiembre", "octubre", "noviembre", "diciembre")


def month_label(period: str) -> str:
    year, month = period.split("-")
    return f"{MONTHS[int(month) - 1]} {year}"


def format_clp(amount: int) -> str:
    return f"${amount:,}".replace(",", ".")


def get_vapid(db: Session) -> Vapid02:
    """Las claves VAPID se generan una vez y se guardan en la base: si cambiaran, todas las suscripciones dejarían de servir."""
    row = db.query(Setting).filter(Setting.key == "vapid_private_pem").first()
    if row:
        return Vapid02.from_pem(row.value.encode())
    vapid = Vapid02()
    vapid.generate_keys()
    db.add(Setting(key="vapid_private_pem", value=vapid.private_pem().decode()))
    db.commit()
    return vapid


def public_key(db: Session) -> str:
    raw = get_vapid(db).public_key.public_bytes(
        serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint
    )
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()


def send(db: Session, subscriptions: list[PushSubscription], title: str, body: str, url: str = "/", tag: str | None = None) -> int:
    """Envía la notificación y borra las suscripciones que el navegador ya dio de baja. Devuelve cuántas llegaron."""
    if not subscriptions:
        return 0
    vapid = get_vapid(db)
    payload = json.dumps({"title": title, "body": body, "url": url, "tag": tag})
    delivered = 0
    for sub in subscriptions:
        try:
            webpush(
                subscription_info={"endpoint": sub.endpoint, "keys": {"p256dh": sub.p256dh, "auth": sub.auth}},
                data=payload,
                vapid_private_key=vapid,
                vapid_claims=dict(VAPID_CLAIMS),
                ttl=24 * 3600,
                timeout=10,
            )
            delivered += 1
        except WebPushException as e:
            status = e.response.status_code if e.response is not None else None
            if status in (404, 410):
                db.delete(sub)
            else:
                logger.warning("Push falló (%s): %s", status, e)
        except Exception as e:  # red caída, timeout: no debe romper la petición que lo originó
            logger.warning("Push falló: %s", e)
    db.commit()
    return delivered


def notify_admins(title: str, body: str, url: str = "/admin/pagos", tag: str | None = None):
    with SessionLocal() as db:
        subs = db.query(PushSubscription).filter(PushSubscription.is_admin == 1).all()
        send(db, subs, title, body, url, tag)


def notify_user(user_id: int, title: str, body: str, url: str = "/mis-pagos", tag: str | None = None):
    with SessionLocal() as db:
        subs = db.query(PushSubscription).filter(PushSubscription.user_id == user_id).all()
        send(db, subs, title, body, url, tag)
