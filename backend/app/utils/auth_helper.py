"""
Authentication and JWT helpers.
"""

import os
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Header, Depends
from app.db.database import get_db_connection

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "skillgap-research-xai-prototype-jwt-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT token."""
    to_encode = data.copy()
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception as e:
        return None


def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """
    Extracts current user if Authorization Bearer header is present.
    Returns None if missing or invalid without raising exception.
    """
    if not authorization:
        return None
    try:
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None
        token = parts[1]
        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            return None
        
        user_id = int(payload["sub"])
        conn = get_db_connection()
        user = conn.execute("SELECT id, email, full_name, role, plan FROM users WHERE id = ?", (user_id,)).fetchone()
        conn.close()
        if user:
            return dict(user)
        return None
    except Exception:
        return None


def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Requires a valid logged-in user. Raises 401 if unauthorized.
    """
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in."
        )
    return user


def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Requires the current user to have 'admin' role.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this endpoint."
        )
    return current_user
