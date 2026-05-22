import os
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import GalleryPhoto
from pydantic import BaseModel

router = APIRouter()

UPLOAD_DIR = "/app/uploads/gallery"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class GalleryPhotoOut(BaseModel):
    id: int
    filename: str
    alt: Optional[str] = None
    event: Optional[str] = None

    class Config:
        from_attributes = True

    @property
    def src(self):
        return f"/api/gallery/files/{self.filename}"


@router.get("/", response_model=list[GalleryPhotoOut])
def get_photos(db: Session = Depends(get_db)):
    return db.query(GalleryPhoto).order_by(GalleryPhoto.created_at.desc()).all()


@router.get("/files/{filename}")
def get_gallery_file(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        return FileResponse(filepath)
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Archivo no encontrado")
