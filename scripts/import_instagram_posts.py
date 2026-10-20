#!/usr/bin/env python3
"""Importa publicaciones públicas de Instagram al feed local de Fuego Dance.

Uso:
  python3 scripts/import_instagram_posts.py URL_O_CODIGO [...]   agrega o actualiza posts
  python3 scripts/import_instagram_posts.py --refresh            vuelve a descargar todo el feed
  python3 scripts/import_instagram_posts.py --remove CODIGO [...] quita posts del feed
  python3 scripts/import_instagram_posts.py --list               muestra el feed actual

No requiere acceso a la cuenta: usa solo lo que Instagram muestra sin iniciar sesión.
  - Página embed (/p/CODIGO/embed/captioned/): imagen completa sin recorte, hasta ~1250px.
    En carruseles solo entrega la primera imagen; en reels, la portada.
  - Página del post (og:description): autor, fecha de publicación y texto.

La imagen se guarda como WebP optimizado ({codigo}.webp) y el manifest feed.json
queda ordenado del más nuevo al más antiguo. El backend lo sirve en /api/instagram/feed.
"""
from __future__ import annotations

import argparse
import html
import io
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

# Carpeta montada en el contenedor como /app/uploads/instagram
DEFAULT_OUTPUT = Path("/mnt/sda/fuegodance/instagram")
PROFILE = "fuegodance.cl"
MAX_SIZE = 1080      # el carrusel muestra ~450px; 1080 cubre pantallas retina
WEBP_QUALITY = 82
REQUEST_DELAY = 2    # segundos entre posts para no gatillar el rate limit

# Instagram entrega las etiquetas og:* y el HTML del embed a este User-Agent
USER_AGENT = "Mozilla/5.0 Chrome/150"
CODE_RE = re.compile(r"^[A-Za-z0-9_-]{6,}$")
URL_CODE_RE = re.compile(r"/(?:p|reel|tv)/([A-Za-z0-9_-]+)")
EMBED_IMG_RE = re.compile(r'<img[^>]+class="EmbeddedMediaImage"[^>]*>', re.IGNORECASE)
SRCSET_RE = re.compile(r'srcset="([^"]+)"')
SRC_RE = re.compile(r'src="([^"]+)"')
OG_RE = r'<meta[^>]+property="og:{}"[^>]+content="([^"]*)"'
# "151 likes, 8 comments - fuegodance.cl on October 14, 2026: "texto del post""
DESCRIPTION_RE = re.compile(r'-\s*([\w.]+)\s+on\s+([A-Z][a-z]+ \d{1,2}, \d{4})\s*:\s*"?(.*?)"?\.?\s*$', re.DOTALL)


def post_code(value: str) -> str:
    value = value.strip()
    match = URL_CODE_RE.search(value)
    if match:
        return match.group(1)
    if CODE_RE.match(value):
        return value
    raise ValueError(f"No pude encontrar el código de publicación en: {value}")


def fetch(url: str, retries: int = 3) -> bytes:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.8"})
    for attempt in range(retries):
        try:
            with urlopen(request, timeout=45) as response:
                return response.read()
        except HTTPError as exc:
            if exc.code != 429 or attempt == retries - 1:
                raise
            wait = 30 * (attempt + 1)
            print(f"   Instagram limitó las consultas (429), reintento en {wait}s…", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError("unreachable")


def og(page: str, prop: str) -> str | None:
    match = re.search(OG_RE.format(prop), page, re.IGNORECASE)
    return html.unescape(match.group(1)) if match else None


def best_embed_image(embed: str) -> str | None:
    """URL de mayor resolución de la imagen principal del embed."""
    tag = EMBED_IMG_RE.search(embed)
    if not tag:
        return None
    srcset = SRCSET_RE.search(tag.group(0))
    if srcset:
        candidates = []
        for entry in html.unescape(srcset.group(1)).split(","):
            parts = entry.strip().rsplit(" ", 1)
            if len(parts) == 2 and parts[1].endswith("w") and parts[1][:-1].isdigit():
                candidates.append((int(parts[1][:-1]), parts[0]))
        if candidates:
            return max(candidates)[1]
    src = SRC_RE.search(tag.group(0))
    return html.unescape(src.group(1)) if src else None


def post_metadata(page: str) -> dict:
    """Autor, fecha y texto desde og:description de la página del post."""
    description = og(page, "description") or ""
    match = DESCRIPTION_RE.search(description)
    if not match:
        return {}
    owner, date, caption = match.groups()
    published = datetime.strptime(date, "%B %d, %Y").replace(hour=12, tzinfo=timezone.utc)
    return {"owner": owner, "timestamp": published.isoformat(), "caption": caption.strip() or None}


def save_webp(data: bytes, path: Path) -> tuple[int, int]:
    with Image.open(io.BytesIO(data)) as img:
        img = ImageOps.exif_transpose(img).convert("RGB")
    img.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)
    tmp = path.with_suffix(".tmp")
    img.save(tmp, "WEBP", quality=WEBP_QUALITY, method=6)
    tmp.replace(path)
    return img.size


def import_post(code: str, output: Path, previous: dict | None) -> dict:
    permalink = f"https://www.instagram.com/p/{code}/"
    embed = fetch(f"{permalink}embed/captioned/").decode("utf-8", errors="ignore")
    page = fetch(permalink).decode("utf-8", errors="ignore")

    # El embed trae la imagen sin recortar; og:image es un recorte cuadrado de baja resolución
    image_url = best_embed_image(embed) or og(page, "image")
    if not image_url:
        raise RuntimeError("Instagram no entregó imagen (¿post privado o eliminado?)")
    width, height = save_webp(fetch(image_url), output / f"{code}.webp")
    for old in (output / f"{code}.jpg", output / f"{code}.jpeg"):
        old.unlink(missing_ok=True)

    meta = post_metadata(page)
    return {
        "id": code,
        "permalink": permalink,
        "media_url": f"/api/instagram/media/{code}",
        "timestamp": meta.get("timestamp") or (previous or {}).get("timestamp"),
        "caption": meta.get("caption"),
        "owner": meta.get("owner"),
        # Siempre IMAGE: solo se descarga la imagen (o la portada de un reel)
        "media_type": "IMAGE",
        "is_carousel": '"isSidecar":true' in embed,
        "width": width,
        "height": height,
    }


def load_manifest(path: Path) -> dict[str, dict]:
    try:
        items = json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return {}
    return {item["id"]: item for item in items if isinstance(item, dict) and item.get("id")}


def save_manifest(path: Path, posts: dict[str, dict]) -> list[dict]:
    ordered = sorted(posts.values(), key=lambda p: p.get("timestamp") or "", reverse=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)
    return ordered


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("posts", nargs="*", help="URLs o códigos de publicaciones")
    parser.add_argument("--refresh", action="store_true", help="vuelve a descargar todos los posts del feed")
    parser.add_argument("--remove", action="store_true", help="quita del feed los posts indicados")
    parser.add_argument("--list", action="store_true", help="muestra el feed actual")
    args = parser.parse_args()

    output = Path(os.environ.get("INSTAGRAM_OUTPUT", DEFAULT_OUTPUT))
    output.mkdir(parents=True, exist_ok=True)
    manifest_path = output / "feed.json"
    posts = load_manifest(manifest_path)

    if args.list:
        for post in save_manifest(manifest_path, posts):
            caption = (post.get("caption") or "").replace("\n", " ")[:60]
            print(f"{(post.get('timestamp') or '?')[:10]}  {post['id']:<12} @{post.get('owner') or '?':<15} {caption}")
        return 0

    codes = [post_code(value) for value in args.posts]
    if args.remove:
        for code in codes:
            if posts.pop(code, None):
                for ext in ("webp", "jpg", "jpeg", "png", "mp4"):
                    (output / f"{code}.{ext}").unlink(missing_ok=True)
                print(f"Eliminado {code}")
            else:
                print(f"{code} no estaba en el feed", file=sys.stderr)
        save_manifest(manifest_path, posts)
        return 0

    if args.refresh:
        codes = list(dict.fromkeys(codes + list(posts)))
    if not codes:
        parser.print_help(sys.stderr)
        return 2

    errors = 0
    for i, code in enumerate(codes):
        if i:
            time.sleep(REQUEST_DELAY)
        try:
            post = import_post(code, output, posts.get(code))
        except Exception as exc:  # informa y sigue con el resto
            errors += 1
            print(f"ERROR {code}: {exc}", file=sys.stderr)
            continue
        posts[code] = post
        note = " (carrusel: solo 1ª imagen)" if post["is_carousel"] else ""
        if post["owner"] and post["owner"] != PROFILE:
            note += f" ⚠ publicado por @{post['owner']}"
        print(f"OK {code}  {(post['timestamp'] or '?')[:10]}  {post['width']}x{post['height']}{note}")
        save_manifest(manifest_path, posts)  # guarda tras cada post por si se corta

    ordered = save_manifest(manifest_path, posts)
    print(f"Manifest actualizado: {manifest_path} ({len(ordered)} publicaciones, {errors} errores)")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
