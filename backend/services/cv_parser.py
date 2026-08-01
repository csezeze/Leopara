import re

from services.skills import find_evidence, find_skills, keyword_exists, normalize_text


CV_CONTEXT_KEYWORDS = [
    "üniversite",
    "university",
    "lise",
    "okul",
    "bölüm",
    "bolum",
    "mühendisliği",
    "muhendisligi",
    "öğrenci",
    "ogrenci",
    "eğitim",
    "egitim",
    "deneyim",
    "experience",
    "proje",
    "project",
    "staj",
    "internship",
    "sertifika",
    "certificate",
    "github",
    "linkedin",
    "portfolio",
    "portfolyo",
    "geliştirdim",
    "gelistirdim",
    "kullandım",
    "kullandim",
    "çalıştım",
    "calistim",
]


def is_valid_cv_text(cv_text: str) -> bool:
    normalized = normalize_text(cv_text)
    words = re.findall(r"[a-z0-9]+", normalized)

    if len(words) < 12:
        return False

    return any(keyword_exists(normalized, keyword) for keyword in CV_CONTEXT_KEYWORDS)


def parse_cv(cv_text: str) -> dict:
    normalized = normalize_text(cv_text)
    skills = find_skills(cv_text)
    evidence_by_skill = {
        skill: find_evidence(cv_text, skill)
        for skill in skills
    }

    return {
        "skills": skills,
        "evidence_by_skill": evidence_by_skill,
        "has_github": "github.com" in normalized or "github" in normalized,
        "has_portfolio": "portfolio" in normalized or "portfolyo" in normalized,
        "has_project": "project" in normalized or "proje" in normalized,
        "has_certificate": "certificate" in normalized or "sertifika" in normalized,
        "has_coursework": "course" in normalized or "ders" in normalized,
        "is_valid_cv": is_valid_cv_text(cv_text),
        "raw_text": cv_text,
    }
