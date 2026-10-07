# SkillGapAI Backend

An Explainable AI-Based System for Skill Gap Analysis — Academic Prototype API.

## Research Pipeline Modules
1. **PyMuPDF Service (`app/services/pdf_service.py`)**: Extracts raw resume text from uploaded PDF documents.
2. **Skill Extractor (`app/ml/skill_extractor.py`)**: Identifies technical skills and context sentences.
3. **Skill Normalizer (`app/ml/skill_normalizer.py`)**: Normalizes skill variants/aliases to canonical forms (ESCO-aligned).
4. **Semantic Matcher (`app/ml/semantic_matcher.py`)**: Uses `sentence-transformers/all-MiniLM-L6-v2` and scikit-learn cosine similarity.
5. **Gap Analyzer (`app/ml/gap_analyzer.py`)**: Classifies skills into Matched (>=0.70), Partial (0.50-0.69), and Missing (<0.50), dynamically computing overall match score.
6. **Explainer (`app/ml/explainer.py`)**: Generates evidence-grounded Explainable AI (XAI) rationale and rule-based learning roadmaps.

## Setup & Running

```bash
cd backend

# Create virtual environment (optional)
python -m venv venv

# Windows activation
venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --port 8000
```

- API Base: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

