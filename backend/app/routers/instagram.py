import os
import json
import time
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, FileResponse
from datetime import datetime, timezone

router = APIRouter()

# Fallback Instagram media URLs (hardcoded from frontend data)
INSTAGRAM_MEDIA = {
    "DX7jLVTvZ0r": "https://scontent-scl3-1.cdninstagram.com/v/t51.82787-15/684309479_18189977359370480_3822622897203984819_n.jpg?stp=dst-jpg_e35_s640x640_sh2.08_tt6&_nc_ht=scontent-scl3-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2gEt6cn3ligKed-8p22tUaWMa12qb0jbS3ehv6EZm7AimhlK2ZOvbOIpKZOQL3V7mNk&_nc_ohc=GeCz43OkAQsQ7kNvwEEagU9&_nc_gid=w6OofcCZSBhLW8cz9Bfkjg&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af6tiLv_Mgx8ABpK6Q_zuLI3o2pJ3G6joBf9d5MILWZmyQ&oe=6A115E69&_nc_sid=8b3546",
    "DWoktFvAEU": "https://scontent-scl3-1.cdninstagram.com/v/t51.82787-15/658438955_18186246262370480_3612401924590420018_n.jpg?stp=dst-jpg_e35_p640x640_sh2.08_tt6&_nc_ht=scontent-scl3-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2gEt6cn3ligKed-8p22tUaWMa12qb0jbS3ehv6EZm7AimhlK2ZOvbOIpKZOQL3V7mNk&_nc_ohc=ArbTDyXyUSEQ7kNvwFVdgXZ&_nc_gid=w6OofcCZSBhLW8cz9Bfkjg&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af4Fot2CD1pkzEm1hsQXBdnUo2r2qHuXfivNjQQ32QYHSA&oe=6A11661A&_nc_sid=8b3546",
    "DWokCQkAGFR": "https://scontent-scl3-1.cdninstagram.com/v/t51.82787-15/658822875_18186245890370480_386556664697906478_n.jpg?stp=dst-jpg_e35_p640x640_sh2.08_tt6&_nc_ht=scontent-scl3-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2gEt6cn3ligKed-8p22tUaWMa12qb0jbS3ehv6EZm7AimhlK2ZOvbOIpKZOQL3V7mNk&_nc_ohc=m_QR4KRp38kQ7kNvwGPZoPn&_nc_gid=w6OofcCZSBhLW8cz9Bfkjg&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af6JIbRA7dtb6aftx3MyywqvHTvqr1fMGhU4w3Y1L3lHuA&oe=6A117653&_nc_sid=8b3546",
    "DYX1f9dj-IX": "https://scontent-scl3-1.cdninstagram.com/v/t51.82787-15/671241987_18191110378370480_6680016366577509530_n.jpg?stp=dst-jpg_e35_s640x640_sh2.08_tt6&_nc_ht=scontent-scl3-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2gEt6cn3ligKed-8p22tUaWMa12qb0jbS3ehv6EZm7AimhlK2ZOvbOIpKZOQL3V7mNk&_nc_ohc=mG39xMEyjN4Q7kNvwGzUBEt&_nc_gid=w6OofcCZSBhLW8cz9Bfkjg&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af4ndfJevZiV_Uyq6HajiFvF_boK-MaWq6YtRN12fFJMKA&oe=6A117FAB&_nc_sid=8b3546",
}

CACHE_DIR = "/app/uploads/instagram"
CACHE_FILE = "/app/data/instagram_cache.json"
os.makedirs(CACHE_DIR, exist_ok=True)

CACHE_MAX_AGE = 24 * 60 * 60  # 24 hours in seconds


def build_fallback_feed() -> list[dict]:
    """Build feed from hardcoded INSTAGRAM_MEDIA URLs."""
    feed = []
    for post_id in INSTAGRAM_MEDIA:
        feed.append({
            "id": post_id,
            "media_url": f"/api/instagram/media/{post_id}",
            "permalink": f"https://www.instagram.com/p/{post_id}/",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    return feed


def read_cache() -> list[dict] | None:
    """Read cached feed if it exists and is fresh enough (< 24h)."""
    if not os.path.exists(CACHE_FILE):
        return None
    try:
        with open(CACHE_FILE, "r") as f:
            data = json.load(f)
        cached_at = data.get("cached_at", 0)
        if time.time() - cached_at < CACHE_MAX_AGE:
            return data.get("feed", [])
    except (json.JSONDecodeError, KeyError, TypeError):
        pass
    return None


def write_cache(feed: list[dict]) -> None:
    """Write feed to cache file with timestamp."""
    data = {
        "cached_at": time.time(),
        "feed": feed,
    }
    cache_dir = os.path.dirname(CACHE_FILE)
    os.makedirs(cache_dir, exist_ok=True)
    with open(CACHE_FILE, "w") as f:
        json.dump(data, f, indent=2)


def fetch_instagram_feed() -> list[dict]:
    """Try to fetch real Instagram feed, fall back to hardcoded URLs."""
    # For now, always use fallback since we don't have Instagram Basic Display API access
    # In the future, this can be replaced with actual API calls
    feed = build_fallback_feed()
    write_cache(feed)
    return feed


@router.get("/feed")
def get_feed():
    """Get Instagram feed from cache. Auto-refreshes if cache is older than 24h."""
    feed = read_cache()
    if feed is None:
        feed = fetch_instagram_feed()
    return feed


@router.post("/refresh")
def refresh_feed():
    """Force refresh the Instagram feed cache immediately."""
    feed = fetch_instagram_feed()
    return {"status": "refreshed", "items": len(feed)}


@router.get("/media/{post_id}")
async def proxy_instagram_media(post_id: str):
    """Proxy Instagram media to avoid CORS issues. Caches images locally."""
    if post_id not in INSTAGRAM_MEDIA:
        raise HTTPException(status_code=404, detail="Media not found")

    original_url = INSTAGRAM_MEDIA[post_id]
    cache_path = os.path.join(CACHE_DIR, f"{post_id}.jpg")

    # Serve from cache if exists
    if os.path.exists(cache_path):
        return FileResponse(cache_path, media_type="image/jpeg")

    # Download and cache
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(original_url, follow_redirects=True, timeout=30)
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Failed to fetch: {resp.status_code}")

            with open(cache_path, "wb") as f:
                f.write(resp.content)

            return Response(content=resp.content, media_type="image/jpeg")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Proxy error: {str(e)}")
