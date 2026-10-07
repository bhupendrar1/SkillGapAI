"""
Authentication Endpoints: Signup, Login, and Me.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from app.db.database import get_db_connection, hash_password, verify_password
from app.utils.auth_helper import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(data: SignupRequest):
    email = data.email.strip().lower()
    full_name = data.full_name.strip()
    password = data.password

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="A valid email address is required.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if not full_name:
        raise HTTPException(status_code=400, detail="Full name is required.")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check existing
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed = hash_password(password)
    cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, role, plan)
        VALUES (?, ?, ?, 'user', 'free')
    """, (email, hashed, full_name))
    user_id = cursor.lastrowid

    # Create associated blank profile
    cursor.execute("""
        INSERT INTO profiles (user_id, target_role, bio, experience_level, skills_list)
        VALUES (?, 'Software Developer', '', 'Entry-Level', '')
    """, (user_id,))

    conn.commit()
    conn.close()

    token = create_access_token({"sub": str(user_id), "email": email, "role": "user"})
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "role": "user",
            "plan": "free"
        }
    }


@router.post("/login")
def login(data: LoginRequest):
    email = data.email.strip().lower()
    password = data.password

    conn = get_db_connection()
    user = conn.execute("SELECT id, email, password_hash, full_name, role, plan FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()

    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": str(user["id"]), "email": user["email"], "role": user["role"]})
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "plan": user["plan"]
        }
    }


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "user": current_user
    }
