"""
Skill Normalization Module.

Academic Purpose:
Skill normalization maps heterogeneous lexical variants, abbreviations, and synonyms
of the same technical competency into a standardized canonical representation.
For example:
- "React.js", "ReactJS", "React JS" -> "React"
- "NodeJS", "Node.js", "node js" -> "Node.js"
- "RESTful API", "REST APIs", "REST API" -> "REST API"
- "Mongo DB", "mongo" -> "MongoDB"

Taxonomy & ESCO Architecture:
This module utilizes a structured canonical skill taxonomy defined in `data/skills.json`.
Each canonical skill includes an optional ESCO (European Skills, Competences, Qualifications
and Occupations) URI identifier. The normalization architecture is explicitly designed
to support full ESCO dataset integration in future research extensions without altering
downstream pipeline interfaces.
"""

import json
from typing import Dict, List, Optional
from app.utils.config import SKILLS_JSON_PATH


class SkillNormalizer:
    def __init__(self, data_path=SKILLS_JSON_PATH):
        self.data_path = data_path
        self.alias_to_canonical: Dict[str, str] = {}
        self.canonical_skills: Dict[str, dict] = {}
        self._load_taxonomy()

    def _load_taxonomy(self):
        """Loads canonical skills and alias mapping from the JSON dataset."""
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                skills_list = data.get("skills", [])
                for item in skills_list:
                    canonical_name = item["name"]
                    self.canonical_skills[canonical_name] = item

                    # Map canonical name to itself (lowercased key)
                    self.alias_to_canonical[canonical_name.lower().strip()] = canonical_name

                    # Map all defined aliases to canonical name
                    for alias in item.get("aliases", []):
                        self.alias_to_canonical[alias.lower().strip()] = canonical_name
        except Exception as e:
            # Fallback minimum mapping if file read fails
            print(f"[Warning] Failed to load skills.json: {e}. Using fallback mappings.")
            self._load_fallback_taxonomy()

    def _load_fallback_taxonomy(self):
        fallback = {
            "React": ["react", "react.js", "reactjs", "react js"],
            "Node.js": ["node.js", "nodejs", "node js", "node"],
            "JavaScript": ["javascript", "js", "ecmascript"],
            "Python": ["python", "py", "python3"],
            "MongoDB": ["mongodb", "mongo db", "mongo"],
            "Docker": ["docker", "docker containers", "containerization"],
            "AWS": ["aws", "amazon web services"],
            "REST API": ["rest api", "restful api", "rest apis", "restful web services"],
            "System Design": ["system design", "distributed systems", "system architecture"],
            "Git": ["git", "git version control", "git scm"],
            "SQL": ["sql", "structured query language", "postgresql", "mysql"]
        }
        for canonical, aliases in fallback.items():
            self.canonical_skills[canonical] = {"name": canonical, "category": "General", "aliases": aliases}
            for alias in aliases:
                self.alias_to_canonical[alias.lower()] = canonical

    def normalize(self, skill_text: str) -> str:
        """
        Normalizes a candidate skill text to its canonical name.
        If no canonical match is found, returns cleanly formatted original text.
        """
        if not skill_text:
            return ""
        cleaned = skill_text.strip().lower()
        if cleaned in self.alias_to_canonical:
            return self.alias_to_canonical[cleaned]
        
        # Return title-cased or preserved casing if unrecognized
        return skill_text.strip()

    def get_canonical_metadata(self, canonical_name: str) -> Optional[dict]:
        """Returns category, esco_uri, and learning curriculum for a canonical skill."""
        return self.canonical_skills.get(canonical_name)

    def get_all_canonical_names(self) -> List[str]:
        """Returns a list of all recognized canonical skill names."""
        return list(self.canonical_skills.keys())

    def get_alias_dictionary(self) -> Dict[str, str]:
        """Returns the alias-to-canonical mapping dictionary."""
        return dict(self.alias_to_canonical)


# Global singleton normalizer
normalizer_instance = SkillNormalizer()


def get_skill_normalizer() -> SkillNormalizer:
    return normalizer_instance

