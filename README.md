# An Explainable AI-Based System for Skill Gap Analysis

**Academic Research Prototype & Platform**

A complete, explainable prototype and platform implementing an end-to-end NLP and dense semantic matching pipeline to compare candidate resume skills against job requirements, classify skill gaps, explain why each classification was made, and recommend deterministic learning curricula.

Now enhanced with **JWT Authentication**, **User Profiles & History**, an **Admin Operations Panel**, **Payment & Subscriptions**, and a **Context-Aware AI Career Coach Chatbot**.

---

## Core Research Methodology Pipeline

The application directly demonstrates this 7-step pipeline:

```
Resume PDF + Job Description Text
              ↓
  1. Text Extraction (PyMuPDF)
              ↓
  2. Skill Extraction (Boundary-aware pattern matching & sentence context)
              ↓
  3. Skill Normalization (ESCO-aligned canonical mapping: React.js → React)
              ↓
  4. Semantic Matching (SentenceTransformer all-MiniLM-L6-v2 + Cosine Similarity)
              ↓
  5. Skill Gap Detection (Matched ≥ 0.70, Partial 0.50–0.69, Missing < 0.50)
              ↓
  6. Explainable AI (Evidence-grounded rationale answering "Why this result?")
              ↓
  7. Learning Recommendation (Deterministic rule-based curricula for gaps)
```

---

## New Platform Features

### 1. Authentication (Login / Signup)
- Secure JWT (JSON Web Tokens) with hashed passwords using `bcrypt`.
- Pre-seeded 1-Click Demo Accounts for viva & mentor presentations:
  - **Supervisor / Admin:** `admin@skillgap.ai` / `Admin@123`
  - **Student / Candidate:** `student@example.com` / `Student@123`

### 2. User Profiles & Saved History
- View and update career role, bio, experience level, and known skills inventory.
- Complete persistent analysis history saved to local SQLite database (`data/skillgap.db`).
- 1-click **"View"** past analyses to reload complete analytical dashboard.

### 3. Admin Operations Panel
- Accessible to users with `admin` role.
- **Platform Telemetry:** Total registered users, total analyses run, active subscriptions, and revenue.
- **User Management:** View all accounts, toggle user roles (`user` $\leftrightarrow$ `admin`), and upgrade/downgrade plans.
- **Global Analysis Logs:** Real-time log of recent candidate analyses across the platform.
- **Threshold Sensitivity Ablation:** Dynamically adjust `MATCHED_THRESHOLD` and `PARTIAL_THRESHOLD` sliders for research sensitivity experiments without restarting the server!

### 4. Payment & Subscriptions (Mock / Sandboxed)
- Three transparent tiers:
  - **Academic Free:** $0/mo (Core 7-step Explainable AI pipeline)
  - **Researcher Pro:** $19/mo (Unlimited analyses, full AI Coach guidance, saved history)
  - **University Lab:** $49/mo (Multi-seat cohort license, custom ESCO taxonomy upload)
- Sandboxed credit card checkout simulation with instant ledger receipt generation and automated user plan upgrade.

### 5. Context-Aware AI Skill Coach Chatbot
- Floating interactive coach widget located at the bottom-right.
- Contextually aware of candidate profile and latest analysis results.
- Provides grounded, evidence-backed answers to:
  - *"Why was my match score calculated like this?"*
  - *"How do I learn Docker from scratch?"*
  - *"Give me 3 technical interview questions for my gaps"*
  - *"Recommend a 3-week study roadmap"*

---

## Dynamic Overall Match Formula

The overall match score is calculated dynamically (never hardcoded):

$$\text{Overall Match (\%)} = \left( \frac{\text{Matched} \times 1.0 + \text{Partial} \times 0.5 + \text{Missing} \times 0.0}{\text{Total Required Skills}} \right) \times 100$$

- **Matched skills**: Full contribution ($1.0$)
- **Partial skills**: Partial contribution ($0.5$)
- **Missing skills**: Zero contribution ($0.0$)

---

## Project Structure

```
skill-gap-analysis/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Brand, status, user avatar dropdown & auth buttons
│   │   │   ├── FlowPipeline.jsx    # Visual 7-step research methodology diagram
│   │   │   ├── SkillBadge.jsx      # Matched, Partial, Missing badge indicators
│   │   │   ├── AuthModal.jsx       # Login/Signup modal with 1-click demo filler
│   │   │   ├── PaymentModal.jsx    # Subscription plans & mock checkout
│   │   │   ├── ChatbotWidget.jsx   # Floating AI Coach Chatbot
│   │   │   └── Footer.jsx          # Prototype credits & research disclaimers
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Clean landing page + viva guide card
│   │   │   ├── InputPage.jsx       # 2-column PDF upload + JD input + 1-click Demo Data
│   │   │   ├── ResultsPage.jsx     # 4 KPI cards + 5 core analytical sections
│   │   │   ├── ProfilePage.jsx     # Profile management & analysis history
│   │   │   └── AdminPage.jsx       # Admin dashboard & threshold ablation
│   │   ├── services/
│   │   │   └── api.js              # Full Axios API client with JWT interceptor
│   │   ├── App.jsx                 # Routing, state, and modal management
│   │   ├── main.jsx
│   │   └── index.css               # Tailwind CSS v4 styling
│   ├── public/
│   │   └── sample_resume.pdf       # Pre-generated sample PDF for viva demo
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, SQLite lifecycle, and router registration
│   │   ├── db/
│   │   │   └── database.py         # SQLite schema & seed account generator
│   │   ├── routes/
│   │   │   ├── analyze.py          # GET /api/health and POST /api/analyze
│   │   │   ├── auth.py             # Signup, Login, and Me
│   │   │   ├── profile.py          # User Profile & Analysis History
│   │   │   ├── admin.py            # Platform stats, users, and threshold ablation
│   │   │   ├── payment.py          # Subscription plans & mock checkout
│   │   │   └── chat.py             # Context-aware AI Coach chatbot
│   │   ├── services/
│   │   │   └── pdf_service.py      # PyMuPDF text extraction & sanitization
│   │   ├── ml/
│   │   │   ├── skill_extractor.py  # Boundary-aware skill and evidence sentence extractor
│   │   │   ├── skill_normalizer.py # ESCO-aligned alias dictionary normalizer
│   │   │   ├── semantic_matcher.py # SentenceTransformer (all-MiniLM-L6-v2) cosine matcher
│   │   │   ├── gap_analyzer.py     # Threshold classifier & dynamic formula evaluator
│   │   │   └── explainer.py        # Explainable AI (XAI) reasoning & recommendations
│   │   └── utils/
│   │       ├── config.py           # Configurable research thresholds & weights
│   │       └── auth_helper.py      # JWT token & role authorization utilities
│   ├── data/
│   │   ├── skills.json             # Canonical skills, aliases, categories, and curricula
│   │   ├── skillgap.db             # SQLite local database
│   │   ├── sample_resume.pdf       # Pre-generated test resume
│   │   └── sample_job_description.txt
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── README.md                       # Root documentation with startup guide
└── .gitignore                      # Git ignore rules for Python, Node, & environments
```

---

## How to Run the Application

### Terminal 1: Run Backend (FastAPI)

```bash
cd backend

# Create virtual environment (optional)
python -m venv venv

# Windows activation:
venv\Scripts\activate

# Linux / macOS activation:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Run server:
uvicorn app.main:app --reload
```

- Backend API: **http://127.0.0.1:8000**
- Interactive Swagger Docs: **http://127.0.0.1:8000/docs**

---

### Terminal 2: Run Frontend (React + Vite)

```bash
cd frontend

# Install frontend packages:
npm install

# Start Vite dev server:
npm run dev
```

- Frontend URL: **http://localhost:5173**

---

## Pre-Seeded Demo Accounts

| Account Type | Email | Password | Role | Plan |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin (Supervisor)** | `admin@skillgap.ai` | `Admin@123` | `admin` | `pro` |
| **Student (Candidate)** | `student@example.com` | `Student@123` | `user` | `free` |

Click **"Sign In / Demo"** on the top navigation bar and select either demo account button to sign in instantly with one click.
