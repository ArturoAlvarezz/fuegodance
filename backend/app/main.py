from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from sqlalchemy import inspect, text
from .database import engine, Base, SessionLocal
from .models import Figure, GalleryPhoto, Video, ContactMessage, AdminUser, User, PlaylistSong, SongVote
from .auth import create_default_admin
from .services.gallery_images import backfill_dimensions
from .routers import figures, gallery, instagram, contact, playlist
from .routers.videos import router as videos_router
from .routers.admin import router as admin_router
from .routers.users import router as users_router

import os
from pathlib import Path

FRONTEND_DIST = Path("/app/frontend/dist")
# Rutas del SPA (frontend/src/App.jsx). El resto recibe index.html con estado 404
# para que el SPA muestre su página de error y los buscadores no indexen la URL.
SPA_ROUTES = {"", "galeria", "figuras", "playlist", "contacto", "login"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables + default admin
    Base.metadata.create_all(bind=engine)
    # create_all no agrega columnas a tablas existentes
    gallery_columns = {c["name"] for c in inspect(engine).get_columns("gallery_photos")}
    playlist_columns = {c["name"] for c in inspect(engine).get_columns("playlist_songs")}
    with engine.begin() as conn:
        for column in ("width", "height"):
            if column not in gallery_columns:
                conn.execute(text(f"ALTER TABLE gallery_photos ADD COLUMN {column} INTEGER"))
        # Las canciones que existían antes de la moderación ya estaban publicadas
        if "status" not in playlist_columns:
            conn.execute(text("ALTER TABLE playlist_songs ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'approved'"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_playlist_songs_status ON playlist_songs (status)"))
    for d in ["/app/uploads/gallery", "/app/uploads/videos", "/app/uploads/thumbnails", "/app/uploads/instagram", "/app/data"]:
        os.makedirs(d, exist_ok=True)
    create_default_admin()
    with SessionLocal() as db:
        backfill_dimensions(db)
    yield


app = FastAPI(
    title="Fuego Dance API",
    description="Backend para la academia de salsa Fuego Dance",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8083",
        "https://fuegodance.cl",
        "https://fuegodance.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public routers
app.include_router(figures.router, prefix="/api/figures", tags=["figures"])
app.include_router(gallery.router, prefix="/api/gallery", tags=["gallery"])
app.include_router(videos_router, prefix="/api/videos", tags=["videos"])
app.include_router(instagram.router, prefix="/api/instagram", tags=["instagram"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])
app.include_router(playlist.router, prefix="/api/playlist", tags=["playlist"])

# User auth
app.include_router(users_router)

# Admin routers
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(playlist.admin_router, prefix="/api/admin/playlist", tags=["admin"])

# Optimized gallery files are served directly by the integrated application.
app.mount("/images", StaticFiles(directory="/app/uploads"), name="images")


@app.get("/api/health")
def health_check():
    return {"status": "🔥 Fuego Dance API is running"}


@app.get("/{path:path}")
def serve_frontend(path: str):
    """Serve the compiled React SPA and fall back to index.html for client routes."""
    index = FRONTEND_DIST / "index.html"
    requested = (FRONTEND_DIST / path).resolve()
    if requested.is_file() and requested.is_relative_to(FRONTEND_DIST.resolve()):
        # Los archivos de assets/ llevan hash en el nombre: pueden cachearse para siempre
        if path.startswith("assets/"):
            return FileResponse(requested, headers={"Cache-Control": "public, max-age=31536000, immutable"})
        return FileResponse(requested)
    if path.startswith(("assets/", "api/")):
        raise HTTPException(status_code=404)
    if index.exists():
        route = path.strip("/")
        known = route in SPA_ROUTES or route == "admin" or route.startswith("admin/")
        # index.html siempre se revalida para que cada despliegue llegue de inmediato
        return FileResponse(index, status_code=200 if known else 404, headers={"Cache-Control": "no-cache"})
    return {"message": "🔥 Fuego Dance API", "docs": "/docs"}
