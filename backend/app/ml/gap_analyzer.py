"""
Skill Gap Detection and Classification Module.

Academic Purpose:
Classifies each required competency into one of three categorical states
based on the calculated semantic similarity score:
1. MATCHED: Similarity >= MATCHED_THRESHOLD (Default: 0.70)
2. PARTIALLY MATCHED: PARTIAL_THRESHOLD <= Similarity < MATCHED_THRESHOLD (Default: 0.50 - 0.69)
3. MISSING: Similarity < PARTIAL_THRESHOLD (Default: < 0.50)

Overall Match Formula:
Computes a weighted aggregation score across all required skills:
Overall Match (%) = ((Matched * 1.0 + Partial * 0.5 + Missing * 0.0) / Total Required Skills) * 100

Threshold Ablation Note:
Thresholds are dynamically read from `app.utils.config` to facilitate
experimental sensitivity analysis without modifying analytical code.
"""

from typing import List, Dict, Any
from app.utils.config import (
    MATCHED_THRESHOLD,
    PARTIAL_THRESHOLD,
    MATCHED_WEIGHT,
    PARTIAL_WEIGHT,
    MISSING_WEIGHT
)


class GapAnalyzer:
    def __init__(
        self,
        matched_threshold: float = MATCHED_THRESHOLD,
        partial_threshold: float = PARTIAL_THRESHOLD,
        matched_weight: float = MATCHED_WEIGHT,
        partial_weight: float = PARTIAL_WEIGHT,
        missing_weight: float = MISSING_WEIGHT
    ):
        self.matched_threshold = matched_threshold
        self.partial_threshold = partial_threshold
        self.matched_weight = matched_weight
        self.partial_weight = partial_weight
        self.missing_weight = missing_weight

    def classify_skill(self, similarity_score: float) -> str:
        """
        Classifies similarity score into 'Matched', 'Partial', or 'Missing'.
        """
        if similarity_score >= self.matched_threshold:
            return "Matched"
        elif similarity_score >= self.partial_threshold:
            return "Partial"
        else:
            return "Missing"

    def analyze_gaps(self, match_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Processes semantic match records, assigns status classifications,
        and computes the dynamic overall match percentage.
        
        Args:
            match_records: List of dicts from semantic_matcher
            
        Returns:
            Dict containing:
            - overall_match: float percentage
            - matched_skills: List[str]
            - partial_skills: List[str]
            - missing_skills: List[str]
            - classified_items: List[Dict] with added 'status'
            - stats: breakdown numbers
        """
        if not match_records:
            return {
                "overall_match": 0.0,
                "matched_skills": [],
                "partial_skills": [],
                "missing_skills": [],
                "classified_items": [],
                "formula_explanation": "Overall Match = ((Matched * 1.0 + Partial * 0.5) / Total) * 100",
                "stats": {"total": 0, "matched": 0, "partial": 0, "missing": 0}
            }

        matched_skills: List[str] = []
        partial_skills: List[str] = []
        missing_skills: List[str] = []
        classified_items: List[Dict[str, Any]] = []

        for record in match_records:
            score = record["similarity_score"]
            status = self.classify_skill(score)
            req_skill = record["required_skill"]

            classified_record = dict(record)
            classified_record["status"] = status
            classified_items.append(classified_record)

            if status == "Matched":
                matched_skills.append(req_skill)
            elif status == "Partial":
                partial_skills.append(req_skill)
            else:
                missing_skills.append(req_skill)

        total_count = len(match_records)
        matched_count = len(matched_skills)
        partial_count = len(partial_skills)
        missing_count = len(missing_skills)

        # Dynamic formula calculation
        weighted_sum = (
            (matched_count * self.matched_weight) +
            (partial_count * self.partial_weight) +
            (missing_count * self.missing_weight)
        )
        overall_match = round((weighted_sum / total_count) * 100.0, 1)

        return {
            "overall_match": overall_match,
            "matched_skills": matched_skills,
            "partial_skills": partial_skills,
            "missing_skills": missing_skills,
            "classified_items": classified_items,
            "formula_explanation": f"Overall Match = (({matched_count} * {self.matched_weight} + {partial_count} * {self.partial_weight}) / {total_count}) * 100 = {overall_match}%",
            "stats": {
                "total": total_count,
                "matched": matched_count,
                "partial": partial_count,
                "missing": missing_count
            }
        }


# Global singleton analyzer
analyzer_instance = GapAnalyzer()


def get_gap_analyzer() -> GapAnalyzer:
    return analyzer_instance

