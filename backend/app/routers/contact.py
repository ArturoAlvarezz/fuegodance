from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

router = APIRouter()


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    message: str


@router.post("/")
def send_message(data: ContactMessage):
    """Receive a contact form message."""
    # TODO: Send email notification + save to DB
    return {"status": "received", "name": data.name}
