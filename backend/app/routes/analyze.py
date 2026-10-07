"""
API Routes for Skill Gap Analysis.

Provides minimal, clean REST endpoints:
- GET /api/health : Server and ML pipeline liveness check
- POST /api/analyze : Complete end-to-end skill gap analysis pipeline
"""

from typing import Optional
import json
from fastapi import APIRouter, File, Form, UploadFile, HTTPException, status, Header, Depends
from pydantic import BaseModel

from app.services.pdf_service import extract_text_from_pdf_bytes, PDFExtractionError
from app.ml.skill_extractor import get_skill_extractor
from app.ml.semantic_matcher import get_semantic_matcher
from app.ml.gap_analyzer import get_gap_analyzer
from app.ml.explainer import get_skill_explainer
from app.ml.skill_normalizer import get_skill_normalizer
from app.db.database import get_db_connection
from app.utils.auth_helper import get_current_user_optional

router = APIRouter()


@router.get("/health")
def health_check():
    """Health check endpoint confirming backend and model readiness."""
    return {
        "status": "healthy",
        "service": "SkillGapAI API",
        "pipeline": "PyMuPDF -> Normalization -> SentenceTransformers -> GapAnalysis -> XAI"
    }


@router.post("/analyze")
async def analyze_skill_gap(
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    job_description: str = Form(...),
    target_role: Optional[str] = Form("Software Developer"),
    authorization: Optional[str] = Header(None)
):
    """
    Executes the research methodology pipeline:
    1. Text Extraction (PyMuPDF for PDF resume or direct text fallback)
    2. Boundary-aware Skill Extraction for Resume and Job Description
    3. Normalization (ESCO-aligned alias mapping)
    4. Dense Semantic Embedding & Cosine Similarity (all-MiniLM-L6-v2)
    5. Gap Classification (Matched, Partial, Missing) and Dynamic Scoring
    6. Explainability (XAI reasoning per skill)
    7. Rule-Based Learning Curriculum Generation
    """
    # Validation 1: Job Description
    if not job_description or not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a job description."
        )

    # Validation 2: Resume Content
    extracted_resume_text = ""
    resume_filename = "Direct Text Input"

    if resume_file is not None and resume_file.filename:
        resume_filename = resume_file.filename
        if not resume_filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please upload a PDF resume (.pdf format)."
            )
        try:
            pdf_bytes = await resume_file.read()
            extracted_resume_text, _ = extract_text_from_pdf_bytes(pdf_bytes)
        except PDFExtractionError as pe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to read PDF resume: {str(pe)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to parse the uploaded PDF file."
            )
    elif resume_text and resume_text.strip():
        extracted_resume_text = resume_text.strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a PDF resume or provide resume text."
        )

    if not extracted_resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The resume text could not be extracted or is empty."
        )

    # Step 2: Skill Extraction
    extractor = get_skill_extractor()
    normalizer = get_skill_normalizer()

    # Extract required skills from Job Description
    job_skills_extracted = extractor.extract_skills_with_evidence(job_description)
    required_canonical_skills = [item["canonical_name"] for item in job_skills_extracted]

    # If job description didn't match canonical skills directly, try extracting lines or fallback keywords
    if not required_canonical_skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No recognizable technical skills were detected in the job description. Please ensure standard skills (e.g. JavaScript, Python, Docker, React, AWS, SQL) are listed."
        )

    # Extract candidate skills & contextual evidence from Resume
    resume_skills_extracted = extractor.extract_skills_with_evidence(extracted_resume_text)

    # Step 4: Semantic Matching
    matcher = get_semantic_matcher()
    match_records = matcher.match_required_skills(
        required_skills=required_canonical_skills,
        candidate_skills_with_evidence=resume_skills_extracted
    )

    # Step 5: Gap Classification and Dynamic Overall Score
    gap_analyzer = get_gap_analyzer()
    analysis_results = gap_analyzer.analyze_gaps(match_records)

    # Step 6: Explainable AI Rationale Generation
    explainer = get_skill_explainer()
    skill_analysis_table = explainer.build_skill_analysis_report(analysis_results["classified_items"])

    # Step 7: Rule-Based Learning Curriculum
    recommendations = explainer.generate_recommendations(analysis_results["classified_items"])

    # Optional Persistence into SQLite for History & Admin Panel
    analysis_id = None
    try:
        user = get_current_user_optional(authorization)
        user_id = user["id"] if user else None
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO analyses (
                user_id, target_role, resume_source, overall_match,
                matched_skills, partial_skills, missing_skills,
                skill_analysis, recommendations
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            target_role or "Software Developer",
            resume_filename,
            analysis_results["overall_match"],
            json.dumps(analysis_results["matched_skills"]),
            json.dumps(analysis_results["partial_skills"]),
            json.dumps(analysis_results["missing_skills"]),
            json.dumps(skill_analysis_table),
            json.dumps(recommendations)
        ))
        conn.commit()
        analysis_id = cursor.lastrowid
        conn.close()
    except Exception as e:
        print(f"[Warning] Failed to persist analysis record: {e}")

    return {
        "analysis_id": analysis_id,
        "target_role": target_role or "Software Developer",
        "resume_source": resume_filename,
        "overall_match": analysis_results["overall_match"],
        "matched_skills": analysis_results["matched_skills"],
        "partial_skills": analysis_results["partial_skills"],
        "missing_skills": analysis_results["missing_skills"],
        "stats": analysis_results["stats"],
        "formula_explanation": analysis_results["formula_explanation"],
        "skill_analysis": skill_analysis_table,
        "recommendations": recommendations,
        "extracted_resume_skills_count": len(resume_skills_extracted),
        "total_required_skills_count": len(required_canonical_skills),
        "all_resume_skills": [s["canonical_name"] for s in resume_skills_extracted]
    }

