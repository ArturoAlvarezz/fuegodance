from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from ..database import get_db
from ..models import Figure
from ..auth import get_authenticated_user
from pydantic import BaseModel

router = APIRouter()


def serialize_figure(fig: Figure) -> dict:
    video = fig.videos[0] if getattr(fig, "videos", None) else None
    return {
        "id": fig.id,
        "name": fig.name,
        "level": fig.level,
        "description": fig.description,
        "duration": fig.duration,
        "video_url": None,
        "thumbnail_url": f"/api/videos/thumbnails/{video.thumbnail_filename}" if video and video.thumbnail_filename else None,
        "video_filename": video.filename if video else None,
        "video_file_url": f"/api/videos/files/{video.filename}" if video else None,
    }


@router.get("/")
def get_figures(
    level: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _user: dict = Depends(get_authenticated_user),
):
    query = db.query(Figure).options(joinedload(Figure.videos))
    if level and level != "all":
        query = query.filter(Figure.level == level)
    figures = query.order_by(Figure.id).all()
    return [serialize_figure(fig) for fig in figures]


@router.get("/{figure_id}")
def get_figure(
    figure_id: int,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_authenticated_user),
):
    fig = db.query(Figure).options(joinedload(Figure.videos)).filter(Figure.id == figure_id).first()
    if not fig:
        raise HTTPException(status_code=404, detail="Figura no encontrada")
    return serialize_figure(fig)
