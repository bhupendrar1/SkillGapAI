

from typing import List, Dict, Any, Optional
from app.ml.skill_normalizer import get_skill_normalizer


class SkillExplainer:
    def __init__(self):
        self.normalizer = get_skill_normalizer()

    def generate_explanation(
        self,
        required_skill: str,
        status: str,
        evidence: str,
        similarity_score: float,
        evidence_snippet: str = ""
    ) -> str:
        """
        Generates an evidence-backed XAI explanation string.
        """
        # Clean evidence display
        has_concrete_evidence = evidence and evidence != "Not Found" and evidence.lower() != "none"

        if status == "Matched":
            if evidence.strip().lower() == required_skill.strip().lower():
                base_msg = f"Direct evidence for '{required_skill}' was verified in the resume with high semantic confidence ({similarity_score:.2f})."
            else:
                base_msg = f"Evidence for '{evidence}' was identified in the resume, directly confirming proficiency in '{required_skill}' (similarity: {similarity_score:.2f})."
            
            if evidence_snippet and evidence_snippet != evidence:
                return f"{base_msg} Context: \"{evidence_snippet}\"."
            return base_msg

        elif status == "Partial":
            if has_concrete_evidence:
                base_msg = (
                    f"'{evidence}' experience was found in the resume, which is semantically related "
                    f"to '{required_skill}' (similarity: {similarity_score:.2f}), but complete direct evidence "
                    f"for '{required_skill}' was not explicitly stated."
                )
            else:
                base_msg = (
                    f"Weak or indirect context relating to '{required_skill}' was detected (similarity: {similarity_score:.2f}), "
                    f"falling short of the full match threshold."
                )

            if evidence_snippet and evidence_snippet != evidence:
                return f"{base_msg} Context: \"{evidence_snippet}\"."
            return base_msg

        else:  # Missing
            if has_concrete_evidence:
                return (
                    f"'{required_skill}' is required by the job description. Although '{evidence}' was noted in the profile, "
                    f"the semantic correlation ({similarity_score:.2f}) is below the required threshold."
                )
            return f"No relevant '{required_skill}' skill or related competency was identified in the resume."

    def build_skill_analysis_report(self, classified_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Builds the unified explainable skill analysis table items.
        """
        analysis_report = []
        for item in classified_items:
            req_skill = item["required_skill"]
            status = item["status"]
            evidence = item.get("matched_evidence", "Not Found")
            score = item["similarity_score"]
            snippet = item.get("evidence_snippet", "")

            explanation = self.generate_explanation(
                required_skill=req_skill,
                status=status,
                evidence=evidence,
                similarity_score=score,
                evidence_snippet=snippet
            )

            analysis_report.append({
                "skill": req_skill,
                "evidence": evidence,
                "evidence_snippet": snippet,
                "similarity": score,
                "status": status,
                "reason": explanation
            })

        return analysis_report

    def generate_recommendations(
        self,
        classified_items: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Generates deterministic rule-based learning roadmaps for missing and partial skills.
        Missing -> High Priority
        Partial -> Medium Priority
        """
        recommendations = []

        for item in classified_items:
            status = item["status"]
            if status == "Matched":
                continue  # Only recommend for missing and partial skills

            skill_name = item["required_skill"]
            metadata = self.normalizer.get_canonical_metadata(skill_name)
            
            # Default fallback curriculum if not specifically in taxonomy
            default_topics = [
                f"{skill_name} core fundamentals and syntax",
                f"Practical project implementation with {skill_name}",
                f"Best practices and design patterns in {skill_name}"
            ]

            topics = default_topics
            if metadata and "learning_recommendations" in metadata:
                topics = metadata["learning_recommendations"]

            priority = "High" if status == "Missing" else "Medium"

            recommendations.append({
                "skill": skill_name,
                "status": status,
                "priority": priority,
                "reason": f"Required for target job role ({priority.lower()} urgency due to {status.lower()} classification).",
                "topics": topics
            })

        # Sort recommendations: High priority first, then Medium
        priority_order = {"High": 0, "Medium": 1}
        recommendations.sort(key=lambda x: priority_order.get(x["priority"], 2))

        return recommendations


# Global singleton explainer
explainer_instance = SkillExplainer()


def get_skill_explainer() -> SkillExplainer:
    return explainer_instance

