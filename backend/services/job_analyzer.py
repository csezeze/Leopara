import re

from services.skills import (
    SKILL_KEYWORDS,
    find_skills,
    keyword_exists,
    normalize_text,
    split_sentences,
)


REQUIREMENT_PRIORITY_WEIGHTS = {
    "required": 1.0,
    "unspecified": 0.8,
    "preferred": 0.6,
    "bonus": 0.3,
}

REQUIREMENT_PRIORITY_MARKERS = {
    "required": [
        "zorunlu",
        "zorunludur",
        "şart",
        "şarttır",
        "gerekli",
        "gereklidir",
        "gerekmektedir",
        "aranmaktadır",
        "beklenir",
        "required",
        "must",
    ],
    "preferred": [
        "tercihen",
        "tercih edilen",
        "tercih edilir",
        "tercih sebebi",
        "tercih sebebidir",
        "tercih nedeni",
        "tercih nedenidir",
        "preferred",
    ],
    "bonus": [
        "ek avantaj",
        "ek avantajdır",
        "avantaj",
        "avantajdır",
        "artı",
        "artıdır",
        "plus",
        "nice to have",
    ],
}


def analyze_posting(posting_text: str) -> dict:
    requirements = find_skills(posting_text)
    normalized = normalize_text(posting_text)

    if not requirements:
        requirements = infer_requirements_from_common_terms(normalized)

    requirement_details = build_requirement_details(posting_text, requirements)

    return {
        "requirements": requirements,
        "requirement_details": requirement_details,
        "is_internship": keyword_exists(normalized, "staj") or keyword_exists(normalized, "intern"),
        "raw_text": posting_text,
    }


def build_requirement_details(posting_text: str, requirements: list[str]) -> list[dict]:
    sentences = split_sentences(posting_text)
    details = []

    for skill in requirements:
        detected_priorities = []

        for sentence in sentences:
            normalized_sentence = normalize_text(sentence)
            skill_positions = find_skill_positions(normalized_sentence, skill)
            if not skill_positions:
                continue

            priority = find_nearest_priority(normalized_sentence, skill_positions)
            if priority:
                detected_priorities.append(priority)

        priority = (
            max(detected_priorities, key=REQUIREMENT_PRIORITY_WEIGHTS.get)
            if detected_priorities
            else "unspecified"
        )
        details.append({
            "skill": skill,
            "priority": priority,
            "weight": REQUIREMENT_PRIORITY_WEIGHTS[priority],
        })

    return details


def find_skill_positions(normalized_sentence: str, skill: str) -> list[int]:
    positions = []
    for keyword in SKILL_KEYWORDS.get(skill, [skill]):
        positions.extend(find_keyword_positions(normalized_sentence, keyword))
    return positions


def find_nearest_priority(normalized_sentence: str, skill_positions: list[int]) -> str | None:
    marker_positions = []
    for priority, markers in REQUIREMENT_PRIORITY_MARKERS.items():
        for marker in markers:
            for position in find_keyword_positions(normalized_sentence, marker):
                marker_positions.append((priority, position))

    if not marker_positions:
        return None

    return min(
        marker_positions,
        key=lambda item: (
            min(abs(item[1] - skill_position) for skill_position in skill_positions),
            -REQUIREMENT_PRIORITY_WEIGHTS[item[0]],
        ),
    )[0]


def find_keyword_positions(normalized_text: str, keyword: str) -> list[int]:
    normalized_keyword = normalize_text(keyword)
    if not normalized_keyword:
        return []

    pattern = rf"(?<![a-z0-9]){re.escape(normalized_keyword)}(?![a-z0-9])"
    return [match.start() for match in re.finditer(pattern, normalized_text)]


def infer_requirements_from_common_terms(normalized_text: str) -> list[str]:
    fallback_terms = {
        "Communication": ["iletişim", "communication"],
        "Teamwork": ["takım", "team"],
        "Problem Solving": ["problem solving", "problem çözme"],
    }
    inferred: list[str] = []
    for label, keywords in fallback_terms.items():
        if any(keyword_exists(normalized_text, keyword) for keyword in keywords):
            inferred.append(label)
    return inferred
