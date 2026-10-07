"""
Admin Dashboard Endpoints for System Oversight, User Management, and Research Ablation.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import json

from app.db.database import get_db_connection
from app.utils.auth_helper import require_admin
import app.utils.config as config

router = APIRouter(prefix="/admin", tags=["Admin Panel"])


class UserRoleUpdateRequest(BaseModel):
    role: Optional[str] = None
    plan: Optional[str] = None


class ThresholdUpdateRequest(BaseModel):
    matched_threshold: float
    partial_threshold: float


@router.get("/stats")
def get_admin_stats(admin_user: dict = Depends(require_admin)):
    conn = get_db_connection()
    total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    total_analyses = conn.execute("SELECT COUNT(*) FROM analyses").fetchone()[0]
    total_pro = conn.execute("SELECT COUNT(*) FROM users WHERE plan = 'pro'").fetchone()[0]
    total_revenue = conn.execute("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed'").fetchone()[0]
    recent_signups = conn.execute("SELECT id, email, full_name, role, plan, created_at FROM users ORDER BY created_at DESC LIMIT 5").fetchall()
    conn.close()

    return {
        "stats": {
            "total_users": total_users,
            "total_analyses": total_analyses,
            "total_pro_subscribers": total_pro,
            "total_revenue_usd": round(float(total_revenue), 2),
            "model_name": config.EMBEDDING_MODEL_NAME,
            "matched_threshold": config.MATCHED_THRESHOLD,
            "partial_threshold": config.PARTIAL_THRESHOLD
        },
        "recent_signups": [dict(u) for u in recent_signups]
    }


@router.get("/users")
def get_all_users(admin_user: dict = Depends(require_admin)):
    conn = get_db_connection()
    users = conn.execute("""
        SELECT u.id, u.email, u.full_name, u.role, u.plan, u.created_at,
               p.target_role, p.experience_level
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        ORDER BY u.id DESC
    """).fetchall()
    conn.close()
    return {"users": [dict(u) for u in users]}


@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, data: UserRoleUpdateRequest, admin_user: dict = Depends(require_admin)):
    conn = get_db_connection()
    cursor = conn.cursor()

    if data.role:
        if data.role not in ["user", "admin"]:
            conn.close()
            raise HTTPException(status_code=400, detail="Invalid role. Must be 'user' or 'admin'.")
        cursor.execute("UPDATE users SET role = ? WHERE id = ?", (data.role, user_id))

    if data.plan:
        if data.plan not in ["free", "pro"]:
            conn.close()
            raise HTTPException(status_code=400, detail="Invalid plan. Must be 'free' or 'pro'.")
        cursor.execute("UPDATE users SET plan = ? WHERE id = ?", (data.plan, user_id))

    conn.commit()
    conn.close()
    return {"success": True, "message": "User updated successfully."}


@router.get("/analyses")
def get_all_analyses(admin_user: dict = Depends(require_admin)):
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT a.id, a.user_id, u.email, a.target_role, a.resume_source, a.overall_match,
               a.matched_skills, a.partial_skills, a.missing_skills, a.created_at
        FROM analyses a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 50
    """).fetchall()
    conn.close()

    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "user_id": r["user_id"],
            "user_email": r["email"] or "Anonymous Visitor",
            "target_role": r["target_role"],
            "resume_source": r["resume_source"],
            "overall_match": r["overall_match"],
            "matched_skills": json.loads(r["matched_skills"]) if r["matched_skills"] else [],
            "partial_skills": json.loads(r["partial_skills"]) if r["partial_skills"] else [],
            "missing_skills": json.loads(r["missing_skills"]) if r["missing_skills"] else [],
            "created_at": r["created_at"]
        })

    return {"analyses": results}


@router.get("/settings")
def get_threshold_settings(admin_user: dict = Depends(require_admin)):
    return {
        "matched_threshold": config.MATCHED_THRESHOLD,
        "partial_threshold": config.PARTIAL_THRESHOLD,
        "embedding_model": config.EMBEDDING_MODEL_NAME
    }


@router.put("/settings")
def update_threshold_settings(data: ThresholdUpdateRequest, admin_user: dict = Depends(require_admin)):
    if not (0.0 <= data.partial_threshold < data.matched_threshold <= 1.0):
        raise HTTPException(
            status_code=400,
            detail="Thresholds must satisfy: 0.0 <= Partial < Matched <= 1.0"
        )

    config.MATCHED_THRESHOLD = data.matched_threshold
    config.PARTIAL_THRESHOLD = data.partial_threshold

    return {
        "success": True,
        "message": "Research classification thresholds updated dynamically for ablation experiments.",
        "matched_threshold": config.MATCHED_THRESHOLD,
        "partial_threshold": config.PARTIAL_THRESHOLD
    }

