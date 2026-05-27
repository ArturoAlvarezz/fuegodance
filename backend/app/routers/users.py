from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import User
from ..auth import verify_password, create_user_token, get_authenticated_user

router = APIRouter(prefix="/api/users", tags=["users"])


class UserLoginIn(BaseModel):
    phone: str
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    phone: str
    is_active: int

    class Config:
        from_attributes = True


@router.post("/auth/login")
def user_login(data: UserLoginIn, db: Session = Depends(get_db)):
    # Normalize phone: remove non-digits and ensure it's 9 digits
    phone_clean = "".join(filter(str.isdigit, data.phone))
    if len(phone_clean) != 9:
        raise HTTPException(status_code=400, detail="El teléfono debe tener 9 dígitos")

    user = db.query(User).filter(User.phone == phone_clean).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Teléfono o contraseña incorrectos")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Usuario desactivado")

    token = create_user_token(user.id, user.full_name, user.phone)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "phone": user.phone,
        },
    }


@router.get("/me", response_model=UserOut)
def get_me(
    current_user: dict = Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] == "admin":
        # Admins can see their own info too
        return {
            "id": 0,
            "full_name": "Admin",
            "phone": "",
            "is_active": 1,
        }
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user
