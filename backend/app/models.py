from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base


class Figure(Base):
    __tablename__ = "figures"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    level = Column(String(50), nullable=False)  # basico, intermedio, avanzado
    description = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    duration = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    videos = relationship("Video", back_populates="figure")


class GalleryPhoto(Base):
    __tablename__ = "gallery_photos"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(500), nullable=False)
    alt = Column(String(200), nullable=True)
    event = Column(String(200), nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    filename = Column(String(500), nullable=False)
    thumbnail_filename = Column(String(500), nullable=True)
    figure_id = Column(Integer, ForeignKey("figures.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    figure = relationship("Figure", back_populates="videos")


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class PlaylistSong(Base):
    __tablename__ = "playlist_songs"

    id = Column(Integer, primary_key=True, index=True)
    youtube_id = Column(String(11), unique=True, nullable=False)
    title = Column(String(300), nullable=False)
    channel = Column(String(200), nullable=True)
    style = Column(String(50), nullable=False)  # salsa, timba, bachata, son, otro
    status = Column(String(20), nullable=False, default="pending", index=True)  # pending, approved, hidden
    added_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # Se guarda el nombre para que la canción conserve su autor si se borra el usuario
    added_by_name = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    votes = relationship("SongVote", back_populates="song", cascade="all, delete-orphan")


class SongVote(Base):
    __tablename__ = "song_votes"
    __table_args__ = (UniqueConstraint("song_id", "user_id"),)

    id = Column(Integer, primary_key=True, index=True)
    song_id = Column(Integer, ForeignKey("playlist_songs.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    song = relationship("PlaylistSong", back_populates="votes")


class Setting(Base):
    """Valores configurables desde el admin (p. ej. el monto de la mensualidad)."""
    __tablename__ = "settings"

    key = Column(String(50), primary_key=True)
    value = Column(Text, nullable=False)


class Payment(Base):
    """Mensualidad de un alumno. Los meses sin fila se consideran pendientes."""
    __tablename__ = "payments"
    __table_args__ = (UniqueConstraint("user_id", "period"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    period = Column(String(7), nullable=False, index=True)  # AAAA-MM
    # Se guarda el monto del momento: cambiar la mensualidad no altera los meses ya registrados
    amount = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # pending, review, paid, waived
    method = Column(String(20), nullable=True)  # transferencia, efectivo, otro
    receipt_filename = Column(String(200), nullable=True)
    note = Column(Text, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class PushSubscription(Base):
    """Dispositivo (navegador) que recibe notificaciones push de un alumno o del admin."""
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(String(1000), unique=True, nullable=False)
    p256dh = Column(String(200), nullable=False)
    auth = Column(String(100), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    is_admin = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ReminderLog(Base):
    """Recordatorios de mensualidad ya enviados, para no repetirlos tras un reinicio."""
    __tablename__ = "reminder_logs"
    __table_args__ = (UniqueConstraint("user_id", "period", "kind"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    period = Column(String(7), nullable=False)
    kind = Column(String(20), nullable=False)  # before, due, overdue
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
