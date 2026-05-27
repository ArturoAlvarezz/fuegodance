from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import bcrypt

SECRET_KEY = "fuego-dance-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

security = HTTPBearer()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_admin_token(username: str) -> str:
    return create_access_token({"sub": username, "role": "admin"})


def create_user_token(user_id: int, full_name: str, phone: str) -> str:
    return create_access_token({
        "sub": phone,
        "role": "user",
        "user_id": user_id,
        "full_name": full_name,
    })


async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Requires a valid admin token."""
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        if role != "admin":
            raise credentials_exception
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username


async def get_authenticated_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Accepts both user and admin tokens. Returns dict with role, sub, and optional user_id/full_name."""
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o sesión expirada",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        if role not in ("admin", "user"):
            raise credentials_exception
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return {
        "sub": sub,
        "role": role,
        "user_id": payload.get("user_id"),
        "full_name": payload.get("full_name"),
    }


# Keep backward compatibility — existing code that imports get_current_user still works
get_current_user = get_current_admin


def create_default_admin():
    """Create default admin user on first startup if none exists."""
    from .database import SessionLocal
    from .models import AdminUser
    db = SessionLocal()
    try:
        existing = db.query(AdminUser).filter(AdminUser.username == "admin").first()
        if not existing:
            admin = AdminUser(
                username="admin",
                hashed_password=hash_password("fuegodance2024"),
            )
            db.add(admin)
            db.commit()
            print("✅ Default admin user created (admin / fuegodance2024)")
    finally:
        db.close()
