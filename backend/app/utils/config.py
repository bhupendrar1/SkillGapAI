"""
Configuration and Research Hyperparameters for SkillGapAI.

IMPORTANT RESEARCH NOTE:
The classification thresholds defined here represent initial baseline prototype
parameters chosen for research demonstration. They provide a transparent, 
configurable foundation for upcoming empirical ablation studies and sensitivity 
analyses. They are NOT claimed as universal ground-truth constants.
"""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
SKILLS_JSON_PATH = DATA_DIR / "skills.json"

# Transformer Embedding Model
# Selected: all-MiniLM-L6-v2 (Lightweight, 384-dimensional, fast on CPU for interactive prototype inference)
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")

# Classification Thresholds (Prototype Baseline)
# Threshold >= 0.70 : Matched
# Threshold 0.50 - 0.69 : Partially Matched
# Threshold < 0.50 : Missing
MATCHED_THRESHOLD = float(os.getenv("MATCHED_THRESHOLD", "0.70"))
PARTIAL_THRESHOLD = float(os.getenv("PARTIAL_THRESHOLD", "0.50"))

# Scoring Weights for Overall Match Formula
# Formula: Overall Match % = ((Matched * 1.0 + Partial * 0.5) / Total Required Skills) * 100
MATCHED_WEIGHT = 1.0
PARTIAL_WEIGHT = 0.5
MISSING_WEIGHT = 0.0

# Server Configuration
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))
CORS_ORIGINS = ["*"]

