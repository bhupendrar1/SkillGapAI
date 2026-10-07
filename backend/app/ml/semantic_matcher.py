"""
Semantic Matcher Module using Sentence Transformers and Scikit-Learn.

Academic Purpose:
Performs dense vector semantic comparison between job-required competencies
and candidate resume profile evidence.
Transforms skill text into 384-dimensional dense embeddings using:
`sentence-transformers/all-MiniLM-L6-v2`.
Computes cosine similarity to capture conceptual relatedness beyond exact keyword matching:
- High similarity (e.g. React <-> React.js ~0.88)
- Partial semantic similarity (e.g. Node.js <-> Express.js ~0.64)
- Low similarity (e.g. Docker <-> HTML ~0.18)
"""

from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

from app.utils.config import EMBEDDING_MODEL_NAME


class SemanticMatcher:
    def __init__(self, model_name: str = EMBEDDING_MODEL_NAME):
        self.model_name = model_name
        self._model: Optional[SentenceTransformer] = None

    @property
    def model(self) -> SentenceTransformer:
        """Lazy loads SentenceTransformer singleton."""
        if self._model is None:
            self._model = SentenceTransformer(self.model_name)
        return self._model

    def compute_similarity(self, text_a: str, text_b: str) -> float:
        """Calculates cosine similarity between two text strings."""
        if not text_a or not text_b:
            return 0.0
        embeddings = self.model.encode([text_a, text_b])
        sim_matrix = cosine_similarity([embeddings[0]], [embeddings[1]])
        return float(round(float(sim_matrix[0][0]), 2))

    def match_required_skills(
        self,
        required_skills: List[str],
        candidate_skills_with_evidence: List[Dict[str, str]]
    ) -> List[Dict[str, Any]]:
        """
        For each required job skill, finds the best semantic alignment from the candidate's profile.
        
        Args:
            required_skills: List of canonical job-required skill names.
            candidate_skills_with_evidence: List of dicts with keys:
                - canonical_name
                - matched_alias
                - evidence_snippet
                
        Returns:
            List of match records:
            [
                {
                    "required_skill": "React",
                    "matched_evidence": "React.js",
                    "evidence_snippet": "Developed user interfaces using React.js and Redux",
                    "similarity_score": 0.88,
                    "is_direct_match": True
                },
                ...
            ]
        """
        if not required_skills:
            return []

        # If candidate has no detected skills at all
        if not candidate_skills_with_evidence:
            return [
                {
                    "required_skill": req,
                    "matched_evidence": "Not Found",
                    "evidence_snippet": "",
                    "similarity_score": 0.0,
                    "is_direct_match": False
                }
                for req in required_skills
            ]

        # Precompute candidate representations
        # Candidate representations: primary alias or canonical name
        cand_labels = [item.get("matched_alias") or item.get("canonical_name") for item in candidate_skills_with_evidence]
        cand_embeddings = self.model.encode(cand_labels)

        # Precompute required skill embeddings
        req_embeddings = self.model.encode(required_skills)

        # Pairwise cosine similarity matrix: shape (len(required), len(candidate))
        sim_matrix = cosine_similarity(req_embeddings, cand_embeddings)

        results = []

        for req_idx, req_skill in enumerate(required_skills):
            # 1. Check for exact canonical match first
            exact_cand_match = None
            for item_idx, item in enumerate(candidate_skills_with_evidence):
                if item["canonical_name"].lower() == req_skill.lower():
                    exact_cand_match = (item_idx, item)
                    break

            if exact_cand_match:
                item_idx, item = exact_cand_match
                # Compute similarity between required skill and matched alias
                alias_text = item.get("matched_alias", req_skill)
                # If identical text, score is 1.0; if alias variant, compute actual cosine similarity
                if alias_text.strip().lower() == req_skill.strip().lower():
                    score = 1.0
                else:
                    score = float(round(float(sim_matrix[req_idx][item_idx]), 2))
                    # Ensure direct match is at least threshold level
                    score = max(score, 0.85)

                results.append({
                    "required_skill": req_skill,
                    "matched_evidence": alias_text,
                    "evidence_snippet": item.get("evidence_snippet", ""),
                    "similarity_score": score,
                    "is_direct_match": True
                })
            else:
                # 2. Find best semantic neighbor among all candidate skills in resume
                best_cand_idx = int(np.argmax(sim_matrix[req_idx]))
                best_score = float(round(float(sim_matrix[req_idx][best_cand_idx]), 2))
                best_cand_item = candidate_skills_with_evidence[best_cand_idx]

                # If score is very low, mark evidence as "Not Found"
                if best_score < 0.35:
                    results.append({
                        "required_skill": req_skill,
                        "matched_evidence": "Not Found",
                        "evidence_snippet": "",
                        "similarity_score": max(best_score, 0.10),
                        "is_direct_match": False
                    })
                else:
                    results.append({
                        "required_skill": req_skill,
                        "matched_evidence": best_cand_item.get("matched_alias") or best_cand_item.get("canonical_name"),
                        "evidence_snippet": best_cand_item.get("evidence_snippet", ""),
                        "similarity_score": best_score,
                        "is_direct_match": False
                    })

        return results


# Global singleton matcher
matcher_instance = SemanticMatcher()


def get_semantic_matcher() -> SemanticMatcher:
    return matcher_instance

