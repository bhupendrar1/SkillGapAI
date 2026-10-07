"""
Payment and Subscription Checkout Endpoints.
Provides simulated payment processing and transaction ledger for plan upgrades.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import uuid

from app.db.database import get_db_connection
from app.utils.auth_helper import get_current_user

router = APIRouter(prefix="/payment", tags=["Payment & Subscriptions"])


class CheckoutRequest(BaseModel):
    plan_name: str
    amount: float
    card_last4: str = "4242"
    payment_method: str = "card"


@router.get("/plans")
def get_plans():
    return {
        "plans": [
            {
                "id": "free",
                "name": "Academic Free",
                "price": 0,
                "billing": "Forever free",
                "features": [
                    "Standard PDF Resume Analysis",
                    "Core 7-Step Explainable AI Pipeline",
                    "Baseline Classification Thresholds",
                    "Basic Learning Recommendations"
                ],
                "recommended": False
            },
            {
                "id": "pro",
                "name": "Researcher Pro",
                "price": 19,
                "billing": "per month (or $9 student discount)",
                "features": [
                    "Unlimited Resume & Job Analyses",
                    "Interactive AI Career & Skill Coach Chatbot",
                    "Detailed Evidence Sentence Extraction Drawer",
                    "Full History Storage & Comparative Tracking",
                    "Priority SentenceTransformer Embedding Inference"
                ],
                "recommended": True
            },
            {
                "id": "enterprise",
                "name": "University Lab",
                "price": 49,
                "billing": "per month / lab license",
                "features": [
                    "Multi-seat Student Cohort Access",
                    "Custom ESCO Skill Taxonomy Upload",
                    "Threshold Ablation Testing Tool",
                    "Bulk PDF Processing REST API",
                    "Dedicated Viva Presentation Support"
                ],
                "recommended": False
            }
        ]
    }


@router.post("/checkout")
def process_checkout(data: CheckoutRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    tx_id = f"tx_{uuid.uuid4().hex[:12]}"

    conn = get_db_connection()
    cursor = conn.cursor()

    # Record payment transaction
    cursor.execute("""
        INSERT INTO payments (user_id, plan_name, amount, currency, transaction_id, status, card_last4)
        VALUES (?, ?, ?, 'USD', ?, 'completed', ?)
    """, (user_id, data.plan_name, data.amount, tx_id, data.card_last4[-4:] if len(data.card_last4) >= 4 else "4242"))

    # Upgrade user to 'pro' plan
    cursor.execute("UPDATE users SET plan = 'pro' WHERE id = ?", (user_id,))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": f"Payment successfully processed for {data.plan_name} plan!",
        "transaction": {
            "transaction_id": tx_id,
            "plan_name": data.plan_name,
            "amount": data.amount,
            "currency": "USD",
            "status": "completed",
            "card_last4": data.card_last4[-4:] if len(data.card_last4) >= 4 else "4242"
        },
        "user_plan": "pro"
    }


@router.get("/history")
def get_payment_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT id, plan_name, amount, currency, transaction_id, status, card_last4, created_at
        FROM payments
        WHERE user_id = ?
        ORDER BY created_at DESC
    """, (user_id,)).fetchall()
    conn.close()

    return {"payments": [dict(r) for r in rows]}

