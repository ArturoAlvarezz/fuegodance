from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..auth import get_authenticated_user
from ..database import get_db
from ..models import PushSubscription, User
from ..services import push

router = APIRouter()


class SubscriptionKeys(BaseModel):
    p256dh: str
    auth: str


class SubscriptionIn(BaseModel):
    endpoint: str
    keys: SubscriptionKeys


class EndpointIn(BaseModel):
    endpoint: str


def owner_filter(current_user: dict):
    if current_user["role"] == "admin":
        return PushSubscription.is_admin == 1
    return PushSubscription.user_id == current_user["user_id"]


@router.get("/public-key")
def get_public_key(db: Session = Depends(get_db)):
    return {"public_key": push.public_key(db)}


@router.post("/subscribe")
def subscribe(data: SubscriptionIn, current_user: dict = Depends(get_authenticated_user), db: Session = Depends(get_db)):
    if not data.endpoint.startswith("https://") or len(data.endpoint) > 1000:
        raise HTTPException(status_code=400, detail="Suscripción no válida")
    is_admin = current_user["role"] == "admin"
    if not is_admin and not db.query(User).filter(User.id == current_user["user_id"], User.is_active == 1).first():
        raise HTTPException(status_code=403, detail="Usuario no válido")

    # El mismo navegador puede pasar de un alumno a otro (o al admin): la suscripción queda con el último
    sub = db.query(PushSubscription).filter(PushSubscription.endpoint == data.endpoint).first()
    if not sub:
        sub = PushSubscription(endpoint=data.endpoint)
        db.add(sub)
    sub.p256dh = data.keys.p256dh[:200]
    sub.auth = data.keys.auth[:100]
    sub.is_admin = 1 if is_admin else 0
    sub.user_id = None if is_admin else current_user["user_id"]
    db.commit()
    return {"status": "subscribed"}


@router.post("/unsubscribe")
def unsubscribe(data: EndpointIn, current_user: dict = Depends(get_authenticated_user), db: Session = Depends(get_db)):
    db.query(PushSubscription).filter(PushSubscription.endpoint == data.endpoint, owner_filter(current_user)).delete()
    db.commit()
    return {"status": "unsubscribed"}


@router.post("/test")
def send_test(data: EndpointIn, current_user: dict = Depends(get_authenticated_user), db: Session = Depends(get_db)):
    sub = db.query(PushSubscription).filter(PushSubscription.endpoint == data.endpoint, owner_filter(current_user)).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Este dispositivo no tiene los avisos activados")
    sent = push.send(db, [sub], "🔥 Avisos activados", "Así te llegarán los avisos de Fuego Dance.", "/admin/pagos" if sub.is_admin else "/mis-pagos")
    if not sent:
        raise HTTPException(status_code=502, detail="No se pudo enviar la notificación de prueba")
    return {"status": "sent"}
