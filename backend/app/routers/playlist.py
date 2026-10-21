import re
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..auth import get_authenticated_user, get_optional_user, get_current_admin
from ..database import get_db
from ..models import PlaylistSong, SongVote, User

router = APIRouter()
admin_router = APIRouter(dependencies=[Depends(get_current_admin)])

STYLES = ("salsa", "timba", "bachata", "son", "otro")
STATUSES = ("pending", "approved", "hidden")
MAX_SONGS_PER_DAY = 5
YOUTUBE_ID_RE = re.compile(r"(?:v=|youtu\.be/|shorts/|embed/|live/)([A-Za-z0-9_-]{11})")


class SongIn(BaseModel):
    url: str
    style: str


class SongUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None
    style: Optional[str] = None


def extract_youtube_id(url: str) -> Optional[str]:
    url = url.strip()
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", url):
        return url
    if "youtube.com" not in url and "youtu.be" not in url:
        return None
    match = YOUTUBE_ID_RE.search(url)
    return match.group(1) if match else None


def fetch_video_info(youtube_id: str) -> dict:
    """Obtiene título y canal con oEmbed (sin clave de API).

    oEmbed responde 401/403 cuando el video no permite incrustarse y 404/400 cuando no existe.
    """
    try:
        res = httpx.get(
            "https://www.youtube.com/oembed",
            params={"url": f"https://www.youtube.com/watch?v={youtube_id}", "format": "json"},
            timeout=10,
        )
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="No se pudo consultar YouTube, inténtalo de nuevo")
    if res.status_code in (401, 403):
        raise HTTPException(status_code=400, detail="Este video no permite reproducirse fuera de YouTube. Prueba con otra versión (por ejemplo, un video con letra o un audio subido por otro canal).")
    if res.status_code != 200:
        raise HTTPException(status_code=400, detail="No encontramos ese video en YouTube")
    data = res.json()
    return {"title": data.get("title") or "Sin título", "channel": data.get("author_name")}


def public_name(full_name: str) -> str:
    """«Ana Pérez Soto» -> «Ana P.»: los visitantes sin sesión no ven nombres completos."""
    parts = full_name.split()
    if len(parts) < 2:
        return full_name
    return f"{parts[0]} {parts[1][0]}."


def serialize_song(song: PlaylistSong, vote_count: int, voted: bool, current_user: Optional[dict]) -> dict:
    is_admin = bool(current_user) and current_user["role"] == "admin"
    user_id = current_user["user_id"] if current_user else None
    return {
        "id": song.id,
        "youtube_id": song.youtube_id,
        "title": song.title,
        "channel": song.channel,
        "style": song.style,
        "status": song.status,
        "added_by_name": song.added_by_name if current_user else public_name(song.added_by_name),
        "created_at": song.created_at.isoformat() if song.created_at else None,
        "votes": vote_count,
        "voted": voted,
        "can_delete": is_admin or (song.added_by_id is not None and song.added_by_id == user_id),
    }


@router.get("/")
def list_songs(
    style: Optional[str] = Query(None),
    order: str = Query("votes"),
    limit: Optional[int] = Query(None, ge=1, le=50),
    current_user: Optional[dict] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    vote_count = func.count(SongVote.id).label("vote_count")
    query = (
        db.query(PlaylistSong, vote_count)
        .outerjoin(SongVote, SongVote.song_id == PlaylistSong.id)
        .group_by(PlaylistSong.id)
    )
    # Público: solo aprobadas. Cada alumno ve además sus propuestas pendientes u ocultas
    user_id = current_user["user_id"] if current_user else None
    if user_id:
        query = query.filter(or_(PlaylistSong.status == "approved", PlaylistSong.added_by_id == user_id))
    else:
        query = query.filter(PlaylistSong.status == "approved")
    if style:
        query = query.filter(PlaylistSong.style == style)
    if order == "recent":
        query = query.order_by(PlaylistSong.created_at.desc())
    else:
        query = query.order_by(vote_count.desc(), PlaylistSong.created_at.desc())

    if limit:
        query = query.limit(limit)
    rows = query.all()
    my_votes = set()
    if current_user and current_user["user_id"]:
        my_votes = {
            v.song_id for v in db.query(SongVote.song_id).filter(SongVote.user_id == current_user["user_id"])
        }
    return [serialize_song(song, count, song.id in my_votes, current_user) for song, count in rows]


@router.post("/")
def add_song(
    data: SongIn,
    current_user: dict = Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    if data.style not in STYLES:
        raise HTTPException(status_code=400, detail="Estilo no válido")
    youtube_id = extract_youtube_id(data.url)
    if not youtube_id:
        raise HTTPException(status_code=400, detail="Pega un enlace de YouTube válido")

    existing = db.query(PlaylistSong).filter(PlaylistSong.youtube_id == youtube_id).first()
    if existing:
        if existing.status == "approved":
            raise HTTPException(status_code=409, detail=f"«{existing.title}» ya está en la playlist (la propuso {existing.added_by_name})")
        raise HTTPException(status_code=409, detail="Esta canción ya fue propuesta y está en revisión")

    if current_user["role"] == "admin":
        added_by_id, added_by_name, status = None, "Fuego Dance", "approved"
    else:
        user = db.query(User).filter(User.id == current_user["user_id"], User.is_active == 1).first()
        if not user:
            raise HTTPException(status_code=403, detail="Usuario no válido")
        since = datetime.now(timezone.utc) - timedelta(days=1)
        recent = (
            db.query(PlaylistSong)
            .filter(PlaylistSong.added_by_id == user.id, PlaylistSong.created_at >= since)
            .count()
        )
        if recent >= MAX_SONGS_PER_DAY:
            raise HTTPException(status_code=429, detail=f"Puedes proponer hasta {MAX_SONGS_PER_DAY} canciones al día")
        added_by_id, added_by_name, status = user.id, user.full_name, "pending"

    info = fetch_video_info(youtube_id)
    song = PlaylistSong(
        youtube_id=youtube_id,
        title=info["title"][:300],
        channel=(info["channel"] or "")[:200] or None,
        style=data.style,
        status=status,
        added_by_id=added_by_id,
        added_by_name=added_by_name,
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    return serialize_song(song, 0, False, current_user)


@router.post("/{song_id}/vote")
def toggle_vote(
    song_id: int,
    current_user: dict = Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    if not current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Solo los alumnos pueden votar")
    song = db.query(PlaylistSong).filter(PlaylistSong.id == song_id).first()
    if not song or song.status != "approved":
        raise HTTPException(status_code=404, detail="Canción no encontrada")

    vote = db.query(SongVote).filter(SongVote.song_id == song_id, SongVote.user_id == current_user["user_id"]).first()
    if vote:
        db.delete(vote)
        voted = False
    else:
        db.add(SongVote(song_id=song_id, user_id=current_user["user_id"]))
        voted = True
    db.commit()
    votes = db.query(SongVote).filter(SongVote.song_id == song_id).count()
    return {"id": song_id, "votes": votes, "voted": voted}


@router.delete("/{song_id}")
def delete_song(
    song_id: int,
    current_user: dict = Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    song = db.query(PlaylistSong).filter(PlaylistSong.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Canción no encontrada")
    is_owner = song.added_by_id is not None and song.added_by_id == current_user["user_id"]
    if current_user["role"] != "admin" and not is_owner:
        raise HTTPException(status_code=403, detail="Solo puedes borrar tus propias canciones")
    db.delete(song)
    db.commit()
    return {"status": "deleted"}


# --- Moderación (solo admin) ---

def song_with_votes(db: Session, song: PlaylistSong) -> dict:
    votes = db.query(SongVote).filter(SongVote.song_id == song.id).count()
    return serialize_song(song, votes, False, {"role": "admin", "user_id": None})


@admin_router.get("/")
def admin_list_songs(status: Optional[str] = Query(None), db: Session = Depends(get_db)):
    vote_count = func.count(SongVote.id).label("vote_count")
    query = (
        db.query(PlaylistSong, vote_count)
        .outerjoin(SongVote, SongVote.song_id == PlaylistSong.id)
        .group_by(PlaylistSong.id)
        .order_by(PlaylistSong.created_at.desc())
    )
    if status:
        query = query.filter(PlaylistSong.status == status)
    counts = dict(db.query(PlaylistSong.status, func.count(PlaylistSong.id)).group_by(PlaylistSong.status).all())
    admin = {"role": "admin", "user_id": None}
    return {
        "songs": [serialize_song(song, count, False, admin) for song, count in query.all()],
        "counts": {s: counts.get(s, 0) for s in STATUSES},
    }


@admin_router.patch("/{song_id}")
def admin_update_song(song_id: int, data: SongUpdate, db: Session = Depends(get_db)):
    song = db.query(PlaylistSong).filter(PlaylistSong.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Canción no encontrada")
    if data.status is not None:
        if data.status not in STATUSES:
            raise HTTPException(status_code=400, detail="Estado no válido")
        song.status = data.status
    if data.style is not None:
        if data.style not in STYLES:
            raise HTTPException(status_code=400, detail="Estilo no válido")
        song.style = data.style
    if data.title is not None:
        title = data.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="El título no puede quedar vacío")
        song.title = title[:300]
    db.commit()
    db.refresh(song)
    return song_with_votes(db, song)


@admin_router.post("/approve-pending")
def admin_approve_pending(db: Session = Depends(get_db)):
    updated = db.query(PlaylistSong).filter(PlaylistSong.status == "pending").update({PlaylistSong.status: "approved"})
    db.commit()
    return {"approved": updated}


@admin_router.delete("/{song_id}")
def admin_delete_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(PlaylistSong).filter(PlaylistSong.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Canción no encontrada")
    db.delete(song)
    db.commit()
    return {"status": "deleted"}
