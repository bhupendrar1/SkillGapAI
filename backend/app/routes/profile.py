"""
User Profile and Analysis History Routes.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import json

from app.db.database import get_db_connection
from app.utils.auth_helper import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    bio: Optional[str] = None
    experience_level: Optional[str] = None
    skills_list: Optional[str] = None


@router.get("")
@router.get("/")
def get_user_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db_connection()
    user = conn.execute("SELECT id, email, full_name, role, plan, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
    profile = conn.execute("SELECT target_role, bio, experience_level, skills_list, updated_at FROM profiles WHERE user_id = ?", (user_id,)).fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    profile_dict = dict(profile) if profile else {
        "target_role": "Software Developer",
        "bio": "",
        "experience_level": "Entry-Level",
        "skills_list": ""
    }

    return {
        "user": dict(user),
        "profile": profile_dict
    }


@router.put("")
@router.put("/")
def update_user_profile(data: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()

    if data.full_name is not None and data.full_name.strip():
        cursor.execute("UPDATE users SET full_name = ? WHERE id = ?", (data.full_name.strip(), user_id))

    cursor.execute("""
        INSERT INTO profiles (user_id, target_role, bio, experience_level, skills_list, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
            target_role = coalesce(?, target_role),
            bio = coalesce(?, bio),
            experience_level = coalesce(?, experience_level),
            skills_list = coalesce(?, skills_list),
            updated_at = CURRENT_TIMESTAMP
    """, (
        user_id,
        data.target_role or "Software Developer",
        data.bio or "",
        data.experience_level or "Entry-Level",
        data.skills_list or "",
        data.target_role,
        data.bio,
        data.experience_level,
        data.skills_list
    ))

    conn.commit()
    conn.close()

    return {"success": True, "message": "Profile updated successfully."}


@router.get("/history")
def get_analysis_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT id, target_role, resume_source, overall_match, matched_skills, partial_skills, missing_skills, created_at
        FROM analyses
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 20
    """, (user_id,)).fetchall()
    conn.close()

    history = []
    for row in rows:
        history.append({
            "id": row["id"],
            "target_role": row["target_role"],
            "resume_source": row["resume_source"],
            "overall_match": row["overall_match"],
            "matched_skills": json.loads(row["matched_skills"]) if row["matched_skills"] else [],
            "partial_skills": json.loads(row["partial_skills"]) if row["partial_skills"] else [],
            "missing_skills": json.loads(row["missing_skills"]) if row["missing_skills"] else [],
            "created_at": row["created_at"]
        })

    return {"success": True, "history": history}
