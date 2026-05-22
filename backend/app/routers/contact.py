from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from ..database import get_db
from ..models import ContactMessage

router = APIRouter()


class ContactMessageIn(BaseModel):
    name: str
    email: EmailStr
    message: str


class ContactMessageOut(BaseModel):
    id: int
    name: str
    email: str
    message: str

    class Config:
        from_attributes = True


@router.post("/")
def send_message(data: ContactMessageIn, db: Session = Depends(get_db)):
    msg = ContactMessage(name=data.name, email=data.email, message=data.message)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"status": "received", "id": msg.id}
