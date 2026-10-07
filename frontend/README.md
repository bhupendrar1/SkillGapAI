# SkillGapAI Frontend

React + Vite frontend for **“An Explainable AI-Based System for Skill Gap Analysis”**.

## Features
- **Clean Academic UI**: Built with Tailwind CSS and Lucide React icons.
- **Interactive Methodology Flow**: Step-by-step visual diagram explaining the 7-stage research pipeline.
- **Two-Column Input**: PyMuPDF-compatible PDF resume upload, direct text alternative, and 1-click Demo Data loader.
- **Results Dashboard**:
  - 4 Key Metrics (Overall Match, Matched, Partial, Missing) dynamically generated from backend.
  - Section 1: Overall Skill Match with dynamic mathematical formula documentation.
  - Section 2: Skill Summary columns (Matched, Partial, Missing).
  - Section 3: Comparative Skill Analysis table with evidence snippet inspection.
  - Section 4: Explainable AI (XAI) rationale cards for every competency.
  - Section 5: Rule-based deterministic learning curriculum for missing/partial skills.
  - Section 6: Research evaluation placeholder avoiding fake metrics.

## Quick Start

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

App runs at: `http://localhost:5173`
Connects to backend at: `http://127.0.0.1:8000/api`
