import os
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import Video
from pydantic import BaseModel

router = APIRouter()

VIDEO_DIR = "/app/uploads/videos"
THUMB_DIR = "/app/uploads/thumbnails"
os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(THUMB_DIR, exist_ok=True)


class VideoOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    filename: str
    thumbnail_filename: Optional[str] = None
    figure_id: Optional[int] = None

    class Config:
        from_attributes = True


@router.get("/", response_model=list[VideoOut])
def get_videos(db: Session = Depends(get_db)):
    return db.query(Video).order_by(Video.created_at.desc()).all()


@router.get("/files/{filename}")
def get_video_file(filename: str):
    filepath = os.path.join(VIDEO_DIR, filename)
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type="video/mp4")
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Video no encontrado")


@router.get("/thumbnails/{filename}")
def get_thumbnail_file(filename: str):
    filepath = os.path.join(THUMB_DIR, filename)
    if os.path.exists(filepath):
        return FileResponse(filepath)
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Thumbnail no encontrado")
