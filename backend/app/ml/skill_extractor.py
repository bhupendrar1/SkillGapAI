"""
Skill Extraction Module.

Extracts technical skills from raw resume and job description text.
Matches candidate competencies against the skill taxonomy using boundary-aware
regex patterns for aliases, handling multi-word tokens (e.g., 'System Design', 'REST API')
and special syntax characters (e.g., 'C++', 'Node.js').
Extracts both the canonical normalized skill and direct evidence context sentences.
"""

import re
from typing import List, Dict, Set
from app.ml.skill_normalizer import get_skill_normalizer, SkillNormalizer


class ExtractedSkillInfo:
    def __init__(self, canonical_name: str, matched_alias: str, context_snippet: str = ""):
        self.canonical_name = canonical_name
        self.matched_alias = matched_alias
        self.context_snippet = context_snippet

    def to_dict(self) -> dict:
        return {
            "canonical_name": self.canonical_name,
            "matched_alias": self.matched_alias,
            "context_snippet": self.context_snippet
        }


class SkillExtractor:
    def __init__(self, normalizer: SkillNormalizer = None):
        self.normalizer = normalizer or get_skill_normalizer()
        self._compiled_patterns = self._build_compiled_patterns()

    def _build_compiled_patterns(self) -> List[tuple]:
        """
        Builds compiled regex patterns sorted by alias length descending
        so that longer phrases like 'Tailwind CSS' match before 'CSS',
        and 'JavaScript' matches before 'Java'.
        """
        alias_dict = self.normalizer.get_alias_dictionary()
        # Sort keys by length descending to prioritize greedy multi-word match
        sorted_aliases = sorted(alias_dict.keys(), key=lambda x: len(x), reverse=True)

        patterns = []
        for alias in sorted_aliases:
            canonical = alias_dict[alias]
            # Escape regex special characters like '+', '.', etc.
            escaped_alias = re.escape(alias)
            # Use word boundaries or start/end boundaries
            # Handle special cases like C++ or .js where standard \b might fail
            if alias.endswith("+") or alias.endswith(".js"):
                pattern_str = r"(?<!\w)" + escaped_alias + r"(?!\w)"
            else:
                pattern_str = r"\b" + escaped_alias + r"\b"
            
            regex = re.compile(pattern_str, re.IGNORECASE)
            patterns.append((regex, alias, canonical))

        return patterns

    def extract_skills_with_evidence(self, text: str) -> List[Dict[str, str]]:
        """
        Extracts recognized skills and finds the sentence context where each skill was mentioned.
        Returns a list of dicts: [{'canonical_name': 'React', 'matched_alias': 'React.js', 'context': '...'}]
        """
        if not text or not text.strip():
            return []

        # Split text into sentences or lines for evidence localization
        raw_sentences = [s.strip() for s in re.split(r"[\n\.\;•\-\*\—]+", text) if len(s.strip()) > 3]

        found_canonicals: Set[str] = set()
        results: List[Dict[str, str]] = []

        # Search for each pattern
        for regex, alias, canonical in self._compiled_patterns:
            if canonical in found_canonicals:
                continue

            match = regex.search(text)
            if match:
                found_canonicals.add(canonical)
                matched_raw_text = match.group(0)

                # Locate best contextual sentence for explainability evidence
                evidence_snippet = matched_raw_text
                for sent in raw_sentences:
                    if regex.search(sent):
                        # Clean sentence and limit length
                        clean_sent = re.sub(r"\s+", " ", sent).strip()
                        if len(clean_sent) > 120:
                            clean_sent = clean_sent[:117] + "..."
                        evidence_snippet = clean_sent
                        break

                results.append({
                    "canonical_name": canonical,
                    "matched_alias": matched_raw_text,
                    "evidence_snippet": evidence_snippet
                })

        return results

    def extract_canonical_skills(self, text: str) -> List[str]:
        """
        Convenience method returning uniquely extracted canonical skill names.
        """
        extracted = self.extract_skills_with_evidence(text)
        return [item["canonical_name"] for item in extracted]


# Global singleton extractor
extractor_instance = SkillExtractor()


def get_skill_extractor() -> SkillExtractor:
    return extractor_instance

