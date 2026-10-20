import os
from PIL import Image, ImageOps

UPLOADS = "/app/uploads"
# (carpeta, lado máximo en px, calidad WebP): lightbox y grilla
PREVIEWS = (("web", 1600, 85), ("thumbnails", 400, 80))


def preview_name(filename: str) -> str:
    return f"{os.path.splitext(filename)[0]}.webp"


def generate_previews(filename: str) -> tuple[int, int]:
    """Genera las versiones WebP de una foto de la galería y retorna (ancho, alto) ya orientado."""
    with Image.open(os.path.join(UPLOADS, "gallery", filename)) as src:
        # draft() decodifica el JPEG a escala reducida: evita cargar 6000px en memoria
        src.draft("RGB", (PREVIEWS[0][1], PREVIEWS[0][1]))
        img = ImageOps.exif_transpose(src).convert("RGB")
    dimensions = None
    for folder, size, quality in PREVIEWS:
        img.thumbnail((size, size), Image.LANCZOS)
        img.save(os.path.join(UPLOADS, folder, preview_name(filename)), "WEBP", quality=quality)
        dimensions = dimensions or img.size
    return dimensions


def remove_previews(filename: str):
    for folder, _, _ in PREVIEWS:
        path = os.path.join(UPLOADS, folder, preview_name(filename))
        if os.path.exists(path):
            os.remove(path)


def backfill_dimensions(db):
    """Completa ancho/alto de fotos antiguas leyendo solo la cabecera de su versión web."""
    from ..models import GalleryPhoto

    for photo in db.query(GalleryPhoto).filter(GalleryPhoto.width.is_(None)):
        path = os.path.join(UPLOADS, "web", preview_name(photo.filename))
        if os.path.exists(path):
            with Image.open(path) as img:
                photo.width, photo.height = img.size
    db.commit()
