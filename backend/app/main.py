"""
SkillGapAI: An Explainable AI-Based System for Skill Gap Analysis
Main FastAPI Application Entry Point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routes.analyze import router as analyze_router
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.admin import router as admin_router
from app.routes.payment import router as payment_router
from app.routes.chat import router as chat_router

from app.ml.semantic_matcher import get_semantic_matcher
from app.ml.skill_extractor import get_skill_extractor
from app.db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite Database & seed accounts
    print("[INFO] Initializing SQLite database...")
    init_db()
    print("[SUCCESS] Database tables and default accounts verified.")

    # Preload ML models during startup for snappy inference
    print("[INFO] Initializing SkillGapAI ML Pipeline...")
    get_skill_extractor()
    matcher = get_semantic_matcher()
    _ = matcher.model
    print("[SUCCESS] SentenceTransformer (all-MiniLM-L6-v2) ready.")
    yield
    print("[INFO] Shutting down SkillGapAI service.")


app = FastAPI(
    title="An Explainable AI-Based System for Skill Gap Analysis",
    description="Academic Research Prototype API demonstrating an end-to-end Explainable AI pipeline with Authentication, User Profiles, Admin Panel, Payment, and AI Coach Chatbot.",
    version="1.1.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(analyze_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(payment_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/")
def root():
    return {
        "title": "An Explainable AI-Based System for Skill Gap Analysis",
        "description": "Academic Research Prototype",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "features": [
            "Explainable AI Skill Gap Pipeline",
            "JWT Authentication (Login / Signup)",
            "User Profiles & History",
            "Admin Panel & Threshold Settings",
            "Payment & Pro Subscriptions",
            "AI Career Coach Chatbot"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
