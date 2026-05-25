from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from .database import engine, Base
from .models import Figure, GalleryPhoto, Video, ContactMessage, AdminUser
from .auth import create_default_admin
from .routers import figures, gallery, instagram, contact
from .routers.videos import router as videos_router
from .routers.admin import router as admin_router

import os


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

# Admin routers
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])


@app.get("/api/health")
def health_check():
    return {"status": "🔥 Fuego Dance API is running"}


@app.get("/")
def root():
    return {"message": "🔥 Fuego Dance API", "docs": "/docs"}
