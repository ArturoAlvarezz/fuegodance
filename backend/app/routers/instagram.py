from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class InstagramPost(BaseModel):
    id: str
    caption: str
    media_url: str
    permalink: str
    likes: Optional[int] = None
    timestamp: Optional[str] = None


# Placeholder — will connect to Instagram Basic Display API
MOCK_POSTS = [
    InstagramPost(
        id=str(i),
        caption=f"¡Post #{i} de Fuego Dance! 🔥💃",
        media_url=f"https://placehold.co/400x400/1A1A2E/E63946?text=IG+{i}",
        permalink="https://www.instagram.com/fuegodance/",
        likes=50 + i * 10,
        timestamp="2024-01-01T00:00:00Z",
    )
    for i in range(1, 7)
]


@router.get("/", response_model=list[InstagramPost])
def get_instagram_posts():
    """Get latest Instagram posts."""
    return MOCK_POSTS
