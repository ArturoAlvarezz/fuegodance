import os
import re
import uuid
from datetime import datetime, timezone
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..auth import get_authenticated_user, get_current_admin
from ..database import get_db
from ..models import Payment, Setting, User
from ..services import push

router = APIRouter()
admin_router = APIRouter(dependencies=[Depends(get_current_admin)])

# Fuera de /app/uploads: esa carpeta se publica en /images y los comprobantes son privados
RECEIPTS_DIR = os.environ.get("RECEIPTS_DIR", "/app/db/receipts")
RECEIPT_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp", ".heic", ".pdf")
MAX_RECEIPT_BYTES = 8 * 1024 * 1024

TZ = ZoneInfo("America/Santiago")
STATUSES = ("pending", "review", "paid", "waived")
METHODS = ("transferencia", "efectivo", "otro")
PERIOD_RE = re.compile(r"\d{4}-(0[1-9]|1[0-2])")

DEFAULTS = {
    "monthly_fee": "30000",
    "due_day": "5",
    "transfer_info": "",
    "reminders_enabled": "1",
}


# --- Utilidades ---

def current_period() -> str:
    return datetime.now(TZ).strftime("%Y-%m")


def validate_period(period: str) -> str:
    if not PERIOD_RE.fullmatch(period):
        raise HTTPException(status_code=400, detail="Mes no válido (formato AAAA-MM)")
    return period


def next_period(period: str) -> str:
    year, month = map(int, period.split("-"))
    year, month = (year + 1, 1) if month == 12 else (year, month + 1)
    return f"{year:04d}-{month:02d}"


def periods_between(start: str, end: str) -> list[str]:
    periods = []
    while start <= end:
        periods.append(start)
        start = next_period(start)
    return periods


def get_settings(db: Session) -> dict:
    stored = {s.key: s.value for s in db.query(Setting).all()}
    # El cobro parte el mes en que se activa la función: los alumnos antiguos no quedan debiendo meses previos
    if "billing_start" not in stored:
        db.add(Setting(key="billing_start", value=current_period()))
        db.commit()
        stored["billing_start"] = current_period()
    values = {**DEFAULTS, **stored}
    return {
        "monthly_fee": int(values["monthly_fee"]),
        "due_day": int(values["due_day"]),
        "transfer_info": values["transfer_info"],
        "billing_start": values["billing_start"],
        "reminders_enabled": values["reminders_enabled"] == "1",
    }


def user_start_period(user: User, billing_start: str) -> str:
    created = user.created_at or datetime.now(timezone.utc)
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    return max(billing_start, created.astimezone(TZ).strftime("%Y-%m"))


def is_overdue(period: str, status: str, due_day: int) -> bool:
    if status != "pending":
        return False
    today = datetime.now(TZ)
    current = today.strftime("%Y-%m")
    return period < current or (period == current and today.day > due_day)


def serialize_month(period: str, payment: Optional[Payment], settings: dict) -> dict:
    status = payment.status if payment else "pending"
    return {
        "period": period,
        "status": status,
        "overdue": is_overdue(period, status, settings["due_day"]),
        # Lo pendiente se cobra al valor vigente; lo registrado conserva su monto
        "amount": payment.amount if payment and status != "pending" else settings["monthly_fee"],
        "method": payment.method if payment else None,
        "note": payment.note if payment else None,
        "paid_at": payment.paid_at.isoformat() if payment and payment.paid_at else None,
        "has_receipt": bool(payment and payment.receipt_filename),
        "payment_id": payment.id if payment else None,
    }


def remove_receipt(payment: Payment):
    if payment.receipt_filename:
        try:
            os.remove(os.path.join(RECEIPTS_DIR, payment.receipt_filename))
        except FileNotFoundError:
            pass
        payment.receipt_filename = None


def delete_user_payments(db: Session, user_id: int):
    """SQLite no aplica las claves foráneas: se borran a mano junto con sus comprobantes."""
    for payment in db.query(Payment).filter(Payment.user_id == user_id).all():
        remove_receipt(payment)
        db.delete(payment)


def student_months(user: User, payments: list[Payment], settings: dict) -> list[dict]:
    by_period = {p.period: p for p in payments}
    periods = set(periods_between(user_start_period(user, settings["billing_start"]), current_period()))
    # Pagos adelantados o de meses previos registrados por el admin también se muestran
    periods.update(by_period)
    return [serialize_month(period, by_period.get(period), settings) for period in sorted(periods, reverse=True)]


def get_student(current_user: dict, db: Session) -> User:
    if current_user["role"] != "user":
        raise HTTPException(status_code=403, detail="Solo los alumnos tienen mensualidades")
    user = db.query(User).filter(User.id == current_user["user_id"], User.is_active == 1).first()
    if not user:
        raise HTTPException(status_code=403, detail="Usuario no válido")
    return user


# --- Alumno ---

@router.get("/me")
def my_payments(current_user: dict = Depends(get_authenticated_user), db: Session = Depends(get_db)):
    user = get_student(current_user, db)
    settings = get_settings(db)
    payments = db.query(Payment).filter(Payment.user_id == user.id).all()
    months = student_months(user, payments, settings)
    return {
        "monthly_fee": settings["monthly_fee"],
        "due_day": settings["due_day"],
        "transfer_info": settings["transfer_info"],
        "current_period": current_period(),
        "months": months,
        "owed": sum(m["amount"] for m in months if m["status"] == "pending"),
    }


@router.post("/me/{period}/receipt")
def upload_receipt(
    period: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    note: Optional[str] = Form(None),
    current_user: dict = Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    validate_period(period)
    user = get_student(current_user, db)
    settings = get_settings(db)
    # Se puede pagar cualquier mes desde el inicio de cobro hasta el siguiente al actual
    if not user_start_period(user, settings["billing_start"]) <= period <= next_period(current_period()):
        raise HTTPException(status_code=400, detail="Ese mes no está disponible para pago")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in RECEIPT_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Sube una foto o PDF del comprobante")
    content = file.file.read(MAX_RECEIPT_BYTES + 1)
    if len(content) > MAX_RECEIPT_BYTES:
        raise HTTPException(status_code=400, detail="El archivo no puede superar los 8 MB")
    if not content:
        raise HTTPException(status_code=400, detail="El archivo está vacío")

    payment = db.query(Payment).filter(Payment.user_id == user.id, Payment.period == period).first()
    if payment and payment.status in ("paid", "waived"):
        raise HTTPException(status_code=400, detail="Ese mes ya está al día")
    if not payment:
        payment = Payment(user_id=user.id, period=period)
        db.add(payment)
    remove_receipt(payment)

    os.makedirs(RECEIPTS_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(RECEIPTS_DIR, filename), "wb") as f:
        f.write(content)

    payment.receipt_filename = filename
    payment.status = "review"
    payment.method = "transferencia"
    payment.amount = settings["monthly_fee"]
    payment.note = (note or "").strip()[:500] or None
    db.commit()
    db.refresh(payment)
    background_tasks.add_task(
        push.notify_admins,
        "Nuevo comprobante",
        f"{user.full_name} subió el comprobante de {push.month_label(period)} ({push.format_clp(payment.amount)})",
        "/admin/pagos",
        f"comprobante-{payment.id}",
    )
    return serialize_month(period, payment, settings)


# --- Administración ---

class SettingsIn(BaseModel):
    monthly_fee: int
    due_day: int
    transfer_info: str = ""
    billing_start: str
    reminders_enabled: bool = True


class PaymentUpdate(BaseModel):
    status: str
    method: Optional[str] = None
    note: Optional[str] = None
    amount: Optional[int] = None


@admin_router.get("/settings")
def admin_get_settings(db: Session = Depends(get_db)):
    return get_settings(db)


@admin_router.put("/settings")
def admin_update_settings(data: SettingsIn, db: Session = Depends(get_db)):
    if not 1000 <= data.monthly_fee <= 1_000_000:
        raise HTTPException(status_code=400, detail="La mensualidad debe estar entre $1.000 y $1.000.000")
    # Hasta el 28 para que exista en todos los meses
    if not 1 <= data.due_day <= 28:
        raise HTTPException(status_code=400, detail="El día de vencimiento debe estar entre 1 y 28")
    validate_period(data.billing_start)
    values = {
        "monthly_fee": str(data.monthly_fee),
        "due_day": str(data.due_day),
        "transfer_info": data.transfer_info.strip()[:1000],
        "billing_start": data.billing_start,
        "reminders_enabled": "1" if data.reminders_enabled else "0",
    }
    for key, value in values.items():
        db.merge(Setting(key=key, value=value))
    db.commit()
    return get_settings(db)


@admin_router.get("/")
def admin_list_payments(period: Optional[str] = Query(None), db: Session = Depends(get_db)):
    period = validate_period(period) if period else current_period()
    settings = get_settings(db)
    current = current_period()

    all_payments = db.query(Payment).all()
    by_user: dict[int, dict[str, Payment]] = {}
    for p in all_payments:
        by_user.setdefault(p.user_id, {})[p.period] = p

    rows = []
    for user in db.query(User).order_by(User.full_name).all():
        payments = by_user.get(user.id, {})
        start = user_start_period(user, settings["billing_start"])
        # Alumnos inactivos o que aún no empezaban solo aparecen si tienen algo registrado ese mes
        if period not in payments and (not user.is_active or period < start):
            continue
        # Meses impagos hasta hoy, para ver de un vistazo quién acumula deuda
        owed = [
            m for m in periods_between(start, current)
            if m not in payments or payments[m].status == "pending"
        ] if user.is_active else []
        rows.append({
            **serialize_month(period, payments.get(period), settings),
            "user_id": user.id,
            "full_name": user.full_name,
            "phone": user.phone,
            "is_active": user.is_active,
            "owed_months": owed,
        })

    summary = {s: sum(1 for r in rows if r["status"] == s) for s in STATUSES}
    summary["overdue"] = sum(1 for r in rows if r["overdue"])
    summary["collected"] = sum(r["amount"] for r in rows if r["status"] == "paid")
    summary["expected"] = sum(r["amount"] for r in rows if r["status"] != "waived")
    return {"period": period, "current_period": current, "settings": settings, "rows": rows, "summary": summary}


@admin_router.put("/{user_id}/{period}")
def admin_update_payment(user_id: int, period: str, data: PaymentUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    validate_period(period)
    if data.status not in STATUSES:
        raise HTTPException(status_code=400, detail="Estado no válido")
    if data.method is not None and data.method not in METHODS:
        raise HTTPException(status_code=400, detail="Medio de pago no válido")
    if data.amount is not None and not 0 <= data.amount <= 1_000_000:
        raise HTTPException(status_code=400, detail="Monto no válido")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")

    settings = get_settings(db)
    payment = db.query(Payment).filter(Payment.user_id == user_id, Payment.period == period).first()
    if not payment:
        payment = Payment(user_id=user_id, period=period)
        db.add(payment)
    previous_status = payment.status or "pending"

    payment.status = data.status
    if data.method is not None:
        payment.method = data.method
    if data.note is not None:
        payment.note = data.note.strip()[:500] or None
    if data.status == "paid":
        payment.paid_at = payment.paid_at or datetime.now(timezone.utc)
        payment.amount = data.amount if data.amount is not None else (payment.amount or settings["monthly_fee"])
    else:
        payment.paid_at = None
        payment.amount = data.amount if data.amount is not None else settings["monthly_fee"]
    db.commit()
    db.refresh(payment)

    month = push.month_label(period)
    if data.status == "paid" and previous_status != "paid":
        background_tasks.add_task(
            push.notify_user, user_id, "Pago confirmado ✅",
            f"Registramos tu mensualidad de {month} ({push.format_clp(payment.amount)}). ¡Gracias!",
        )
    elif data.status == "pending" and previous_status == "review":
        background_tasks.add_task(
            push.notify_user, user_id, "Revisa tu comprobante",
            payment.note or f"No pudimos confirmar tu pago de {month}. Sube el comprobante de nuevo.",
        )
    return serialize_month(period, payment, settings)


@admin_router.get("/{payment_id}/receipt")
def admin_get_receipt(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment or not payment.receipt_filename:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")
    path = os.path.join(RECEIPTS_DIR, payment.receipt_filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")
    return FileResponse(path, headers={"Cache-Control": "private, no-store"})
