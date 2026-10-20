from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from .database import engine, Base
from .models import Figure, GalleryPhoto, Video, ContactMessage, AdminUser, User
from .auth import create_default_admin
from .routers import figures, gallery, instagram, contact
from .routers.videos import router as videos_router
from .routers.admin import router as admin_router
from .routers.users import router as users_router

import os
from pathlib import Path

FRONTEND_DIST = Path("/app/frontend/dist")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables + default admin
    Base.metadata.create_all(bind=engine)
    for d in ["/app/uploads/gallery", "/app/uploads/videos", "/app/uploads/thumbnails", "/app/uploads/instagram", "/app/data"]:
        os.makedirs(d, exist_ok=True)
    create_default_admin()
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

# User auth
app.include_router(users_router)

# Admin routers
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])

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
        return FileResponse(requested)
    if index.exists():
        return FileResponse(index)
    return {"message": "🔥 Fuego Dance API", "docs": "/docs"}
