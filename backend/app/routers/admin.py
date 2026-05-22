import os
import subprocess
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from pydantic import BaseModel
from ..database import get_db
from ..models import Figure, GalleryPhoto, Video, ContactMessage, AdminUser
from ..auth import get_current_user, verify_password, create_access_token

router = APIRouter(prefix="", tags=["admin"])

UPLOAD_GALLERY = "/app/uploads/gallery"
UPLOAD_VIDEOS = "/app/uploads/videos"
UPLOAD_THUMBS = "/app/uploads/thumbnails"
for d in [UPLOAD_GALLERY, UPLOAD_VIDEOS, UPLOAD_THUMBS]:
    os.makedirs(d, exist_ok=True)

VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi"]
IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"]


def save_upload(file: UploadFile, folder: str, allowed_ext: list[str]) -> str:
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_ext:
        raise HTTPException(status_code=400, detail=f"Tipo de archivo no soportado: {ext}")
    unique_name = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(folder, unique_name)
    with open(filepath, "wb") as f:
        f.write(file.file.read())
    return unique_name


def format_duration(seconds: float | None) -> Optional[str]:
    if seconds is None or seconds <= 0:
        return None
    total = int(round(seconds))
    minutes, secs = divmod(total, 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def get_video_duration(filename: str) -> Optional[str]:
    """Read video duration from the saved local file using ffprobe."""
    filepath = os.path.join(UPLOAD_VIDEOS, filename)
    try:
        output = subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                filepath,
            ],
            text=True,
            stderr=subprocess.STDOUT,
            timeout=20,
        ).strip()
        return format_duration(float(output))
    except Exception:
        return None


def generate_video_thumbnail(video_filename: str) -> Optional[str]:
    """Generate a thumbnail from the first frame at 0.5s using ffmpeg."""
    if not video_filename:
        return None
    input_path = os.path.join(UPLOAD_VIDEOS, video_filename)
    base = os.path.splitext(video_filename)[0]
    thumb_filename = f"thumbnail_{base}.jpg"
    output_path = os.path.join(UPLOAD_THUMBS, thumb_filename)
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-i", input_path,
                "-ss", "00:00:00.5",
                "-vframes", "1",
                "-vf", "scale=640:-1",
                "-y",
                output_path,
            ],
            capture_output=True,
            timeout=30,
            check=True,
        )
        return thumb_filename
    except Exception:
        return None


def remove_file(folder: str, filename: Optional[str]):
    if not filename:
        return
    path = os.path.join(folder, filename)
    if os.path.exists(path):
        os.remove(path)


def serialize_figure(fig: Figure) -> dict:
    video = fig.videos[0] if getattr(fig, "videos", None) else None
    return {
        "id": fig.id,
        "name": fig.name,
        "level": fig.level,
        "description": fig.description,
        "duration": fig.duration,
        "video_filename": video.filename if video else None,
        "video_file_url": f"/api/videos/files/{video.filename}" if video else None,
    }


# ── AUTH ──
class LoginIn(BaseModel):
    username: str
    password: str


@router.post("/auth/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


# ── FIGURES CRUD (videos are uploaded files, not external URLs) ──
@router.get("/figures/", dependencies=[Depends(get_current_user)])
def admin_list_figures(db: Session = Depends(get_db)):
    figures = db.query(Figure).options(joinedload(Figure.videos)).order_by(Figure.id).all()
    return [serialize_figure(fig) for fig in figures]


@router.post("/figures/", dependencies=[Depends(get_current_user)])
def admin_create_figure(
    name: str = Form(...),
    level: str = Form(...),
    video: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    fig = Figure(name=name, level=level, description=None, duration=None)
    db.add(fig)
    db.commit()
    db.refresh(fig)

    if video:
        video_filename = save_upload(video, UPLOAD_VIDEOS, VIDEO_EXTENSIONS)
        fig.duration = get_video_duration(video_filename)
        thumb_name = generate_video_thumbnail(video_filename)
        vid = Video(
            title=name,
            description=None,
            filename=video_filename,
            thumbnail_filename=thumb_name,
            figure_id=fig.id,
        )
        db.add(vid)
        db.commit()

    fig = db.query(Figure).options(joinedload(Figure.videos)).filter(Figure.id == fig.id).first()
    return serialize_figure(fig)


@router.put("/figures/{figure_id}", dependencies=[Depends(get_current_user)])
def admin_update_figure(
    figure_id: int,
    name: Optional[str] = Form(None),
    level: Optional[str] = Form(None),
    video: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    fig = db.query(Figure).options(joinedload(Figure.videos)).filter(Figure.id == figure_id).first()
    if not fig:
        raise HTTPException(status_code=404, detail="Figura no encontrada")

    if name is not None:
        fig.name = name
    if level is not None:
        fig.level = level
    fig.description = None

    if video:
        # Replace previous figure videos with the new uploaded file.
        for old_video in list(fig.videos):
            remove_file(UPLOAD_VIDEOS, old_video.filename)
            remove_file(UPLOAD_THUMBS, old_video.thumbnail_filename)
            db.delete(old_video)
        video_filename = save_upload(video, UPLOAD_VIDEOS, VIDEO_EXTENSIONS)
        fig.duration = get_video_duration(video_filename)
        thumb_name = generate_video_thumbnail(video_filename)
        db.add(Video(
            title=name or fig.name,
            description=None,
            filename=video_filename,
            thumbnail_filename=thumb_name,
            figure_id=fig.id,
        ))

    db.commit()
    fig = db.query(Figure).options(joinedload(Figure.videos)).filter(Figure.id == figure_id).first()
    return serialize_figure(fig)


@router.delete("/figures/{figure_id}", dependencies=[Depends(get_current_user)])
def admin_delete_figure(figure_id: int, db: Session = Depends(get_db)):
    fig = db.query(Figure).options(joinedload(Figure.videos)).filter(Figure.id == figure_id).first()
    if not fig:
        raise HTTPException(status_code=404, detail="Figura no encontrada")
    for video in list(fig.videos):
        remove_file(UPLOAD_VIDEOS, video.filename)
        remove_file(UPLOAD_THUMBS, video.thumbnail_filename)
        db.delete(video)
    db.delete(fig)
    db.commit()
    return {"status": "deleted", "id": figure_id}


# ── GALLERY CRUD ──
@router.get("/gallery/", dependencies=[Depends(get_current_user)])
def admin_list_gallery(db: Session = Depends(get_db)):
    return db.query(GalleryPhoto).order_by(GalleryPhoto.created_at.desc()).all()


@router.post("/gallery/", dependencies=[Depends(get_current_user)])
async def admin_upload_gallery(
    file: UploadFile = File(...),
    event: Optional[str] = Form(None),
    alt: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    unique_name = save_upload(file, UPLOAD_GALLERY, IMAGE_EXTENSIONS)
    photo = GalleryPhoto(filename=unique_name, alt=alt or file.filename, event=event)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/gallery/{photo_id}", dependencies=[Depends(get_current_user)])
def admin_delete_gallery(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(GalleryPhoto).filter(GalleryPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    remove_file(UPLOAD_GALLERY, photo.filename)
    db.delete(photo)
    db.commit()
    return {"status": "deleted", "id": photo_id}


# ── VIDEOS CRUD ──
@router.get("/videos/", dependencies=[Depends(get_current_user)])
def admin_list_videos(db: Session = Depends(get_db)):
    return db.query(Video).order_by(Video.created_at.desc()).all()


@router.post("/videos/", dependencies=[Depends(get_current_user)])
async def admin_upload_video(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    figure_id: Optional[int] = Form(None),
    thumbnail: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    unique_name = save_upload(file, UPLOAD_VIDEOS, VIDEO_EXTENSIONS)
    thumb_name = save_upload(thumbnail, UPLOAD_THUMBS, IMAGE_EXTENSIONS) if thumbnail else None
    video = Video(title=title, description=description, filename=unique_name, thumbnail_filename=thumb_name, figure_id=figure_id)
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


@router.delete("/videos/{video_id}", dependencies=[Depends(get_current_user)])
def admin_delete_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video no encontrado")
    remove_file(UPLOAD_VIDEOS, video.filename)
    remove_file(UPLOAD_THUMBS, video.thumbnail_filename)
    db.delete(video)
    db.commit()
    return {"status": "deleted", "id": video_id}


# ── CONTACT MESSAGES ──
@router.get("/contact/", dependencies=[Depends(get_current_user)])
def admin_list_messages(db: Session = Depends(get_db)):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
