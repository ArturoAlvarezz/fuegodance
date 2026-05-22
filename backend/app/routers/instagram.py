import os
import json
import time
import httpx
import re
import subprocess
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, FileResponse
from datetime import datetime, timezone

router = APIRouter()

CACHE_DIR = "/app/uploads/instagram"
CACHE_FILE = "/app/data/instagram_cache.json"
SCRAPE_SCRIPT = "/app/scripts/scrape_instagram.py"

os.makedirs(CACHE_DIR, exist_ok=True)

CACHE_MAX_AGE = 6 * 60 * 60  # 6 hours in seconds


def read_cache() -> list[dict] | None:
    """Read cached feed if it exists and is fresh enough."""
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
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, "w") as f:
        json.dump(data, f, indent=2)


async def download_and_cache_image(post_id: str, image_url: str) -> str | None:
    """Download image from Instagram CDN and cache locally."""
    cache_path = os.path.join(CACHE_DIR, f"{post_id}.jpg")

    # Serve from cache if exists
    if os.path.exists(cache_path):
        return f"/api/instagram/media/{post_id}"

    # Download and cache
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(image_url, follow_redirects=True, timeout=30)
            if resp.status_code == 200:
                with open(cache_path, "wb") as f:
                    f.write(resp.content)
                return f"/api/instagram/media/{post_id}"
    except Exception:
        pass
    return None


def get_fallback_feed() -> list[dict]:
    """Return a basic fallback if scraping fails completely."""
    # These are the known posts from the profile
    known_posts = [
        {"code": "DYX1f9dj-IX", "url": "https://www.instagram.com/p/DYX1f9dj-IX/"},
        {"code": "DX7jLVTvZ0r", "url": "https://www.instagram.com/p/DX7jLVTvZ0r/"},
        {"code": "DYmncWPAMK0", "url": "https://www.instagram.com/p/DYmncWPAMK0/"},
        {"code": "DYkO25dAHMa", "url": "https://www.instagram.com/p/DYkO25dAHMa/"},
        {"code": "DYgM3sxAOiH", "url": "https://www.instagram.com/p/DYgM3sxAOiH/"},
        {"code": "DYXW-t6gLLU", "url": "https://www.instagram.com/p/DYXW-t6gLLU/"},
        {"code": "DYUeGKcgH5C", "url": "https://www.instagram.com/p/DYUeGKcgH5C/"},
        {"code": "DX8Ic5QAGUP", "url": "https://www.instagram.com/p/DX8Ic5QAGUP/"},
        {"code": "DXqJPZPgAFs", "url": "https://www.instagram.com/p/DXqJPZPgAFs/"},
        {"code": "DXqICmHgBAV", "url": "https://www.instagram.com/p/DXqICmHgBAV/"},
    ]
    return [
        {
            "id": p["code"],
            "permalink": p["url"],
            "media_url": f"/api/instagram/media/{p['code']}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        for p in known_posts
    ]


@router.get("/feed")
def get_feed():
    """Get Instagram feed from cache. Returns cached data if fresh."""
    feed = read_cache()
    if feed is not None:
        return feed
    # Return fallback and trigger background refresh
    return get_fallback_feed()


@router.post("/refresh")
async def refresh_feed():
    """Force refresh the Instagram feed by scraping the profile."""
    feed = await scrape_instagram()
    if feed:
        write_cache(feed)
        return {"status": "refreshed", "items": len(feed)}
    return {"status": "error", "message": "Could not scrape Instagram"}


async def scrape_instagram() -> list[dict]:
    """Scrape Instagram profile page for post data."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    try:
        async with httpx.AsyncClient() as client:
            # Get the profile page
            resp = await client.get(
                "https://www.instagram.com/fuegodance.cl/",
                headers=headers,
                follow_redirects=True,
                timeout=15,
            )
            if resp.status_code != 200:
                return get_fallback_feed()

            # Extract post shortcodes from the page
            text = resp.text
            codes = list(set(re.findall(r'\"shortcode\":\"([A-Za-z0-9_-]+)\"', text)))

            if not codes:
                return get_fallback_feed()

            # For each post, fetch the embed page to get the image
            feed = []
            for code in codes[:10]:
                try:
                    embed_resp = await client.get(
                        f"https://www.instagram.com/p/{code}/embed/",
                        headers=headers,
                        follow_redirects=True,
                        timeout=15,
                    )
                    if embed_resp.status_code == 200:
                        # Extract image URL from embed page
                        img_match = re.findall(
                            r'src="(https://[^"]*cdninstagram[^"]*\.jpg[^"]*)"',
                            embed_resp.text,
                        )
                        # The last image is usually the post image (not profile pic)
                        img_url = img_match[-1] if img_match else None

                        media_url = None
                        if img_url:
                            media_url = await download_and_cache_image(code, img_url)

                        feed.append({
                            "id": code,
                            "permalink": f"https://www.instagram.com/p/{code}/",
                            "media_url": media_url or f"/api/instagram/media/{code}",
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        })
                except Exception:
                    feed.append({
                        "id": code,
                        "permalink": f"https://www.instagram.com/p/{code}/",
                        "media_url": f"/api/instagram/media/{code}",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })

            return feed if feed else get_fallback_feed()

    except Exception:
        return get_fallback_feed()


@router.get("/media/{post_id}")
async def proxy_instagram_media(post_id: str):
    """Proxy Instagram media to avoid CORS issues. Caches images locally."""
    cache_path = os.path.join(CACHE_DIR, f"{post_id}.jpg")

    # Serve from cache if exists
    if os.path.exists(cache_path):
        return FileResponse(cache_path, media_type="image/jpeg")

    # Try to fetch from embed page
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }

    try:
        async with httpx.AsyncClient() as client:
            embed_resp = await client.get(
                f"https://www.instagram.com/p/{post_id}/embed/",
                headers=headers,
                follow_redirects=True,
                timeout=15,
            )
            if embed_resp.status_code == 200:
                img_match = re.findall(
                    r'src="(https://[^"]*cdninstagram[^"]*\.jpg[^"]*)"',
                    embed_resp.text,
                )
                if img_match:
                    img_url = img_match[-1]
                    img_resp = await client.get(img_url, follow_redirects=True, timeout=30)
                    if img_resp.status_code == 200:
                        with open(cache_path, "wb") as f:
                            f.write(img_resp.content)
                        return Response(content=img_resp.content, media_type="image/jpeg")
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Media not found")
