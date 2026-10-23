import asyncio
import logging
from datetime import datetime

from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Payment, PushSubscription, ReminderLog, User
from ..routers.payments import TZ, get_settings, periods_between, user_start_period
from . import push

logger = logging.getLogger("fuego.reminders")

SEND_FROM_HOUR = 10  # no despertar a nadie: los avisos salen desde las 10:00
DAYS_BEFORE = 3
DAYS_AFTER = 3
CHECK_EVERY_SECONDS = 30 * 60


def reminder_kind(day: int, due_day: int) -> str | None:
    if due_day - DAYS_BEFORE <= day < due_day:
        return "before"
    if day == due_day:
        return "due"
    if day >= due_day + DAYS_AFTER:
        return "overdue"
    return None


def reminder_text(kind: str, period: str, owed: int, owed_months: int, due_day: int) -> tuple[str, str]:
    month = push.month_label(period)
    if kind == "before":
        return "Tu mensualidad vence pronto", f"La mensualidad de {month} ({push.format_clp(owed)}) vence el día {due_day}. Toca para ver cómo pagar."
    if kind == "due":
        return "Hoy vence tu mensualidad", f"Recuerda pagar la mensualidad de {month} ({push.format_clp(owed)})."
    months = f"{owed_months} mensualidades" if owed_months > 1 else f"la mensualidad de {month}"
    return "Tienes un pago atrasado", f"Tienes pendiente {months} ({push.format_clp(owed)}). Si ya pagaste, sube tu comprobante."


def run_reminders(db: Session, now: datetime | None = None) -> int:
    """Envía los recordatorios que correspondan hoy. Cada tipo sale una sola vez por alumno y mes."""
    now = now or datetime.now(TZ)
    settings = get_settings(db)
    if not settings["reminders_enabled"] or now.hour < SEND_FROM_HOUR:
        return 0
    kind = reminder_kind(now.day, settings["due_day"])
    if not kind:
        return 0
    period = now.strftime("%Y-%m")

    subscribed = {uid for (uid,) in db.query(PushSubscription.user_id).filter(PushSubscription.user_id.isnot(None)).distinct()}
    sent_users = 0
    for user in db.query(User).filter(User.is_active == 1, User.id.in_(subscribed)).all():
        start = user_start_period(user, settings["billing_start"])
        if period < start:
            continue
        if db.query(ReminderLog).filter_by(user_id=user.id, period=period, kind=kind).first():
            continue
        payments = {p.period: p for p in db.query(Payment).filter(Payment.user_id == user.id)}
        current = payments.get(period)
        if current and current.status != "pending":
            continue
        owed_periods = [m for m in periods_between(start, period) if m not in payments or payments[m].status == "pending"]
        title, body = reminder_text(kind, period, settings["monthly_fee"] * len(owed_periods), len(owed_periods), settings["due_day"])
        subs = db.query(PushSubscription).filter(PushSubscription.user_id == user.id).all()
        if push.send(db, subs, title, body, "/mis-pagos", tag=f"mensualidad-{period}"):
            db.add(ReminderLog(user_id=user.id, period=period, kind=kind))
            db.commit()
            sent_users += 1
    if sent_users:
        logger.info("Recordatorio '%s' de %s enviado a %d alumnos", kind, period, sent_users)
    return sent_users


def _run_once():
    with SessionLocal() as db:
        run_reminders(db)


async def reminders_loop():
    while True:
        try:
            await asyncio.to_thread(_run_once)
        except Exception:
            logger.exception("Error al enviar recordatorios")
        await asyncio.sleep(CHECK_EVERY_SECONDS)
