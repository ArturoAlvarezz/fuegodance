from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()


class GalleryPhoto(BaseModel):
    id: int
    src: str
    alt: str
    event: Optional[str] = None
    date: Optional[datetime] = None


# Placeholder — will connect to DB + file storage
MOCK_PHOTOS = [
    GalleryPhoto(id=i, src=f"/api/gallery/files/{i}", alt=f"Social {i}",
                 event=["Salsa Night", "Social Viernes", "Práctica Libre", "Festival Fuego"][i % 4],
                 date=datetime.now())
    for i in range(1, 13)
]


@router.get("/", response_model=list[GalleryPhoto])
def get_photos():
    """Get all gallery photos."""
    return MOCK_PHOTOS


@router.post("/upload")
async def upload_photo(file: UploadFile = File(...), event: Optional[str] = None):
    """Upload a new photo to the gallery."""
    # TODO: Save to disk/CDN + create DB record
    return {"filename": file.filename, "event": event, "status": "uploaded"}
