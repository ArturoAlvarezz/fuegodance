import json
import os
import re
import time
from urllib.parse import quote

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, Response

router = APIRouter()

CACHE_DIR = "/app/uploads/instagram"
# Dentro del volumen montado para que la caché sobreviva a los redespliegues
CACHE_FILE = os.path.join(CACHE_DIR, "graph_cache.json")
MANIFEST_FILE = os.path.join(CACHE_DIR, "feed.json")
CACHE_MAX_AGE = 60 * 60  # 1 hora
GRAPH_API_VERSION = os.getenv("INSTAGRAM_GRAPH_API_VERSION", "v23.0")
GRAPH_API_HOST = os.getenv("INSTAGRAM_GRAPH_API_HOST", "graph.instagram.com")

os.makedirs(CACHE_DIR, exist_ok=True)

# Momento del último intento fallido: evita consultar Instagram en cada visita
_last_failed_refresh = 0.0


def read_cache() -> tuple[list[dict] | None, list[dict] | None]:
    """Return (fresh_feed, stale_feed) so stale data can be shown safely."""
    if not os.path.exists(CACHE_FILE):
        return None, None
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)
        feed = data.get("feed")
        if not isinstance(feed, list):
            return None, None
        if time.time() - data.get("cached_at", 0) < CACHE_MAX_AGE:
            return feed, feed
        return None, feed
    except (OSError, json.JSONDecodeError, TypeError, AttributeError):
        return None, None


def write_cache(feed: list[dict]) -> None:
    """Persist only a verified feed, never the hardcoded fallback."""
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, "w", encoding="utf-8") as file:
        json.dump({"cached_at": time.time(), "feed": feed}, file, indent=2)


async def download_and_cache_image(post_id: str, image_url: str | None) -> str | None:
    """Download a Graph API/CDN image so the frontend does not depend on expiring URLs."""
    if not image_url:
        return None
    cache_path = os.path.join(CACHE_DIR, f"{post_id}.jpg")
    if os.path.exists(cache_path):
        return f"/api/instagram/media/{post_id}"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url, follow_redirects=True, timeout=30)
            if response.status_code == 200 and response.content:
                with open(cache_path, "wb") as file:
                    file.write(response.content)
                return f"/api/instagram/media/{post_id}"
    except (httpx.HTTPError, OSError):
        pass
    return None


def normalize_post(post: dict, media_url: str | None = None) -> dict:
    return {
        "id": post.get("id"),
        "permalink": post.get("permalink") or f"https://www.instagram.com/p/{post.get('code', '')}/",
        "media_url": media_url or post.get("media_url"),
        "timestamp": post.get("timestamp"),
        "caption": post.get("caption"),
        "media_type": post.get("media_type"),
    }


def get_fallback_feed() -> list[dict]:
    """Return the locally imported, verified Instagram links when available."""
    try:
        with open(MANIFEST_FILE, "r", encoding="utf-8") as file:
            feed = json.load(file)
        if isinstance(feed, list):
            return [post for post in feed if isinstance(post, dict) and post.get("id")]
    except (OSError, json.JSONDecodeError, TypeError):
        pass
    return []


async def fetch_graph_feed() -> list[dict]:
    """Fetch current media through Instagram Graph API."""
    token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
    user_id = os.getenv("INSTAGRAM_USER_ID")
    if not token or not user_id:
        return []

    fields = "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url"
    url = f"https://{GRAPH_API_HOST}/{GRAPH_API_VERSION}/{quote(user_id, safe='')}/media"
    params = {"fields": fields, "limit": 12, "access_token": token}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=20)
            response.raise_for_status()
            payload = response.json()
            posts = payload.get("data", [])
            if not isinstance(posts, list):
                return []

            feed = []
            for post in posts:
                source_url = post.get("thumbnail_url") or post.get("media_url")
                cached_url = await download_and_cache_image(post.get("id", ""), source_url)
                if cached_url:
                    feed.append(normalize_post(post, cached_url))
            return [post for post in feed if post.get("id")]
    except (httpx.HTTPError, ValueError, KeyError, TypeError):
        return []


async def refresh_feed_data() -> list[dict]:
    """Consulta la Graph API (requiere token); cachea solo resultados reales.

    El endpoint público del perfil exige sesión desde 2026 (responde 401), así que
    sin token el feed sale de feed.json, generado por scripts/import_instagram_posts.py.
    """
    global _last_failed_refresh
    feed = await fetch_graph_feed()
    if feed:
        write_cache(feed)
        print(f"Instagram feed actualizado mediante Graph API: {len(feed)} publicaciones")
    else:
        _last_failed_refresh = time.time()
    return feed


@router.get("/feed")
async def get_feed():
    """Return fresh cache; refresh when expired and preserve stale data only as a fallback."""
    fresh, stale = read_cache()
    if fresh is not None:
        return fresh
    if time.time() - _last_failed_refresh < CACHE_MAX_AGE:
        return stale or get_fallback_feed()
    refreshed = await refresh_feed_data()
    if refreshed:
        return refreshed
    return stale or get_fallback_feed()


@router.post("/refresh")
async def refresh_feed():
    feed = await refresh_feed_data()
    if feed:
        return {"status": "refreshed", "items": len(feed)}
    return {"status": "error", "message": "No se pudo obtener una publicación real de Instagram"}


@router.get("/media/{post_id}")
async def proxy_instagram_media(post_id: str):
    """Serve a previously cached Instagram image or video."""
    # The manifest keeps a stable extensionless URL; resolve the local file safely.
    safe_id = re.sub(r"[^A-Za-z0-9_-]", "", post_id)
    candidates = (
        (f"{safe_id}.webp", "image/webp"),
        (f"{safe_id}.mp4", "video/mp4"),
        (f"{safe_id}.jpg", "image/jpeg"),
        (f"{safe_id}.jpeg", "image/jpeg"),
        (f"{safe_id}.png", "image/png"),
    )
    for filename, media_type in candidates:
        cache_path = os.path.join(CACHE_DIR, filename)
        if os.path.exists(cache_path):
            return FileResponse(
                cache_path,
                media_type=media_type,
                headers={"Cache-Control": "no-cache, must-revalidate"},
            )
    raise HTTPException(status_code=404, detail="Media not found")
