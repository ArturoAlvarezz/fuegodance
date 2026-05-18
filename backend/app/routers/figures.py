from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class Figure(BaseModel):
    id: int
    name: str
    level: str  # basico, intermedio, avanzado
    description: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[str] = None


# Placeholder — will connect to DB
MOCK_FIGURES = [
    Figure(id=1, name="Dile que no", level="basico", video_url="", duration="2:30",
           description="Figura básica de cambio de dirección"),
    Figure(id=2, name="Enchufla", level="basico", video_url="", duration="3:10",
           description="Giro de la follower debajo del brazo del leader"),
    Figure(id=3, name="Vacilala", level="intermedio", video_url="", duration="4:20",
           description="Figura donde la follower camina con estilo"),
    Figure(id=4, name="Sombrero", level="intermedio", video_url="", duration="3:45",
           description="Combinación de manos sobre la cabeza"),
    Figure(id=5, name="Setenta", level="avanzado", video_url="", duration="5:00",
           description="Figura compleja con múltiples giros"),
    Figure(id=6, name="Coca-Cola", level="avanzado", video_url="", duration="4:15",
           description="Giro con agarre cruzado y liberación"),
]


@router.get("/", response_model=list[Figure])
def get_figures(level: Optional[str] = None):
    """Get all figures, optionally filtered by level."""
    if level and level != "all":
        return [f for f in MOCK_FIGURES if f.level == level]
    return MOCK_FIGURES


@router.get("/{figure_id}", response_model=Figure)
def get_figure(figure_id: int):
    """Get a single figure by ID."""
    for f in MOCK_FIGURES:
        if f.id == figure_id:
            return f
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Figura no encontrada")
