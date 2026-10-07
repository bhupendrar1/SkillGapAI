"""
Chatbot Endpoints: Context-Aware AI Skill Coach & Career Advisor.
Provides grounded learning guidance, interview prep, and gap explanations.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import re

from app.db.database import get_db_connection
from app.utils.auth_helper import get_current_user_optional
from app.ml.skill_normalizer import get_skill_normalizer

router = APIRouter(prefix="/chat", tags=["AI Skill Coach Chatbot"])


class ChatMessageRequest(BaseModel):
    message: str
    analysis_context: Optional[Dict[str, Any]] = None


def generate_coach_response(user_message: str, context: Optional[Dict[str, Any]]) -> str:
    """
    Generates intelligent, grounded career advice based on the skill taxonomy
    and the candidate's latest analysis context.
    """
    msg = user_message.lower().strip()
    normalizer = get_skill_normalizer()

    # Extract any context details if provided
    role = context.get("target_role", "Software Developer") if context else "Software Developer"
    matched = context.get("matched_skills", []) if context else []
    missing = context.get("missing_skills", []) if context else []
    partial = context.get("partial_skills", []) if context else []
    score = context.get("overall_match", None) if context else None

    # Intent 1: "Explain my score" or "Why this match score?"
    if any(q in msg for q in ["score", "why", "formula", "calculate", "percentage", "low", "overall"]):
        if score is not None:
            explanation = (
                f"Your overall skill match for **{role}** is **{score}%**.\n\n"
                f"Here is how this was dynamically computed:\n"
                f"- **{len(matched)} Matched Skills** contributed 1.0 each ({', '.join(matched) if matched else 'None'}).\n"
                f"- **{len(partial)} Partially Matched Skills** contributed 0.5 each ({', '.join(partial) if partial else 'None'}).\n"
                f"- **{len(missing)} Missing Skills** contributed 0.0 ({', '.join(missing) if missing else 'None'}).\n\n"
                f"**Formula:** `((Matched * 1.0 + Partial * 0.5) / Total) * 100`.\n\n"
                f"To boost your score to 80%+, focus on bridging your primary missing competencies: **{', '.join(missing[:2])}**."
            )
            return explanation

    # Intent 2: Questions about specific skills (e.g., Docker, AWS, React, etc.)
    all_canonicals = normalizer.get_all_canonical_names()
    matched_skill_in_query = None
    for s in all_canonicals:
        if s.lower() in msg:
            matched_skill_in_query = s
            break

    if matched_skill_in_query:
        meta = normalizer.get_canonical_metadata(matched_skill_in_query)
        recs = meta.get("learning_recommendations", []) if meta else []
        
        status_note = ""
        if matched_skill_in_query in missing:
            status_note = f" (Identified as a **Missing Skill** in your latest analysis for {role})"
        elif matched_skill_in_query in partial:
            status_note = f" (Identified as a **Partially Matched Skill** in your profile)"
        elif matched_skill_in_query in matched:
            status_note = f" (You already have verified evidence for this in your resume!)"

        response = (
            f"Here is a recommended learning roadmap for **{matched_skill_in_query}**{status_note}:\n\n"
        )
        if recs:
            for i, topic in enumerate(recs, 1):
                response += f"**Step {i}:** {topic}\n"
        else:
            response += (
                f"- Understand {matched_skill_in_query} fundamentals and core architecture.\n"
                f"- Build a hands-on portfolio project applying {matched_skill_in_query}.\n"
                f"- Review common design patterns and best practices.\n"
            )

        response += (
            f"\n💡 *Coach Tip:* Start by building a mini-project that connects {matched_skill_in_query} with "
            f"your existing strengths ({matched[0] if matched else 'your primary languages'})."
        )
        return response

    # Intent 3: Interview questions prep
    if any(q in msg for q in ["interview", "questions", "prepare", "prep"]):
        target_focus = missing[0] if missing else (partial[0] if partial else "Core CS")
        return (
            f"Here are 3 key technical interview questions to practice for your target role (**{role}**), "
            f"focusing on your skill gap in **{target_focus}**:\n\n"
            f"1. **Conceptual:** How does {target_focus} work under the hood, and what problems does it solve?\n"
            f"2. **Scenario:** Can you describe a situation where you would choose {target_focus} over alternatives?\n"
            f"3. **Practical:** Walk me through how you would configure and troubleshoot a deployment using {target_focus}.\n\n"
            f"Practice explaining your thought process clearly using the STAR (Situation, Task, Action, Result) method!"
        )

    # Intent 4: Study plan / roadmap
    if any(q in msg for q in ["roadmap", "study plan", "week", "learn", "how to start"]):
        top_gaps = missing[:3] if missing else ["Docker", "AWS", "System Design"]
        return (
            f"Here is a structured 3-Week Accelerated Upskilling Plan for **{role}**:\n\n"
            f"📅 **Week 1 — {top_gaps[0] if len(top_gaps) > 0 else 'Containerization'}:** Focus on fundamentals, local CLI setup, and creating your first containers/images.\n"
            f"📅 **Week 2 — {top_gaps[1] if len(top_gaps) > 1 else 'Cloud Basics'}:** Deploy your application to cloud instances, configure storage, and manage environment secrets.\n"
            f"📅 **Week 3 — {top_gaps[2] if len(top_gaps) > 2 else 'Architecture'}:** Integrate services with a clean REST API and review system scalability trade-offs.\n\n"
            f"Need specific tutorials or docs on any of these topics? Ask me anytime!"
        )

    # Default fallback career advice
    return (
        f"Hello! I am your **SkillGap AI Coach**.\n\n"
        f"I can help you:\n"
        f"• **Explain your match score** and why certain skills were classified as Matched, Partial, or Missing.\n"
        f"• **Generate step-by-step learning roadmaps** for skills like Docker, AWS, React, Node.js, and System Design.\n"
        f"• **Provide technical interview questions** to prepare for your target role (**{role}**).\n\n"
        f"Try asking: *'How do I learn Docker from scratch?'* or *'Explain why my match score was calculated this way.'*"
    )


@router.post("/message")
def send_chat_message(
    data: ChatMessageRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    user_msg = data.message.strip()
    coach_reply = generate_coach_response(user_msg, data.analysis_context)

    # Persist in DB if logged in
    if current_user:
        user_id = current_user["id"]
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO chat_messages (user_id, sender, message) VALUES (?, 'user', ?)", (user_id, user_msg))
        cursor.execute("INSERT INTO chat_messages (user_id, sender, message) VALUES (?, 'assistant', ?)", (user_id, coach_reply))
        conn.commit()
        conn.close()

    return {
        "reply": coach_reply,
        "sender": "assistant"
    }


@router.get("/history")
def get_chat_history(current_user: Optional[dict] = Depends(get_current_user_optional)):
    if not current_user:
        return {"messages": []}

    user_id = current_user["id"]
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT id, sender, message, created_at
        FROM chat_messages
        WHERE user_id = ?
        ORDER BY created_at ASC
        LIMIT 50
    """, (user_id,)).fetchall()
    conn.close()

    return {"messages": [dict(r) for r in rows]}

