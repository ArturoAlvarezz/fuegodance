from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import figures, gallery, instagram, contact

app = FastAPI(
    title="Fuego Dance API",
    description="Backend para la academia de salsa Fuego Dance",
    version="1.0.0",
)

# CORS — allow frontend in dev and prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "https://fuegodance.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(figures.router, prefix="/api/figures", tags=["figures"])
app.include_router(gallery.router, prefix="/api/gallery", tags=["gallery"])
app.include_router(instagram.router, prefix="/api/instagram", tags=["instagram"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])


@app.get("/api/health")
def health_check():
    return {"status": "🔥 Fuego Dance API is running"}


@app.get("/")
def root():
    return {"message": "🔥 Fuego Dance API", "docs": "/docs"}
